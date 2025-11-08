@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ==========================================
echo     宇硕复盘图鉴 - Vercel完整部署脚本
echo ==========================================

REM 创建日志目录
if not exist log mkdir log
set "LOG_FILE=log\vercel_deploy_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%.log"
set "LOG_FILE=%LOG_FILE: =0%"

echo %date% %time% [INFO] 开始Vercel部署流程 >> "%LOG_FILE%"
echo.

REM ================================================
REM 第1步：系统环境检查
REM ================================================
echo 🔍 第1步：检查系统环境
echo %date% %time% [INFO] 开始系统环境检查 >> "%LOG_FILE%"

REM 检查Node.js
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ 错误：Node.js未安装
    echo %date% %time% [ERROR] Node.js未安装，影响：无法构建前端项目 >> "%LOG_FILE%"
    echo 解决方案：请访问 https://nodejs.org 下载安装Node.js
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js版本：!NODE_VERSION!
    echo %date% %time% [INFO] Node.js版本：!NODE_VERSION! >> "%LOG_FILE%"
)

REM 检查npm
npm --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ 错误：npm未安装
    echo %date% %time% [ERROR] npm未安装，影响：无法安装依赖包 >> "%LOG_FILE%"
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm版本：!NPM_VERSION!
    echo %date% %time% [INFO] npm版本：!NPM_VERSION! >> "%LOG_FILE%"
)

REM 检查Git
git --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ 错误：Git未安装
    echo %date% %time% [ERROR] Git未安装，影响：无法进行版本控制和代码推送 >> "%LOG_FILE%"
    echo 解决方案：请访问 https://git-scm.com 下载安装Git
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo ✅ Git版本：!GIT_VERSION!
    echo %date% %time% [INFO] Git版本：!GIT_VERSION! >> "%LOG_FILE%"
)

echo.

REM ================================================
REM 第2步：项目模块检查
REM ================================================
echo 🔧 第2步：检查项目模块
echo %date% %time% [INFO] 开始项目模块检查 >> "%LOG_FILE%"

REM 检查package.json
if not exist package.json (
    echo ❌ 错误：package.json不存在
    echo %date% %time% [ERROR] package.json缺失，影响：无法识别项目依赖 >> "%LOG_FILE%"
    pause
    exit /b 1
) else (
    echo ✅ package.json存在
    echo %date% %time% [INFO] package.json检查通过 >> "%LOG_FILE%"
)

REM 检查Vite配置
if not exist vite.config.ts (
    echo ❌ 警告：vite.config.ts不存在
    echo %date% %time% [WARN] Vite配置文件缺失，可能影响构建 >> "%LOG_FILE%"
) else (
    echo ✅ Vite配置文件存在
    echo %date% %time% [INFO] Vite构建系统配置正常 >> "%LOG_FILE%"
)

REM 检查Vercel配置
if not exist vercel.json (
    echo ❌ 警告：vercel.json不存在，将使用默认配置
    echo %date% %time% [WARN] Vercel配置文件缺失，将使用默认配置 >> "%LOG_FILE%"
) else (
    echo ✅ Vercel配置文件存在
    echo %date% %time% [INFO] Vercel部署配置正常 >> "%LOG_FILE%"
)

REM 检查环境变量文件
if not exist .env.local (
    echo ❌ 警告：.env.local不存在
    echo %date% %time% [WARN] 环境变量文件缺失，Supabase连接可能失败 >> "%LOG_FILE%"
) else (
    echo ✅ 环境变量文件存在
    echo %date% %time% [INFO] Supabase配置文件存在 >> "%LOG_FILE%"
)

echo.

REM ================================================
REM 第3步：安装依赖
REM ================================================
echo 📦 第3步：安装项目依赖
echo %date% %time% [INFO] 开始安装依赖包 >> "%LOG_FILE%"

npm install
if !errorlevel! neq 0 (
    echo ❌ 错误：依赖安装失败
    echo %date% %time% [ERROR] npm install失败，影响：无法构建项目 >> "%LOG_FILE%"
    echo 解决方案：检查网络连接，清除npm缓存后重试
    pause
    exit /b 1
) else (
    echo ✅ 依赖安装成功
    echo %date% %time% [INFO] React、Vite、Supabase等模块安装完成 >> "%LOG_FILE%"
)

echo.

REM ================================================
REM 第4步：项目构建测试
REM ================================================
echo 🏗️ 第4步：构建项目
echo %date% %time% [INFO] 开始项目构建测试 >> "%LOG_FILE%"

npm run build
if !errorlevel! neq 0 (
    echo ❌ 错误：项目构建失败
    echo %date% %time% [ERROR] 构建失败，影响：无法部署到Vercel >> "%LOG_FILE%"
    echo 可能原因：TypeScript编译错误、React组件错误、Vite配置问题
    echo 解决方案：检查代码错误并修复
    pause
    exit /b 1
) else (
    echo ✅ 项目构建成功
    echo %date% %time% [INFO] Vite构建成功，dist文件夹已生成 >> "%LOG_FILE%"
)

