# 🛡️ 宇硕复盘图鉴 - 完整备份指南

## 📅 备份时间
2025-09-05 - 系统功能完善，用户体验优化完成

## 🎯 备份目标
- 防止代码修改导致的功能回退
- 保护数据库结构和数据
- 确保系统可以快速恢复到当前稳定状态

---

## 1️⃣ 代码备份

### Git版本控制 (推荐)
```bash
# 在项目根目录执行
git init
git add .
git commit -m "🎉 系统完成 - 稳定版本备份

✅ 功能完成:
- 用户注册登录系统 (昵称登录)
- 管理员后台权限管理
- 时间窗口访问控制
- 用户界面优化完成
- 退出登录功能完善

🔧 技术栈:
- React 18 + TypeScript + Vite
- Supabase认证 + PostgreSQL
- Tailwind CSS + 响应式设计"
```

### 文件夹备份
```bash
# 创建备份文件夹
mkdir ../backup_2025_09_05
# 复制整个项目
cp -r . ../backup_2025_09_05/
```

### 压缩备份
```bash
# Windows命令
tar -czf "../宇硕复盘图鉴_稳定版_2025_09_05.tar.gz" .

# 或者直接右键项目文件夹 -> 发送到 -> 压缩文件
```

---

## 2️⃣ 数据库备份

### Supabase数据库结构备份
```sql
-- 在Supabase SQL Editor中执行，导出表结构
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 导出所有数据
SELECT * FROM public.profiles;
SELECT * FROM public.access_grants;
```

### 完整SQL备份脚本
保存以下内容到 `database_backup_2025_09_05.sql`:

```sql
-- ==============================================
-- 宇硕复盘图鉴数据库完整备份
-- 时间: 2025-09-05
-- 版本: 稳定版 v1.0
-- ==============================================

-- 表结构备份
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wechat_nickname text NOT NULL UNIQUE,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES public.profiles(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  duration_key text NOT NULL CHECK (duration_key IN ('forever','1y','6m','3m','1m','custom'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_access_grants_granted_by ON public.access_grants(granted_by);

-- RLS策略 (在triggers_and_policies.sql中)

-- 管理员检查函数
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;
```

### Supabase项目设置备份
1. **项目信息**:
   - 项目URL: [记录你的项目URL]
   - 项目ID: [记录项目ID] 
   - API Keys: [记录anon key和service key]

2. **认证设置**: 
   - 邮箱确认: 关闭
   - 注册开放性: 允许
   - JWT过期时间: 默认

---

## 3️⃣ 环境配置备份

### .env.local 文件备份
```env
# Supabase配置
VITE_SUPABASE_URL=你的项目URL
VITE_SUPABASE_ANON_KEY=你的anon key

# 管理员配置  
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=7287843

# 邮箱域名配置
VITE_FAKE_EMAIL_DOMAIN=wx.local
```

### package.json 核心依赖
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "crypto-js": "^4.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1"
  },
  "devDependencies": {
    "@types/crypto-js": "^4.2.1",
    "typescript": "^5.0.2",
    "vite": "^5.0.8"
  }
}
```

---

## 4️⃣ 关键文件清单

### 核心页面组件
- ✅ `src/pages/SimpleLogin.tsx` - 昵称登录页面
- ✅ `src/pages/Register.tsx` - 用户注册页面  
- ✅ `src/pages/AdminLogin.tsx` - 管理员登录
- ✅ `src/pages/AdminDashboard.tsx` - 管理员后台
- ✅ `src/pages/UserGate.tsx` - 权限检查路由
- ✅ `src/pages/IndexPage.tsx` - 用户主页(iframe)
- ✅ `src/pages/NotAuthorized.tsx` - 未授权页面

### 工具函数
- ✅ `src/utils/nicknameToEmail.ts` - 昵称转邮箱
- ✅ `src/utils/duration.ts` - 时间计算工具

### 配置文件
- ✅ `src/App.tsx` - 路由配置
- ✅ `src/lib/supabaseClient.ts` - 数据库连接
- ✅ `index.html` - 入口文件
- ✅ `vite.config.ts` - 构建配置

---

## 5️⃣ 快速恢复指南

### 代码恢复
1. 解压备份文件或克隆Git仓库
2. 运行 `npm install` 安装依赖
3. 复制 `.env.local` 文件配置环境变量
4. 运行 `npm run dev` 启动开发服务器

### 数据库恢复  
1. 创建新的Supabase项目
2. 在SQL Editor中执行 `database_backup_2025_09_05.sql`
3. 在SQL Editor中执行 `triggers_and_policies.sql`
4. 更新代码中的Supabase配置

### 管理员账号恢复
1. 在Authentication > Users创建admin@yushuo.local用户
2. 在profiles表中添加is_admin=true的记录
3. 测试admin/7287843登录

---

## 6️⃣ 定期备份建议

### 自动化脚本 (backup.bat)
```batch
@echo off
echo 开始备份宇硕复盘图鉴...

set backup_date=%date:~0,4%%date:~5,2%%date:~8,2%
set backup_name=宇硕复盘图鉴_备份_%backup_date%

echo 创建备份目录...
mkdir "..\backups\%backup_name%"

echo 复制代码文件...
xcopy . "..\backups\%backup_name%" /E /I /H /Y

echo 备份完成！位置: ..\backups\%backup_name%
pause
```

### 备份检查清单
- [ ] 代码文件完整性
- [ ] .env.local配置文件
- [ ] package.json依赖列表  
- [ ] 数据库表结构SQL
- [ ] 管理员账号存在且可登录
- [ ] 普通用户注册登录正常
- [ ] 权限控制功能正常

---

## ✨ 当前系统状态快照

### 功能完成度: 100% ✅
- [x] 用户注册 (昵称 + 密码)
- [x] 昵称登录 (自动转换伪邮箱) 
- [x] 管理员登录 (admin/7287843)
- [x] 权限检查 (管理员/普通用户分离)
- [x] 时间窗口访问控制
- [x] 用户审批管理
- [x] 退出登录功能
- [x] 响应式界面设计
- [x] 错误处理和用户反馈

### 技术架构稳定 ✅
- React 18 + TypeScript (类型安全)
- Vite (快速构建)
- Supabase (认证 + 数据库)
- Tailwind CSS (现代样式)
- PostgreSQL + RLS (数据安全)

**🎉 系统已达到生产就绪状态！**