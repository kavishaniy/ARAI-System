#!/bin/bash

# FIGMA ANALYSIS TROUBLESHOOTING GUIDE
# =====================================
# If Figma analysis stopped working, follow these steps

echo "🔧 FIGMA ANALYSIS TROUBLESHOOTING"
echo "=================================="
echo ""

# Step 1: Check backend status
echo "1️⃣  Checking backend status..."
if lsof -i :8000 > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 8000"
else
    echo "   ❌ Backend is NOT running"
    echo "   📝 To start: cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
fi

# Step 2: Check environment variables
echo ""
echo "2️⃣  Checking environment variables..."
if grep -q "FIGMA_API_TOKEN" /Users/kavishani/Documents/FYP/arai-system/backend/.env; then
    echo "   ✅ FIGMA_API_TOKEN is set in .env"
    TOKEN_VALUE=$(grep "FIGMA_API_TOKEN" /Users/kavishani/Documents/FYP/arai-system/backend/.env | cut -d'=' -f2)
    if [ -z "$TOKEN_VALUE" ]; then
        echo "   ⚠️  WARNING: Token value is empty!"
    else
        echo "   ✅ Token value found (${#TOKEN_VALUE} characters)"
    fi
else
    echo "   ❌ FIGMA_API_TOKEN not found in .env"
fi

# Step 3: Check Python modules
echo ""
echo "3️⃣  Checking Python module dependencies..."
cd /Users/kavishani/Documents/FYP/arai-system/backend
python3 -c "from app.services.figma_service import FigmaAnalysisService; print('   ✅ FigmaAnalysisService imports successfully')" 2>/dev/null || echo "   ❌ FigmaAnalysisService import failed"
python3 -c "from app.core.figma_client import FigmaAPIClient; print('   ✅ FigmaAPIClient imports successfully')" 2>/dev/null || echo "   ❌ FigmaAPIClient import failed"

# Step 4: Check Figma URL format
echo ""
echo "4️⃣  Checking Figma URL format..."
FIGMA_URL="https://www.figma.com/design/UHw9ANQMCKSIKmZgrxeOxl/Untitled?node-id=0-1&t=PQ8G1kjKcPlSEeP7-1"

if [[ $FIGMA_URL =~ figma\.com/(file|design)/ ]]; then
    echo "   ✅ URL format is valid"
    FILE_KEY=$(echo $FIGMA_URL | sed -E 's|.*figma\.com/(file|design)/([a-zA-Z0-9]+).*|\2|')
    echo "   📁 File key extracted: $FILE_KEY"
else
    echo "   ❌ URL format is invalid"
fi

echo ""
echo "=================================="
echo "SUMMARY"
echo "=================================="
echo ""
echo "If any checks above are failing:"
echo ""
echo "For Backend Issues:"
echo "  1. Kill existing process: pkill -f uvicorn"
echo "  2. Start fresh: cd backend && bash ../start_backend.sh"
echo ""
echo "For Token Issues:"
echo "  1. Check .env file has FIGMA_API_TOKEN set"
echo "  2. Get new token: https://www.figma.com/developers/api#auth"
echo "  3. Update .env with new token"
echo ""
echo "For Import Issues:"
echo "  1. Check app/services/figma_service.py exists"
echo "  2. Check app/core/figma_client.py exists"
echo "  3. Run: pip install -r requirements.txt"
echo ""
echo "=================================="
