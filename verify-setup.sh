#!/bin/bash

# ARAI System - Figma Analysis Setup Verification Script
# This script checks if your environment is properly configured for Figma analysis

echo "🔍 ARAI System - Figma Analysis Setup Verification"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print results
print_check() {
    local check_name=$1
    local status=$2
    local message=$3
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $check_name"
        if [ ! -z "$message" ]; then
            echo "   └─ $message"
        fi
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $check_name"
        if [ ! -z "$message" ]; then
            echo "   └─ $message"
        fi
        ((CHECKS_FAILED++))
    fi
    echo ""
}

# 1. Check if FIGMA_API_TOKEN is set
echo -e "${BLUE}1. Checking FIGMA_API_TOKEN environment variable...${NC}"
if [ ! -z "$FIGMA_API_TOKEN" ]; then
    TOKEN_LENGTH=${#FIGMA_API_TOKEN}
    print_check "FIGMA_API_TOKEN" "PASS" "Token is set (${TOKEN_LENGTH} characters)"
else
    print_check "FIGMA_API_TOKEN" "FAIL" "Token not set. Use: export FIGMA_API_TOKEN='your_token_here'"
fi

# 2. Check if backend is running locally
echo -e "${BLUE}2. Checking if backend is running...${NC}"
if curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    print_check "Backend Health Check" "PASS" "Backend is accessible at http://localhost:8000"
else
    print_check "Backend Health Check" "FAIL" "Backend not running. Start with: bash start-backend-fast.sh"
fi

# 3. Check if frontend is running locally
echo -e "${BLUE}3. Checking if frontend is running...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1 || curl -s http://localhost:5173 > /dev/null 2>&1; then
    print_check "Frontend Access" "PASS" "Frontend is accessible"
else
    print_check "Frontend Access" "FAIL" "Frontend not running at localhost:3000 or localhost:5173"
fi

# 4. Check Python version (for backend)
echo -e "${BLUE}4. Checking Python installation...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_check "Python Installation" "PASS" "Python found: $PYTHON_VERSION"
else
    print_check "Python Installation" "FAIL" "Python not found. Install Python 3.8+"
fi

# 5. Check Node.js version (for frontend)
echo -e "${BLUE}5. Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_check "Node.js Installation" "PASS" "Node.js found: $NODE_VERSION"
else
    print_check "Node.js Installation" "FAIL" "Node.js not found. Install Node.js 16+"
fi

# 6. Check backend requirements
echo -e "${BLUE}6. Checking backend dependencies...${NC}"
if [ -f "backend/requirements.txt" ]; then
    if python3 -c "import fastapi, uvicorn, requests" 2>/dev/null; then
        print_check "Backend Dependencies" "PASS" "All required packages are installed"
    else
        print_check "Backend Dependencies" "FAIL" "Missing packages. Run: pip install -r backend/requirements.txt"
    fi
else
    print_check "Backend Dependencies" "FAIL" "requirements.txt not found"
fi

# 7. Check frontend node_modules
echo -e "${BLUE}7. Checking frontend dependencies...${NC}"
if [ -d "frontend/node_modules" ]; then
    print_check "Frontend Dependencies" "PASS" "Node modules installed"
else
    print_check "Frontend Dependencies" "FAIL" "Node modules not found. Run: cd frontend && npm install"
fi

# 8. Check if backend files exist
echo -e "${BLUE}8. Checking backend API files...${NC}"
if [ -f "backend/app/api/analysis.py" ]; then
    print_check "Analysis API File" "PASS" "Found backend/app/api/analysis.py"
else
    print_check "Analysis API File" "FAIL" "backend/app/api/analysis.py not found"
fi

# 9. Check if frontend Figma component exists
echo -e "${BLUE}9. Checking frontend components...${NC}"
if [ -f "frontend/src/components/FigmaAnalyzer.jsx" ]; then
    print_check "FigmaAnalyzer Component" "PASS" "Found frontend/src/components/FigmaAnalyzer.jsx"
else
    print_check "FigmaAnalyzer Component" "FAIL" "frontend/src/components/FigmaAnalyzer.jsx not found"
fi

# 10. Check .env file (if it exists)
echo -e "${BLUE}10. Checking .env configuration...${NC}"
if [ -f "backend/.env" ] || [ -f ".env" ]; then
    if grep -q "FIGMA_API_TOKEN" backend/.env 2>/dev/null || grep -q "FIGMA_API_TOKEN" .env 2>/dev/null; then
        print_check ".env Configuration" "PASS" "FIGMA_API_TOKEN found in .env file"
    else
        print_check ".env Configuration" "FAIL" ".env file exists but FIGMA_API_TOKEN not set"
    fi
else
    print_check ".env Configuration" "WARN" ".env file not found (using environment variable is OK)"
fi

echo ""
echo "=================================================="
echo -e "${BLUE}Summary:${NC}"
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Your setup is ready for Figma analysis.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Navigate to Figma Analysis section"
    echo "3. Enter a Figma file URL (e.g., https://www.figma.com/file/abc123/YourFile)"
    echo "4. Click 'Analyze All Screens'"
    echo ""
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "For more help, see: FIGMA_ANALYSIS_TROUBLESHOOTING.md"
    echo ""
fi

# Display troubleshooting tips
echo -e "${YELLOW}💡 Quick Troubleshooting Tips:${NC}"
echo ""
echo "If Figma analysis is not working:"
echo "1. Make sure FIGMA_API_TOKEN is set:"
echo "   export FIGMA_API_TOKEN='your_token_here'"
echo ""
echo "2. Check backend is running:"
echo "   curl http://localhost:8000/api/v1/health"
echo ""
echo "3. View backend logs:"
echo "   tail -f backend.log"
echo ""
echo "4. Check browser console (F12 → Console tab):"
echo "   for real-time analysis logs"
echo ""
echo "5. Ensure Figma URL is correct:"
echo "   https://www.figma.com/file/ABC123/YourFileName"
echo ""

echo -e "${BLUE}For detailed help, see: FIGMA_ANALYSIS_TROUBLESHOOTING.md${NC}"
