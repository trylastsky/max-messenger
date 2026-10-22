@echo off
setlocal
title MAX Messenger

cd /d "%~dp0"

echo ========================================
echo          MAX Messenger
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or is not in PATH.
    echo Install the LTS version from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm was not found. Reinstall Node.js LTS.
    echo.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo [ERROR] package.json was not found.
    echo Put this file in the project root, next to package.json.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing project dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Dependency installation failed.
        pause
        exit /b 1
    )
)

echo.
echo Starting the development server...
echo When Vite prints a Local URL, open it in your browser.
echo Press Ctrl+C to stop the server.
echo.

call npm run dev
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if not "%EXIT_CODE%"=="0" (
    echo The development server exited with code %EXIT_CODE%.
)
pause
exit /b %EXIT_CODE%
