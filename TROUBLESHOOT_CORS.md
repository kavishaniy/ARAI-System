# 🔧 CORS Troubleshooting Guide

## Current Issue
Getting `Disallowed CORS origin` error from backend when frontend tries to connect.

## Root Cause
The `ALLOWED_ORIGINS` environment variable in Railway is either:
- Not set
- Set incorrectly
- Railway hasn't redeployed with the new variable

---

## ✅ SOLUTION: Fix Railway Environment Variable

### Step 1: Open Railway Dashboard
Go to: https://railway.com/project/2dee3236-8f3c-4a8c-a7d0-1843e49cf69f

### Step 2: Navigate to Service Variables
1. Click on `arai-system` service (your backend)
2. Click `Variables` tab
3. Check if `ALLOWED_ORIGINS` exists

### Step 3: Set/Update Variable
**If variable doesn't exist:**
- Click `+ New Variable`
- Name: `ALLOWED_ORIGINS`
- Value: `https://frontend-seven-alpha-91.vercel.app`
- Click `Add`

**If variable exists but has wrong value:**
- Click on the variable
- Update value to: `https://frontend-seven-alpha-91.vercel.app`
- Click `Update`

### Step 4: Force Redeploy
After setting the variable:
1. Go to `Deployments` tab
2. Click on the latest deployment
3. Click `⋮` (three dots menu)
4. Click `Redeploy`
5. Wait 30-60 seconds for deployment to complete

### Step 5: Verify It's Working
Run this command in your terminal:

```bash
curl -X OPTIONS https://arai-system-production.up.railway.app/api/v1/auth/signup \
  -H "Origin: https://frontend-seven-alpha-91.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -i 2>&1 | grep -E "(HTTP/|access-control-allow-origin|Disallowed)"
```

**Expected Success Output:**
```
HTTP/2 200
access-control-allow-origin: https://frontend-seven-alpha-91.vercel.app
```

**Current Error Output (what you're seeing now):**
```
HTTP/2 400
Disallowed CORS origin
```

---

## 🔍 Alternative: Check Railway Logs

If the variable is set but still not working:

```bash
cd backend
railway logs --tail 50
```

Look for:
- Any errors during startup
- CORS configuration messages
- Environment variable loading issues

---

## 🎯 Quick Test After Fix

Once CORS is working, test your frontend signup:
1. Go to: https://frontend-seven-alpha-91.vercel.app
2. Open browser DevTools (F12) → Console tab
3. Try to sign up
4. Should now work without "Network Error"!

---

## 📝 Notes

- Your backend code in `config.py` is correct ✅
- Your frontend `.env.production` is correct ✅
- The ONLY issue is the Railway environment variable

The variable MUST be set in Railway dashboard for production, not in your local `.env` file.
