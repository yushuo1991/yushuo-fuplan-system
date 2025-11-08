@echo off
chcp 65001 >nul
echo 开始部署到服务器 107.173.154.147...

REM 设置变量
set SERVER_IP=107.173.154.147
set SERVER_USER=root
set SERVER_PATH=/var/www/fupan
set LOCAL_BUILD_DIR=dist

echo.
echo [1/4] 构建项目...
call npm run build
if errorlevel 1 (
    echo 构建失败！请检查错误信息。
    pause
    exit /b 1
)

echo.
echo [2/4] 打包构建文件...
if exist deploy_temp.tar.gz del deploy_temp.tar.gz
tar -czf deploy_temp.tar.gz -C %LOCAL_BUILD_DIR% .

echo.
echo [3/4] 上传到服务器...
echo 正在上传文件到 %SERVER_IP%...
scp deploy_temp.tar.gz %SERVER_USER%@%SERVER_IP%:/tmp/

echo.
echo [4/4] 在服务器上部署...
ssh %SERVER_USER%@%SERVER_IP% "
echo '正在服务器上执行部署...'
cd %SERVER_PATH%
sudo rm -rf dist_backup
if [ -d 'dist' ]; then
    sudo mv dist dist_backup
    echo '已备份旧版本到 dist_backup'
fi
sudo mkdir -p dist
cd dist
sudo tar -xzf /tmp/deploy_temp.tar.gz
sudo chown -R www-data:www-data %SERVER_PATH%/dist
sudo chmod -R 755 %SERVER_PATH%/dist
echo '检查Nginx配置...'
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo '已重新加载Nginx配置'
else
    echo '警告：Nginx配置测试失败，请检查配置文件'
fi
rm -f /tmp/deploy_temp.tar.gz
echo '部署完成！'
echo '访问地址: https://fupan.yushuo.click'
"

REM 清理本地临时文件
if exist deploy_temp.tar.gz del deploy_temp.tar.gz

echo.
echo ====================================
echo 部署完成！
echo 访问地址: https://fupan.yushuo.click
echo ====================================
echo.

REM 询问是否查看服务器日志
set /p check_logs="是否查看服务器访问日志？(y/n): "
if /i "%check_logs%"=="y" (
    echo 正在查看最近的访问日志...
    ssh %SERVER_USER%@%SERVER_IP% "sudo tail -20 /var/log/nginx/access.log"
)

pause