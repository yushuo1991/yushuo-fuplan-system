// 实时涨停数据API - 强制使用真实开盘啦API版本
// 🚫 此版本绝对不包含任何模拟数据

module.exports = async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取查询参数中的日期，如果没有则使用今天
    const { date } = req.query;
    let targetDate;
    
    if (date) {
      // 如果传入了日期参数（格式可能是YYYYMMDD）
      if (date.length === 8) {
        targetDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
      } else {
        targetDate = date;
      }
    } else {
      // 使用今天的日期
      targetDate = new Date().toISOString().split('T')[0];
    }
    
    console.log(`🎯 实时API强制使用真实开盘啦数据，日期: ${targetDate}`);

    // 调用我们的历史API获取真实数据
    const historicalApiUrl = `/api/historical-limit-up?date=${targetDate}`;
    console.log('📡 内部调用历史API:', historicalApiUrl);
    
    // 由于是内部调用，我们直接调用函数
    const historicalHandler = require('./historical-limit-up.js');
    
    // 创建模拟的请求和响应对象
    const mockReq = {
      method: 'GET',
      query: { date: targetDate }
    };
    
    let responseData = null;
    const mockRes = {
      setHeader: () => {},
      status: (code) => ({
        json: (data) => {
          responseData = { code, data };
          return { json: () => data, end: () => {} };
        },
        end: () => {}
      })
    };
    
    // 调用历史API
    await historicalHandler(mockReq, mockRes);
    
    if (responseData && responseData.code === 200) {
      const histData = responseData.data;
      
      // 将历史API的返回格式转换为实时API的格式
      const apiDate = targetDate.replace(/-/g, ''); // 转换为YYYYMMDD格式
      
      console.log(`✅ 成功从历史API获取真实数据: ${histData.data.total_count}只涨停股票`);
      
      return res.status(200).json({
        success: true,
        date: apiDate,
        total_count: histData.data.total_count,
        data: JSON.stringify({
          date: apiDate,
          total_count: histData.data.total_count,
          data: {
            categories: histData.data.categories
          }
        }),
        source: 'realtime_via_historical_api', // 明确标记数据来源
        message: histData.data.total_count === 0 ? '真实API返回空数据' : '真实API返回数据',
        fetchTime: new Date().toISOString(),
        original_source: 'REAL_API_ONLY'
      });
    } else {
      console.error('❌ 历史API调用失败');
      return res.status(404).json({
        success: false,
        error: '真实API调用失败',
        date: targetDate,
        source: 'realtime_via_historical_api',
        message: '按用户要求，不使用任何模拟数据',
        fetchTime: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ 实时API调用失败:', error);
    return res.status(500).json({ 
      error: '真实API调用失败',
      message: error.message,
      source: 'realtime_via_historical_api',
      note: '系统不使用任何模拟数据'
    });
  }
};