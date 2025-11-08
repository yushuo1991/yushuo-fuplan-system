// 测试数据处理和排序功能的脚本
const fs = require('fs');
const path = require('path');

// 导入数据处理API
const handler = require('./data-processor.js');

// 写入日志
function writeLog(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  const logPath = path.join(__dirname, '..', 'log', 'data-processor-test.log');
  fs.appendFileSync(logPath, logMessage, 'utf8');
  
  if (data) {
    const detailLogPath = path.join(__dirname, '..', 'log', 'data-processor-details.json');
    const existingLogs = fs.existsSync(detailLogPath) ? 
      JSON.parse(fs.readFileSync(detailLogPath, 'utf8')) : [];
    
    existingLogs.push({
      timestamp,
      message,
      data
    });
    
    fs.writeFileSync(detailLogPath, JSON.stringify(existingLogs, null, 2), 'utf8');
  }
}

// 创建模拟请求和响应对象
function createMockRequest(method, data = null, query = {}) {
  return {
    method,
    body: data,
    query
  };
}

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

// 测试数据处理功能
async function testDataProcessing(testDate) {
  try {
    writeLog(`🧪 测试日期 ${testDate} 的数据处理功能`);
    
    // 使用GET方法测试（自动获取历史数据并处理）
    const req = createMockRequest('GET', null, { date: testDate });
    const res = createMockResponse();
    
    await handler(req, res);
    
    if (res.statusCode === 200 && res.data.success) {
      const result = res.data.processed_data;
      
      writeLog(`✅ ${testDate} 数据处理成功`, {
        total_stocks: result.total_stocks,
        total_categories: result.total_categories,
        market_sentiment: result.global_stats.market_sentiment,
        top_category: result.global_stats.top_category?.name
      });
      
      // 详细分析各板块
      writeLog(`📊 ${testDate} 板块分析:`);
      Object.entries(result.categories).forEach(([categoryName, categoryData]) => {
        const stats = categoryData.stats;
        writeLog(`  🎯 ${categoryName}: ${categoryData.count}只股票, 优先级${categoryData.priority_score}, 平均${stats.avg_limit_times}连板, 高连板${stats.high_limit_count}只 (${stats.high_limit_ratio}%)`);
        
        // 显示前3只高连板股票
        const topStocks = categoryData.stocks
          .filter(stock => stock.limit_times >= 2)
          .slice(0, 3);
          
        topStocks.forEach(stock => {
          writeLog(`    📈 ${stock.name}(${stock.ts_code}): ${stock.limit_times}连板, 后续5天: [${stock.next_5_days.join(', ')}]%`);
        });
      });
      
      // 市场情绪分析
      const globalStats = result.global_stats;
      writeLog(`🌡️ 市场情绪: ${globalStats.market_sentiment}, 平均板块规模: ${globalStats.avg_category_size}只, 高连板占比: ${globalStats.high_limit_ratio}%`);
      
      return result;
    } else {
      writeLog(`❌ ${testDate} 数据处理失败: ${res.data.error || '未知错误'}`);
      return null;
    }
    
  } catch (error) {
    writeLog(`💥 ${testDate} 数据处理出错: ${error.message}`);
    return null;
  }
}

// 测试POST方法（使用模拟数据）
async function testPostMethod() {
  writeLog('🔄 测试POST方法处理模拟数据');
  
  const mockData = {
    date: '2024-09-06',
    categories: {
      "人工智能": {
        count: 6,
        stocks: [
          {"ts_code": "002230.SZ", "name": "科大讯飞", "pct_chg": 9.97, "limit_times": 3, "next_5_days": [8.5, 7.4, 6.7, 5.5, 4.6]},
          {"ts_code": "002439.SZ", "name": "启明星辰", "pct_chg": 10.01, "limit_times": 2, "next_5_days": [8.8, 7.2, 6.5, 5.1, 4.3]},
          {"ts_code": "300413.SZ", "name": "芒果超媒", "pct_chg": 9.99, "limit_times": 1, "next_5_days": [7.9, 6.8, 5.9, 4.8, 3.9]},
          {"ts_code": "688111.SH", "name": "金山办公", "pct_chg": 10.00, "limit_times": 1, "next_5_days": [9.2, 8.1, 7.3, 6.2, 5.4]},
          {"ts_code": "300059.SZ", "name": "东方财富", "pct_chg": 9.95, "limit_times": 1, "next_5_days": [7.8, 6.9, 6.1, 5.2, 4.4]},
          {"ts_code": "002152.SZ", "name": "广电运通", "pct_chg": 9.88, "limit_times": 1, "next_5_days": [7.6, 6.7, 5.8, 4.9, 4.1]}
        ]
      },
      "新能源汽车": {
        count: 3,
        stocks: [
          {"ts_code": "002594.SZ", "name": "比亚迪", "pct_chg": 10.00, "limit_times": 2, "next_5_days": [8.9, 7.8, 6.9, 5.8, 4.9]},
          {"ts_code": "300750.SZ", "name": "宁德时代", "pct_chg": 9.99, "limit_times": 1, "next_5_days": [8.3, 7.1, 6.2, 5.3, 4.5]},
          {"ts_code": "601633.SH", "name": "长城汽车", "pct_chg": 9.92, "limit_times": 1, "next_5_days": [7.7, 6.6, 5.7, 4.8, 4.0]}
        ]
      },
      "医药生物": {
        count: 2,
        stocks: [
          {"ts_code": "300122.SZ", "name": "智飞生物", "pct_chg": 9.84, "limit_times": 4, "next_5_days": [7.3, 6.2, 5.3, 4.4, 3.6]},
          {"ts_code": "000661.SZ", "name": "长春高新", "pct_chg": 10.00, "limit_times": 1, "next_5_days": [8.6, 7.4, 6.5, 5.5, 4.6]}
        ]
      }
    }
  };
  
  const req = createMockRequest('POST', mockData);
  const res = createMockResponse();
  
  await handler(req, res);
  
  if (res.statusCode === 200 && res.data.success) {
    const result = res.data.processed_data;
    writeLog('✅ POST方法测试成功', {
      total_stocks: result.total_stocks,
      categories_order: Object.keys(result.categories),
      market_sentiment: result.global_stats.market_sentiment
    });
    
    // 验证排序是否正确（医药生物应该排第一，因为有4连板的股票）
    const categoriesOrder = Object.keys(result.categories);
    writeLog(`📋 板块排序: ${categoriesOrder.join(' > ')}`);
    
    // 验证股票排序是否正确
    Object.entries(result.categories).forEach(([categoryName, categoryData]) => {
      const stocksOrder = categoryData.stocks.map(s => `${s.name}(${s.limit_times}板)`);
      writeLog(`  🔄 ${categoryName} 内部排序: ${stocksOrder.join(' > ')}`);
    });
    
    return result;
  } else {
    writeLog(`❌ POST方法测试失败: ${res.data.error || '未知错误'}`);
    return null;
  }
}

