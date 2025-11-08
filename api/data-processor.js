// 涨停数据处理和排序API
module.exports = async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let rawData;
    
    if (req.method === 'POST') {
      // POST请求：处理传入的原始数据
      rawData = req.body;
    } else {
      // GET请求：从查询参数获取日期，然后获取该日期的数据
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ 
          error: 'Missing required parameter: date (format: YYYY-MM-DD)' 
        });
      }
      
      // 调用历史数据API获取原始数据
      const historicalHandler = require('./historical-limit-up.js');
      const mockReq = { method: 'GET', query: { date } };
      const mockRes = createMockResponse();
      
      await historicalHandler(mockReq, mockRes);
      
      if (mockRes.statusCode !== 200) {
        return res.status(mockRes.statusCode).json(mockRes.data);
      }
      
      rawData = mockRes.data.data;
    }

    console.log('处理涨停数据:', rawData ? '有数据' : '无数据');

    if (!rawData || !rawData.categories) {
      return res.status(400).json({
        error: 'Invalid data format or no data provided'
      });
    }

    // 处理数据：按涨停原因分类并按连续涨停数排序
    const processedData = processLimitUpData(rawData);
    
    return res.status(200).json({
      success: true,
      processed_data: processedData,
      processing_time: new Date().toISOString(),
      source: 'data-processor'
    });

  } catch (error) {
    console.error('数据处理失败:', error);
    return res.status(500).json({ 
      error: 'Failed to process data',
      message: error.message 
    });
  }
};

function createMockResponse() {
  return {
    headers: {},
    statusCode: 200,
    data: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
    end() { return this; }
  };
}

function processLimitUpData(rawData) {
  // 第一步：提取所有股票数据并按板块分类
  const categoriesWithStocks = {};
  let totalStocks = 0;
  
  if (rawData.categories) {
    Object.entries(rawData.categories).forEach(([categoryName, categoryData]) => {
      if (categoryData.stocks && Array.isArray(categoryData.stocks)) {
        // 对该板块内的股票按连续涨停次数排序（降序）
        const sortedStocks = [...categoryData.stocks].sort((a, b) => {
          // 首先按连续涨停次数排序
          const limitTimesA = a.limit_times || 1;
          const limitTimesB = b.limit_times || 1;
          
          if (limitTimesB !== limitTimesA) {
            return limitTimesB - limitTimesA; // 连续涨停数多的在前
          }
          
          // 连续涨停数相同时，按涨幅排序
          const pctChgA = a.pct_chg || 0;
          const pctChgB = b.pct_chg || 0;
          return pctChgB - pctChgA; // 涨幅大的在前
        });
        
        // 计算该板块的统计信息
        const stats = calculateCategoryStats(sortedStocks);
        
        categoriesWithStocks[categoryName] = {
          count: sortedStocks.length,
          stocks: sortedStocks,
          stats: stats
        };
        
        totalStocks += sortedStocks.length;
      }
    });
  }
  
  // 第二步：按板块内连续涨停股票数量和质量对板块排序
  const sortedCategories = Object.entries(categoriesWithStocks)
    .map(([name, data]) => ({
      name,
      ...data,
      priority: calculateCategoryPriority(data)
    }))
    .sort((a, b) => b.priority - a.priority); // 按优先级降序排列
  
  // 第三步：生成最终的处理结果
  const processedResult = {
    total_stocks: totalStocks,
    total_categories: sortedCategories.length,
    date: rawData.date || new Date().toISOString().split('T')[0],
    categories: {}
  };
  
  // 将排序后的板块数据转换为最终格式
  sortedCategories.forEach(category => {
    processedResult.categories[category.name] = {
      count: category.count,
      stocks: category.stocks,
      stats: category.stats,
      priority_score: Math.round(category.priority * 100) / 100
    };
  });
  
  // 第四步：生成全局统计信息
  processedResult.global_stats = generateGlobalStats(sortedCategories);
  
  return processedResult;
}

