@echo off
title ARCTIC CODE SENS - Full Stack
color 0A

echo.
echo ========================================
echo ARCTIC CODE SENS - Full Stack Startup
echo ========================================
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server on http://localhost:5000
start "ARCTIC CODE SENS - Backend" cmd /k "cd server && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start Frontend Server
echo [2/2] Starting Frontend Server on http://localhost:5173
start "ARCTIC CODE SENS - Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Servers are starting...
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Test Credentials:
echo Email: test@example.com
echo Password: Test@123
echo ========================================
echo.
pause
