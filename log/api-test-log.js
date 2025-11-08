// API测试日志记录脚本
// 记录真实API调用的详细过程和结果

const fs = require('fs');
const path = require('path');

class APILogger {
  constructor() {
    this.logDir = path.join(__dirname);
    this.logFile = path.join(this.logDir, `api-test-${this.getDateString()}.log`);
    this.createLogFile();
  }
  
  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
  
  getTimestamp() {
    return new Date().toISOString();
  }
  
  createLogFile() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    const header = `==================== API测试日志 ====================
测试开始时间: ${this.getTimestamp()}
目的: 验证开盘啦API真实数据调用和处理功能
========================================================

`;
    fs.writeFileSync(this.logFile, header, 'utf8');
  }
  
  log(level, message, data = null) {
    const timestamp = this.getTimestamp();
    let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      logEntry += '\n' + JSON.stringify(data, null, 2);
    }
    
    logEntry += '\n\n';
    
    fs.appendFileSync(this.logFile, logEntry, 'utf8');
    console.log(logEntry.trim());
  }
  
  info(message, data = null) {
    this.log('info', message, data);
  }
  
  error(message, data = null) {
    this.log('error', message, data);
  }
  
  warn(message, data = null) {
    this.log('warn', message, data);
  }
  
  success(message, data = null) {
    this.log('success', message, data);
  }
  
  debug(message, data = null) {
    this.log('debug', message, data);
  }
  
  // 记录API调用详情
  logAPICall(method, url, headers, response) {
    this.info('API调用详情', {
      method: method,
      url: url,
      headers: headers,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      }
    });
  }
  
  // 记录数据处理结果
  logDataProcessing(inputData, outputData) {
    this.info('数据处理结果', {
      input: {
        type: Array.isArray(inputData) ? 'array' : typeof inputData,
        length: Array.isArray(inputData) ? inputData.length : 'N/A',
        keys: inputData && typeof inputData === 'object' ? Object.keys(inputData) : 'N/A'
      },
      output: {
        total_count: outputData.total_count,
        categories_count: Object.keys(outputData.categories || {}).length,
        categories_names: Object.keys(outputData.categories || {}),
        date: outputData.date
      }
    });
  }
  
  // 记录错误详情
  logError(operation, error, context = {}) {
    this.error(`${operation} 失败`, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context: context
    });
  }
  
  // 生成测试报告
  generateReport(testResults) {
    const reportHeader = `\n==================== 测试报告 ====================\n`;
    const reportFooter = `\n================================================\n`;
    
    let report = reportHeader;
    report += `测试完成时间: ${this.getTimestamp()}\n`;
    report += `总测试数量: ${testResults.length}\n\n`;
    
    testResults.forEach((result, index) => {
      report += `测试 ${index + 1}: ${result.testName}\n`;
      report += `  日期: ${result.date}\n`;
      report += `  状态: ${result.success ? '✓ 成功' : '✗ 失败'}\n`;
      report += `  API状态: ${result.apiStatus || 'N/A'}\n`;
      report += `  数据量: ${result.dataCount || 0}\n`;
      report += `  板块数: ${result.categoriesCount || 0}\n`;
      if (result.error) {
        report += `  错误: ${result.error}\n`;
      }
      report += '\n';
    });
    
    report += reportFooter;
    
    fs.appendFileSync(this.logFile, report, 'utf8');
    console.log(report);
    
    return this.logFile;
  }
}

module.exports = APILogger;