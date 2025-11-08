#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
开盘啦API接口解析工具
功能：解析涨停板数据接口并生成诊断报告
"""

import requests
import json
import logging
import os
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import time

class APIAnalyzer:
    def __init__(self):
        self.log_dir = "log"
        self.setup_logging()
        
    def setup_logging(self):
        """设置日志系统"""
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir)
        
        log_filename = os.path.join(self.log_dir, f"api_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_filename, encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def parse_url_parameters(self, url):
        """解析URL参数"""
        self.logger.info("开始解析URL参数")
        
        parsed = urlparse(url)
        params = parse_qs(parsed.query)
        
        # 将参数值从列表转换为字符串
        parsed_params = {k: v[0] if v else '' for k, v in params.items()}
        
        self.logger.info(f"解析到的参数: {json.dumps(parsed_params, ensure_ascii=False, indent=2)}")
        
        return {
            'base_url': f"{parsed.scheme}://{parsed.netloc}{parsed.path}",
            'parameters': parsed_params,
            'full_url': url
        }
    
    def analyze_parameters(self, params):
        """分析参数含义"""
        self.logger.info("开始分析参数含义")
        
        param_analysis = {
            'a': {'value': params.get('a', ''), 'description': 'API接口方法名 - GetDayZhangTing (获取日涨停数据)'},
            'st': {'value': params.get('st', ''), 'description': '状态或开始时间参数'},
            'apiv': {'value': params.get('apiv', ''), 'description': 'API版本号'},
            'c': {'value': params.get('c', ''), 'description': '控制器名称 - HisLimitResumption (历史涨停复盘)'},
            'StockID': {'value': params.get('StockID', ''), 'description': '股票ID - 002456 (欧菲光)'},
            'PhoneOSNew': {'value': params.get('PhoneOSNew', ''), 'description': '手机操作系统新版本标识'},
            'UserID': {'value': params.get('UserID', ''), 'description': '用户ID'},
            'DeviceID': {'value': params.get('DeviceID', ''), 'description': '设备唯一标识符'},
            'VerSion': {'value': params.get('VerSion', ''), 'description': '客户端版本号'},
            'Token': {'value': params.get('Token', ''), 'description': '访问令牌'},
            'Index': {'value': params.get('Index', ''), 'description': '索引或页码'}
        }
        
        for param, info in param_analysis.items():
            self.logger.info(f"{param}: {info['value']} - {info['description']}")
            
        return param_analysis
    
    def send_request(self, url):
        """发送HTTP请求"""
        self.logger.info("开始发送HTTP请求")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        }
        
        try:
            self.logger.info(f"请求URL: {url}")
            self.logger.info(f"请求头: {json.dumps(headers, ensure_ascii=False, indent=2)}")
            
            response = requests.get(url, headers=headers, timeout=30)
            
            self.logger.info(f"响应状态码: {response.status_code}")
            self.logger.info(f"响应头: {dict(response.headers)}")
            
            if response.status_code == 200:
                self.logger.info("请求成功")
                return {
                    'success': True,
                    'status_code': response.status_code,
                    'headers': dict(response.headers),
                    'content': response.text,
                    'content_type': response.headers.get('content-type', '')
                }
            else:
                self.logger.error(f"请求失败，状态码: {response.status_code}")
                return {
                    'success': False,
                    'status_code': response.status_code,
                    'error': f"HTTP {response.status_code}",
                    'content': response.text
                }
                
        except requests.exceptions.Timeout:
            self.logger.error("请求超时")
            return {'success': False, 'error': '请求超时'}
        except requests.exceptions.ConnectionError:
            self.logger.error("连接错误")
            return {'success': False, 'error': '连接错误'}
        except Exception as e:
            self.logger.error(f"请求异常: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def analyze_response(self, response_data):
        """分析响应数据"""
        self.logger.info("开始分析响应数据")
        
        if not response_data['success']:
            self.logger.error(f"响应失败: {response_data.get('error', '未知错误')}")
            return response_data
        
        content = response_data['content']
        content_type = response_data.get('content_type', '')
        
        # 尝试解析JSON
        try:
            if 'application/json' in content_type or content.strip().startswith(('{', '[')):
                json_data = json.loads(content)
                self.logger.info("成功解析为JSON格式")
                self.logger.info(f"JSON数据结构: {json.dumps(json_data, ensure_ascii=False, indent=2)}")
                
                response_data['parsed_json'] = json_data
                response_data['data_type'] = 'json'
                
                # 分析JSON结构
                if isinstance(json_data, dict):
                    response_data['json_analysis'] = self.analyze_json_structure(json_data)
                    
            else:
                self.logger.info("响应内容非JSON格式")
                self.logger.info(f"响应内容: {content[:500]}...")
                response_data['data_type'] = 'text'
                
        except json.JSONDecodeError as e:
            self.logger.warning(f"JSON解析失败: {str(e)}")
            self.logger.info(f"原始响应内容: {content[:500]}...")
            response_data['data_type'] = 'text'
            response_data['json_error'] = str(e)
        
        return response_data
    
    def analyze_json_structure(self, json_data):
        """分析JSON数据结构"""
        analysis = {
            'type': type(json_data).__name__,
            'keys': [],
            'structure': {}
        }
        
        if isinstance(json_data, dict):
            analysis['keys'] = list(json_data.keys())
            for key, value in json_data.items():
                analysis['structure'][key] = {
                    'type': type(value).__name__,
                    'sample_value': str(value)[:100] if not isinstance(value, (dict, list)) else f"{type(value).__name__} with {len(value)} items"
                }
                
        elif isinstance(json_data, list):
            analysis['length'] = len(json_data)
            if json_data:
                analysis['first_item_type'] = type(json_data[0]).__name__
                if isinstance(json_data[0], dict):
                    analysis['first_item_keys'] = list(json_data[0].keys())
                    
        return analysis
    
    def generate_diagnostic_report(self, url_analysis, param_analysis, response_analysis):
        """生成诊断报告"""
        self.logger.info("开始生成诊断报告")
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report = {
            'timestamp': timestamp,
            'analysis_time': datetime.now().isoformat(),
            'url_analysis': url_analysis,
            'parameter_analysis': param_analysis,
            'response_analysis': response_analysis,
            'summary': self.generate_summary(url_analysis, param_analysis, response_analysis)
        }
        
        # 保存报告到文件
        report_filename = os.path.join(self.log_dir, f"api_diagnostic_report_{timestamp}.json")
        with open(report_filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"诊断报告已保存至: {report_filename}")
        return report
    
    def generate_summary(self, url_analysis, param_analysis, response_analysis):
        """生成分析摘要"""
        summary = {
            'api_purpose': '获取股票涨停板历史数据',
            'target_stock': param_analysis.get('StockID', {}).get('value', '未知'),
            'api_status': 'success' if response_analysis.get('success') else 'failed',
            'data_format': response_analysis.get('data_type', '未知'),
            'issues': [],
            'recommendations': []
        }
        
        # 检查可能的问题
        if not response_analysis.get('success'):
            summary['issues'].append(f"API请求失败: {response_analysis.get('error', '未知错误')}")
            summary['recommendations'].append("检查网络连接和API服务器状态")
        
        if response_analysis.get('status_code') != 200:
            summary['issues'].append(f"HTTP状态码异常: {response_analysis.get('status_code')}")
            summary['recommendations'].append("检查API接口URL和参数是否正确")
        
        if response_analysis.get('json_error'):
            summary['issues'].append("JSON解析失败，可能返回非标准JSON格式")
            summary['recommendations'].append("检查API返回格式或联系接口提供方")
        
        return summary
    
    def run_analysis(self, url):
        """运行完整分析"""
        self.logger.info("开始API接口完整分析")
        
        try:
            # 1. 解析URL参数
            url_analysis = self.parse_url_parameters(url)
            
            # 2. 分析参数含义
            param_analysis = self.analyze_parameters(url_analysis['parameters'])
            
            # 3. 发送请求
            response_analysis = self.send_request(url)
            
            # 4. 分析响应
            response_analysis = self.analyze_response(response_analysis)
            
            # 5. 生成诊断报告
            report = self.generate_diagnostic_report(url_analysis, param_analysis, response_analysis)
            
            self.logger.info("API接口分析完成")
            return report
            
        except Exception as e:
            self.logger.error(f"分析过程出现异常: {str(e)}")
            return {'error': str(e), 'success': False}

def main():
    """主函数"""
    url = "https://apphis.longhuvip.com/w1/api/index.php?a=GetDayZhangTing&st=100&apiv=w31&c=HisLimitResumption&StockID=002456&PhoneOSNew=1&UserID=0&DeviceID=00000000-296c-20ad-0000-00003eb74e84&VerSion=5.7.0.12&Token=0&Index=0"
    
    analyzer = APIAnalyzer()
    report = analyzer.run_analysis(url)
    
    print("\n" + "="*80)
    print("API 接口分析结果")
    print("="*80)
    
    if report.get('success', True):
        print(f"\n📊 分析摘要:")
        summary = report.get('summary', {})
        print(f"   API用途: {summary.get('api_purpose', '未知')}")
        print(f"   目标股票: {summary.get('target_stock', '未知')}")
        print(f"   接口状态: {summary.get('api_status', '未知')}")
        print(f"   数据格式: {summary.get('data_format', '未知')}")
        
        if summary.get('issues'):
            print(f"\n⚠️  发现问题:")
            for issue in summary['issues']:
                print(f"   - {issue}")
        
        if summary.get('recommendations'):
            print(f"\n💡 建议:")
            for rec in summary['recommendations']:
                print(f"   - {rec}")
                
        # 显示返回数据
        response = report.get('response_analysis', {})
        if response.get('success') and response.get('parsed_json'):
            print(f"\n📋 返回数据:")
            print(json.dumps(response['parsed_json'], ensure_ascii=False, indent=2))
        elif response.get('content'):
            print(f"\n📋 原始响应:")
            print(response['content'][:1000] + ("..." if len(response['content']) > 1000 else ""))
    else:
        print(f"\n❌ 分析失败: {report.get('error', '未知错误')}")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    main()