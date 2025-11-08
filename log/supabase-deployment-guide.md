# 🚀 Supabase部署配置指南

## 📋 完整部署步骤

### 第一步：创建Supabase项目
1. 访问 https://supabase.com
2. 注册/登录账户
3. 点击"New project"创建新项目
4. 项目信息填写：
   - **Name**: `limit-up-analysis`
   - **Organization**: 选择你的组织
   - **Database Password**: 设置强密码（记录保存）
   - **Region**: 选择亚洲地区（如Singapore）
5. 点击"Create new project"

### 第二步：获取项目配置信息
项目创建完成后，前往Settings > API：
- **Project URL**: `https://xxx.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIsI...`（公开密钥）
- **service_role key**: `eyJhbGciOiJIUzI1NiIsI...`（服务密钥，保密）

### 第三步：设置数据库Schema
1. 进入Supabase Dashboard
2. 点击左侧"SQL Editor"
3. 复制`supabase/schema.sql`文件内容
4. 粘贴到SQL编辑器并执行
5. 确认所有表和索引创建成功

### 第四步：部署Edge Functions

#### 安装Supabase CLI
```bash
# Windows (PowerShell)
npm install -g @supabase/supabase-cli

# 验证安装
supabase --version
```

#### 登录并链接项目
```bash
# 登录Supabase
supabase login

# 进入项目目录
cd C:\Users\yushu\Documents\GitHub\limit-up-analysis

# 链接到远程项目
supabase link --project-ref YOUR_PROJECT_REF
```

#### 部署Edge Functions
```bash
# 部署所有函数
supabase functions deploy

# 或单独部署特定函数
supabase functions deploy fetch-limit-up-data
```

### 第五步：配置前端环境变量

在`public/supabase-enhanced-script.js`中更新配置：

```javascript
async initSupabase() {
    try {
        // 替换为您的实际Supabase配置
        const SUPABASE_URL = 'https://你的项目ID.supabase.co';
        const SUPABASE_ANON_KEY = '你的anon密钥';
        
        // 初始化Supabase客户端
        this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Supabase客户端初始化成功');
        // ...
    } catch (error) {
        console.error('❌ Supabase初始化失败:', error);
    }
}
```

### 第六步：设置环境变量（Edge Functions）
在Supabase Dashboard的Settings > Edge Functions中设置：
- `SUPABASE_URL`: 你的项目URL
- `SUPABASE_SERVICE_ROLE_KEY`: 服务角色密钥

### 第七步：测试部署

#### 测试Edge Function
```bash
curl -i --location --request POST 'https://你的项目ID.supabase.co/functions/v1/fetch-limit-up-data' \
  --header 'Authorization: Bearer 你的anon密钥' \
  --header 'Content-Type: application/json' \
  --data '{"date": "2025-09-10"}'
```

#### 测试前端集成
1. 在浏览器中打开 `supabase-enhanced.html`
2. 检查浏览器控制台是否显示"✅ Supabase客户端初始化成功"
3. 选择日期并点击"刷新数据"测试完整流程

---

## 🔧 故障排除

### 常见问题解决方案

#### 1. CORS错误
如果仍然遇到CORS错误：
- 确认Edge Function已正确部署
- 检查请求URL是否正确指向Supabase Functions
- 验证API密钥是否正确

#### 2. 数据库连接失败
- 检查数据库Schema是否正确创建
- 确认service_role密钥配置正确
- 验证数据库密码是否正确

#### 3. API调用失败
- 查看Edge Function日志：Supabase Dashboard > Edge Functions > Logs
- 检查外部API是否可访问
- 确认API参数格式正确

#### 4. 前端无法连接
- 检查SUPABASE_URL和SUPABASE_ANON_KEY是否正确
- 确认Supabase客户端SDK已正确加载
- 查看浏览器控制台错误信息

---

## 📊 监控和日志

### 查看系统运行状态
1. **Supabase Dashboard** - 查看整体项目健康状态
2. **Edge Functions Logs** - 查看API调用详细日志
3. **Database Logs** - 查看数据库操作记录
4. **API Analytics** - 监控API使用情况

### 数据库查询验证
```sql
-- 查看最新的涨停数据
SELECT * FROM limit_up_stocks ORDER BY created_at DESC LIMIT 10;

-- 查看板块统计
SELECT * FROM limit_up_categories ORDER BY date DESC, stock_count DESC;

-- 查看API调用日志
SELECT * FROM api_call_logs ORDER BY called_at DESC LIMIT 10;
```

---

## 🎯 完成后的验证

### 功能验证清单
- [ ] Supabase项目创建成功
- [ ] 数据库Schema部署完成
- [ ] Edge Function部署并运行正常
- [ ] 前端成功连接Supabase
- [ ] 能够获取真实涨停数据
- [ ] 数据正确存储到数据库
- [ ] 缓存机制正常工作
- [ ] 错误处理和日志记录正常

### 性能指标
- API响应时间 < 3秒
- 数据缓存命中率 > 80%
- 错误率 < 1%

---

## 📝 下一步优化

1. **定时数据更新** - 设置定时任务自动获取最新数据
2. **数据分析功能** - 基于历史数据进行趋势分析
3. **性能优化** - 实现更智能的缓存策略
4. **监控告警** - 设置API调用失败告警

---

**🎉 恭喜！Supabase增强版涨停分析系统已成功部署！**

现在您可以：
- 绕过所有CORS限制
- 获取并缓存真实的涨停数据
- 享受高性能的数据访问体验
- 拥有完整的数据历史记录

如有任何问题，请查看Supabase Dashboard中的日志信息进行排查。