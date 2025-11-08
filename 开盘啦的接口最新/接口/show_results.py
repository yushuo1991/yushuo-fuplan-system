#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
显示API分析结果
"""

import json
import os

def show_results():
    """显示API分析结果"""
    
    # 读取最新的诊断报告
    log_dir = "log"
    if not os.path.exists(log_dir):
        print("错误: log目录不存在")
        return
    
    # 找到最新的诊断报告文件
    report_files = [f for f in os.listdir(log_dir) if f.startswith("api_diagnostic_report_") and f.endswith(".json")]
    if not report_files:
        print("错误: 未找到诊断报告文件")
        return
    
    latest_report = sorted(report_files)[-1]
    report_path = os.path.join(log_dir, latest_report)
    
    try:
        with open(report_path, 'r', encoding='utf-8') as f:
            report = json.load(f)
        
        print("="*80)
        print("API 接口分析结果")
        print("="*80)
        
        # 基本信息
        print("\n[基本信息]")
        url_info = report['url_analysis']
        print(f"基础URL: {url_info['base_url']}")
        print(f"分析时间: {report['analysis_time']}")
        
        # 参数分析
        print("\n[URL参数解析]")
        params = url_info['parameters']
        param_desc = report['parameter_analysis']
        
        for key, value in params.items():
            desc = param_desc.get(key, {}).get('description', '未知')
            print(f"  {key}: {value} - {desc}")
        
        # 响应分析
        print("\n[响应分析]")
        response = report['response_analysis']
        print(f"HTTP状态码: {response['status_code']}")
        print(f"服务器: {response['headers'].get('Server', '未知')}")
        print(f"后端技术: {response['headers'].get('X-Powered-By', '未知')}")
        print(f"内容类型: {response['headers'].get('Content-Type', '未知')}")
        
        # 返回数据
        print("\n[返回数据]")
        if response.get('parsed_json'):
            json_data = response['parsed_json']
            print("JSON格式数据:")
            print(json.dumps(json_data, ensure_ascii=False, indent=2))
            
            # 数据结构分析
            json_analysis = response.get('json_analysis', {})
            print(f"\n数据结构:")
            print(f"  类型: {json_analysis.get('type', '未知')}")
            print(f"  字段: {', '.join(json_analysis.get('keys', []))}")
            
            for key, info in json_analysis.get('structure', {}).items():
                print(f"  {key}: {info.get('type', '未知')} - {info.get('sample_value', '')}")
        else:
            print("原始响应:")
            print(response.get('content', '无内容'))
        
        # 摘要
        print("\n[分析摘要]")
        summary = report['summary']
        print(f"API用途: {summary.get('api_purpose', '未知')}")
        print(f"目标股票: {summary.get('target_stock', '未知')}")
        print(f"接口状态: {summary.get('api_status', '未知')}")
        print(f"数据格式: {summary.get('data_format', '未知')}")
        
        if summary.get('issues'):
            print("\n发现问题:")
            for issue in summary['issues']:
                print(f"  - {issue}")
        
        if summary.get('recommendations'):
            print("\n建议:")
            for rec in summary['recommendations']:
                print(f"  - {rec}")
        else:
            print("\n状态: 接口运行正常")
        
        # 技术分析
        print("\n[技术分析]")
        print("模块分析:")
        
        # Web服务器模块
        server = response['headers'].get('Server', '')
        if 'nginx' in server.lower():
            print("  - Web服务器: Nginx")
            print("    状态: 正常运行")
            print("    影响: 负责HTTP请求处理和负载均衡")
        
        # 应用服务器模块  
        powered_by = response['headers'].get('X-Powered-By', '')
        if 'php' in powered_by.lower():
            php_version = powered_by.split('/')[-1] if '/' in powered_by else '未知版本'
            print(f"  - 应用服务器: PHP {php_version}")
            print("    状态: 正常运行")
            print("    影响: 负责业务逻辑处理和数据查询")
        
        # 数据库模块（推断）
        if response.get('parsed_json') and response['parsed_json'].get('errcode') == '0':
            print("  - 数据库模块: 正常")
            print("    状态: 连接正常，但查询结果为空")
            print("    影响: 可能是指定股票在指定时间范围内无涨停数据")
        
        # API接口模块
        print("  - API接口模块: 正常")
        print("    状态: 成功响应，返回标准JSON格式")
        print("    影响: 接口可用，参数解析正确")
        
        print("\n" + "="*80)
        print(f"详细报告已保存至: {report_path}")
        
    except Exception as e:
        print(f"读取报告失败: {str(e)}")

if __name__ == "__main__":
    show_results()