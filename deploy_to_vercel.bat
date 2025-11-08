@echo off
echo ==========================================
echo     宇硕复盘图鉴 - Vercel部署助手
echo ==========================================

echo 🚀 开始准备部署...

echo.
echo 📦 第一步：构建项目
call npm run build

echo.
echo 📝 第二步：Git准备
if not exist .git (
    echo 初始化Git仓库...
    git init
    git add .
    git commit -m "初始提交 - 宇硕复盘图鉴系统"
    echo ✅ Git仓库初始化完成
) else (
    echo Git仓库已存在，提交最新更改...
    git add .
    git commit -m "更新 - 准备部署 %date% %time%"
    echo ✅ 代码更新完成
)

echo.
echo 🌐 第三步：准备部署
echo ==========================================
echo 📋 接下来请手动完成以下步骤：
echo.
echo 1. GitHub仓库创建：
echo    - 访问: https://github.com
echo    - 创建新仓库: yushuo-fuplan-system
echo.
echo 2. 推送代码到GitHub：
echo    git remote add origin https://github.com/你的用户名/yushuo-fuplan-system.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Vercel部署：
echo    - 访问: https://vercel.com
echo    - 用GitHub登录
echo    - Import Project，选择刚创建的仓库
echo.
echo 4. 配置环境变量（在Vercel项目设置中）：
echo    VITE_SUPABASE_URL = %VITE_SUPABASE_URL%
echo    VITE_SUPABASE_ANON_KEY = %VITE_SUPABASE_ANON_KEY%
echo    VITE_ADMIN_USERNAME = admin
echo    VITE_ADMIN_PASSWORD = 7287843
echo    VITE_FAKE_EMAIL_DOMAIN = wx.local
echo.
echo ✨ 部署完成后，你的朋友就能通过网址访问了！
echo ==========================================
pause