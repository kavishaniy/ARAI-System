# 🎯 Railway Deployment - Visual Step-by-Step Guide

## The Problem You Had
```
Railway couldn't understand your project structure because it's a monorepo.
✖ Detected both Python AND Node.js
✖ Didn't know which to prioritize  
✖ Failed to build
```

## The Solution
```
Deploy as TWO separate services in the SAME Railway project.
✅ Backend Service (Python)
✅ Frontend Service (Node.js)
✅ Both automatically deployed when you push to GitHub
```

---

## Visual Deployment Flow

```
┌─────────────────────────────────────────────────────┐
│             Your GitHub Repository                  │
│         (arai-system monorepo)                      │
├─────────────────────────────────────────────────────┤
│  backend/    │    frontend/    │    uploads/        │
│  ├── main.py │    ├── index.js │    ├── (data)      │
│  ├── app/    │    ├── App.js   │    └── ...         │
│  └── req.txt │    └── pkg.json │                    │
└─────────────────────────────────────────────────────┘
        │                    │
        ▼                    ▼
   ┌─────────────┐      ┌──────────────┐
   │  Railway    │      │   Railway    │
   │  Backend    │      │   Frontend   │
   │  Service 1  │      │   Service 2  │
   └──────┬──────┘      └────────┬─────┘
          │                      │
          │ Port: 8000           │ Port: 3000
          │                      │
          ▼                      ▼
   ┌──────────────┐      ┌──────────────┐
   │  backend-    │      │  frontend-   │
   │  prod.       │      │  prod.       │
   │  railway.app │      │  railway.app │
   └──────┬───────┘      └────────┬─────┘
          │ https://...           │ https://...
          └──────────┬────────────┘
                     │
                     ▼
                ┌──────────────┐
                │  Supabase    │
                │  Database    │
                └──────────────┘
```

---

## Step 1️⃣: Go to Railway Dashboard

```
https://railway.app/dashboard
└─ Your existing project
   └─ Click to open project
```

**Screenshot would show:**
```
┌────────────────────────────────────────┐
│ ARAI System  [Project Name]            │
├────────────────────────────────────────┤
│                                        │
│ [+ New Service]  [Settings]  [Share]   │
│                                        │
│ Current Services:                      │
│ (empty or old failed deployment)       │
│                                        │
└────────────────────────────────────────┘
```

---

## Step 2️⃣: Create Backend Service

### Click: "+ New Service"

```
┌────────────────────────────────────┐
│ Select Source                       │
├────────────────────────────────────┤
│                                    │
│ ☑ GitHub Repo  ○ Docker Image     │
│ ○ Data Service ○ Template         │
│                                    │
└────────────────────────────────────┘
```

### Select: GitHub Repo
```
┌────────────────────────────────────┐
│ Choose Repository                   │
├────────────────────────────────────┤
│                                    │
│ Repository: arai-system            │
│ Branch: main                       │
│                                    │
│ [Deploy Selected]  [Cancel]        │
│                                    │
└────────────────────────────────────┘
```

### Configure: Backend Service Settings
```
┌────────────────────────────────────────┐
│ Service Configuration                  │
├────────────────────────────────────────┤
│                                        │
│ Service Name:  [backend]               │
│ Root Directory: [backend]  ⬅️ IMPORTANT│
│                                        │
│ Framework: [Auto-detect] → Python     │
│                                        │
│ Start Command:                         │
│ [uvicorn app.main:app --host ...] ✓   │
│                                        │
│ [Deploy]                               │
│                                        │
└────────────────────────────────────────┘
```

### Result: Backend Service Deployed ✅
```
┌──────────────────────────────────┐
│  backend-prod.railway.app        │
│  ✓ Deployed                      │
│  Status: Running                 │
│  Port: 8000                      │
│  Language: Python 3.11           │
│  Domain: generated               │
└──────────────────────────────────┘
```

---

## Step 3️⃣: Create Frontend Service

### In Same Project: Click "+ New Service"

```
Repeat same steps as backend:
1. Select GitHub Repo
2. Repository: arai-system
3. Branch: main
```

### Configure: Frontend Service Settings
```
┌────────────────────────────────────────┐
│ Service Configuration                  │
├────────────────────────────────────────┤
│                                        │
│ Service Name:  [frontend]              │
│ Root Directory: [frontend]  ⬅️ IMPORTANT│
│                                        │
│ Framework: [Auto-detect] → Node.js    │
│                                        │
│ Build Command:                         │
│ [npm install && npm run build]         │
│                                        │
│ Start Command:                         │
│ [npm start]  or  [serve -s build]     │
│                                        │
│ [Deploy]                               │
│                                        │
└────────────────────────────────────────┘
```

### Result: Frontend Service Deployed ✅
```
┌──────────────────────────────────┐
│  frontend-prod.railway.app       │
│  ✓ Deployed                      │
│  Status: Running                 │
│  Port: 3000                      │
│  Language: Node.js 18.x          │
│  Domain: generated               │
└──────────────────────────────────┘
```

---

## Step 4️⃣: Configure Environment Variables

### Backend Service Variables

