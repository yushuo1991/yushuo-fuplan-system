@echo off
echo ========================================
echo  清理项目冗余文件
echo ========================================

echo 正在删除冗余文件...

:: 删除旧版本和测试文件
del "7-25-2.html" 2>nul
del "complete_interface_docs_with_samples.html" 2>nul
del "debug-api-test.html" 2>nul
del "test-real-integration.js" 2>nul
del "test-recent-dates.js" 2>nul
del "final-system-test.js" 2>nul
del "test-pure-api-version.js" 2>nul
del "test-complete-fix.js" 2>nul
del "test-api.bat" 2>nul
del "deploy.bat" 2>nul
del "manual-deploy-steps.md" 2>nul
del "web-deployment-guide.md" 2>nul
del "supabase-function-with-config.ts" 2>nul
del "supabase-function-updated.ts" 2>nul
del "VERCEL_DEPLOYMENT.md" 2>nul
del "DEPLOY_CHECKLIST.md" 2>nul
del "IMPLEMENTATION_REPORT.md" 2>nul

:: 删除旧的API文件夹（如果存在Vercel版本残留）
if exist "api" (
    echo 警告: 发现api文件夹，这是Vercel版本的残留
    echo 如确认不需要，请手动删除
)

:: 删除旧的public文件（非Supabase版本）
if exist "public\script.js" (
    del "public\script.js" 2>nul
    echo 删除旧版本前端脚本
)

if exist "public\enhanced-script.js" (
    del "public\enhanced-script.js" 2>nul
    echo 删除非Supabase版本脚本
)

if exist "public\enhanced.html" (
    del "public\enhanced.html" 2>nul
    echo 删除非Supabase版本HTML
)

echo ========================================
echo  清理完成！保留的核心文件:
echo ========================================
echo ✅ supabase/ - 数据库和Edge Functions
echo ✅ public/supabase-enhanced.html - 前端界面
echo ✅ public/supabase-enhanced-script.js - 前端脚本  
echo ✅ public/enhanced-styles.css - 样式文件
echo ✅ log/ - 日志和文档
echo ✅ README.md - 项目说明
echo ✅ package.json - 依赖管理
echo.

pause