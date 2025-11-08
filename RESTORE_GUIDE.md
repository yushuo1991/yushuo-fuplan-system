# 🚀 快速恢复指南

## 📋 恢复步骤 (5分钟完成)

### 1️⃣ 恢复代码
```bash
# 解压备份文件到新文件夹
# 或者从Git克隆

cd 项目文件夹
npm install
```

### 2️⃣ 恢复数据库
1. 创建新的Supabase项目
2. 在SQL Editor中执行 `log/database_backup_2025_09_05.sql`
3. 在Authentication > Users创建管理员用户:
   - Email: `admin@yushuo.local`
   - Password: `7287843`
4. 在profiles表添加管理员记录

### 3️⃣ 配置环境
复制`.env.local`文件，更新Supabase配置:
```env
VITE_SUPABASE_URL=新项目URL
VITE_SUPABASE_ANON_KEY=新项目anon key
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=7287843
VITE_FAKE_EMAIL_DOMAIN=wx.local
```

### 4️⃣ 启动测试
```bash
npm run dev
# 访问 http://localhost:5173
# 测试登录功能
```

## ✅ 功能验证清单
- [ ] 用户注册正常
- [ ] 昵称登录正常  
- [ ] 管理员登录正常(admin/7287843)
- [ ] 权限控制正常
- [ ] 退出登录正常

**恢复完成！** 🎉