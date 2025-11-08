// 测试历史涨停数据获取脚本
const fs = require('fs');
const path = require('path');

// 导入历史数据API处理函数
const handler = require('./historical-limit-up.js');

// 模拟请求对象
function createMockRequest(date) {
  return {
    method: 'GET',
    query: { date }
  };
}

// 模拟响应对象
function createMockResponse() {
  const response = {
    headers: {},
    statusCode: 200,
    data: null,
    
    setHeader(key, value) {
      this.headers[key] = value;
    },
    
    status(code) {
      this.statusCode = code;
      return this;
    },
    
    json(data) {
      this.data = data;
      return this;
    },
    
    end() {
      return this;
    }
  };
  
  return response;
}

// 写入日志
function writeLog(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // 写入控制台
  console.log(logMessage.trim());
  
  // 写入日志文件
  const logPath = path.join(__dirname, '..', 'log', 'historical-data-test.log');
  fs.appendFileSync(logPath, logMessage, 'utf8');
  
  // 如果有数据，写入详细日志
  if (data) {
    const detailLogPath = path.join(__dirname, '..', 'log', 'historical-data-details.json');
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

// 测试指定日期的数据获取
async function testDateData(date) {
  try {
    writeLog(`开始测试日期: ${date}`);
    
    const req = createMockRequest(date);
    const res = createMockResponse();
    
    // 调用API处理函数
    await handler(req, res);
    
    if (res.statusCode === 200) {
      const result = res.data;
      writeLog(`✅ ${date} 数据获取成功`, {
        total_count: result.total_count,
        categories_count: Object.keys(result.data.categories || {}).length,
        categories: Object.keys(result.data.categories || {})
      });
      
      // 统计各板块信息
      if (result.data.categories) {
        Object.entries(result.data.categories).forEach(([category, info]) => {
          writeLog(`  📊 ${category}: ${info.count}只股票`);
          
          // 检查后续5天数据
          if (info.stocks && info.stocks[0]) {
            const sample = info.stocks[0];
            writeLog(`  📈 样本股票 ${sample.name}(${sample.ts_code}): 连续${sample.limit_times}板, 后续5天预期: [${sample.next_5_days.join(', ')}]%`);
          }
        });
      }
      
      return result;
    } else {
      writeLog(`❌ ${date} 数据获取失败: ${res.data.error}`);
      return null;
    }
    
  } catch (error) {
    writeLog(`💥 ${date} 测试出错: ${error.message}`);
    return null;
  }
}

// 测试最近7天数据
async function testRecent7Days() {
  writeLog('🚀 开始测试最近7天历史涨停数据获取');
  
  const today = new Date();
  const testDates = [];
  
  // 生成最近7个工作日
  for (let i = 1; testDates.length < 7; i++) {
    const testDate = new Date(today);
    testDate.setDate(today.getDate() - i);
    
    // 跳过周末
    const dayOfWeek = testDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = testDate.toISOString().split('T')[0];
      testDates.push(dateStr);
    }
  }
  
  writeLog(`📅 测试日期列表: ${testDates.join(', ')}`);
  
  const results = [];
  
  // 逐个测试
  for (const date of testDates) {
    const result = await testDateData(date);
    if (result) {
      results.push(result);
    }
    
    // 间隔500ms避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 汇总统计
  writeLog('📊 七日数据汇总统计:');
  const totalStats = {
    total_stocks: 0,
    total_categories: new Set(),
    date_range: `${testDates[testDates.length - 1]} 到 ${testDates[0]}`
  };
  
  results.forEach((result, index) => {
    if (result.data && result.data.categories) {
      totalStats.total_stocks += result.total_count;
      Object.keys(result.data.categories).forEach(cat => {
        totalStats.total_categories.add(cat);
      });
    }
  });
  
  totalStats.total_categories = Array.from(totalStats.total_categories);
  
  writeLog('📈 汇总结果:', totalStats);
  writeLog('✅ 最近7天历史数据测试完成');
  
  return results;
}

// 测试特定功能
async function testSpecificFeatures() {
  writeLog('🧪 开始测试特定功能');
  
  // 1. 测试日期验证
  writeLog('测试1: 日期格式验证');
  const invalidDateReq = createMockRequest('invalid-date');
  const invalidDateRes = createMockResponse();
  await handler(invalidDateReq, invalidDateRes);
  writeLog(`无效日期测试: ${invalidDateRes.statusCode === 400 ? '✅ 通过' : '❌ 失败'}`);
  
  // 2. 测试周末日期
  writeLog('测试2: 周末日期处理');
  const weekend = '2024-09-01'; // 假设是周末
  const weekendResult = await testDateData(weekend);
  
  // 3. 测试数据一致性（同一日期多次请求应返回相同结果）
  writeLog('测试3: 数据一致性验证');
  const testDate = '2024-09-06';
  const result1 = await testDateData(testDate);
  await new Promise(resolve => setTimeout(resolve, 100));
  const result2 = await testDateData(testDate);
  
  const isConsistent = JSON.stringify(result1) === JSON.stringify(result2);
  writeLog(`数据一致性: ${isConsistent ? '✅ 通过' : '❌ 失败'}`);
  
  writeLog('🎯 特定功能测试完成');
}

// 主测试函数
async function runTests() {
  try {
    // 清空日志文件
    const logPath = path.join(__dirname, '..', 'log', 'historical-data-test.log');
    fs.writeFileSync(logPath, '', 'utf8');
    
    writeLog('🎬 开始历史涨停数据API测试');
    writeLog('📝 测试模块: 历史涨停数据获取、数据分类、后续表现预测');
    
    // 测试最近7天
    await testRecent7Days();
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试特定功能
    await testSpecificFeatures();
    
    writeLog('🏆 所有测试完成！');
    writeLog('📋 详细日志保存在: log/historical-data-test.log');
    writeLog('📊 详细数据保存在: log/historical-data-details.json');
    
  } catch (error) {
    writeLog(`💥 测试过程出错: ${error.message}`);
    console.error('测试失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().then(() => {
    console.log('\n✨ 测试脚本执行完成，请查看日志文件了解详情。');
  }).catch(error => {
    console.error('\n💥 测试脚本执行失败:', error);
  });
}

module.exports = {
  testDateData,
  testRecent7Days,
  runTests
};