```
Backend Service → Variables → [Add Variable]

ALLOWED_ORIGINS: https://frontend-prod.railway.app
SUPABASE_URL: https://omguovoobfiuaooupzsw.supabase.co
SUPABASE_KEY: eyJhbGci...
SUPABASE_SERVICE_KEY: eyJhbGci...
SECRET_KEY: sb_secret_...
SALICON_MODEL_PATH: ./ai_models/salicon_model
RICO_MODEL_PATH: ./ai_models/rico_model
DEBUG: False
ENVIRONMENT: production
```

### Frontend Service Variables

```
Frontend Service → Variables → [Add Variable]

REACT_APP_API_URL: https://backend-prod.railway.app/api/v1
CI: false
```

---

## Step 5️⃣: Deploy & Test

### Automatic Deployment
```
Once you push to main branch:

GitHub Repo Updates
        │
        ▼
Railway Detects Change
        │
        ▼
Build Services
├─ backend → compiled from /backend
└─ frontend → compiled from /frontend
        │
        ▼
Deploy Services
├─ backend-prod.railway.app:8000
└─ frontend-prod.railway.app
        │
        ▼
Tests Run (if configured)
        │
        ▼
✅ Live!
```

### Manual Testing

**Test 1: Frontend Loads**
```
Open: https://frontend-prod.railway.app
Expected: App loads without errors
Console: No CORS errors
```

**Test 2: Backend API Works**
```
Open: https://backend-prod.railway.app/docs
Expected: Swagger UI shows all endpoints
```

**Test 3: Connection Works**
```
Open Browser DevTools (F12)
Go to Application → Fetch/XHR
Upload a design in frontend
Expected: Request to https://backend-prod.railway.app/api/v1/...
Status: 200 ✅
```

**Test 4: Authentication Works**
```
Try to login/signup
Expected: Supabase authentication works
User created in Supabase
```

---

## Complete Service Overview (After Deployment)

```
┌─────────────────────────────────────────────────────────┐
│         Your Railway Project Dashboard                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Service: backend-prod                                  │
│  ├─ Status: ✓ Running                                  │
│  ├─ Domains: backend-prod.railway.app                  │
│  ├─ Port: 8000                                         │
│  ├─ Framework: Python (FastAPI)                        │
│  ├─ Deployments: [View Logs]                           │
│  └─ Memory: 512MB                                      │
│                                                         │
│  Service: frontend-prod                                 │
│  ├─ Status: ✓ Running                                  │
│  ├─ Domains: frontend-prod.railway.app                 │
│  ├─ Port: 3000                                         │
│  ├─ Framework: Node.js (React)                         │
│  ├─ Deployments: [View Logs]                           │
│  └─ Memory: 512MB                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚨 If Something Goes Wrong

### Check Logs
```
Service → Deployments → Latest Deployment → View Logs

Look for:
- Build errors
- Start command errors
- Port binding errors
- Missing dependencies
```

### Common Fixes

**CORS Error in Console:**
```
1. Note the frontend domain
2. Backend Service → Variables
3. Update ALLOWED_ORIGINS: https://your-frontend-domain
4. Redeploy backend
```

**API 404 Error:**
```
1. Check frontend .env has correct backend URL
2. Check backend is actually running
3. Check start command matches app structure
```

**Build Failed:**
```
1. View build logs in Railway
2. Check requirements.txt (backend) or package.json (frontend)
3. Ensure no typos in root directory setting
```

---

## 📊 Monitoring After Deployment

```
Each Service Dashboard Shows:

├─ Deployments (history of builds)
├─ Logs (real-time application output)
├─ Metrics (CPU, Memory, Network)
├─ Health (service status)
├─ Variables (environment variables)
├─ Domains (assigned URLs)
└─ Settings (configuration)
```

---

## Final Architecture (After Deployment)

```
https://frontend-prod.railway.app
        │
        ├─ React App (built & optimized)
        ├─ Tailwind CSS styling
        ├─ Supabase Auth integration
        └─ Axios calls to backend API
                │
                ▼
        https://backend-prod.railway.app/api/v1
                │
                ├─ FastAPI server (Python)
                ├─ Image processing
                ├─ AI model inference
                ├─ Supabase database access
                └─ File upload/storage
                        │
                        ▼
                Supabase (Cloud)
                ├─ PostgreSQL Database
                ├─ Authentication
                ├─ Storage buckets
                └─ Realtime subscriptions
```

---

## Timeline to Deployment

```
5 minutes:  Create backend service
5 minutes:  Create frontend service
5 minutes:  Configure variables
5 minutes:  Deploy
5 minutes:  Test and verify

Total: ⏱️  25 minutes from start to live
```

---

## Summary Checklist

- [ ] Open Railway Dashboard
- [ ] Create Backend Service (root: backend)
- [ ] Create Frontend Service (root: frontend)
- [ ] Set Backend Environment Variables
- [ ] Set Frontend Environment Variables
- [ ] Both services deployed successfully
- [ ] Check logs for any errors
- [ ] Test frontend URL
- [ ] Test backend API /docs endpoint
- [ ] Test API connectivity from frontend
- [ ] Test authentication
- [ ] Celebrate! 🎉

---

Good luck with your deployment! 🚀

For detailed help, see:
- `RAILWAY_QUICK_FIX.md` - Quick reference
- `RAILWAY_DEPLOYMENT_COMPLETE.md` - Full guide
- `RAILWAY_BUILD_FIX.md` - Troubleshooting
