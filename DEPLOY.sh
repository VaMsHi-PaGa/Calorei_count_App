#!/bin/bash

# FitTrack Deployment Script
# This script starts both backend and frontend servers for development or production

set -e

echo "🚀 FitTrack Deployment Script"
echo "=============================="
echo ""

# Check if backend venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✅ Virtual environment created and dependencies installed"
else
    source venv/bin/activate
    echo "✅ Virtual environment activated"

echo ""
echo "📋 Available deployment options:"
echo ""
echo "1. Development (Both servers with auto-reload)"
echo "2. Production (Gunicorn backend + Next.js)"
echo "3. Backend only (API server)"
echo "4. Frontend only (Web server)"
echo ""
read -p "Choose option (1-4): " option

case $option in
    1)
        echo ""
        echo "🔧 Starting development servers..."
        echo "Frontend will start in a new terminal window"
        echo ""
        echo "Backend starting on http://0.0.0.0:8000"
        echo "Frontend will start on http://localhost:3000"
        echo ""
        
        # Start backend in background
        (source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &
        BACKEND_PID=$!
        
        sleep 2
        
        # Start frontend in another terminal
        (cd /home/ubuntu/fitness-app/frontend && npm run dev) &
        FRONTEND_PID=$!
        
        echo ""
        echo "✅ Servers started!"
        echo "Backend PID: $BACKEND_PID"
        echo "Frontend PID: $FRONTEND_PID"
        echo ""
        echo "Press Ctrl+C to stop both servers"
        
        wait
        ;;
        
    2)
        echo ""
        echo "🔧 Starting production servers..."
        
        # Install Gunicorn if needed
        pip install gunicorn > /dev/null 2>&1
        
echo "📦 Building frontend (production)..."
cd frontend
npm install
npm run build
cd ..
        
        echo ""
        echo "Backend starting on http://0.0.0.0:8000"
        echo "Frontend starting on http://localhost:3000"
        echo ""
        
        # Start backend
        (cd /home/ubuntu/fitness-app && source venv/bin/activate && gunicorn app.main:app -w 4 -b 0.0.0.0:8000 --timeout 120) &
        BACKEND_PID=$!
        
        sleep 2
        
        # Start frontend
        (cd /home/ubuntu/fitness-app/frontend && npm start) &
        FRONTEND_PID=$!
        
        echo "✅ Production servers started!"
        echo "Backend PID: $BACKEND_PID"
        echo "Frontend PID: $FRONTEND_PID"
        
        wait
        ;;
        
    3)
        echo ""
        echo "🔧 Starting backend only..."
        echo "Backend starting on http://0.0.0.0:8000"
        echo ""
        
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
        ;;
        
    4)
        echo ""
        echo "🔧 Starting frontend only..."
        echo "Frontend starting on http://localhost:3000"
        echo ""
        
        cd frontend
        npm run dev
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac
