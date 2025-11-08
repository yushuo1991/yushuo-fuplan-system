# 🏗️ 涨停分析系统 - 项目架构详解

## 🎯 项目目标
创建一个能够获取**真实涨停股票数据**的分析系统，解决浏览器跨域限制，提供高性能的数据展示。

## 🚨 核心问题与解决方案

### 问题：浏览器跨域限制
- **现象**: 直接调用开盘啦API被CORS政策阻止
- **影响**: 无法获取真实股票数据
- **解决方案**: 使用Supabase Edge Functions作为代理

## 🏛️ 系统架构图

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   用户浏览器   │───▶│  Supabase   │───▶│ Edge Functions │───▶│  开盘啦API   │
│             │    │   Client    │    │  (服务端代理)  │    │  (真实数据)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │ PostgreSQL  │    │  API调用日志  │
                   │  数据缓存    │    │    监控      │
                   └─────────────┘    └─────────────┘
```

## 📁 项目结构 (清理后)

```
limit-up-analysis/
├── 🗄️ supabase/                    # Supabase后端
│   ├── schema.sql                  # 数据库结构定义
│   └── functions/
│       └── fetch-limit-up-data/
│           └── index.ts           # Edge Function主逻辑
│
├── 🌐 public/                      # 前端文件
│   ├── supabase-enhanced.html     # 主界面
│   ├── supabase-enhanced-script.js # 前端逻辑
│   └── enhanced-styles.css        # 样式文件
│
├── 📝 log/                         # 日志和文档
│   ├── supabase-solution-analysis.md
│   ├── supabase-deployment-guide.md
│   └── deployment-checklist.md
│
├── 📋 README.md                    # 项目说明
├── 📦 package.json                 # 依赖管理
└── 🧹 cleanup.bat                  # 清理脚本
```

## 🔄 系统工作流程

### 第一步：用户操作
```javascript
用户选择日期 → 点击"刷新数据" → 前端发起请求
```

### 第二步：前端处理
```javascript
// supabase-enhanced-script.js
const { data } = await supabase.functions.invoke('fetch-limit-up-data', {
    body: { date: selectedDate, force_refresh: false }
});
```
**作用**: 调用Supabase Edge Function，传递日期参数

### 第三步：Edge Function处理
```typescript
// supabase/functions/fetch-limit-up-data/index.ts
serve(async (req) => {
    // 1. 检查缓存
    // 2. 调用开盘啦API
    // 3. 存储到数据库
    // 4. 返回格式化数据
});
```
**作用**: 
- 🔍 智能缓存检查
- 📡 调用外部API
- 💾 数据持久化存储
- 📊 数据格式化处理

### 第四步：数据库操作
```sql
-- 存储涨停股票
INSERT INTO limit_up_stocks (date, stock_code, stock_name...);

-- 生成板块统计
INSERT INTO limit_up_categories (date, category_name, stock_count...);

-- 记录API调用日志
INSERT INTO api_call_logs (date, success, response_time...);
```
**作用**: 数据持久化，支持缓存和历史查询

### 第五步：前端展示
```javascript
// 渲染数据到界面
this.renderData(data);
this.updateStatsOverview(data);
this.updateCategoriesList(data);
```
**作用**: 将数据可视化展示给用户

## 🧩 核心组件详解

### 1️⃣ 数据库层 (`supabase/schema.sql`)
**作用**: 数据结构定义和存储
**核心表**:
- `limit_up_stocks` - 涨停股票明细
- `limit_up_categories` - 板块统计汇总
- `api_call_logs` - API调用监控
- `data_source_config` - 数据源配置

### 2️⃣ 服务层 (`supabase/functions/fetch-limit-up-data/index.ts`)
**作用**: 业务逻辑处理和API代理
**核心功能**:
```typescript
// 缓存检查
if (!force_refresh) {
    // 优先返回缓存数据
}

// API调用
const apiResponse = await fetch(kaipanlaApiUrl);

// 数据存储
await saveStocksToDatabase(supabase, stocksData, date);
```

### 3️⃣ 表现层 (`public/supabase-enhanced.html + script.js`)
**作用**: 用户界面和交互
**核心功能**:
- 📅 日期选择器
- 🔄 数据刷新控制
- 📊 统计数据展示
- 📋 股票列表展示
- 🔍 详情模态框

## ⚙️ 配置说明

### Supabase配置
```javascript
const SUPABASE_URL = 'https://xlslwrrctyedgwxdeosf.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### Edge Function环境变量
```
PROJECT_URL = https://xlslwrrctyedgwxdeosf.supabase.co
SERVICE_KEY = your-service-role-key
```

### 开盘啦API参数
```typescript
const params = {
    'a': 'GetDayZhangTing',      // 获取涨停数据
    'Date': '20250910',          // 日期格式YYYYMMDD
    'st': '100',                 // 股票类型
    'c': 'HisLimitResumption'    // 历史涨停复盘
};
```

## 🚀 部署流程

### 1. 数据库部署
```sql
-- 在Supabase Dashboard SQL Editor中执行
-- 复制 supabase/schema.sql 内容并运行
```

### 2. Edge Function部署
```
-- 在Supabase Dashboard Edge Functions中
-- 创建函数: fetch-limit-up-data
-- 复制 supabase/functions/fetch-limit-up-data/index.ts 内容
```

### 3. 环境变量设置
```
-- 在Supabase Dashboard Secrets中设置
PROJECT_URL, SERVICE_KEY
```

### 4. 前端部署
```
-- 直接打开 public/supabase-enhanced.html
-- 或部署到任何静态托管服务
```

## 🔍 监控与调试

### 数据库监控
```sql
-- 查看最新涨停数据
SELECT * FROM limit_up_stocks ORDER BY created_at DESC LIMIT 10;

-- 查看API调用状态
SELECT * FROM api_call_logs ORDER BY called_at DESC LIMIT 5;
```

### 前端调试
```javascript
// 打开浏览器控制台查看日志
// 关键日志：
// ✅ Supabase客户端初始化成功
// 📊 Supabase Function响应
// ✅ 数据加载完成
```

### Edge Function日志
```
-- 在Supabase Dashboard Edge Functions Logs中查看
-- 关键日志：
-- 🎯 获取涨停数据
-- 📡 调用开盘啦API
-- 💾 存储数据到数据库
```

## 💡 核心优势

1. **🛡️ 彻底解决跨域问题** - Edge Functions服务端调用
2. **⚡ 高性能缓存机制** - PostgreSQL智能缓存
3. **📊 完整数据监控** - 全链路日志记录
4. **🔄 自动故障恢复** - 缓存降级机制
5. **🎯 真实数据保证** - 直接调用开盘啦API

## 🎉 使用方法

1. **打开** `public/supabase-enhanced.html`
2. **选择** 交易日期
3. **点击** "刷新数据" 或 "强制获取最新"
4. **查看** 涨停股票按板块分类展示
5. **点击** 股票查看详细信息

---

**🎯 这就是整个系统的完整架构！每个组件都有明确的职责，通过清晰的数据流实现从API调用到用户展示的完整链路。**