# Netlify 部署指南

## 🚀 快速部署步骤

### 1. 访问 Netlify
https://netlify.com

### 2. 使用GitHub登录
点击 "Sign up with GitHub"

### 3. 导入项目
1. 点击 "Add new site" → "Import an existing project"
2. 选择 "Deploy with GitHub"
3. 找到并选择 "yushuo-fuplan-system" 仓库
4. 点击 "Deploy site"

### 4. 构建配置（自动检测）
- **Build command**: `npm run build`  
- **Publish directory**: `dist`
- **Node.js version**: 18

### 5. 配置环境变量（重要）
部署后在 Site settings → Environment variables 中添加：

从你的 .env.local 文件复制以下变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_USERNAME`
- `VITE_ADMIN_PASSWORD`
- `VITE_FAKE_EMAIL_DOMAIN`

### 6. 重新部署
添加环境变量后，点击 "Trigger deploy" 重新构建

## 🎉 完成后
你将获得一个 `.netlify.app` 域名，用户可通过互联网访问！

## 优势
- ✅ 无需账户验证
- ✅ 自动从GitHub部署
- ✅ 免费SSL证书
- ✅ 全球CDN加速