// 测试数据一致性
async function testDataConsistency() {
  writeLog('🔍 测试数据处理一致性');
  
  const testDate = '2024-09-06';
  
  // 连续两次处理同一日期的数据
  const result1 = await testDataProcessing(testDate);
  await new Promise(resolve => setTimeout(resolve, 100));
  const result2 = await testDataProcessing(testDate);
  
  if (result1 && result2) {
    const isConsistent = JSON.stringify(result1) === JSON.stringify(result2);
    writeLog(`数据一致性: ${isConsistent ? '✅ 通过' : '❌ 失败'}`);
    
    if (!isConsistent) {
      writeLog('差异分析:', {
        result1_categories: Object.keys(result1.categories),
        result2_categories: Object.keys(result2.categories)
      });
    }
  }
}

// 测试边缘情况
async function testEdgeCases() {
  writeLog('⚠️ 测试边缘情况');
  
  // 测试空数据
  writeLog('测试1: 空数据处理');
  const emptyReq = createMockRequest('POST', { categories: {} });
  const emptyRes = createMockResponse();
  await handler(emptyReq, emptyRes);
  writeLog(`空数据处理: ${emptyRes.statusCode === 200 ? '✅ 通过' : '❌ 失败'}`);
  
  // 测试无效日期
  writeLog('测试2: 无效日期');
  const invalidDateReq = createMockRequest('GET', null, { date: 'invalid-date' });
  const invalidDateRes = createMockResponse();
  await handler(invalidDateReq, invalidDateRes);
  writeLog(`无效日期处理: ${invalidDateRes.statusCode === 400 ? '✅ 通过' : '❌ 失败'}`);
  
  // 测试不支持的方法
  writeLog('测试3: 不支持的HTTP方法');
  const invalidMethodReq = createMockRequest('DELETE');
  const invalidMethodRes = createMockResponse();
  await handler(invalidMethodReq, invalidMethodRes);
  writeLog(`不支持方法处理: ${invalidMethodRes.statusCode === 405 ? '✅ 通过' : '❌ 失败'}`);
}

// 主测试函数
async function runTests() {
  try {
    // 清空日志文件
    const logPath = path.join(__dirname, '..', 'log', 'data-processor-test.log');
    fs.writeFileSync(logPath, '', 'utf8');
    
    writeLog('🚀 开始数据处理和排序功能测试');
    
    // 测试真实数据处理
    await testDataProcessing('2024-09-06');
    await testDataProcessing('2024-09-05');
    await testDataProcessing('2024-09-04');
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试POST方法
    await testPostMethod();
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试数据一致性
    await testDataConsistency();
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试边缘情况
    await testEdgeCases();
    
    writeLog('🎉 数据处理和排序功能测试完成！');
    writeLog('📋 详细日志保存在: log/data-processor-test.log');
    writeLog('📊 详细数据保存在: log/data-processor-details.json');
    
  } catch (error) {
    writeLog(`💥 测试过程出错: ${error.message}`);
    console.error('测试失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().then(() => {
    console.log('\n✨ 数据处理测试脚本执行完成，请查看日志文件了解详情。');
  }).catch(error => {
    console.error('\n💥 测试脚本执行失败:', error);
  });
}

module.exports = {
  testDataProcessing,
  testPostMethod,
  runTests
};