// 测试真实开盘啦API调用
// 验证API是否能正常返回数据并进行处理

const testRealAPI = async (testDate) => {
  console.log(`\n==================== 测试真实API调用 [${testDate}] ====================`);
  
  try {
    // 构建API URL
    const baseUrl = 'https://apphis.longhuvip.com/w1/api/index.php';
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
      'Date': testDate,
      'UserID': '0'
    });
    
    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log('API URL:', apiUrl);
    
    // 调用API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.longhuvip.com/',
        'Origin': 'https://www.longhuvip.com'
      }
    });
    
    console.log('API响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseText = await response.text();
    console.log('API响应长度:', responseText.length);
    console.log('API响应前1000字符:', responseText.substring(0, 1000));
    
    // 尝试解析JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('JSON解析成功');
    } catch (parseError) {
      console.error('JSON解析失败:', parseError.message);
      return null;
    }
    
    // 分析数据结构
    console.log('数据类型:', typeof data);
    console.log('数据键名:', Object.keys(data || {}));
    
    if (data && data.Data && Array.isArray(data.Data)) {
      console.log('发现Data数组，长度:', data.Data.length);
      if (data.Data.length > 0) {
        console.log('第一个股票数据结构:', Object.keys(data.Data[0]));
        console.log('第一个股票数据示例:', data.Data[0]);
      }
    } else if (Array.isArray(data)) {
      console.log('数据是数组，长度:', data.length);
      if (data.length > 0) {
        console.log('第一个元素结构:', Object.keys(data[0]));
        console.log('第一个元素示例:', data[0]);
      }
    }
    
    return data;
    
  } catch (error) {
    console.error('API测试失败:', error.message);
    console.error('错误详情:', error);
    return null;
  }
};

// 测试历史API功能的完整流程
const testHistoricalAPI = async (testDate) => {
  console.log(`\n==================== 测试历史API完整流程 [${testDate}] ====================`);
  
  try {
    // 调用历史API
    const response = await fetch(`/api/historical-limit-up?date=${testDate}`);
    
    console.log('历史API响应状态:', response.status);
    
    if (!response.ok) {
      console.error('历史API调用失败:', response.status, response.statusText);
      return null;
    }
    
    const result = await response.json();
    console.log('历史API响应成功');
    console.log('返回的数据结构:', {
      success: result.success,
      date: result.date,
      total_count: result.total_count,
      source: result.source,
      categoriesCount: result.data ? Object.keys(result.data.categories || {}).length : 0
    });
    
    if (result.data && result.data.categories) {
      console.log('板块详情:');
      Object.entries(result.data.categories).forEach(([categoryName, categoryData]) => {
        console.log(`  - ${categoryName}: ${categoryData.count}只股票`);
        if (categoryData.stocks && categoryData.stocks.length > 0) {
          console.log(`    示例股票: ${categoryData.stocks[0].name} (${categoryData.stocks[0].ts_code})`);
        }
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('历史API测试失败:', error);
    return null;
  }
};

// 主测试函数
const runTests = async () => {
  console.log('开始测试真实API集成...\n');
  
  const testDates = [
    '2024-09-06', // 上周五
    '2024-09-05', // 上周四
    '2024-09-04'  // 上周三
  ];
  
  // 测试1: 直接调用开盘啦API
  console.log('=== 测试1: 直接API调用 ===');
  for (const testDate of testDates) {
    await testRealAPI(testDate);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 延迟2秒避免频率限制
  }
  
  // 测试2: 通过我们的API调用
  console.log('\n=== 测试2: 历史API集成测试 ===');
  for (const testDate of testDates) {
    await testHistoricalAPI(testDate);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 延迟1秒
  }
  
  console.log('\n==================== 测试完成 ====================');
};

// 导出测试函数
module.exports = {
  testRealAPI,
  testHistoricalAPI,
  runTests
};

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runTests().catch(console.error);
}