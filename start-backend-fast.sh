#!/bin/bash
# Quick Backend Startup Script - Optimized for 30-second analysis

echo "🚀 Starting ARAI Backend (Optimized)..."
echo ""

# Kill any existing processes on port 5000/8000
echo "🧹 Clearing ports..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 1

# Change to backend directory
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Start with minimal reload watching (faster startup)
echo "⚡ Starting server..."
echo ""
echo "   Backend URL: http://localhost:5000"
echo "   Frontend URL: http://localhost:3000"
echo ""
echo "✅ Server starting... Ready in ~3-5 seconds"
echo ""

# Run without reload watcher for faster startup
PYTHONUNBUFFERED=1 python -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 5000 \
    --workers 1 \
    --loop uvloop \
    --log-level info

# Note: Remove --reload flag for production speed
# Add back --reload if you want development auto-reload
