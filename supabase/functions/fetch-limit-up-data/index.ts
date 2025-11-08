// Supabase Edge Function: 获取涨停数据
// 解决跨域问题，调用开盘啦API并存储到数据库

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LimitUpStock {
  Code?: string
  Name?: string
  PlateID?: string
  PlateName?: string
  PctChg?: number
  LimitTimes?: number
  [key: string]: any
}

interface ApiResponse {
  list?: LimitUpStock[]
  List?: LimitUpStock[]
  errcode?: string
  [key: string]: any
}

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 初始化Supabase客户端
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 获取请求参数
    const { date, force_refresh = false } = await req.json().catch(() => ({ date: new Date().toISOString().split('T')[0] }))
    
    console.log(`🎯 Supabase Edge Function: 获取涨停数据，日期=${date}, 强制刷新=${force_refresh}`)

    // 检查是否已有缓存数据（除非强制刷新）
    if (!force_refresh) {
      const { data: existingData, error: cacheError } = await supabase
        .from('limit_up_stocks')
        .select('*')
        .eq('date', date)
        .limit(1)

      if (!cacheError && existingData && existingData.length > 0) {
        console.log(`📊 使用缓存数据，日期=${date}`)
        return await returnCachedData(supabase, date)
      }
    }

    // 获取数据源配置
    const { data: configData, error: configError } = await supabase
      .from('data_source_config')
      .select('*')
      .eq('source_name', 'kaipanla')
      .eq('is_active', true)
      .single()

    if (configError || !configData) {
      throw new Error('未找到有效的数据源配置')
    }

    // 构建API请求
    const apiUrl = buildKaipanlaApiUrl(configData.api_url, date)
    console.log(`📡 调用开盘啦API: ${apiUrl}`)

    // 记录API调用开始
    const callStartTime = Date.now()
    
    const { data: logData, error: logError } = await supabase
      .from('api_call_logs')
      .insert({
        date: date,
        api_endpoint: apiUrl,
        request_params: { date },
        called_at: new Date().toISOString()
      })
      .select()
      .single()

    const logId = logData?.id

    try {
      // 调用外部API
      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: configData.request_headers || {},
        signal: AbortSignal.timeout((configData.timeout_seconds || 10) * 1000)
      })

      const responseTime = Date.now() - callStartTime
      const responseText = await apiResponse.text()
      
      console.log(`📦 API响应: 状态=${apiResponse.status}, 长度=${responseText.length}, 用时=${responseTime}ms`)

      // 更新API调用日志
      if (logId) {
        await supabase
          .from('api_call_logs')
          .update({
            response_status: apiResponse.status,
            response_time: responseTime,
            success: apiResponse.ok
          })
          .eq('id', logId)
      }

      if (!apiResponse.ok) {
        throw new Error(`API响应错误: ${apiResponse.status} ${apiResponse.statusText}`)
      }

      // 解析响应
      const apiData: ApiResponse = JSON.parse(responseText)
      console.log(`🔍 API数据结构: errcode=${apiData.errcode}, list长度=${apiData.list?.length || 0}, List长度=${apiData.List?.length || 0}`)

      // 处理API数据
      if (apiData.errcode === "0") {
        const stocksData = apiData.list || apiData.List || []
        
        if (stocksData.length > 0) {
          // 存储真实数据到数据库
          const result = await saveStocksToDatabase(supabase, stocksData, date)
          
          // 更新成功日志
          if (logId) {
            await supabase
              .from('api_call_logs')
              .update({
                response_data: { stocks_count: stocksData.length, sample: stocksData[0] },
                success: true
              })
              .eq('id', logId)
          }

          return new Response(
            JSON.stringify({
              success: true,
              date: date,
              total_count: result.total_count,
              categories: result.categories,
              source: 'supabase_real_api',
              message: `成功获取并存储${result.total_count}只涨停股票`,
              cached: false,
              response_time_ms: responseTime
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        } else {
          // 无数据情况
          console.log(`ℹ️ API返回空数据，日期=${date}`)
          
          return new Response(
            JSON.stringify({
              success: true,
              date: date,
              total_count: 0,
              categories: {},
              source: 'supabase_real_api',
              message: '真实API返回空数据（该日期无涨停股票）',
              cached: false,
              response_time_ms: responseTime
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }
      } else {
        throw new Error(`API返回错误代码: ${apiData.errcode}`)
      }

    } catch (apiError) {
      // 更新失败日志
      if (logId) {
        await supabase
          .from('api_call_logs')
          .update({
            error_message: apiError.message,
            success: false
          })
          .eq('id', logId)
      }
      
      console.error(`❌ API调用失败: ${apiError.message}`)
      
      // 尝试返回缓存数据作为降级方案
      const cachedResult = await returnCachedData(supabase, date)
      if (cachedResult) {
        return cachedResult
      }
      
      throw apiError
    }

  } catch (error) {
    console.error('❌ Edge Function执行失败:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        source: 'supabase_edge_function',
        message: 'API调用失败，无缓存数据可用'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function buildKaipanlaApiUrl(baseUrl: string, date: string): string {
  const params = new URLSearchParams({
    'a': 'GetDayZhangTing',
    'st': '100',
    'c': 'HisLimitResumption',
    'PhoneOSNew': '1',
    'DeviceID': 'ffffffff-e91e-5efd-ffff-ffffa460846b',
    'VerSion': '5.12.0.4',
    'Token': '0',
    'Index': '0',
    'apiv': 'w34',
    'Date': date.replace(/-/g, ''), // 转换为YYYYMMDD格式
    'UserID': '0'
  })
  
  return `${baseUrl}?${params.toString()}`
}

async function saveStocksToDatabase(supabase: any, stocksData: LimitUpStock[], date: string) {
  console.log(`💾 开始存储${stocksData.length}只股票数据到数据库`)
  
  // 先清除当日旧数据
  await supabase
    .from('limit_up_stocks')
    .delete()
    .eq('date', date)

  // 准备股票数据
  const stocksToInsert = stocksData.map((stock, index) => ({
    date: date,
    stock_code: stock.Code || `REAL_${index + 1}`,
    stock_name: stock.Name || `真实股票${index + 1}`,
    plate_id: stock.PlateID,
    plate_name: stock.PlateName || '其他板块',
    pct_chg: parseFloat(stock.PctChg?.toString() || '9.99'),
    limit_times: parseInt(stock.LimitTimes?.toString() || '1'),
  }))

  // 批量插入股票数据
  const { data: insertedStocks, error: stockError } = await supabase
    .from('limit_up_stocks')
    .insert(stocksToInsert)
    .select()

  if (stockError) {
    throw new Error(`股票数据插入失败: ${stockError.message}`)
  }

  // 生成板块统计
  const categories: { [key: string]: any } = {}
  stocksToInsert.forEach(stock => {
    const categoryName = stock.plate_name
    if (!categories[categoryName]) {
      categories[categoryName] = {
        count: 0,
        stocks: [],
        totalPctChg: 0,
        maxLimitTimes: 0
      }
    }
    categories[categoryName].count++
    categories[categoryName].stocks.push(stock)
    categories[categoryName].totalPctChg += stock.pct_chg
    categories[categoryName].maxLimitTimes = Math.max(categories[categoryName].maxLimitTimes, stock.limit_times)
  })

  // 先清除当日板块统计
  await supabase
    .from('limit_up_categories')
    .delete()
    .eq('date', date)

  // 准备板块统计数据
  const categoriesToInsert = Object.entries(categories).map(([name, data]: [string, any]) => ({
    date: date,
    category_name: name,
    stock_count: data.count,
    avg_pct_chg: parseFloat((data.totalPctChg / data.count).toFixed(2)),
    max_limit_times: data.maxLimitTimes,
    min_limit_times: Math.min(...data.stocks.map((s: any) => s.limit_times))
  }))

  // 插入板块统计数据
  await supabase
    .from('limit_up_categories')
    .insert(categoriesToInsert)

  console.log(`✅ 成功存储${stocksToInsert.length}只股票和${categoriesToInsert.length}个板块`)

  return {
    total_count: stocksToInsert.length,
    categories: categories
  }
}

async function returnCachedData(supabase: any, date: string) {
  console.log(`📊 尝试获取缓存数据，日期=${date}`)
  
  const { data: stocks, error: stocksError } = await supabase
    .from('limit_up_stocks')
    .select('*')
    .eq('date', date)

  const { data: categories, error: categoriesError } = await supabase
    .from('limit_up_categories')
    .select('*')
    .eq('date', date)

  if (stocksError || categoriesError) {
    console.log('❌ 缓存数据获取失败')
    return null
  }

  if (!stocks || stocks.length === 0) {
    console.log('ℹ️ 无缓存数据')
    return new Response(
      JSON.stringify({
        success: true,
        date: date,
        total_count: 0,
        categories: {},
        source: 'supabase_cache',
        message: '无缓存数据，该日期可能无涨停股票',
        cached: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // 重构缓存数据格式
  const formattedCategories: { [key: string]: any } = {}
  categories?.forEach(cat => {
    const categoryStocks = stocks.filter(stock => stock.plate_name === cat.category_name)
    formattedCategories[cat.category_name] = {
      count: cat.stock_count,
      stocks: categoryStocks.map(stock => ({
        ts_code: stock.stock_code,
        name: stock.stock_name,
        pct_chg: stock.pct_chg,
        limit_times: stock.limit_times,
        plate_name: stock.plate_name
      }))
    }
  })

  console.log(`✅ 返回缓存数据：${stocks.length}只股票，${Object.keys(formattedCategories).length}个板块`)

  return new Response(
    JSON.stringify({
      success: true,
      date: date,
      total_count: stocks.length,
      categories: formattedCategories,
      source: 'supabase_cache',
      message: `返回缓存数据：${stocks.length}只涨停股票`,
      cached: true
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fetch-limit-up-data' \
    --header 'Authorization: Bearer [YOUR_ANON_KEY]' \
    --header 'Content-Type: application/json' \
    --data '{"date": "2025-09-10"}'

*/