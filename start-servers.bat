@echo off
title Starting QuickIT Servers
echo ========================================
echo           STARTING QUICKIT SERVERS
echo ========================================

echo.
echo Step 1: Killing existing node processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (
    echo ✓ Killed existing processes
) else (
    echo ✓ No existing processes found
)

echo.
echo Step 2: Starting Backend Server (port 8000)...
start "QuickIT Backend" cmd /k "cd /d %~dp0backend && echo Starting Backend... && npm start"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Step 3: Starting Frontend Server (port 5173)...
start "QuickIT Frontend" cmd /k "cd /d %~dp0frontend && echo Starting Frontend... && set PORT=5173 && npm run dev"

echo.
echo ========================================
echo   SERVERS STARTING IN SEPARATE WINDOWS
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Wait for both windows to show "ready" messages
echo Then go to: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul