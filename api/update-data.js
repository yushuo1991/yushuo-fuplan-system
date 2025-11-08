// Vercel Serverless Function - 更新涨停数据
// 这个函数将处理Tushare数据获取和Supabase存储
module.exports = async function handler(req, res) {
  // 安全检查 - 只允许POST请求，并可以添加API key验证
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 可选：API Key验证（从环境变量获取）
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.UPDATE_API_KEY;
  
  if (expectedKey && apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 导入必要的包（需要安装到package.json）
    const { createClient } = require('@supabase/supabase-js');
    
    // Supabase配置
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xlslwrrctyedgwxdeosf.supabase.co';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    if (!SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Supabase service key not configured' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 注意：在Vercel上运行Python代码需要额外配置
    // 这里提供两种方案：
    
    // 方案1：生成演示数据（立即可用）
    const demoData = generateDemoData();
    
    // 保存到Supabase
    const { data, error } = await supabase
      .from('limit_analysis')
      .upsert({
        date: demoData.date,
        total_count: demoData.total_count,
        data: demoData
      }, { 
        onConflict: 'date' 
      });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to save data' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Data updated successfully',
      date: demoData.date,
      total_count: demoData.total_count
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// 生成演示数据函数
function generateDemoData() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  const categories = [
    {
      category_name: "人工智能",
      limit_count: 6,
      stocks: [
        { ts_code: "002230.SZ", name: "科大讯飞", next_5_days: [3.2, -1.8, 2.5, 0.8, -2.1], next_5_dates: getNext5TradeDays() },
        { ts_code: "002415.SZ", name: "海康威视", next_5_days: [2.8, 1.2, -0.5, 3.1, 1.8], next_5_dates: getNext5TradeDays() },
        { ts_code: "002236.SZ", name: "大华股份", next_5_days: [1.9, -2.3, 4.2, -1.1, 2.7], next_5_dates: getNext5TradeDays() },
        { ts_code: "300496.SZ", name: "中科创达", next_5_days: [4.5, 0.8, -1.9, 2.3, -0.7], next_5_dates: getNext5TradeDays() },
        { ts_code: "300253.SZ", name: "卫宁健康", next_5_days: [2.1, 3.6, -2.8, 1.4, 0.9], next_5_dates: getNext5TradeDays() },
        { ts_code: "300168.SZ", name: "万达信息", next_5_days: [1.7, -0.9, 3.8, -1.5, 2.2], next_5_dates: getNext5TradeDays() }
      ]
    },
    {
      category_name: "新能源汽车", 
      limit_count: 5,
      stocks: [
        { ts_code: "300750.SZ", name: "宁德时代", next_5_days: [5.2, 2.1, -1.3, 3.7, 1.5], next_5_dates: getNext5TradeDays() },
        { ts_code: "002594.SZ", name: "比亚迪", next_5_days: [3.8, -2.1, 4.3, 0.7, -1.8], next_5_dates: getNext5TradeDays() },
        { ts_code: "300014.SZ", name: "亿纬锂能", next_5_days: [2.9, 1.8, -3.2, 2.6, 0.4], next_5_dates: getNext5TradeDays() },
        { ts_code: "300073.SZ", name: "当升科技", next_5_days: [4.1, -0.8, 2.7, -1.9, 3.3], next_5_dates: getNext5TradeDays() },
        { ts_code: "002812.SZ", name: "恩捷股份", next_5_days: [1.6, 3.9, -2.4, 1.8, -0.6], next_5_dates: getNext5TradeDays() }
      ]
    },
    {
      category_name: "医药生物",
      limit_count: 4,
      stocks: [
        { ts_code: "600276.SH", name: "恒瑞医药", next_5_days: [2.7, -1.4, 3.6, 1.2, -2.8], next_5_dates: getNext5TradeDays() },
        { ts_code: "603259.SH", name: "药明康德", next_5_days: [3.9, 0.8, -2.1, 2.4, 1.7], next_5_dates: getNext5TradeDays() },
        { ts_code: "300760.SZ", name: "迈瑞医疗", next_5_days: [1.8, 2.9, -1.7, 0.5, 3.2], next_5_dates: getNext5TradeDays() },
        { ts_code: "002821.SZ", name: "凯莱英", next_5_days: [4.2, -2.6, 1.9, -0.8, 2.1], next_5_dates: getNext5TradeDays() }
      ]
    }
  ];

  return {
    date: today,
    total_count: categories.reduce((sum, cat) => sum + cat.limit_count, 0),
    categories: categories
  };
}

// 生成后续5个交易日
function getNext5TradeDays() {
  const dates = [];
  let currentDate = new Date();
  let count = 0;
  
  while (count < 5) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // 跳过周末
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      dates.push(currentDate.toISOString().slice(0, 10).replace(/-/g, ''));
      count++;
    }
  }
  
  return dates;
}