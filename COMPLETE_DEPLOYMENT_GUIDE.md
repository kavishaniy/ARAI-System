# Complete Deployment Guide: Railway Backend + Vercel Frontend

> **Date:** April 12, 2026  
> **Project:** ARAI System - Accessibility Readability Attention Index  
> **Backend:** Python FastAPI on Railway  
> **Frontend:** React on Vercel

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deploy Backend to Railway](#deploy-backend-to-railway)
3. [Deploy Frontend to Vercel](#deploy-frontend-to-vercel)
4. [Connect Frontend & Backend](#connect-frontend--backend)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ **GitHub Account** - https://github.com
- ✅ **Railway Account** - https://railway.app (sign up with GitHub)
- ✅ **Vercel Account** - https://vercel.com (sign up with GitHub)

### Your Repository
- **Repo Name:** ARAI-System
- **Owner:** kavishaniy
- **Branch:** main
- **URL:** https://github.com/kavishaniy/ARAI-System

---

## 🚀 Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **"Start New Project"**
3. Select **"Deploy from GitHub"**
4. Authorize Railway to access your GitHub account
5. Select repository: **ARAI-System**
6. Select branch: **main**

### Step 2: Configure Railway Service

1. Railway will auto-detect it's a Python project
2. In Railway dashboard, click on your project
3. Click **"New Service"** or let it auto-add backend
4. Select the **backend** directory if prompted

### Step 3: Set Environment Variables

In Railway Dashboard → Your Project → Variables tab:

```
Environment Variables:
┌─────────────────────────┬─────────────────────────────────────────┐
│ Key                     │ Value                                   │
├─────────────────────────┼─────────────────────────────────────────┤
│ PYTHONUNBUFFERED        │ 1                                       │
│ ENVIRONMENT             │ production                              │
│ DEBUG                   │ False                                   │
│ PORT                    │ 8000                                    │
│ SUPABASE_URL            │ your_supabase_url                       │
│ SUPABASE_KEY            │ your_supabase_key                       │
│ ALLOWED_ORIGINS         │ https://your-frontend.vercel.app       │
└─────────────────────────┴─────────────────────────────────────────┘
```

**Important:** Replace with your actual Supabase credentials!

### Step 4: Deploy

1. Railway will auto-deploy when you add the service
2. Go to **Deployments** tab to monitor build progress
3. Wait for ✅ "Deployment Successful"

### Step 5: Get Your Railway URL

1. In Railway dashboard, click on your backend service
2. Go to **Settings** → **Domains**
3. Copy the public URL (format: `https://arai-system-production.up.railway.app`)
4. **Save this URL - you'll need it for the frontend!**

---

## 🎨 Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to https://vercel.com/new
2. Click **"Import Project"**
3. Paste your repo URL: `https://github.com/kavishaniy/ARAI-System`
4. Click **"Continue"**

### Step 2: Configure Project Settings

On the import screen:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Create React App |
| **Root Directory** | `./frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm ci` |

### Step 3: Add Environment Variables

**Important:** Before clicking Deploy, add environment variables:

1. Under **Environment Variables** section:
   ```
   REACT_APP_API_URL = https://YOUR_RAILWAY_URL/api/v1
   ```
   
   Replace `YOUR_RAILWAY_URL` with your actual Railway URL from Step 5 above!

2. Make sure it applies to: **Production**, **Preview**, and **Development**

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-5 minutes)
3. Once done, you'll see ✅ "Congratulations! Your project has been successfully deployed"

### Step 5: Get Your Vercel URL

After deployment:
1. Click **"Visit"** button to see your live site
2. The URL will be: `https://arai-system.vercel.app` (or your custom domain)
3. **Save this URL - you'll need it for backend CORS!**

---

## 🔗 Connect Frontend & Backend

### Verify Frontend Environment Variable

Your frontend should already be configured. Verify in `/frontend/.env.production`:

```bash
REACT_APP_API_URL=https://YOUR_RAILWAY_URL/api/v1
```

### Update Backend CORS (if needed)

Your backend CORS is already configured in `backend/app/main.py` to accept Vercel URLs:

```python
cors_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://arai-system.vercel.app",
    "https://arai-system-git-main-kavishaniy.vercel.app",
    "https://arai-system-kavishaniy.vercel.app",
]
```

If using a custom Vercel domain, add it to this list:
1. Edit `backend/app/main.py`
2. Add your Vercel URL to `cors_origins` list
3. Commit and push
4. Railway will auto-redeploy

---

## ✅ Testing & Verification

### Test 1: Health Check Endpoint

```bash
# Replace with your actual Railway URL
curl https://YOUR_RAILWAY_URL/api/v1/health

# Expected response: {"status": "ok"} or similar
```

### Test 2: Frontend Connection

1. Go to your Vercel site: `https://arai-system.vercel.app`
2. Open **Browser Console** (F12 → Console tab)
3. Try logging in - check if API calls work
4. Check console for any CORS errors

### Test 3: API Request in Browser Console

```javascript
// Replace with your Railway URL
fetch('https://YOUR_RAILWAY_URL/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Test 4: Check Vercel Logs

1. Go to https://vercel.com
2. Click your project
3. Go to **Deployments** tab
4. Click the latest deployment
5. Go to **Logs** to see any errors

---

## 🔍 Important URLs Reference

| Component | URL |
|-----------|-----|
| **GitHub Repo** | https://github.com/kavishaniy/ARAI-System |
| **Railway Project** | https://railway.app/project/[project-id] |
| **Railway Backend** | https://arai-system-production.up.railway.app |
| **Vercel Project** | https://vercel.com/kavishaniy/arai-system |
| **Frontend Live** | https://arai-system.vercel.app |
| **API Base** | https://arai-system-production.up.railway.app/api/v1 |

---

## 🐛 Troubleshooting

### Issue: Frontend shows "Cannot reach API"

**Solution:**
1. Verify Railway URL is correct in Vercel env vars
2. Check if Railway backend is running (check Railway logs)
3. Test Railway health endpoint directly
4. Check CORS errors in browser console

### Issue: Vercel Build Fails

**Solution:**
1. Check Vercel build logs
2. Ensure `CI=false` is set in build command (already done)
3. Clear Vercel build cache and redeploy
4. Verify `.nvmrc` file exists with Node 18.x

### Issue: Railway Deployment Fails

**Solution:**
1. Check Railway deployment logs
2. Verify Python 3.11 runtime (already configured)
3. Ensure requirements.txt has all dependencies
4. Check environment variables are set correctly

### Issue: CORS Errors in Browser

**Solution:**
1. Verify Vercel URL is in Railway's `cors_origins` list
2. Check that `Access-Control-Allow-Origin` header is returned
3. Verify request includes proper headers
4. Check that backend is returning CORS headers

### Issue: "Module not found" on Vercel

**Solution:**
1. Run locally: `npm ci && npm run build`
2. Check that all imports are correct
3. Verify package-lock.json is committed
4. Clear Vercel cache and redeploy

---

## 📝 Environment Variables Checklist

### Backend (Railway)
- [ ] PYTHONUNBUFFERED = 1
- [ ] ENVIRONMENT = production
- [ ] DEBUG = False
- [ ] SUPABASE_URL = [your supabase url]
- [ ] SUPABASE_KEY = [your supabase key]
- [ ] ALLOWED_ORIGINS = https://arai-system.vercel.app

### Frontend (Vercel)
- [ ] REACT_APP_API_URL = https://arai-system-production.up.railway.app/api/v1

---

## 🎉 Success Checklist

After following all steps:

- [ ] Railway backend is deployed and running
- [ ] Vercel frontend is deployed and running
- [ ] Vercel shows your frontend live
- [ ] Browser console has no CORS errors
- [ ] API calls from frontend reach backend
- [ ] Login/authentication works
- [ ] Analysis features work end-to-end

---

## 🔄 Redeployment Process (Future)

When you make changes to code:

### Backend Changes
```bash
git add .
git commit -m "Backend changes"
git push origin main
# Railway auto-redeploys from main branch
```

### Frontend Changes
```bash
git add .
git commit -m "Frontend changes"
git push origin main
# Vercel auto-redeploys from main branch
```

### Manual Redeploy
- **Railway:** Go to Deployments → Click "Redeploy"
- **Vercel:** Go to Deployments → Click "Redeploy"

---

## 📞 Quick Help

| Issue | Command/Action |
|-------|---|
| Test backend health | `curl https://YOUR_RAILWAY_URL/api/v1/health` |
| View Vercel logs | https://vercel.com → Project → Deployments → Logs |
| View Railway logs | Railway Dashboard → Your Service → Logs |
| Clear Vercel cache | Vercel → Settings → Git → "Clear Build Cache" |
| Redeploy Railroad | Railway → Deployments → "Redeploy" |

---

## 📚 Documentation Links

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)
- [GitHub Docs](https://docs.github.com)

---

**Last Updated:** April 12, 2026  
**Status:** ✅ Complete and Ready to Deploy
