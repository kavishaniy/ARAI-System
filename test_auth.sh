#!/bin/bash

# Test Authentication Flow Script
# This script tests the login/signup endpoints

API_URL="http://localhost:8000/api/v1"

echo "================================"
echo "ARAI Authentication Test Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Signup
echo "Test 1: Testing Signup Endpoint..."
SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser'$(date +%s)'@example.com",
    "password":"TestPassword123!",
    "full_name":"Test User"
  }')

SIGNUP_HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -n1)
SIGNUP_BODY=$(echo "$SIGNUP_RESPONSE" | sed '$d')

if [ "$SIGNUP_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Signup successful (HTTP $SIGNUP_HTTP_CODE)${NC}"
    echo "Response: $SIGNUP_BODY" | jq '.' 2>/dev/null || echo "$SIGNUP_BODY"
    
    # Extract token for next test
    TOKEN=$(echo "$SIGNUP_BODY" | jq -r '.access_token' 2>/dev/null)
    echo "Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}✗ Signup failed (HTTP $SIGNUP_HTTP_CODE)${NC}"
    echo "Response: $SIGNUP_BODY"
fi

echo ""
echo "---"
echo ""

# Test 2: Login
echo "Test 2: Testing Login Endpoint..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPassword123!"
  }')

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$LOGIN_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Login successful (HTTP $LOGIN_HTTP_CODE)${NC}"
    echo "Response: $LOGIN_BODY" | jq '.' 2>/dev/null || echo "$LOGIN_BODY"
    
    # Extract token
    TOKEN=$(echo "$LOGIN_BODY" | jq -r '.access_token' 2>/dev/null)
    echo "Token: ${TOKEN:0:50}..."
elif [ "$LOGIN_HTTP_CODE" = "401" ]; then
    echo -e "${YELLOW}⚠ Login failed - Invalid credentials (expected if user doesn't exist)${NC}"
    echo "Response: $LOGIN_BODY"
else
    echo -e "${RED}✗ Login failed (HTTP $LOGIN_HTTP_CODE)${NC}"
    echo "Response: $LOGIN_BODY"
fi

echo ""
echo "---"
echo ""

# Test 3: Check if backend is running
echo "Test 3: Checking Backend Health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/../")
HEALTH_HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)

if [ "$HEALTH_HTTP_CODE" = "200" ] || [ "$HEALTH_HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend might not be running${NC}"
    echo "Make sure to start backend with: cd backend && uvicorn app.main:app --reload"
fi

echo ""
echo "================================"
echo "Test Summary"
echo "================================"
echo ""
echo "Next Steps:"
echo "1. If signup failed with rate limit error, wait 5-10 minutes or use different email"
echo "2. Open http://localhost:3000/login in browser"
echo "3. Try logging in with existing credentials"
echo "4. Check browser console (F12) for 'Login successful' message"
echo "5. Verify you're redirected to /dashboard"
echo ""
echo "Debugging Tips:"
echo "- Open browser DevTools (F12) → Console tab"
echo "- Check localStorage: localStorage.getItem('access_token')"
echo "- Look for 'Login successful' or 'Signup successful' messages"
echo "- Check for 'Authenticated, rendering protected content' message"
echo ""
