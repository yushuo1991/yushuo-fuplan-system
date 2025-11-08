@echo off
echo ===========================================
echo    宇硕复盘图鉴 - 快速备份脚本
echo ===========================================

set backup_date=%date:~0,4%_%date:~5,2%_%date:~8,2%_%time:~0,2%_%time:~3,2%
set backup_date=%backup_date: =0%
set backup_name=宇硕复盘图鉴_备份_%backup_date%

echo 📅 备份时间: %date% %time%
echo 📁 备份名称: %backup_name%
echo.

echo 🔄 创建备份目录...
if not exist "..\backups" mkdir "..\backups"
mkdir "..\backups\%backup_name%"

echo 📋 复制项目文件...
xcopy . "..\backups\%backup_name%" /E /I /H /Y /Q

echo 🗑️  清理备份文件...
rmdir /s /q "..\backups\%backup_name%\node_modules" 2>nul
rmdir /s /q "..\backups\%backup_name%\dist" 2>nul
rmdir /s /q "..\backups\%backup_name%\.git" 2>nul

echo.
echo ✅ 备份完成！
echo 📍 备份位置: ..\backups\%backup_name%
echo.
echo 💡 提示: 
echo    1. 记得备份Supabase数据库数据
echo    2. 保存.env.local配置文件  
echo    3. 记录Supabase项目URL和API密钥
echo.
pause