function calculateCategoryStats(stocks) {
  if (!stocks || stocks.length === 0) {
    return {
      avg_limit_times: 0,
      max_limit_times: 0,
      avg_pct_chg: 0,
      avg_next_day_return: 0,
      high_limit_count: 0
    };
  }
  
  const limitTimes = stocks.map(s => s.limit_times || 1);
  const pctChgs = stocks.map(s => s.pct_chg || 0);
  const nextDayReturns = stocks.map(s => s.next_5_days ? s.next_5_days[0] : 0);
  
  // 高连板股票数量（3板及以上）
  const highLimitCount = limitTimes.filter(lt => lt >= 3).length;
  
  return {
    avg_limit_times: Math.round((limitTimes.reduce((a, b) => a + b, 0) / stocks.length) * 100) / 100,
    max_limit_times: Math.max(...limitTimes),
    avg_pct_chg: Math.round((pctChgs.reduce((a, b) => a + b, 0) / stocks.length) * 100) / 100,
    avg_next_day_return: Math.round((nextDayReturns.reduce((a, b) => a + b, 0) / stocks.length) * 100) / 100,
    high_limit_count: highLimitCount,
    high_limit_ratio: Math.round((highLimitCount / stocks.length) * 10000) / 100 // 百分比，保留2位小数
  };
}

function calculateCategoryPriority(categoryData) {
  const { count, stats } = categoryData;
  
  // 权重因子
  const weights = {
    stock_count: 0.3,      // 股票数量权重
    avg_limit_times: 0.25,  // 平均连续涨停次数权重
    max_limit_times: 0.2,   // 最高连续涨停次数权重
    high_limit_ratio: 0.15, // 高连板股票占比权重
    avg_next_day: 0.1       // 次日平均收益权重
  };
  
  // 归一化处理（将各指标转换为0-1范围的分数）
  const normalizedScores = {
    stock_count: Math.min(count / 10, 1), // 10只股票以上得满分
    avg_limit_times: Math.min((stats.avg_limit_times - 1) / 4, 1), // 平均5连板以上得满分
    max_limit_times: Math.min((stats.max_limit_times - 1) / 9, 1), // 最高10连板以上得满分
    high_limit_ratio: stats.high_limit_ratio / 100, // 高连板占比100%得满分
    avg_next_day: Math.max(0, Math.min(stats.avg_next_day_return / 10, 1)) // 次日10%收益得满分
  };
  
  // 计算加权总分
  let totalScore = 0;
  Object.entries(weights).forEach(([key, weight]) => {
    totalScore += normalizedScores[key] * weight;
  });
  
  // 额外加分：板块股票数量多的额外奖励
  if (count >= 5) totalScore += 0.1;
  if (count >= 8) totalScore += 0.1;
  
  return totalScore;
}

function generateGlobalStats(sortedCategories) {
  if (sortedCategories.length === 0) {
    return {
      top_category: null,
      avg_category_size: 0,
      total_high_limit_stocks: 0,
      market_sentiment: 'neutral'
    };
  }
  
  const totalStocks = sortedCategories.reduce((sum, cat) => sum + cat.count, 0);
  const totalHighLimitStocks = sortedCategories.reduce((sum, cat) => sum + cat.stats.high_limit_count, 0);
  
  // 市场情绪判断
  let sentiment = 'neutral';
  const avgCategorySize = totalStocks / sortedCategories.length;
  const highLimitRatio = totalHighLimitStocks / totalStocks;
  
  if (avgCategorySize >= 5 && highLimitRatio >= 0.3) {
    sentiment = 'bullish'; // 看涨
  } else if (avgCategorySize >= 3 && highLimitRatio >= 0.2) {
    sentiment = 'positive'; // 积极
  } else if (avgCategorySize <= 2 || highLimitRatio <= 0.1) {
    sentiment = 'bearish'; // 看跌
  }
  
  return {
    top_category: sortedCategories[0] ? {
      name: sortedCategories[0].name,
      count: sortedCategories[0].count,
      priority_score: sortedCategories[0].priority
    } : null,
    avg_category_size: Math.round(avgCategorySize * 100) / 100,
    total_high_limit_stocks: totalHighLimitStocks,
    high_limit_ratio: Math.round(highLimitRatio * 10000) / 100,
    market_sentiment: sentiment,
    category_distribution: sortedCategories.map(cat => ({
      name: cat.name,
      count: cat.count,
      percentage: Math.round((cat.count / totalStocks) * 10000) / 100
    }))
  };
}

// 导出处理函数供其他模块使用
module.exports.processLimitUpData = processLimitUpData;
module.exports.calculateCategoryStats = calculateCategoryStats;