echo.

REM ================================================
REM 第5步：Git仓库准备
REM ================================================
echo 📝 第5步：准备Git仓库
echo %date% %time% [INFO] 开始Git仓库配置 >> "%LOG_FILE%"

if not exist .git (
    echo 初始化Git仓库...
    git init
    echo %date% %time% [INFO] Git仓库初始化完成 >> "%LOG_FILE%"
    
    REM 检查是否有gitignore
    if not exist .gitignore (
        echo node_modules/ > .gitignore
        echo dist/ >> .gitignore
        echo .env.local >> .gitignore
        echo *.log >> .gitignore
        echo %date% %time% [INFO] 创建.gitignore文件 >> "%LOG_FILE%"
    )
    
    git add .
    git commit -m "初始提交 - 宇硕复盘图鉴系统 %date% %time%"
    echo ✅ Git仓库初始化完成
    echo %date% %time% [INFO] 代码已提交到本地Git仓库 >> "%LOG_FILE%"
) else (
    echo Git仓库已存在，添加最新更改...
    git add .
    git commit -m "更新 - 准备Vercel部署 %date% %time%"
    if !errorlevel! equ 0 (
        echo ✅ 代码更新完成
        echo %date% %time% [INFO] 最新代码已提交 >> "%LOG_FILE%"
    ) else (
        echo ℹ️ 没有新的更改需要提交
        echo %date% %time% [INFO] 代码无变化，跳过提交 >> "%LOG_FILE%"
    )
)

echo.

REM ================================================
REM 第6步：输出部署指南
REM ================================================
echo 🌐 第6步：Vercel部署指南
echo %date% %time% [INFO] 生成部署指南 >> "%LOG_FILE%"

echo.
echo ==========================================
echo 📋 手动完成以下步骤进行Vercel部署：
echo ==========================================
echo.
echo 🔗 1. 创建GitHub仓库：
echo    - 访问: https://github.com/new
echo    - 仓库名: yushuo-fuplan-system
echo    - 设为公开或私人（推荐私人）
echo    - 不要初始化README
echo.
echo 📤 2. 推送代码到GitHub：
echo    在命令行中运行以下命令：
echo    git remote add origin https://github.com/你的用户名/yushuo-fuplan-system.git
echo    git branch -M main  
echo    git push -u origin main
echo.
echo 🚀 3. 在Vercel部署：
echo    - 访问: https://vercel.com
echo    - 用GitHub账号登录
echo    - 点击 "New Project"
echo    - 选择 "Import Git Repository"  
echo    - 选择刚创建的 yushuo-fuplan-system 仓库
echo    - Framework Preset: 自动检测到 Vite
echo    - Build Command: npm run build
echo    - Output Directory: dist
echo    - 点击 Deploy
echo.
echo ⚙️ 4. 配置环境变量（重要！）：
echo    在Vercel项目设置 Settings → Environment Variables 中添加：

REM 读取.env.local文件并显示环境变量
if exist .env.local (
    echo    从 .env.local 读取到以下环境变量：
    for /f "usebackq tokens=1* delims==" %%a in (".env.local") do (
        if "%%a" neq "" if not "%%a"=="#*" (
            echo    %%a = %%b
            echo %date% %time% [INFO] 环境变量 %%a 需要在Vercel配置 >> "%LOG_FILE%"
        )
    )
) else (
    echo    ⚠️ .env.local文件不存在，请手动添加Supabase配置：
    echo    VITE_SUPABASE_URL = 你的Supabase项目URL
    echo    VITE_SUPABASE_ANON_KEY = 你的Supabase匿名密钥
    echo    VITE_ADMIN_USERNAME = admin
    echo    VITE_ADMIN_PASSWORD = 7287843
    echo    VITE_FAKE_EMAIL_DOMAIN = wx.local
)

echo.
echo ✅ 5. 部署完成后：
echo    - Vercel会提供一个.vercel.app域名
echo    - 每次推送到main分支都会自动重新部署
echo    - 可以在Vercel控制台查看部署日志
echo.
echo 📊 系统架构说明：
echo    - 前端：React + TypeScript + Vite (负责用户界面)
echo    - 数据库：Supabase (负责数据存储和用户认证)
echo    - 部署：Vercel (负责静态文件托管和CDN分发)
echo    - 版本控制：Git + GitHub (负责代码管理和自动部署)
echo.
echo %date% %time% [INFO] 部署指南生成完成 >> "%LOG_FILE%"

echo ==========================================
echo ✨ 脚本执行完成！检查日志文件："%LOG_FILE%"
echo ==========================================

pause