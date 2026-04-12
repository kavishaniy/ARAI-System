# Deployment Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                   https://arai-system.vercel.app                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    HTTPS / REST API / JSON
                                │
        ┌───────────────────────┴──────────────────────┐
        │                                              │
┌───────▼─────────────────────────────┐   ┌──────────▼─────────────┐
│     VERCEL (Frontend)               │   │   RAILWAY (Backend)    │
├─────────────────────────────────────┤   ├──────────────────────────┤
│ React 18 Application                │   │ FastAPI (Python)        │
│ - Components                        │   │ - API Endpoints         │
│ - Pages                             │   │ - Authentication        │
│ - Services (API calls)              │   │ - Analysis Logic        │
│ - State Management                  │   │ - Image Processing      │
│                                     │   │ - Database Connection   │
│ Build Command:                      │   │ (Supabase)              │
│ CI=false npm run build              │   │                         │
│                                     │   │ Server:                 │
│ Framework: Create React App         │   │ Uvicorn on Port 8000    │
│ Node: 18.x                          │   │                         │
│ Deploy: Automatic on push           │   │ Python: 3.11            │
│                                     │   │ Deploy: Automatic       │
│ URL:                                │   │                         │
│ https://arai-system.vercel.app      │   │ URL:                    │
│                                     │   │ https://arai-system-    │
│ Env Var:                            │   │ production.up.railway.  │
│ REACT_APP_API_URL=[Railway URL]     │   │ app/api/v1              │
└─────────────────────────────────────┘   │                         │
                                           │ Env Vars:               │
                                           │ SUPABASE_URL            │
                                           │ SUPABASE_KEY            │
                                           │ ALLOWED_ORIGINS=        │
                                           │ [Vercel URL]            │
                                           └──────────────────────────┘
                                                      │
                                                      │
                                           ┌──────────▼──────────┐
                                           │  SUPABASE           │
                                           │  (Database & Auth)  │
                                           └─────────────────────┘
```

---

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    1. USER INTERACTION                         │
│                                                                │
│  User clicks "Login" in React Frontend                        │
└────────────────────┬───────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────────┐
│              2. FRONTEND API CALL                              │
│                                                                │
│  const response = await fetch(                                │
│    'https://arai-system-production.up.railway.app/api/v1/    │
│    auth/login',                                              │
│    { method: 'POST', body: credentials }                     │
│  )                                                            │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ HTTPS REQUEST
                     │
┌────────────────────▼───────────────────────────────────────────┐
│              3. CORS CHECK (Railway Backend)                   │
│                                                                │
│  ✓ Origin: https://arai-system.vercel.app                     │
│  ✓ Matches: ALLOWED_ORIGINS environment variable             │
│  ✓ Add CORS headers to response                               │
└────────────────────┬───────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────────┐
│           4. BACKEND PROCESSING                                │
│                                                                │
│  FastAPI route handler processes request:                     │
│  - Validate credentials                                       │
│  - Query Supabase database                                    │
│  - Generate JWT token                                         │
│  - Return response                                            │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ HTTPS RESPONSE (with CORS headers)
                     │
┌────────────────────▼───────────────────────────────────────────┐
│           5. FRONTEND RECEIVES RESPONSE                        │
│                                                                │
│  Browser checks CORS headers ✓                                │
│  React component receives data                                │
│  Update component state                                       │
│  Redirect to dashboard                                        │
└────────────────────┬───────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────────┐
│           6. USER LOGGED IN                                    │
│                                                                │
│  Token stored in localStorage                                 │
│  User can now use app                                         │
└────────────────────────────────────────────────────────────────┘
```

---

## Deployment Flow

