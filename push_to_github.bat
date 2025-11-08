@echo off
chcp 65001 >nul
echo ========================================
echo     推送代码到GitHub - yushuo1991
echo ========================================

echo 📋 即将执行的操作：
echo 1. 添加远程仓库：https://github.com/yushuo1991/yushuo-fuplan-system.git
echo 2. 重命名分支为 main
echo 3. 推送代码到GitHub
echo.

echo ⚠️ 重要提醒：
echo 请确保你已经在GitHub上创建了仓库 'yushuo-fuplan-system'
echo 如果还没有创建，请先访问：https://github.com/new
echo.

pause

echo 📤 步骤1：添加远程仓库
git remote add origin https://github.com/yushuo1991/yushuo-fuplan-system.git
if %errorlevel% neq 0 (
    echo ❌ 添加远程仓库失败，可能原因：
    echo - 仓库已经存在远程连接
    echo - 网络连接问题
    echo 尝试移除现有远程连接...
    git remote remove origin
    git remote add origin https://github.com/yushuo1991/yushuo-fuplan-system.git
)
echo ✅ 远程仓库添加完成

echo.
echo 🔄 步骤2：重命名分支为main
git branch -M main
if %errorlevel% neq 0 (
    echo ❌ 分支重命名失败，继续执行...
) else (
    echo ✅ 分支重命名完成
)

echo.
echo 📡 步骤3：推送代码到GitHub
echo 正在推送，请等待...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo ❌ 推送失败！可能的原因和解决方案：
    echo.
    echo 1. GitHub仓库不存在：
    echo    - 访问：https://github.com/new
    echo    - 创建仓库名：yushuo-fuplan-system
    echo    - 不要初始化README文件
    echo.
    echo 2. 需要GitHub身份验证：
    echo    - 如果要求登录，请使用GitHub用户名和Personal Access Token
    echo    - Token获取：GitHub → Settings → Developer settings → Personal access tokens
    echo.
    echo 3. 网络问题：
    echo    - 检查网络连接
    echo    - 稍后重试
    echo.
    pause
) else (
    echo.
    echo ✅ 成功推送到GitHub！
    echo 📍 仓库地址：https://github.com/yushuo1991/yushuo-fuplan-system
    echo.
    echo 🎉 下一步：
    echo 1. 访问 https://vercel.com
    echo 2. 使用GitHub登录
    echo 3. Import Project，选择 yushuo-fuplan-system
    echo 4. 配置环境变量并部署
    echo.
)

echo ========================================
echo 推送脚本执行完成
echo ========================================
pause