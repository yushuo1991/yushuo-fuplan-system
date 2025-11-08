-- 清理和重新创建Supabase数据库表
-- 解决表权限和冲突问题

-- 第一步：删除旧的冲突表
DROP TABLE IF EXISTS limit_analysis CASCADE;
DROP TABLE IF EXISTS limit_stocks CASCADE;
DROP TABLE IF EXISTS category_stats CASCADE;
DROP TABLE IF EXISTS latest_analysis CASCADE;
DROP TABLE IF EXISTS category_ranking CASCADE;
DROP TABLE IF EXISTS category_performance CASCADE;
DROP TABLE IF EXISTS top_performers CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;

-- 第二步：删除可能存在的旧版本表（如果存在）
DROP TABLE IF EXISTS limit_up_stocks CASCADE;
DROP TABLE IF EXISTS limit_up_categories CASCADE;
DROP TABLE IF EXISTS stock_performance_tracking CASCADE;
DROP TABLE IF EXISTS api_call_logs CASCADE;
DROP TABLE IF EXISTS data_source_config CASCADE;
DROP TABLE IF EXISTS data_refresh_logs CASCADE;

-- 第三步：删除旧的视图
DROP VIEW IF EXISTS daily_limit_up_summary CASCADE;
DROP VIEW IF EXISTS category_performance_analysis CASCADE;

-- 第四步：删除旧的函数
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ========================================
-- 重新创建所有表和结构
-- ========================================

-- 1. 涨停股票主表
CREATE TABLE limit_up_stocks (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    stock_code VARCHAR(20) NOT NULL,
    stock_name VARCHAR(100) NOT NULL,
    plate_id VARCHAR(50),
    plate_name VARCHAR(100),
    pct_chg DECIMAL(5,2) DEFAULT 9.99,
    limit_times INTEGER DEFAULT 1,
    market_cap BIGINT,
    turnover_rate DECIMAL(5,2),
    volume BIGINT,
    amount BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_stock_per_date UNIQUE(date, stock_code),
    CONSTRAINT valid_pct_chg CHECK (pct_chg >= 0 AND pct_chg <= 20),
    CONSTRAINT valid_limit_times CHECK (limit_times >= 1 AND limit_times <= 10)
);

