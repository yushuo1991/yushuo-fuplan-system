// 复盘数据类型定义

export interface ReviewRecord {
  id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  review_date?: string;
  
  // Section 1: 市场多空
  macro_risk_free?: boolean;
  non_breaking_index?: boolean;
  market_direction?: string;
  
  // Section 2: 情绪阶段
  emotion_stage?: string;
  volume_amplified?: boolean;
  index_turning_point?: boolean;
  
  // Section 3: 板块节奏
  sector_option1?: string;
  sector_option2?: string;
  sector_option3?: string;
  sector_option4?: string;
  sector_option5?: string;
  rising_theme1?: string;
  rising_theme2?: string;
  swim_lane_data?: any;
  
  // Section 4: 策略方法
  personal_strategy?: string;
  
  // Section 5: 执行计划
  stock_position?: string;
  funding_support?: string;
  expectation?: string;
  stock_selection?: string;
  focus_stocks?: string;
  buy_plan?: string;
  sell_plan?: string;
  risk_control?: string;
  mental_adjustment?: string;
  
  // Section 6: 交易记录
  trading_reflection?: string;
}

export interface TradingRecord {
  id?: string;
  review_id: string;
  stock_name?: string;
  buy_price?: number;
  sell_price?: number;
  profit_percent?: number;
  created_at?: string;
}

export interface ReviewRecordWithTrades extends ReviewRecord {
  trading_records?: TradingRecord[];
}

