-- 复盘数据表结构
-- 用于存储用户每日填写的复盘表单数据

begin;

-- 复盘记录主表
create table if not exists public.review_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  review_date date not null default current_date,
  
  -- Section 1: 市场多空
  macro_risk_free boolean default false,
  non_breaking_index boolean default false,
  market_direction text, -- '多头', '空头', '震荡'
  
  -- Section 2: 情绪阶段
  emotion_stage text, -- '混沌期', '主升期', '盘顶期', '退潮期'
  volume_amplified boolean default false,
  index_turning_point boolean default false,
  
  -- Section 3: 板块节奏
  sector_option1 text,
  sector_option2 text,
  sector_option3 text,
  sector_option4 text,
  sector_option5 text,
  rising_theme1 text,
  rising_theme2 text,
  swim_lane_data jsonb, -- 存储泳道图的完整数据
  
  -- Section 4: 策略方法
  personal_strategy text,
  
  -- Section 5: 执行计划
  stock_position text,
  funding_support text,
  expectation text,
  stock_selection text,
  focus_stocks text,
  buy_plan text,
  sell_plan text,
  risk_control text,
  mental_adjustment text,
  
  -- Section 6: 交易记录
  trading_reflection text,
  
  -- 索引
  unique(user_id, review_date)
);

-- 交易记录子表
create table if not exists public.trading_records (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.review_records(id) on delete cascade,
  stock_name text,
  buy_price numeric(10, 2),
  sell_price numeric(10, 2),
  profit_percent numeric(6, 2),
  created_at timestamptz not null default now()
);

-- 创建索引
create index if not exists idx_review_records_user_date on public.review_records(user_id, review_date desc);
create index if not exists idx_review_records_created on public.review_records(created_at desc);
create index if not exists idx_trading_records_review on public.trading_records(review_id);

-- 自动更新 updated_at 触发器
create or replace function public.update_review_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

drop trigger if exists review_records_updated_at on public.review_records;
create trigger review_records_updated_at
  before update on public.review_records
  for each row execute function public.update_review_updated_at();

-- RLS 策略
alter table public.review_records enable row level security;
alter table public.trading_records enable row level security;

-- review_records 策略
drop policy if exists review_records_select_own on public.review_records;
create policy review_records_select_own on public.review_records 
  for select using (auth.uid() = user_id);

drop policy if exists review_records_select_admin on public.review_records;
create policy review_records_select_admin on public.review_records 
  for select using (public.is_admin());

drop policy if exists review_records_insert_own on public.review_records;
create policy review_records_insert_own on public.review_records 
  for insert with check (auth.uid() = user_id);

drop policy if exists review_records_update_own on public.review_records;
create policy review_records_update_own on public.review_records 
  for update using (auth.uid() = user_id);

drop policy if exists review_records_delete_own on public.review_records;
create policy review_records_delete_own on public.review_records 
  for delete using (auth.uid() = user_id);

drop policy if exists review_records_delete_admin on public.review_records;
create policy review_records_delete_admin on public.review_records 
  for delete using (public.is_admin());

-- trading_records 策略
drop policy if exists trading_records_select_own on public.trading_records;
create policy trading_records_select_own on public.trading_records 
  for select using (
    exists (
      select 1 from public.review_records r 
      where r.id = trading_records.review_id 
      and r.user_id = auth.uid()
    )
  );

drop policy if exists trading_records_select_admin on public.trading_records;
create policy trading_records_select_admin on public.trading_records 
  for select using (public.is_admin());

drop policy if exists trading_records_insert_own on public.trading_records;
create policy trading_records_insert_own on public.trading_records 
  for insert with check (
    exists (
      select 1 from public.review_records r 
      where r.id = trading_records.review_id 
      and r.user_id = auth.uid()
    )
  );

drop policy if exists trading_records_update_own on public.trading_records;
create policy trading_records_update_own on public.trading_records 
  for update using (
    exists (
      select 1 from public.review_records r 
      where r.id = trading_records.review_id 
      and r.user_id = auth.uid()
    )
  );

drop policy if exists trading_records_delete_own on public.trading_records;
create policy trading_records_delete_own on public.trading_records 
  for delete using (
    exists (
      select 1 from public.review_records r 
      where r.id = trading_records.review_id 
      and r.user_id = auth.uid()
    )
  );

commit;

