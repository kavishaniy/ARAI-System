#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}🔍 ARAI System - Diagnostic Report${NC}"
echo -e "${BLUE}=====================================${NC}\n"

# Check if backend is running
echo -e "${YELLOW}1️⃣  Checking Backend Status...${NC}"
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on port 8000${NC}"
else
    echo -e "${RED}❌ Backend is NOT running on port 8000${NC}"
fi

# Check if frontend is running
echo -e "\n${YELLOW}2️⃣  Checking Frontend Status...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running on port 3000${NC}"
else
    echo -e "${RED}❌ Frontend is NOT running on port 3000${NC}"
fi

# Check Supabase connection
echo -e "\n${YELLOW}3️⃣  Checking Supabase Connection...${NC}"
if python3 << 'PYEOF'
import sys
sys.path.insert(0, 'backend')
try:
    from app.core.config import settings
    from app.core.database import supabase_admin
    response = supabase_admin.table("projects").select("id").limit(1).execute()
    print("✅ Supabase connected successfully")
    print(f"   Current project count: {len(response.data) if hasattr(response, 'data') else 'unknown'}")
except Exception as e:
    print(f"❌ Supabase connection failed: {str(e)}")
    sys.exit(1)
PYEOF
then
    :
else
    echo -e "${RED}Supabase check failed${NC}"
fi

# Check database migrations
echo -e "\n${YELLOW}4️⃣  Checking Database Schema...${NC}"
if python3 << 'PYEOF'
import sys
sys.path.insert(0, 'backend')
try:
    from app.core.database import supabase_admin
    # Try to get table info
    response = supabase_admin.table("projects").select("*").limit(1).execute()
    print("✅ Projects table exists")
    print("   Columns: id, user_id, name, description, created_at, updated_at")
except Exception as e:
    print(f"❌ Projects table check failed: {str(e)}")
    sys.exit(1)
PYEOF
then
    :
else
    echo -e "${RED}Table check failed${NC}"
fi

# Test API endpoint
echo -e "\n${YELLOW}5️⃣  Testing API Endpoints...${NC}"

echo "   Testing GET /api/v1/projects (without auth)..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/v1/projects)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}   ✅ Returns 401 (expected - requires auth)${NC}"
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "${YELLOW}   ⚠️  Returns 200 (auth might not be enforced)${NC}"
else
    echo -e "${RED}   ❌ Returns $HTTP_CODE${NC}"
fi

# Check logs
echo -e "\n${YELLOW}6️⃣  Recent Backend Logs...${NC}"
if [ -f "backend/backend.log" ]; then
    echo "   Last 10 lines:"
    tail -10 backend/backend.log | sed 's/^/   /'
else
    echo -e "${YELLOW}   ℹ️  No backend.log found${NC}"
fi

# Summary
echo -e "\n${BLUE}=====================================${NC}"
echo -e "${BLUE}📊 Next Steps:${NC}"
echo -e "${BLUE}=====================================${NC}"
echo "1. If backend/frontend are running: Check browser console (F12)"
echo "2. Try to create a project in the UI"
echo "3. Check Network tab in DevTools for POST /api/v1/projects request"
echo "4. Look for Authorization header with Bearer token"
echo "5. Check response status and error message"
echo ""
echo "Run this command to see detailed logs:"
echo "   tail -f backend/backend.log"
echo ""
