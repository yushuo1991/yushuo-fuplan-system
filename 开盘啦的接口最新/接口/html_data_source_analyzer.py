#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HTML文件数据来源分析工具
分析HTML文件中的API接口和数据来源
"""

import re
import json
import logging
import os
from datetime import datetime
from urllib.parse import urlparse

class HTMLDataSourceAnalyzer:
    def __init__(self):
        self.log_dir = "log"
        self.setup_logging()
        self.api_endpoints = []
        self.external_resources = []
        self.data_sources = []
        
    def setup_logging(self):
        """设置日志系统"""
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir)
        
        log_filename = os.path.join(self.log_dir, f"html_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_filename, encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def analyze_html_file(self, file_path):
        """分析HTML文件"""
        self.logger.info(f"开始分析HTML文件: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # 分析各种数据源
            self.extract_api_endpoints(html_content)
            self.extract_external_resources(html_content)
            self.extract_image_sources(html_content)
            self.extract_javascript_urls(html_content)
            self.analyze_fetch_requests(html_content)
            self.analyze_data_flow(html_content)
            
            # 生成分析报告
            report = self.generate_report(file_path)
            return report
            
        except Exception as e:
            self.logger.error(f"分析HTML文件失败: {str(e)}")
            return None
    
    def extract_api_endpoints(self, html_content):
        """提取API端点"""
        self.logger.info("提取API端点")
        
        # 匹配fetch请求中的URL
        fetch_patterns = [
            r'fetch\([\'\"](https?://[^\'\"\s]+)[\'\"]\)',
            r'fetch\(`([^`]+)`\)',
            r'await\s+fetch\([\'\"](https?://[^\'\"\s]+)[\'\"]\)',
        ]
        
        for pattern in fetch_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0] if match[0] else match[1]
                
                endpoint_info = {
                    'type': 'API_ENDPOINT',
                    'url': match,
                    'method': 'GET',  # 默认GET，实际可能需要更细致的分析
                    'purpose': self.guess_api_purpose(match)
                }
                self.api_endpoints.append(endpoint_info)
                self.logger.info(f"发现API端点: {match}")
        
        # 匹配XMLHttpRequest或其他AJAX请求
        ajax_patterns = [
            r'xhr\.open\([\'\"](GET|POST)[\'\"]\s*,\s*[\'\"](https?://[^\'\"\s]+)[\'\"]\)',
            r'\.get\([\'\"](https?://[^\'\"\s]+)[\'\"]\)',
            r'\.post\([\'\"](https?://[^\'\"\s]+)[\'\"]\)',
        ]
        
        for pattern in ajax_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    method = match[0] if len(match) > 1 else 'GET'
                    url = match[1] if len(match) > 1 else match[0]
                else:
                    method = 'GET'
                    url = match
                
                endpoint_info = {
                    'type': 'AJAX_REQUEST',
                    'url': url,
                    'method': method.upper(),
                    'purpose': self.guess_api_purpose(url)
                }
                self.api_endpoints.append(endpoint_info)
                self.logger.info(f"发现AJAX请求: {method} {url}")
    
    def extract_external_resources(self, html_content):
        """提取外部资源"""
        self.logger.info("提取外部资源")
        
        # CDN资源
        cdn_pattern = r'src=[\'\"](https?://cdn\.[^\'\"\s]+)[\'\"]\)'
        cdn_matches = re.findall(cdn_pattern, html_content, re.IGNORECASE)
        for match in cdn_matches:
            resource_info = {
                'type': 'CDN_RESOURCE',
                'url': match,
                'resource_type': self.guess_resource_type(match)
            }
            self.external_resources.append(resource_info)
            self.logger.info(f"发现CDN资源: {match}")
        
        # 脚本资源
        script_pattern = r'<script[^>]+src=[\'\"](https?://[^\'\"\s]+)[\'\"]\)'
        script_matches = re.findall(script_pattern, html_content, re.IGNORECASE)
        for match in script_matches:
            resource_info = {
                'type': 'SCRIPT_RESOURCE',
                'url': match,
                'resource_type': 'javascript'
            }
            self.external_resources.append(resource_info)
            self.logger.info(f"发现脚本资源: {match}")
    
    def extract_image_sources(self, html_content):
        """提取图片来源"""
        self.logger.info("提取图片来源")
        
        # 图片src模式
        img_patterns = [
            r'src=[\'\"](https?://[^\'\"\s]+\.(?:jpg|jpeg|png|gif|svg|webp))[\'\"]\)',
            r'<img[^>]+src=[\'\"](https?://[^\'\"\s]+)[\'\"]\)',
            r'image\.sinajs\.cn[^\'\"\s]*',
            r'http://image\.sinajs\.cn/newchart/daily/[^\'\"\s]*\.gif'
        ]
        
        for pattern in img_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0]
                
                # 补全不完整的URL
                if not match.startswith('http'):
                    match = 'http://' + match
                
                image_info = {
                    'type': 'IMAGE_SOURCE',
                    'url': match,
                    'purpose': self.guess_image_purpose(match)
                }
                self.data_sources.append(image_info)
                self.logger.info(f"发现图片源: {match}")
    
    def extract_javascript_urls(self, html_content):
        """提取JavaScript中的URL"""
        self.logger.info("提取JavaScript中的URL")
        
        # 在JavaScript代码中查找URL
        js_url_patterns = [
            r'[\'\"](https?://[^\'\"\s]+\.(?:php|aspx?|jsp|py|rb)(?:\?[^\'\"\s]*)?)[\'\"]\)',
            r'[\'\"](https?://[a-zA-Z0-9.-]+/[^\'\"\s]*)[\'\"]\)',
        ]
        
        for pattern in js_url_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0]
                
                # 过滤掉一些不相关的URL
                if any(skip in match.lower() for skip in ['font', 'css', 'bootstrap', 'jquery']):
                    continue
                
                url_info = {
                    'type': 'JAVASCRIPT_URL',
                    'url': match,
                    'purpose': self.guess_api_purpose(match)
                }
                self.data_sources.append(url_info)
                self.logger.info(f"发现JavaScript URL: {match}")
    
    def analyze_fetch_requests(self, html_content):
        """分析fetch请求的详细信息"""
        self.logger.info("分析fetch请求详情")
        
        # 查找完整的fetch调用
        fetch_pattern = r'fetch\s*\(\s*[\'\"](https?://[^\'\"\s]+)[\'\"]\s*(?:,\s*\{([^}]+)\})?\s*\)'
        matches = re.findall(fetch_pattern, html_content, re.IGNORECASE | re.DOTALL)
        
        for match in matches:
            url = match[0]
            options = match[1] if len(match) > 1 else ''
            
            # 分析请求选项
            method = 'GET'
            headers = {}
            
            if options:
                method_match = re.search(r'method\s*:\s*[\'\"](GET|POST|PUT|DELETE)[\'\"]\)', options, re.IGNORECASE)
                if method_match:
                    method = method_match.group(1).upper()
                
                # 查找headers
                headers_match = re.search(r'headers\s*:\s*\{([^}]+)\}', options, re.IGNORECASE)
                if headers_match:
                    headers_content = headers_match.group(1)
                    header_pairs = re.findall(r'[\'\"]([\w-]+)[\'\"]\s*:\s*[\'\"]([\w\s/.-]+)[\'\"]\)', headers_content)
                    for key, value in header_pairs:
                        headers[key] = value
            
            fetch_info = {
                'type': 'FETCH_REQUEST',
                'url': url,
                'method': method,
                'headers': headers,
                'purpose': self.guess_api_purpose(url),
                'domain': urlparse(url).netloc
            }
            self.api_endpoints.append(fetch_info)
            self.logger.info(f"详细fetch请求: {method} {url}")
    
    def analyze_data_flow(self, html_content):
        """分析数据流"""
        self.logger.info("分析数据流")
        
        # 查找数据处理函数
        data_processing_patterns = [
            r'processApiData\s*\(',
            r'\.json\(\)\s*\.then',
            r'localStorage\.(?:setItem|getItem)',
            r'JSON\.(?:parse|stringify)',
        ]
        
        data_flow_info = []
        for pattern in data_processing_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            if matches:
                data_flow_info.append({
                    'pattern': pattern,
                    'count': len(matches),
                    'type': self.guess_data_processing_type(pattern)
                })
        
        return data_flow_info
    
    def guess_api_purpose(self, url):
        """猜测API用途"""
        url_lower = url.lower()
        
        if 'longhuvip' in url_lower:
            if 'getytfp_bkhx' in url_lower:
                return '获取板块行情数据'
            elif 'getdayzhangting' in url_lower:
                return '获取涨停数据'
            else:
                return '龙虎榜数据接口'
        elif 'szse.cn' in url_lower:
            return '深交所交易日历数据'
        elif 'kpl.php' in url_lower:
            return '历史数据查询接口'
        elif 'sinajs.cn' in url_lower:
            return '新浪财经图表数据'
        else:
            return '未知API接口'
    
    def guess_image_purpose(self, url):
        """猜测图片用途"""
        url_lower = url.lower()
        
        if 'sinajs.cn' in url_lower:
            if 'newchart/daily' in url_lower:
                return 'K线图表'
            else:
                return '新浪财经图表'
        elif any(ext in url_lower for ext in ['.jpg', '.png', '.gif']):
            return '静态图片资源'
        else:
            return '未知图片用途'
    
    def guess_resource_type(self, url):
        """猜测资源类型"""
        url_lower = url.lower()
        
        if url_lower.endswith('.js'):
            return 'javascript'
        elif url_lower.endswith('.css'):
            return 'stylesheet'
        elif any(ext in url_lower for ext in ['.jpg', '.png', '.gif', '.svg']):
            return 'image'
        else:
            return 'unknown'
    
    def guess_data_processing_type(self, pattern):
        """猜测数据处理类型"""
        if 'localStorage' in pattern:
            return '本地存储操作'
        elif 'JSON' in pattern:
            return 'JSON数据处理'
        elif 'processApiData' in pattern:
            return 'API数据处理'
        elif '.json()' in pattern:
            return 'HTTP响应解析'
        else:
            return '未知数据处理'
    
    def generate_report(self, file_path):
        """生成分析报告"""
        self.logger.info("生成分析报告")
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report = {
            'timestamp': timestamp,
            'analysis_time': datetime.now().isoformat(),
            'file_path': file_path,
            'summary': {
                'total_api_endpoints': len(self.api_endpoints),
                'total_external_resources': len(self.external_resources),
                'total_data_sources': len(self.data_sources),
                'unique_domains': len(set(urlparse(item['url']).netloc for item in self.api_endpoints + self.external_resources + self.data_sources if 'url' in item))
            },
            'api_endpoints': self.api_endpoints,
            'external_resources': self.external_resources,
            'data_sources': self.data_sources,
            'domain_analysis': self.analyze_domains(),
            'technology_stack': self.analyze_technology_stack(),
            'data_flow_patterns': self.analyze_data_flow_patterns()
        }
        
        # 保存报告到文件
        report_filename = os.path.join(self.log_dir, f"html_data_source_report_{timestamp}.json")
        with open(report_filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"分析报告已保存至: {report_filename}")
        return report
    
    def analyze_domains(self):
        """分析域名分布"""
        domains = {}
        
        for item in self.api_endpoints + self.external_resources + self.data_sources:
            if 'url' in item:
                domain = urlparse(item['url']).netloc
                if domain:
                    if domain not in domains:
                        domains[domain] = {
                            'count': 0,
                            'types': set(),
                            'purposes': set()
                        }
                    domains[domain]['count'] += 1
                    domains[domain]['types'].add(item['type'])
                    if 'purpose' in item:
                        domains[domain]['purposes'].add(item['purpose'])
        
        # 转换set为list以便JSON序列化
        for domain in domains:
            domains[domain]['types'] = list(domains[domain]['types'])
            domains[domain]['purposes'] = list(domains[domain]['purposes'])
        
        return domains
    
    def analyze_technology_stack(self):
        """分析技术栈"""
        tech_stack = {
            'frontend_frameworks': [],
            'chart_libraries': [],
            'data_processing': [],
            'storage_methods': []
        }
        
        # 基于发现的资源分析技术栈
        for resource in self.external_resources:
            url = resource['url'].lower()
            if 'echarts' in url:
                tech_stack['chart_libraries'].append('ECharts')
            elif 'jquery' in url:
                tech_stack['frontend_frameworks'].append('jQuery')
            elif 'bootstrap' in url:
                tech_stack['frontend_frameworks'].append('Bootstrap')
        
        # 基于数据源分析
        for source in self.data_sources:
            if 'localStorage' in str(source):
                tech_stack['storage_methods'].append('LocalStorage')
        
        return tech_stack
    
    def analyze_data_flow_patterns(self):
        """分析数据流模式"""
        patterns = {
            'api_to_localstorage': False,
            'real_time_updates': False,
            'data_export_import': False,
            'chart_integration': False
        }
        
        # 基于API端点和数据源分析数据流模式
        api_urls = [item['url'] for item in self.api_endpoints if 'url' in item]
        
        if any('longhuvip.com' in url for url in api_urls):
            patterns['real_time_updates'] = True
        
        if any('sinajs.cn' in source['url'] for source in self.data_sources if 'url' in source):
            patterns['chart_integration'] = True
        
        # 检查是否有导入导出功能
        all_content = str(self.api_endpoints + self.external_resources + self.data_sources)
        if 'export' in all_content.lower() or 'import' in all_content.lower():
            patterns['data_export_import'] = True
        
        if 'localStorage' in all_content:
            patterns['api_to_localstorage'] = True
        
        return patterns

def main():
    """主函数"""
    file_path = r"C:\吴QQ的AIR\BaiduSyncdisk\600 - 原桌面\7-25-2.html"
    
    analyzer = HTMLDataSourceAnalyzer()
    report = analyzer.analyze_html_file(file_path)
    
    if report:
        print("\n" + "="*80)
        print("HTML数据来源分析结果")
        print("="*80)
        
        # 基本信息
        print(f"\n📄 文件信息:")
        print(f"   文件路径: {report['file_path']}")
        print(f"   分析时间: {report['analysis_time']}")
        
        # 统计概览
        summary = report['summary']
        print(f"\n📊 统计概览:")
        print(f"   API端点数量: {summary['total_api_endpoints']}")
        print(f"   外部资源数量: {summary['total_external_resources']}")
        print(f"   数据源数量: {summary['total_data_sources']}")
        print(f"   涉及域名数量: {summary['unique_domains']}")
        
        # API端点详情
        print(f"\n🔗 API端点详情:")
        for i, endpoint in enumerate(report['api_endpoints'], 1):
            print(f"   {i}. {endpoint['url']}")
            print(f"      方法: {endpoint.get('method', 'GET')}")
            print(f"      用途: {endpoint.get('purpose', '未知')}")
            print(f"      类型: {endpoint.get('type', 'API')}")
            if endpoint.get('headers'):
                print(f"      请求头: {endpoint['headers']}")
            print()
        
        # 数据源详情
        print(f"\n📈 数据源详情:")
        for i, source in enumerate(report['data_sources'], 1):
            print(f"   {i}. {source['url']}")
            print(f"      类型: {source.get('type', '未知')}")
            print(f"      用途: {source.get('purpose', '未知')}")
            print()
        
        # 域名分析
        print(f"\n🌐 域名分析:")
        for domain, info in report['domain_analysis'].items():
            print(f"   {domain}:")
            print(f"      使用次数: {info['count']}")
            print(f"      资源类型: {', '.join(info['types'])}")
            print(f"      主要用途: {', '.join(info['purposes'])}")
            print()
        
        # 技术栈分析
        tech_stack = report['technology_stack']
        print(f"\n⚙️ 技术栈分析:")
        if tech_stack['chart_libraries']:
            print(f"   图表库: {', '.join(tech_stack['chart_libraries'])}")
        if tech_stack['frontend_frameworks']:
            print(f"   前端框架: {', '.join(tech_stack['frontend_frameworks'])}")
        if tech_stack['storage_methods']:
            print(f"   存储方式: {', '.join(tech_stack['storage_methods'])}")
        
        # 数据流模式
        patterns = report['data_flow_patterns']
        print(f"\n🔄 数据流模式:")
        print(f"   API到本地存储: {'✅' if patterns['api_to_localstorage'] else '❌'}")
        print(f"   实时数据更新: {'✅' if patterns['real_time_updates'] else '❌'}")
        print(f"   数据导入导出: {'✅' if patterns['data_export_import'] else '❌'}")
        print(f"   图表集成: {'✅' if patterns['chart_integration'] else '❌'}")
        
        print("\n" + "="*80)
        print(f"详细报告已保存至: log/html_data_source_report_{report['timestamp']}.json")
        
    else:
        print("❌ 分析失败")

if __name__ == "__main__":
    main()