```
GIT REPOSITORY (GitHub)
    │
    ├─────────────────┬────────────────────────┐
    │                 │                        │
    │                 │                        │
    ▼                 ▼                        ▼
┌────────────┐  ┌──────────────┐      ┌──────────────────┐
│ RAILWAY    │  │ VERCEL       │      │ GITHUB ACTIONS   │
│ WEBHOOK    │  │ WEBHOOK      │      │ (CI/CD) [Optional]
└────────────┘  └──────────────┘      └──────────────────┘
    │                 │
    │                 │
    ▼                 ▼
┌────────────┐  ┌──────────────┐
│ BUILD      │  │ BUILD        │
│ Backend    │  │ Frontend     │
│ - pip      │  │ - npm ci     │
│ - pytest   │  │ - npm build  │
│ (optional) │  │ (CI=false)   │
└────────────┘  └──────────────┘
    │                 │
    │                 │
    ▼                 ▼
┌────────────┐  ┌──────────────┐
│ DEPLOY     │  │ DEPLOY       │
│ - Start    │  │ - Publish    │
│   Uvicorn  │  │   to CDN     │
│ - Set env  │  │ - Set env    │
│   vars     │  │   vars       │
└────────────┘  └──────────────┘
    │                 │
    │                 │
    ▼                 ▼
┌────────────┐  ┌──────────────┐
│ RUNNING    │  │ RUNNING      │
│ Online     │  │ Online       │
│ Production │  │ Production   │
└────────────┘  └──────────────┘
```

---

## Environment Variables Flow

```
┌──────────────────────────────────────────────────┐
│     LOCAL DEVELOPMENT (.env, .env.local)         │
├──────────────────────────────────────────────────┤
│ REACT_APP_API_URL=http://localhost:8000/api/v1  │
│ (Development server)                             │
└──────────────────────────────────────────────────┘
            ↓ (commit only code, not .env)
┌──────────────────────────────────────────────────┐
│       GITHUB REPOSITORY (no secrets!)            │
├──────────────────────────────────────────────────┤
│ - Code only                                      │
│ - .gitignore excludes .env files                │
│ - Environment template in .env.example           │
└──────────────────────────────────────────────────┘
    ↓                                    ↓
┌────────────────────────┐  ┌──────────────────────┐
│  RAILWAY DASHBOARD     │  │  VERCEL DASHBOARD    │
├────────────────────────┤  ├──────────────────────┤
│ Variables:             │  │ Environment Variables:
│ ✓ SUPABASE_URL         │  │ ✓ REACT_APP_API_URL  │
│ ✓ SUPABASE_KEY         │  │   (Points to Railway) │
│ ✓ ALLOWED_ORIGINS      │  │                      │
│   (Points to Vercel)   │  │                      │
│ ✓ ENVIRONMENT=prod     │  │ Deployment Reloads:  │
│ ✓ DEBUG=False          │  │ - Production          │
│                        │  │ - Preview             │
│                        │  │ - Development         │
└────────────────────────┘  └──────────────────────┘
    ↓                                    ↓
┌────────────────────────┐  ┌──────────────────────┐
│  RAILWAY RUNTIME       │  │  VERCEL RUNTIME      │
├────────────────────────┤  ├──────────────────────┤
│ Environment Loaded:    │  │ Environment Loaded:  │
│ ✓ SUPABASE_URL         │  │ ✓ REACT_APP_API_URL  │
│ ✓ SUPABASE_KEY         │  │   = Railway URL      │
│ ✓ ALLOWED_ORIGINS      │  │                      │
│ ✓ etc.                 │  │                      │
│                        │  │ Build Runs With:     │
│ Server Starts:         │  │ npm run build        │
│ uvicorn app.main:app   │  │ (Uses env vars)      │
└────────────────────────┘  └──────────────────────┘
    ↓                                    ↓
┌────────────────────────────────────────────────────┐
│          BROWSER RUNTIME                           │
├────────────────────────────────────────────────────┤
│ Frontend (React)                                   │
│ ├─ REACT_APP_API_URL injected at build time       │
│ └─ All API calls use this URL                     │
│                                                    │
│ Backend (FastAPI)                                 │
│ ├─ SUPABASE_URL/KEY used for database             │
│ ├─ ALLOWED_ORIGINS used for CORS                  │
│ └─ Listens on https://arai-system-production... │
└────────────────────────────────────────────────────┘
```

---

## File Structure & Deployment

