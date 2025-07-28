@echo off
REM TypeScript Migration and Build Script for MCP Blocks Server (Windows)

echo 🚀 MCP Blocks Server - TypeScript Setup ^& Build
echo ================================================

REM Check Node.js
echo 📋 Checking Node.js version...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20 or later.
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed.
    exit /b 1
)

for /f %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm version: %NPM_VERSION%

REM Install dependencies
echo.
echo 📦 Installing dependencies...
npm install

REM Install TypeScript dependencies
echo.
echo 🔧 Installing TypeScript dependencies...
npm install --save-dev typescript @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint ts-node

REM Clean previous build
echo.
echo 🧹 Cleaning previous build...
if exist dist rmdir /s /q dist

REM Type check
echo.
echo 🔍 Running type check...
npm run type-check
if %ERRORLEVEL% NEQ 0 (
    echo ❌ TypeScript type checking failed. Please fix the errors above.
    exit /b 1
)
echo ✅ TypeScript type checking passed!

REM Build
echo.
echo 🔨 Building TypeScript...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ TypeScript build failed. Please fix the errors above.
    exit /b 1
)
echo ✅ TypeScript build completed successfully!

REM Run linting
echo.
echo 🧐 Running ESLint...
npm run lint
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Linting found some issues. Consider fixing them.
) else (
    echo ✅ Linting passed!
)

REM Check if dist directory was created
if exist dist (
    echo.
    echo 📁 Build output created in dist/ directory
) else (
    echo ❌ Build directory 'dist' was not created.
    exit /b 1
)

echo.
echo 🎉 TypeScript setup and build completed successfully!
echo.
echo Next steps:
echo   • Run 'npm start' to start the compiled server
echo   • Run 'npm run dev' to start in development mode
echo   • Run 'npm run watch' to watch for changes during development
echo   • Check README-TypeScript.md for detailed documentation
echo.
echo Environment variables needed:
echo   • BLOCKS_KEY - Your blocks API key
echo   • USERNAME - Your username
echo   • USER_KEY - Your user key
echo.
pause
