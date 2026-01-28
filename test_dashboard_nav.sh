#!/bin/bash

# Quick Auth Test Script
# This script helps test the authentication flow

echo "========================================="
echo "ARAI Authentication Quick Test"
echo "========================================="
echo ""

# Check if backend is running
echo "1. Checking if backend is running..."
BACKEND_STATUS=$(curl -s http://localhost:8000 2>&1)
if [[ $BACKEND_STATUS == *"ARAI API"* ]]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is NOT running"
    echo "   Start it with: cd backend && uvicorn app.main:app --reload"
    echo ""
fi

# Check if frontend is running
echo ""
echo "2. Checking if frontend is running..."
FRONTEND_STATUS=$(curl -s http://localhost:3000 2>&1)
if [[ $FRONTEND_STATUS == *"<!DOCTYPE html>"* ]] || [[ $FRONTEND_STATUS == *"<div id=\"root\">"* ]]; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is NOT running"
    echo "   Start it with: cd frontend && npm start"
    echo ""
fi

echo ""
echo "========================================="
echo "Manual Testing Instructions"
echo "========================================="
echo ""
echo "📋 Testing Checklist:"
echo ""
echo "1. Open browser to: http://localhost:3000/login"
echo "2. Open browser console (F12 → Console tab)"
echo "3. Enter credentials and click 'Sign in'"
echo "4. Watch console for these messages:"
echo "   ✓ Login successful: {..."
echo "   ✓ Token stored: Yes"
echo "   ✓ Redirecting to dashboard..."
echo "   ✓ ProtectedRoute check: {isAuthenticated: true...}"
echo "   ✓ Authenticated, rendering protected content"
echo ""
echo "5. If you see 'Token stored: No':"
echo "   → Check backend logs for errors"
echo "   → Verify Supabase credentials in backend/.env"
echo ""
echo "6. If redirect doesn't happen:"
echo "   → Look for red errors in console"
echo "   → Try manually: window.location.href = '/dashboard'"
echo ""
echo "7. If it redirects back to login:"
echo "   → Check: localStorage.getItem('access_token')"
echo "   → Token might be invalid or expired"
echo ""
echo "========================================="
echo "Quick Console Commands"
echo "========================================="
echo ""
echo "In browser console (F12), try these:"
echo ""
echo "// Check if token exists"
echo "localStorage.getItem('access_token')"
echo ""
echo "// Check user data"
echo "localStorage.getItem('user')"
echo ""
echo "// Manually redirect to dashboard"
echo "window.location.href = '/dashboard'"
echo ""
echo "// Clear everything and start fresh"
echo "localStorage.clear(); location.reload()"
echo ""
echo "========================================="

# Test backend auth endpoint
echo ""
echo "3. Testing backend auth endpoint..."
echo ""
echo "Testing signup with unique email..."
TEST_EMAIL="test$(date +%s)@example.com"
SIGNUP_RESULT=$(curl -s -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPassword123!\",\"full_name\":\"Test User\"}" 2>&1)

if [[ $SIGNUP_RESULT == *"access_token"* ]]; then
    echo "✅ Signup endpoint working - Token received"
    echo "   Email used: $TEST_EMAIL"
else
    echo "⚠️  Signup response: $SIGNUP_RESULT"
fi

echo ""
echo "========================================="
echo "Ready to Test!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000/login in your browser"
echo "2. Open Developer Tools (F12)"
echo "3. Go to Console tab"
echo "4. Login and watch the console output"
echo ""
echo "For detailed debugging guide, see:"
echo "→ DASHBOARD_NAVIGATION_DEBUG.md"
echo ""
