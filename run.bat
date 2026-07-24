@echo off
echo.
echo ========================================
echo ARCTIC CODE SENS - Full Stack Startup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installing backend dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Backend installation failed
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Installing frontend dependencies...
cd client
call npm install
if errorlevel 1 (
    echo ERROR: Frontend installation failed
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Starting backend server...
start cmd /k "cd server && npm run dev"

echo.
echo [4/4] Starting frontend server...
timeout /t 3 /nobreak
start cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Servers starting...
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
echo.
pause
