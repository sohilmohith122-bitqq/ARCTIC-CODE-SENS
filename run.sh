#!/bin/bash

echo ""
echo "========================================"
echo "ARCTIC CODE SENS - Full Stack Startup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/4] Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Backend installation failed"
    exit 1
fi
cd ..

echo ""
echo "[2/4] Installing frontend dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend installation failed"
    exit 1
fi
cd ..

echo ""
echo "[3/4] Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

echo ""
echo "[4/4] Starting frontend server..."
sleep 3
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "Servers starting..."
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