```
ARAI-System (GitHub Repo)
│
├── backend/                          [Deployed to Railway]
│   ├── Procfile                      ✅ Uvicorn config
│   ├── Dockerfile                    ✅ Container config
│   ├── requirements.txt               ✅ Python deps
│   ├── runtime.txt                   ✅ Python 3.11
│   ├── Aptfile                       ✅ System deps
│   ├── railway.json                  ✅ Railway config
│   ├── app/
│   │   ├── main.py                   ✅ FastAPI + CORS
│   │   ├── core/config.py            ✅ Settings
│   │   └── api/                      ✅ Endpoints
│   └── .env (NOT COMMITTED)          ⚠️ Add to Railway
│
├── frontend/                         [Deployed to Vercel]
│   ├── .nvmrc                        ✅ Node 18.19.0
│   ├── vercel.json                   ✅ Vercel config
│   ├── package.json                  ✅ npm deps + build script
│   ├── .env.production               ✅ Production env
│   ├── public/                       ✅ Static files
│   ├── src/
│   │   ├── pages/                    ✅ React pages
│   │   ├── components/               ✅ React components
│   │   └── services/api.js           ✅ API calls
│   └── build/                        ✅ Generated by build
│
├── data/                             [Not deployed]
│   └── (Training data, etc.)
│
├── docs/                             [Optional]
│   └── (Documentation)
│
├── README.md                         [Project info]
│
└── DEPLOYMENT GUIDES                 [You are here!]
    ├── COMPLETE_DEPLOYMENT_GUIDE.md  ⭐ START HERE
    ├── QUICK_DEPLOYMENT_CHECKLIST.md ⚡ Quick ref
    ├── BACKEND_DEPLOYMENT_CONFIG.md  🔧 Backend ref
    └── README_DEPLOYMENT.md          📚 Overview
```

---

## CORS Flow Diagram

```
1. BROWSER sends request from Vercel:
   ┌──────────────────────────┐
   │ GET /api/v1/health       │
   │ Origin: arai-system.     │
   │         vercel.app       │
   │ Host: arai-system-       │
   │       production.up.     │
   │       railway.app        │
   └──────────────────────────┘
              │
              ▼
2. RAILWAY checks CORS:
   ┌──────────────────────────────────────┐
   │ Is origin in cors_origins?           │
   │                                      │
   │ cors_origins = [                     │
   │   "https://arai-system.vercel.app",  │
   │   "https://*.vercel.app",  ← MATCH! │
   │   ...                                │
   │ ]                                    │
   │                                      │
   │ Result: ✅ ALLOWED                   │
   └──────────────────────────────────────┘
              │
              ▼
3. RAILWAY adds CORS headers:
   ┌──────────────────────────────────────┐
   │ HTTP/1.1 200 OK                      │
   │ Access-Control-Allow-Origin:         │
   │   arai-system.vercel.app             │
   │ Access-Control-Allow-Methods:        │
   │   GET, POST, PUT, DELETE, OPTIONS    │
   │ Access-Control-Allow-Headers: *      │
   │                                      │
   │ {"status": "ok"}                     │
   └──────────────────────────────────────┘
              │
              ▼
4. BROWSER receives response:
   ┌──────────────────────────────────────┐
   │ Browser checks:                      │
   │ ✓ CORS header present                │
   │ ✓ Origin matches                     │
   │ ✓ Methods OK                         │
   │                                      │
   │ Result: ✅ Request allowed!          │
   │                                      │
   │ React component receives data ✅     │
   └──────────────────────────────────────┘
```

---

## Phase Timeline

```
TIMELINE (Estimated Total: ~50-65 minutes)

00:00 ├─ Start
      │
05:00 ├─ Phase 1: Railway Setup Complete ✅
      │  ├─ Account created
      │  ├─ Project created
      │  ├─ Variables set
      │  └─ Deployment started
      │
20:00 ├─ Railway Deployment Completes ✅
      │  ├─ Build successful
      │  ├─ Public URL obtained
      │  └─ Health check passes
      │
22:00 ├─ Phase 2: Frontend Config ✅
      │  ├─ Verified .env.production
      │  ├─ Changes committed
      │  └─ Pushed to GitHub
      │
24:00 ├─ Phase 3: Vercel Import Starts
      │  ├─ Project created
      │  ├─ Env vars set
      │  └─ Build starts
      │
38:00 ├─ Phase 3: Vercel Deployment Completes ✅
      │  ├─ Build successful
      │  ├─ Live URL ready
      │  └─ Site deployed
      │
43:00 ├─ Phase 4: Verification ✅
      │  ├─ Health check passes
      │  ├─ Frontend loads
      │  ├─ No CORS errors
      │  └─ API calls work
      │
50:00 ├─ Phase 5: E2E Testing ✅
      │  ├─ Login works
      │  ├─ Upload works
      │  └─ Analysis works
      │
60:00 └─ 🎉 COMPLETE! All systems operational!
```

---

**Visual Guide Complete!** 📊

Use these diagrams to understand the system architecture and deployment process.

