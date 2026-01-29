#!/bin/bash

echo "============================================"
echo "🧪 TESTING AUTH REDIRECT"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "📋 System Status Check:"
echo "-------------------------------------------"

# 1. Check Backend
echo -n "1. Backend (http://localhost:8000): "
BACKEND_CHECK=$(curl -s http://localhost:8000 2>&1)
if [[ $BACKEND_CHECK == *"ARAI API"* ]]; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not Running${NC}"
    echo "   Start with: cd backend && uvicorn app.main:app --reload"
fi

# 2. Check Frontend
echo -n "2. Frontend (http://localhost:3000): "
FRONTEND_CHECK=$(curl -s http://localhost:3000 2>&1)
if [[ $FRONTEND_CHECK == *"DOCTYPE html"* ]] || [[ $FRONTEND_CHECK == *"root"* ]]; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not Running${NC}"
    echo "   Start with: cd frontend && npm start"
fi

echo ""
echo "============================================"
echo "🎯 LIVE TESTING INSTRUCTIONS"
echo "============================================"
echo ""

cat << 'EOF'
📍 STEP 1: Open Browser
   → Go to: http://localhost:3000/signup
   → Or go to: http://localhost:3000/login

📍 STEP 2: Open Developer Console
   → Press F12 (Windows/Linux)
   → Or Cmd+Option+I (Mac)
   → Click "Console" tab

📍 STEP 3: Fill the Form
   Signup:
   ✏️  Name: Test User
   ✏️  Email: test@example.com
   ✏️  Password: TestPassword123!
   ✏️  Confirm: TestPassword123!

   Login:
   ✏️  Email: [your existing email]
   ✏️  Password: [your password]

📍 STEP 4: Click Submit & Watch Console
   You SHOULD see this sequence:

   ✅ SUCCESS SEQUENCE:
   ┌─────────────────────────────────────────┐
   │ 🚀 Starting signup...                   │
   │ 📧 Email: test@example.com             │
   │ 👤 Name: Test User                     │
   │ ✅ Signup response: {access_token:...} │
   │ ✅ Token saved: eyJ...                 │
   │ ✅ User saved: {...}                   │
   │ 🔄 About to navigate to /dashboard...  │
   │ ✅ Token verified, redirecting...      │
   │ ✅ Navigate setup complete!            │
   │ 🎯 Executing redirect to /dashboard    │
   │                                         │
   │ [PAGE RELOADS]                         │
   │                                         │
   │ ProtectedRoute check: {                │
   │   isAuthenticated: true,               │
   │   hasToken: true,                      │
   │   path: "/dashboard"                   │
   │ }                                       │
   │ Authenticated, rendering content       │
   │                                         │
   │ >>> DASHBOARD PAGE SHOWS! 🎉          │
   └─────────────────────────────────────────┘

   ❌ IF YOU SEE ERROR:
   ┌─────────────────────────────────────────┐
   │ 🚀 Starting signup...                   │
   │ ❌ Signup error: [error message]       │
   │ ❌ Error details: {...}                │
   └─────────────────────────────────────────┘
   
   → Check the error message
   → See troubleshooting below

EOF

echo ""
echo "============================================"
echo "🔧 TROUBLESHOOTING"
echo "============================================"
echo ""

cat << 'EOF'
PROBLEM 1: No console messages at all
└─ Solution: Refresh page, console might be cleared
   → Press F5 to refresh
   → Make sure Console tab is selected

PROBLEM 2: "Network Error" in console
└─ Solution: Backend not running
   → Terminal: cd backend
   → Run: uvicorn app.main:app --reload
   → Check: http://localhost:8000

PROBLEM 3: "401 Unauthorized" (Login only)
└─ Solution: Wrong credentials or user doesn't exist
   → Try signup first
   → Or check your password

PROBLEM 4: "400 Bad Request - Email already registered" (Signup)
└─ Solution: Email already used
   → Use different email: test123@example.com
   → Or login with existing email

PROBLEM 5: "429 Rate Limit Exceeded"
└─ Solution: Too many signup attempts
   → Wait 5-10 minutes
   → Or use different email address

PROBLEM 6: Token saved but no redirect happens
└─ Solution: Check for JavaScript errors
   → Look for RED text in console
   → Try manual redirect in console:
     window.location.href = '/dashboard'

PROBLEM 7: Redirects to dashboard then back to login
└─ Solution: Token validation issue
   → Check in console:
     localStorage.getItem('access_token')
   → Should show a long token starting with "eyJ"
   → If null or undefined, token wasn't saved properly

EOF

echo ""
echo "============================================"
echo "🎮 MANUAL CONSOLE COMMANDS"
echo "============================================"
echo ""
echo "If redirect doesn't work, try these in browser console (F12):"
echo ""
echo "1️⃣  Check if token exists:"
echo '   localStorage.getItem("access_token")'
echo ""
echo "2️⃣  Check user data:"
echo '   localStorage.getItem("user")'
echo ""
echo "3️⃣  Check authentication state:"
echo '   !!localStorage.getItem("access_token")'
echo ""
echo "4️⃣  Manually redirect to dashboard:"
echo '   window.location.href = "/dashboard"'
echo ""
echo "5️⃣  Clear everything and start fresh:"
echo '   localStorage.clear(); sessionStorage.clear(); location.reload()'
echo ""

echo "============================================"
echo "📊 BACKEND API TEST"
echo "============================================"
echo ""
echo "Testing backend auth endpoint directly..."
echo ""

# Test signup endpoint
TEST_EMAIL="test$(date +%s)@example.com"
echo "Attempting signup with: $TEST_EMAIL"
echo ""

SIGNUP_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPassword123!\",\"full_name\":\"Test User\"}" 2>&1)

HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$SIGNUP_RESPONSE" | grep -v "HTTP_CODE:")

if [[ $HTTP_CODE == "200" ]]; then
    echo -e "${GREEN}✅ Backend Signup Working!${NC}"
    echo "   HTTP Status: $HTTP_CODE"
    echo "   Email used: $TEST_EMAIL"
    if [[ $RESPONSE_BODY == *"access_token"* ]]; then
        echo -e "${GREEN}   Token received: ✓${NC}"
    else
        echo -e "${YELLOW}   ⚠️  No token in response${NC}"
    fi
elif [[ $HTTP_CODE == "400" ]]; then
    echo -e "${YELLOW}⚠️  User might already exist (expected if testing)${NC}"
    echo "   HTTP Status: $HTTP_CODE"
elif [[ $HTTP_CODE == "429" ]]; then
    echo -e "${YELLOW}⚠️  Rate limit exceeded${NC}"
    echo "   Wait 5-10 minutes or use different email"
else
    echo -e "${RED}❌ Backend Error${NC}"
    echo "   HTTP Status: ${HTTP_CODE:-No response}"
    echo "   Response: $RESPONSE_BODY"
fi

echo ""
echo "============================================"
echo "✅ WHAT TO DO NOW"
echo "============================================"
echo ""
echo "1. Open browser to: http://localhost:3000/signup"
echo "2. Press F12 to open console"
echo "3. Fill in the form"
echo "4. Click 'Sign up'"
echo "5. Watch the console for emoji trail (🚀 📧 ✅ 🎯)"
echo "6. Dashboard should load automatically!"
echo ""
echo "If it doesn't work:"
echo "→ Take a screenshot of the console"
echo "→ Check which emoji sequence you see"
echo "→ Match it to troubleshooting guide above"
echo ""
echo "============================================"
