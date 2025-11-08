@echo off
echo ========================================
echo     Vercel Deploy Check
echo ========================================

echo Step 1: Check Node.js
node --version
if %errorlevel% neq 0 echo ERROR: Node.js not found

echo.
echo Step 2: Check npm  
npm --version
if %errorlevel% neq 0 echo ERROR: npm not found

echo.
echo Step 3: Check Git
git --version
if %errorlevel% neq 0 echo ERROR: Git not found

echo.
echo Step 4: Build project
npm run build
if %errorlevel% neq 0 echo ERROR: Build failed

echo.
echo Step 5: Initialize Git
if not exist .git (
    git init
    echo node_modules/ > .gitignore
    echo dist/ >> .gitignore
    echo .env.local >> .gitignore
    echo *.log >> .gitignore
    git add .
    git commit -m "Initial commit for Vercel deploy"
    echo Git initialized successfully
) else (
    echo Git already initialized
    git add .
    git commit -m "Update for Vercel deploy"
)

echo.
echo ========================================
echo All checks completed successfully!
echo ========================================
pause