-- 2. 板块统计表
CREATE TABLE limit_up_categories (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    stock_count INTEGER NOT NULL,
    avg_pct_chg DECIMAL(5,2),
    max_limit_times INTEGER,
    min_limit_times INTEGER,
    total_market_cap BIGINT,
    avg_turnover_rate DECIMAL(5,2),
    category_score DECIMAL(8,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_category_per_date UNIQUE(date, category_name),
    CONSTRAINT valid_stock_count CHECK (stock_count > 0)
);

-- 3. 后续表现跟踪表
CREATE TABLE stock_performance_tracking (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,
    limit_up_date DATE NOT NULL,
    tracking_date DATE NOT NULL,
    days_after INTEGER NOT NULL,
    open_price DECIMAL(10,2),
    close_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    pct_chg DECIMAL(5,2),
    cumulative_return DECIMAL(8,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_tracking_record UNIQUE(stock_code, limit_up_date, tracking_date),
    CONSTRAINT valid_days_after CHECK (days_after >= 1 AND days_after <= 30)
);

-- 4. API调用日志表
CREATE TABLE api_call_logs (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    api_endpoint VARCHAR(500),
    request_params JSONB,
    response_status INTEGER,
    response_data JSONB,
    response_time INTEGER,
    error_message TEXT,
    success BOOLEAN DEFAULT FALSE,
    called_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_response_status CHECK (response_status >= 100 AND response_status <= 599)
);

-- 5. 数据源配置表
CREATE TABLE data_source_config (
    id BIGSERIAL PRIMARY KEY,
    source_name VARCHAR(50) NOT NULL UNIQUE,
    api_url TEXT NOT NULL,
    api_key VARCHAR(500),
    request_headers JSONB,
    rate_limit_per_minute INTEGER DEFAULT 60,
    timeout_seconds INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    last_success_at TIMESTAMP WITH TIME ZONE,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 数据刷新记录表
CREATE TABLE data_refresh_logs (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    refresh_type VARCHAR(50) NOT NULL,
    source_name VARCHAR(50) NOT NULL,
    stocks_added INTEGER DEFAULT 0,
    stocks_updated INTEGER DEFAULT 0,
    categories_processed INTEGER DEFAULT 0,
    duration_ms INTEGER,
    success BOOLEAN DEFAULT FALSE,
    error_details TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 创建索引优化性能
-- ========================================
CREATE INDEX idx_limit_up_stocks_date ON limit_up_stocks(date DESC);
CREATE INDEX idx_limit_up_stocks_plate ON limit_up_stocks(plate_name);
CREATE INDEX idx_limit_up_stocks_code ON limit_up_stocks(stock_code);
CREATE INDEX idx_limit_up_categories_date ON limit_up_categories(date DESC);
CREATE INDEX idx_performance_tracking_date ON stock_performance_tracking(limit_up_date, tracking_date);
CREATE INDEX idx_api_logs_date ON api_call_logs(called_at DESC);
CREATE INDEX idx_refresh_logs_date ON data_refresh_logs(started_at DESC);

-- ========================================
-- 创建更新时间戳触发器
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_limit_up_stocks_updated_at
    BEFORE UPDATE ON limit_up_stocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_source_config_updated_at
    BEFORE UPDATE ON data_source_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 插入默认数据源配置
-- ========================================
INSERT INTO data_source_config (
    source_name, 
    api_url, 
    request_headers,
    rate_limit_per_minute,
    timeout_seconds
) VALUES (
    'kaipanla',
    'https://apphis.longhuvip.com/w1/api/index.php',
    '{"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept": "application/json, text/plain, */*", "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8", "Cache-Control": "no-cache", "Referer": "https://www.longhuvip.com/", "Origin": "https://www.longhuvip.com"}'::jsonb,
    30,
    10
) ON CONFLICT (source_name) DO UPDATE SET
    api_url = EXCLUDED.api_url,
    request_headers = EXCLUDED.request_headers,
    rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
    timeout_seconds = EXCLUDED.timeout_seconds,
    updated_at = NOW();

-- ========================================
-- 创建分析视图
-- ========================================
CREATE VIEW daily_limit_up_summary AS
SELECT 
    date,
    COUNT(*) as total_stocks,
    COUNT(DISTINCT plate_name) as total_categories,
    AVG(pct_chg) as avg_pct_chg,
    MAX(limit_times) as max_limit_times,
    COUNT(CASE WHEN limit_times >= 3 THEN 1 END) as high_limit_count,
    ROUND(COUNT(CASE WHEN limit_times >= 3 THEN 1 END) * 100.0 / COUNT(*), 2) as high_limit_ratio
FROM limit_up_stocks
GROUP BY date
ORDER BY date DESC;

CREATE VIEW category_performance_analysis AS
SELECT 
    luc.date,
    luc.category_name,
    luc.stock_count,
    luc.avg_pct_chg,
    luc.max_limit_times,
    COALESCE(AVG(spt.cumulative_return), 0) as avg_5day_return
FROM limit_up_categories luc
LEFT JOIN limit_up_stocks lus ON luc.date = lus.date AND luc.category_name = lus.plate_name
LEFT JOIN stock_performance_tracking spt ON lus.stock_code = spt.stock_code 
    AND lus.date = spt.limit_up_date 
    AND spt.days_after = 5
GROUP BY luc.date, luc.category_name, luc.stock_count, luc.avg_pct_chg, luc.max_limit_times
ORDER BY luc.date DESC, luc.stock_count DESC;

-- ========================================
-- 设置表权限（RLS策略）
-- ========================================

-- 启用行级安全性
ALTER TABLE limit_up_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE limit_up_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_performance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_source_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_refresh_logs ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（适用于公开数据）
CREATE POLICY "Enable all operations for everyone" ON limit_up_stocks FOR ALL USING (true);
CREATE POLICY "Enable all operations for everyone" ON limit_up_categories FOR ALL USING (true);
CREATE POLICY "Enable all operations for everyone" ON stock_performance_tracking FOR ALL USING (true);
CREATE POLICY "Enable all operations for everyone" ON api_call_logs FOR ALL USING (true);
CREATE POLICY "Enable all operations for everyone" ON data_source_config FOR ALL USING (true);
CREATE POLICY "Enable all operations for everyone" ON data_refresh_logs FOR ALL USING (true);

-- ========================================
-- 添加表注释
-- ========================================
COMMENT ON TABLE limit_up_stocks IS '涨停股票主表，存储每日涨停股票的详细信息';
COMMENT ON TABLE limit_up_categories IS '涨停板块统计表，存储按板块汇总的涨停数据';
COMMENT ON TABLE stock_performance_tracking IS '股票后续表现跟踪表，记录涨停后的价格走势';
COMMENT ON TABLE api_call_logs IS 'API调用日志表，记录所有外部API调用详情';
COMMENT ON TABLE data_source_config IS '数据源配置表，管理外部API的配置信息';
COMMENT ON TABLE data_refresh_logs IS '数据刷新记录表，跟踪数据更新操作';

-- ========================================
-- 验证表创建
-- ========================================
SELECT 
    table_name,
    table_type,
    'Created successfully' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'limit_up_stocks',
    'limit_up_categories', 
    'stock_performance_tracking',
    'api_call_logs',
    'data_source_config',
    'data_refresh_logs'
)
ORDER BY table_name;