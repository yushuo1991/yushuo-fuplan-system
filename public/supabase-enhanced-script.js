// Supabase增强版前端脚本
// 使用Supabase Edge Functions解决跨域问题

class SupabaseEnhancedApp {
    constructor() {
        this.supabase = null;
        this.currentData = null;
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 初始化Supabase增强版系统');
        
        // 初始化UI
        this.setupEventListeners();
        this.setupDateInput();
        
        // 检查Supabase配置
        await this.initSupabase();
        
        // 加载初始数据
        await this.loadInitialData();
    }
    
    async initSupabase() {
        try {
            // Supabase项目配置
            const SUPABASE_URL = 'https://xlslwrrctyedgwxdeosf.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsc2x3cnJjdHllZGd3eGRlb3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDU3MDcsImV4cCI6MjA3Mjk4MTcwN30.n4JVZUfGlt8nAF41r2ejHu_JR2_1lDOhFZSVMWHTQMs';
            
            // 初始化Supabase客户端
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            console.log('✅ Supabase客户端初始化成功');
            this.updateSystemStatus('connected', 'Supabase连接成功', 'Edge Functions可用');
            
            // 测试连接
            await this.testSupabaseConnection();
            
        } catch (error) {
            console.error('❌ Supabase初始化失败:', error);
            this.updateSystemStatus('error', 'Supabase连接失败', error.message);
            this.showErrorModal('Supabase初始化失败', error.message);
        }
    }
    
    async testSupabaseConnection() {
        try {
            // 简单的连接测试
            const { data, error } = await this.supabase
                .from('limit_up_stocks')
                .select('count(*)')
                .limit(1);
            
            if (error && !error.message.includes('relation "limit_up_stocks" does not exist')) {
                throw error;
            }
            
            console.log('✅ Supabase数据库连接测试成功');
            this.updateSystemStatus('connected', 'Supabase连接正常', '数据库访问正常');
            
        } catch (error) {
            console.warn('⚠️ Supabase连接测试失败:', error.message);
            this.updateSystemStatus('error', 'Supabase连接异常', error.message);
        }
    }
    
