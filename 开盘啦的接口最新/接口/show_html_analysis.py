#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
显示HTML数据来源分析结果
"""

import json
import os
import re
from urllib.parse import urlparse

def analyze_html_simple():
    """简化的HTML分析"""
    file_path = r"C:\吴QQ的AIR\BaiduSyncdisk\600 - 原桌面\7-25-2.html"
    
    print("="*80)
    print("HTML文件数据来源分析结果")
    print("="*80)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        print(f"\n文件信息:")
        print(f"   文件路径: {file_path}")
        print(f"   文件大小: {len(html_content)} 字符")
        
        # 提取API端点
        api_endpoints = []
        
        # fetch请求模式
        fetch_patterns = [
            r'fetch\([\'\"](https?://[^\'\"\s]+)[\'\"]\)',
            r'await\s+fetch\([\'\"](https?://[^\'\"\s]+)[\'\"]\)',
        ]
        
        print(f"\nAPI端点分析:")
        endpoint_count = 1
        
        for pattern in fetch_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                domain = urlparse(match).netloc
                purpose = ""
                
                if 'longhuvip.com' in match.lower():
                    if 'getytfp_bkhx' in match.lower():
                        purpose = "获取板块行情数据"
                    else:
                        purpose = "龙虎榜数据接口"
                elif 'szse.cn' in match.lower():
                    purpose = "深交所交易日历数据"
                elif 'kpl.php' in match.lower():
                    purpose = "历史数据查询接口"
                
                print(f"   {endpoint_count}. {match}")
                print(f"      域名: {domain}")
                print(f"      用途: {purpose}")
                print()
                
                api_endpoints.append({
                    'url': match,
                    'domain': domain,
                    'purpose': purpose
                })
                endpoint_count += 1
        
        # 提取图片数据源
        print(f"图片数据源分析:")
        img_patterns = [
            r'http://image\.sinajs\.cn/newchart/daily/[^\'\"\s]*\.gif',
            r'src=[\'\"](https?://[^\'\"\s]+\.(?:jpg|jpeg|png|gif|svg|webp))[\'\"]\)',
        ]
        
        image_count = 1
        for pattern in img_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0]
                
                domain = urlparse(match).netloc if match.startswith('http') else 'image.sinajs.cn'
                purpose = ""
                
                if 'sinajs.cn' in match.lower():
                    if 'newchart/daily' in match.lower():
                        purpose = "新浪财经K线图表"
                    else:
                        purpose = "新浪财经图表"
                
                print(f"   {image_count}. {match}")
                print(f"      域名: {domain}")
                print(f"      用途: {purpose}")
                print()
                image_count += 1
        
        # 提取外部脚本资源
        print(f"外部脚本资源:")
        script_pattern = r'<script[^>]+src=[\'\"](https?://[^\'\"\s]+)[\'\"]\)'
        script_matches = re.findall(script_pattern, html_content, re.IGNORECASE)
        
        script_count = 1
        for match in script_matches:
            domain = urlparse(match).netloc
            purpose = ""
            
            if 'echarts' in match.lower():
                purpose = "ECharts图表库"
            elif 'cdn.jsdelivr.net' in match.lower():
                purpose = "CDN JavaScript库"
            
            print(f"   {script_count}. {match}")
            print(f"      域名: {domain}")
            print(f"      用途: {purpose}")
            print()
            script_count += 1
        
        # 域名统计
        all_domains = set()
        for endpoint in api_endpoints:
            all_domains.add(endpoint['domain'])
        
        for match in script_matches:
            all_domains.add(urlparse(match).netloc)
        
        print(f"域名统计:")
        domain_analysis = {}
        
        # 统计各域名的详细信息
        for domain in all_domains:
            if not domain:
                continue
                
            domain_info = {
                'api_count': 0,
                'purposes': set(),
                'description': ''
            }
            
            # 统计API使用
            for endpoint in api_endpoints:
                if endpoint['domain'] == domain:
                    domain_info['api_count'] += 1
                    if endpoint['purpose']:
                        domain_info['purposes'].add(endpoint['purpose'])
            
            # 添加域名描述
            if 'longhuvip.com' in domain:
                domain_info['description'] = '龙虎榜数据服务商'
            elif 'szse.cn' in domain:
                domain_info['description'] = '深圳证券交易所'
            elif 'sinajs.cn' in domain:
                domain_info['description'] = '新浪财经数据服务'
            elif 'jsdelivr.net' in domain:
                domain_info['description'] = 'CDN服务提供商'
            else:
                domain_info['description'] = '第三方服务'
            
            domain_analysis[domain] = domain_info
        
        for domain, info in domain_analysis.items():
            print(f"   {domain}")
            print(f"      描述: {info['description']}")
            print(f"      API调用次数: {info['api_count']}")
            if info['purposes']:
                print(f"      主要用途: {', '.join(info['purposes'])}")
            print()
        
        # 技术栈分析
        print(f"技术栈分析:")
        
        tech_features = []
        
        # 检查JavaScript库
        if 'echarts' in html_content.lower():
            tech_features.append("使用ECharts图表库进行数据可视化")
        
        if 'localstorage' in html_content.lower():
            tech_features.append("使用LocalStorage进行本地数据存储")
        
        if 'fetch(' in html_content.lower():
            tech_features.append("使用现代Fetch API进行网络请求")
        
        if 'json.parse' in html_content.lower():
            tech_features.append("JSON数据格式处理")
        
        if 'exportdata' in html_content.lower():
            tech_features.append("支持数据导入导出功能")
        
        for i, feature in enumerate(tech_features, 1):
            print(f"   {i}. {feature}")
        
        # 功能模块分析
        print(f"\n功能模块分析:")
        
        modules = []
        
        if 'StockDataManager' in html_content:
            modules.append("股票数据管理模块")
        
        if 'fetchTodayData' in html_content:
            modules.append("实时数据获取模块")
        
        if 'renderTable' in html_content:
            modules.append("数据表格渲染模块")
        
        if 'showStockModal' in html_content:
            modules.append("股票详情弹窗模块")
        
        if 'exportData' in html_content:
            modules.append("数据导出模块")
        
        if 'sectorChartModal' in html_content:
            modules.append("板块图表分析模块")
        
        for i, module in enumerate(modules, 1):
            print(f"   {i}. {module}")
        
        # 数据流分析
        print(f"\n数据流分析:")
        print(f"   1. 从龙虎榜API获取板块行情数据")
        print(f"   2. 从深交所API获取交易日历")
        print(f"   3. 从历史数据接口获取往期数据")
        print(f"   4. 将数据存储到浏览器LocalStorage")
        print(f"   5. 从新浪财经获取K线图表")
        print(f"   6. 使用ECharts生成趋势图表")
        print(f"   7. 支持数据的导入和导出")
        
        # 关键发现
        print(f"\n关键发现:")
        print(f"   • 主要数据源: longhuvip.com (龙虎榜数据)")
        print(f"   • 图表数据源: image.sinajs.cn (新浪财经)")
        print(f"   • 交易日历: szse.cn (深圳证券交易所)")
        print(f"   • 本地存储: 使用浏览器LocalStorage")
        print(f"   • 可视化工具: ECharts图表库")
        print(f"   • 数据更新: 支持实时和历史数据获取")
        
        print("\n" + "="*80)
        
    except Exception as e:
        print(f"分析过程出现错误: {str(e)}")

if __name__ == "__main__":
    analyze_html_simple()