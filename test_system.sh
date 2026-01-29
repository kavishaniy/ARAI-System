#!/bin/bash

# ARAI System Test Script
# Tests the AI-Powered UX Design Critique System

echo "========================================="
echo "ARAI System Testing Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "Checking backend status..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$BACKEND_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo "Start backend with: cd backend && uvicorn app.main:app --reload"
    exit 1
fi

# Check if frontend is running
echo "Checking frontend status..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$FRONTEND_STATUS" -eq 200 ] || [ "$FRONTEND_STATUS" -eq 301 ]; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may not be running${NC}"
    echo "Start frontend with: cd frontend && npm start"
fi

echo ""
echo "========================================="
echo "API Endpoints Test"
echo "========================================="
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:8000/health)
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi

echo ""

# Test root endpoint
echo "2. Testing root endpoint..."
ROOT_RESPONSE=$(curl -s http://localhost:8000/)
if [[ $ROOT_RESPONSE == *"ARAI"* ]]; then
    echo -e "${GREEN}✓ Root endpoint working${NC}"
    echo "   Response: $ROOT_RESPONSE"
else
    echo -e "${RED}✗ Root endpoint failed${NC}"
fi

echo ""

# Check analysis history endpoint (requires auth)
echo "3. Testing analysis history endpoint..."
HISTORY_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/v1/analysis/history)
HTTP_CODE=$(echo "$HISTORY_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✓ Analysis endpoint accessible${NC}"
    if [ "$HTTP_CODE" -eq 401 ]; then
        echo -e "${YELLOW}  (Authentication required - this is expected)${NC}"
    fi
else
    echo -e "${RED}✗ Analysis endpoint failed${NC}"
fi

echo ""
echo "========================================="
echo "File System Check"
echo "========================================="
echo ""

# Check required directories
REQUIRED_DIRS=(
    "backend/app/ai_modules"
    "backend/uploads"
    "backend/models"
    "data/figma_designs"
    "frontend/src/components/Analysis"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir exists"
    else
        echo -e "${YELLOW}⚠${NC} $dir does not exist (creating...)"
        mkdir -p "$dir"
    fi
done

echo ""

# Check test images
echo "Checking for test images..."
TEST_IMAGES=$(find data/figma_designs -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | wc -l)
echo "Found $TEST_IMAGES test images in data/figma_designs/"

if [ "$TEST_IMAGES" -gt 0 ]; then
    echo -e "${GREEN}✓ Test images available${NC}"
    echo ""
    echo "Sample images:"
    find data/figma_designs -type f \( -name "*.png" -o -name "*.jpg" \) | head -5
else
    echo -e "${YELLOW}⚠ No test images found${NC}"
    echo "Add design mockups to data/figma_designs/ for testing"
fi

echo ""
echo "========================================="
echo "Python Dependencies Check"
echo "========================================="
echo ""

# Check if virtual environment is active
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo -e "${GREEN}✓ Virtual environment is active${NC}"
    echo "   Path: $VIRTUAL_ENV"
else
    echo -e "${YELLOW}⚠ No virtual environment detected${NC}"
    echo "   Consider activating: source venv/bin/activate"
fi

echo ""

# Check key Python packages
KEY_PACKAGES=("fastapi" "pillow" "opencv-python" "pytesseract" "torch")

echo "Checking Python packages..."
for package in "${KEY_PACKAGES[@]}"; do
    if python3 -c "import ${package//-/_}" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $package installed"
    else
        echo -e "${RED}✗${NC} $package not found"
    fi
done

echo ""
echo "========================================="
echo "System Configuration"
echo "========================================="
echo ""

# Check .env file
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ backend/.env exists${NC}"
    
    # Check if key variables are set (without showing values)
    if grep -q "SUPABASE_URL" backend/.env && grep -q "SUPABASE_KEY" backend/.env; then
        echo -e "${GREEN}✓ Supabase credentials configured${NC}"
    else
        echo -e "${YELLOW}⚠ Supabase credentials may be incomplete${NC}"
    fi
else
    echo -e "${YELLOW}⚠ backend/.env not found${NC}"
    echo "   Copy backend/.env.example to backend/.env and configure"
fi

echo ""
echo "========================================="
echo "Testing Complete"
echo "========================================="
echo ""

echo "Summary:"
echo "- Backend: $([ "$BACKEND_STATUS" -eq 200 ] && echo -e "${GREEN}Running${NC}" || echo -e "${RED}Not running${NC}")"
echo "- Frontend: $([ "$FRONTEND_STATUS" -eq 200 ] && echo -e "${GREEN}Running${NC}" || echo -e "${YELLOW}Check manually${NC}")"
echo "- Test Images: $TEST_IMAGES available"
echo ""

echo "Next Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Sign up / Log in"
echo "3. Upload a design from data/figma_designs/"
echo "4. View comprehensive analysis results"
echo ""

echo "For detailed implementation info, see:"
echo "- IMPLEMENTATION_GUIDE.md"
echo "- QUICK_START.md"
echo ""