    setupEventListeners() {
        // 日期选择器
        const dateSelect = document.getElementById('dateSelect');
        dateSelect?.addEventListener('change', (e) => {
            this.loadDataForDate(e.target.value);
        });
        
        // 刷新按钮
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn?.addEventListener('click', () => {
            this.refreshData();
        });
        
        // 强制刷新按钮
        const forceRefreshBtn = document.getElementById('forceRefreshBtn');
        forceRefreshBtn?.addEventListener('click', () => {
            this.forceRefreshData();
        });
        
        // 模态框关闭事件
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('stockModal');
            const errorModal = document.getElementById('errorModal');
            
            if (e.target === modal) {
                this.closeModal();
            }
            if (e.target === errorModal) {
                this.closeErrorModal();
            }
        });
    }
    
    setupDateInput() {
        const dateSelect = document.getElementById('dateSelect');
        if (!dateSelect) return;
        
        // 生成最近7个交易日
        const recentDays = this.getRecentTradingDays(7);
        
        recentDays.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = this.formatDisplayDate(date);
            dateSelect.appendChild(option);
        });
        
        if (recentDays.length > 0) {
            dateSelect.value = recentDays[0];
        }
    }
    
    getRecentTradingDays(count) {
        const days = [];
        const today = new Date();
        
        for (let i = 0; days.length < count; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            
            const dayOfWeek = checkDate.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                days.push(checkDate.toISOString().split('T')[0]);
            }
        }
        
        return days;
    }
    
    formatDisplayDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const dayOfWeek = weekdays[date.getDay()];
        
        if (diffDays === 0) return `今日 ${dateString} (${dayOfWeek})`;
        if (diffDays === 1) return `昨日 ${dateString} (${dayOfWeek})`;
        return `${dateString} (${dayOfWeek})`;
    }
    
    async loadInitialData() {
        const dateSelect = document.getElementById('dateSelect');
        if (dateSelect?.value && this.supabase) {
            await this.loadDataForDate(dateSelect.value);
        }
    }
    
    async loadDataForDate(dateString, forceRefresh = false) {
        if (!dateString || !this.supabase) {
            console.error('❌ 缺少日期参数或Supabase未初始化');
            return;
        }
        
        if (this.isLoading) {
            console.log('⏳ 数据加载中，跳过重复请求');
            return;
        }
        
        this.isLoading = true;
        this.showLoading(true);
        this.updateLoadingMessage('准备调用Supabase Edge Function...');
        this.setProgressStep(1);
        
        try {
            console.log(`🎯 通过Supabase获取数据: ${dateString}, 强制刷新: ${forceRefresh}`);
            
            // 调用Supabase Edge Function
            this.updateLoadingMessage('正在调用Edge Function...');
            const { data, error } = await this.supabase.functions.invoke('fetch-limit-up-data', {
                body: {
                    date: dateString,
                    force_refresh: forceRefresh
                }
            });
            
            if (error) {
                console.error('❌ Supabase Function调用失败:', error);
                throw new Error(`Edge Function错误: ${error.message}`);
            }
            
            this.setProgressStep(2);
            this.updateLoadingMessage('处理API响应数据...');
            
            console.log('📊 Supabase Function响应:', data);
            
            if (data.success) {
                this.currentData = data;
                this.setProgressStep(3);
                this.updateLoadingMessage('渲染数据到界面...');
                
                // 渲染数据
                this.renderData(data);
                this.setProgressStep(4);
                
                // 更新状态信息
                const sourceText = data.cached ? '缓存数据' : '实时API';
                const responseTime = data.response_time_ms ? `${data.response_time_ms}ms` : '';
                
                this.updateSystemStatus('connected', 
                    `数据加载成功 - ${sourceText}`, 
                    `${data.total_count}只股票 ${responseTime}`
                );
                
                this.updateDataFreshness(data);
                
                console.log(`✅ 数据加载完成: ${data.total_count}只涨停股票，来源: ${data.source}`);
            } else {
                console.warn('⚠️ Supabase Function返回失败:', data);
                this.showNoData(data.message || '数据获取失败');
            }
            
        } catch (error) {
            console.error('❌ 数据加载失败:', error);
            this.updateSystemStatus('error', '数据加载失败', error.message);
            this.showErrorModal('数据加载失败', error.message);
            this.showNoData('数据加载失败: ' + error.message);
        }
        
        this.isLoading = false;
        this.showLoading(false);
    }
    
    async refreshData() {
        const dateSelect = document.getElementById('dateSelect');
        if (dateSelect?.value) {
            await this.loadDataForDate(dateSelect.value, false);
        }
    }
    
    async forceRefreshData() {
        const dateSelect = document.getElementById('dateSelect');
        if (dateSelect?.value) {
            console.log('🔄 强制刷新数据，将跳过缓存');
            await this.loadDataForDate(dateSelect.value, true);
        }
    }
    
    renderData(data) {
        if (data.total_count === 0) {
            this.showNoData(data.message || '该日期无涨停数据');
            return;
        }
        
        // 更新统计概览
        this.updateStatsOverview(data);
        
        // 更新板块列表
        this.updateCategoriesList(data);
        
        // 显示数据区域
        this.showDataSections();
    }
    
    updateStatsOverview(data) {
        const elements = {
            totalLimitUp: data.total_count || 0,
            totalCategories: Object.keys(data.categories || {}).length,
            topCategory: this.getTopCategory(data.categories),
            dataSource: this.getDataSourceText(data)
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    updateCategoriesList(data) {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;
        
        categoriesList.innerHTML = '';
        
        if (!data.categories || Object.keys(data.categories).length === 0) {
            categoriesList.innerHTML = '<p class="no-categories">暂无板块数据</p>';
            return;
        }
        
        // 按股票数量排序板块
        const sortedCategories = Object.entries(data.categories)
            .sort(([,a], [,b]) => b.count - a.count);
        
        sortedCategories.forEach(([categoryName, categoryData]) => {
            const categoryElement = this.createCategoryElement(categoryName, categoryData, data.date);
            categoriesList.appendChild(categoryElement);
        });
    }
    
    createCategoryElement(categoryName, categoryData, date) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-card';
        
        const avgLimitTimes = this.calculateAvgLimitTimes(categoryData.stocks);
        const maxLimitTimes = Math.max(...categoryData.stocks.map(s => s.limit_times || 1));
        const highLimitCount = categoryData.stocks.filter(s => (s.limit_times || 1) >= 3).length;
        
        categoryDiv.innerHTML = `
            <div class="category-header">
                <h3 class="category-title">
                    <i class="fas fa-layer-group"></i>
                    ${categoryName}
                    <span class="category-badge">${categoryData.count}只</span>
                    ${highLimitCount > 0 ? 
                        `<span class="high-limit-badge">${highLimitCount}只高连板</span>` : ''}
                </h3>
                <div class="category-stats">
                    <span class="stat-item">平均连板: ${avgLimitTimes}</span>
                    <span class="stat-item">最高连板: ${maxLimitTimes}</span>
                    <span class="stat-item">数据源: Supabase</span>
                </div>
            </div>
            <div class="stocks-list">
                ${categoryData.stocks.map(stock => this.createStockHTML(stock, date)).join('')}
            </div>
        `;
        
        return categoryDiv;
    }
    
    createStockHTML(stock, date) {
        const limitTimesClass = this.getLimitTimesClass(stock.limit_times || 1);
        
        return `
            <div class="stock-item" onclick="window.limitUpApp.showStockModal('${JSON.stringify(stock).replace(/'/g, '\\\'').replace(/"/g, '&quot;')}', '${date}')">
                <div class="stock-info">
                    <div class="stock-name">${stock.name || stock.stock_name}</div>
                    <div class="stock-code">${stock.ts_code || stock.stock_code}</div>
                </div>
                <div class="stock-metrics">
                    <span class="limit-times ${limitTimesClass}">${stock.limit_times || 1}连板</span>
                    <span class="pct-chg">${(stock.pct_chg || 9.99).toFixed(2)}%</span>
                </div>
            </div>
        `;
    }
    
    showStockModal(stockJson, date) {
        try {
            const stock = typeof stockJson === 'string' ? JSON.parse(stockJson) : stockJson;
            
            const modal = document.getElementById('stockModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');
            
            modalTitle.textContent = `${stock.name || stock.stock_name} (${stock.ts_code || stock.stock_code})`;
            
            modalContent.innerHTML = `
                <div class="stock-detail">
                    <div class="detail-section">
                        <h4>基本信息</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">当日涨幅:</span>
                                <span class="detail-value">${(stock.pct_chg || 9.99).toFixed(2)}%</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">连续涨停:</span>
                                <span class="detail-value">${stock.limit_times || 1}次</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">板块分类:</span>
                                <span class="detail-value">${stock.plate_name || '未分类'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">数据来源:</span>
                                <span class="detail-value">Supabase + 开盘啦API</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Supabase增强功能</h4>
                        <div class="analysis-text">
                            该股票数据通过Supabase Edge Function从开盘啦API获取，
                            已缓存到PostgreSQL数据库中，确保数据的持久性和访问性能。
                            Supabase架构有效解决了浏览器跨域访问限制。
                        </div>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
            
        } catch (error) {
            console.error('❌ 显示股票详情失败:', error);
        }
    }
    
    // 工具函数
    calculateAvgLimitTimes(stocks) {
        if (!stocks || stocks.length === 0) return '0';
        const avg = stocks.reduce((sum, stock) => sum + (stock.limit_times || 1), 0) / stocks.length;
        return avg.toFixed(1);
    }
    
    getLimitTimesClass(limitTimes) {
        if (limitTimes >= 5) return 'limit-times-ultra';
        if (limitTimes >= 3) return 'limit-times-high';
        if (limitTimes >= 2) return 'limit-times-medium';
        return 'limit-times-low';
    }
    
    getTopCategory(categories) {
        if (!categories || Object.keys(categories).length === 0) return '-';
        
        const sorted = Object.entries(categories)
            .sort(([,a], [,b]) => b.count - a.count);
        
        return sorted[0] ? sorted[0][0] : '-';
    }
    
    getDataSourceText(data) {
        if (data.cached) return '缓存';
        if (data.source === 'supabase_real_api') return '实时API';
        return 'Supabase';
    }
    
    updateSystemStatus(status, message, detail = '') {
        const statusDot = document.getElementById('statusDot');
        const statusMessage = document.getElementById('statusMessage');
        const statusDetail = document.getElementById('statusDetail');
        
        if (statusDot) {
            statusDot.className = `fas fa-circle status-dot ${status}`;
        }
        
        if (statusMessage) {
            statusMessage.textContent = message;
        }
        
        if (statusDetail) {
            statusDetail.textContent = detail;
        }
    }
    
    updateDataFreshness(data) {
        const freshnessText = document.getElementById('freshnessText');
        if (!freshnessText) return;
        
        if (data.cached) {
            freshnessText.innerHTML = '<i class="fas fa-database"></i> 缓存数据（已优化性能）';
        } else {
            freshnessText.innerHTML = '<i class="fas fa-sync"></i> 实时获取（直接API调用）';
        }
        
        const cacheInfo = document.getElementById('cacheInfo');
        if (cacheInfo) {
            if (data.cached) {
                cacheInfo.innerHTML = '<i class="fas fa-database"></i> <span>数据来源：PostgreSQL缓存</span>';
                cacheInfo.style.background = '#e8f5e8';
                cacheInfo.style.color = '#2e7d32';
            } else {
                cacheInfo.innerHTML = '<i class="fas fa-cloud-download-alt"></i> <span>数据来源：实时API调用</span>';
                cacheInfo.style.background = '#fff3cd';
                cacheInfo.style.color = '#856404';
            }
        }
    }
    
    showLoading(show) {
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) {
            loadingSection.style.display = show ? 'block' : 'none';
        }
        
        if (!show) {
            // 重置进度步骤
            for (let i = 1; i <= 4; i++) {
                const step = document.getElementById(`step${i}`);
                if (step) {
                    step.classList.remove('active', 'completed');
                }
            }
        }
    }
    
    updateLoadingMessage(message) {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
    }
    
    setProgressStep(stepNumber) {
        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.classList.remove('active');
                if (i < stepNumber) {
                    step.classList.add('completed');
                } else if (i === stepNumber) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('completed');
                }
            }
        }
    }
    
    showDataSections() {
        const sections = ['statsOverview', 'categoriesSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'block';
            }
        });
        
        const noDataSection = document.getElementById('noDataSection');
        if (noDataSection) {
            noDataSection.style.display = 'none';
        }
    }
    
    showNoData(message = '该交易日暂无涨停数据') {
        const noDataSection = document.getElementById('noDataSection');
        const noDataMessage = document.getElementById('noDataMessage');
        
        if (noDataMessage) {
            noDataMessage.textContent = message;
        }
        
        if (noDataSection) {
            noDataSection.style.display = 'block';
        }
        
        const sections = ['statsOverview', 'categoriesSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
    }
    
    showConfigurationError() {
        this.updateSystemStatus('error', 'Supabase未配置', '请设置正确的URL和密钥');
        this.showErrorModal(
            'Supabase配置错误', 
            '请在 supabase-enhanced-script.js 中设置正确的 SUPABASE_URL 和 SUPABASE_ANON_KEY'
        );
    }
    
    showErrorModal(title, message) {
        const errorModal = document.getElementById('errorModal');
        const errorContent = document.getElementById('errorContent');
        
        if (errorContent) {
            errorContent.innerHTML = `
                <h4>${title}</h4>
                <p>${message}</p>
                <div class="error-details">
                    <strong>解决方案：</strong>
                    <ul>
                        <li>检查Supabase项目设置</li>
                        <li>确认API密钥正确</li>
                        <li>验证Edge Function已部署</li>
                        <li>检查数据库Schema已创建</li>
                    </ul>
                </div>
            `;
        }
        
        if (errorModal) {
            errorModal.style.display = 'block';
        }
    }
    
    closeModal() {
        const modal = document.getElementById('stockModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    closeErrorModal() {
        const errorModal = document.getElementById('errorModal');
        if (errorModal) {
            errorModal.style.display = 'none';
        }
    }
    
    async retryConnection() {
        this.closeErrorModal();
        await this.initSupabase();
    }
}

// 全局函数
window.forceRefreshData = function() {
    if (window.limitUpApp) {
        window.limitUpApp.forceRefreshData();
    }
};

window.closeModal = function() {
    if (window.limitUpApp) {
        window.limitUpApp.closeModal();
    }
};

window.closeErrorModal = function() {
    if (window.limitUpApp) {
        window.limitUpApp.closeErrorModal();
    }
};

window.retryConnection = function() {
    if (window.limitUpApp) {
        window.limitUpApp.retryConnection();
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 Supabase增强版涨停分析系统启动');
    window.limitUpApp = new SupabaseEnhancedApp();
});