-- 涨停分析系统 Supabase 数据库 Schema
-- 解决跨域问题，存储真实股票数据

-- 1. 涨停股票主表
CREATE TABLE IF NOT EXISTS limit_up_stocks (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    stock_code VARCHAR(20) NOT NULL,
    stock_name VARCHAR(100) NOT NULL,
    plate_id VARCHAR(50),
    plate_name VARCHAR(100),
    pct_chg DECIMAL(5,2) DEFAULT 9.99,
    limit_times INTEGER DEFAULT 1,
    market_cap BIGINT, -- 市值
    turnover_rate DECIMAL(5,2), -- 换手率
    volume BIGINT, -- 成交量
    amount BIGINT, -- 成交额
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束条件
    CONSTRAINT unique_stock_per_date UNIQUE(date, stock_code),
    CONSTRAINT valid_pct_chg CHECK (pct_chg >= 0 AND pct_chg <= 20),
    CONSTRAINT valid_limit_times CHECK (limit_times >= 1 AND limit_times <= 10)
);

-- 2. 板块统计表
CREATE TABLE IF NOT EXISTS limit_up_categories (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    stock_count INTEGER NOT NULL,
    avg_pct_chg DECIMAL(5,2),
    max_limit_times INTEGER,
    min_limit_times INTEGER,
    total_market_cap BIGINT,
    avg_turnover_rate DECIMAL(5,2),
    category_score DECIMAL(8,4), -- 板块评分
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束条件
    CONSTRAINT unique_category_per_date UNIQUE(date, category_name),
    CONSTRAINT valid_stock_count CHECK (stock_count > 0)
);

-- 3. 后续表现跟踪表
CREATE TABLE IF NOT EXISTS stock_performance_tracking (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,
    limit_up_date DATE NOT NULL, -- 涨停日期
    tracking_date DATE NOT NULL, -- 跟踪日期
    days_after INTEGER NOT NULL, -- T+N天
    open_price DECIMAL(10,2),
    close_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    pct_chg DECIMAL(5,2), -- 当日涨跌幅
    cumulative_return DECIMAL(8,4), -- 累计收益率
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束条件
    CONSTRAINT unique_tracking_record UNIQUE(stock_code, limit_up_date, tracking_date),
    CONSTRAINT valid_days_after CHECK (days_after >= 1 AND days_after <= 30)
);

-- 4. API调用日志表
CREATE TABLE IF NOT EXISTS api_call_logs (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    api_endpoint VARCHAR(500),
    request_params JSONB,
    response_status INTEGER,
    response_data JSONB,
    response_time INTEGER, -- 响应时间(毫秒)
    error_message TEXT,
    success BOOLEAN DEFAULT FALSE,
    called_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束条件
    CONSTRAINT valid_response_status CHECK (response_status >= 100 AND response_status <= 599)
);

-- 5. 数据源配置表
CREATE TABLE IF NOT EXISTS data_source_config (
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
CREATE TABLE IF NOT EXISTS data_refresh_logs (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    refresh_type VARCHAR(50) NOT NULL, -- 'manual', 'scheduled', 'api'
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

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_limit_up_stocks_date ON limit_up_stocks(date DESC);
CREATE INDEX IF NOT EXISTS idx_limit_up_stocks_plate ON limit_up_stocks(plate_name);
CREATE INDEX IF NOT EXISTS idx_limit_up_stocks_code ON limit_up_stocks(stock_code);
CREATE INDEX IF NOT EXISTS idx_limit_up_categories_date ON limit_up_categories(date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_tracking_date ON stock_performance_tracking(limit_up_date, tracking_date);
CREATE INDEX IF NOT EXISTS idx_api_logs_date ON api_call_logs(called_at DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_logs_date ON data_refresh_logs(started_at DESC);

-- 创建自动更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_limit_up_stocks_updated_at
    BEFORE UPDATE ON limit_up_stocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_data_source_config_updated_at
    BEFORE UPDATE ON data_source_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入默认数据源配置
INSERT INTO data_source_config (
    source_name, 
    api_url, 
    request_headers,
    rate_limit_per_minute,
    timeout_seconds
) VALUES (
    'kaipanla',
    'https://apphis.longhuvip.com/w1/api/index.php',
    '{
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Referer": "https://www.longhuvip.com/",
        "Origin": "https://www.longhuvip.com"
    }'::jsonb,
    30,
    10
) ON CONFLICT (source_name) DO NOTHING;

-- 创建用于数据分析的视图
CREATE OR REPLACE VIEW daily_limit_up_summary AS
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

-- 创建板块表现分析视图
CREATE OR REPLACE VIEW category_performance_analysis AS
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

-- 添加注释
COMMENT ON TABLE limit_up_stocks IS '涨停股票主表，存储每日涨停股票的详细信息';
COMMENT ON TABLE limit_up_categories IS '涨停板块统计表，存储按板块汇总的涨停数据';
COMMENT ON TABLE stock_performance_tracking IS '股票后续表现跟踪表，记录涨停后的价格走势';
COMMENT ON TABLE api_call_logs IS 'API调用日志表，记录所有外部API调用详情';
COMMENT ON TABLE data_source_config IS '数据源配置表，管理外部API的配置信息';
COMMENT ON TABLE data_refresh_logs IS '数据刷新记录表，跟踪数据更新操作';

COMMENT ON VIEW daily_limit_up_summary IS '每日涨停数据汇总视图';
COMMENT ON VIEW category_performance_analysis IS '板块表现分析视图，包含后续收益数据';