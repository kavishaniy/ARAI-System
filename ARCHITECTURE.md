# ARAI System - DigitalOcean Architecture

## Deployment Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     DigitalOcean App Platform                   │
│                   (arai-system.ondigitalocean.app)             │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ (HTTPS/SSL)
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌────────────┐   ┌──────────────┐   ┌──────────────┐
   │  Frontend  │   │   Backend    │   │   Database   │
   │   (React)  │   │  (FastAPI)   │   │ (Supabase)   │
   │            │   │              │   │              │
   │ Port 3000  │   │  Port 8080   │   │ External     │
   │ Serves UI  │   │  Serves API  │   │ PostgreSQL   │
   │            │   │              │   │              │
   └────────────┘   └──────────────┘   └──────────────┘
        │                 │                     │
        │                 │ /api                │
        └─────────────────┼─────────────────────┘
                          │
                   ┌──────────────┐
                   │   Browser    │
                   │  (User)      │
                   └──────────────┘
```

---

## Network Flow

```
1. User Access
   Browser → https://arai-system.ondigitalocean.app
                    ↓
2. DigitalOcean Router (Ingress)
   ├─ /api/...  → Backend Service (FastAPI)
   └─ /        → Frontend Service (React)
                    ↓
3. Frontend Service
   ├─ Serves React app (HTML, JS, CSS)
   ├─ Requests API from: /api/...
   └─ CORS headers checked
                    ↓
4. Backend Service
   ├─ Receives API requests
   ├─ Queries Supabase database
   ├─ Returns JSON responses
   └─ Health checks on /health
                    ↓
5. Supabase (External)
   ├─ PostgreSQL database
   ├─ Authentication
   └─ File storage
```

---

## Service Details

### Frontend Service
```yaml
Name: frontend
Type: Node.js / React
Source: ./frontend/
Port: 3000
Build: npm ci && npm run build
Start: npm start
Health Check: GET /
Instances: 1 (Basic plan)
RAM: 512MB
```

### Backend Service
```yaml
Name: backend
Type: Python / FastAPI
Source: ./backend/
Port: 8080
Build: pip install -r requirements.txt
Start: uvicorn app.main:app --host 0.0.0.0 --port 8080
Health Check: GET /health
Instances: 1 (Basic plan)
RAM: 512MB
```

### Database
```yaml
Name: Supabase (External)
Type: PostgreSQL
Hosted: supabase.co
Connection: DATABASE_URL env var
Backups: Daily (Supabase managed)
Scaling: Handled by Supabase
```

---

## Environment Variables Flow

```
Environment Variables (Set in DigitalOcean Dashboard)
    │
    ├─ Backend Environment
    │  ├─ DATABASE_URL → Connects to Supabase
    │  ├─ SUPABASE_URL → Supabase project URL
    │  ├─ SUPABASE_KEY → Authentication
    │  ├─ SECRET_KEY → API security
    │  ├─ SENDGRID_API_KEY → Email sending
    │  └─ ALLOWED_ORIGINS → CORS whitelist
    │
    └─ Frontend Environment
       ├─ REACT_APP_API_URL → Backend endpoint
       └─ REACT_APP_ENVIRONMENT → App environment flag
```

---

## Deployment Pipeline

```
Developer commits to GitHub (main branch)
    ↓
DigitalOcean detects push (via webhook)
    ↓
Build Frontend
├─ npm ci (clean install)
├─ npm run build (create optimized build)
└─ Output: /build directory (static files)
    ↓
Build Backend
├─ pip install -r requirements.txt
└─ Ready to start
    ↓
Start Services
├─ Frontend on port 3000
├─ Backend on port 8080
└─ Run health checks
    ↓
Routing Configuration
├─ /api/* → Backend
└─ /* → Frontend
    ↓
✅ Deployment Complete
    Live at: https://arai-system.ondigitalocean.app
    ↓
Auto-deploy enabled for future pushes
```

---

## File Structure (Deployment View)

```
arai-system/ (GitHub repository)
│
├─ app.yaml ⭐ (DigitalOcean reads this)
│  └─ Defines services, build commands, environment variables
│
├─ frontend/ (React)
│  ├─ src/
│  ├─ public/
│  ├─ package.json
│  └─ build/ (generated during build)
│     └─ Served by Frontend service on port 3000
│
├─ backend/ (FastAPI)
│  ├─ app/
│  │  ├─ main.py (entry point)
│  │  └─ ... (other modules)
│  ├─ requirements.txt
│  └─ venv/ (NOT deployed)
│     └─ Dependencies installed during build
│
├─ migrations/ (Database)
│  └─ Run via Supabase dashboard
│
└─ DEPLOYMENT_*.md (Documentation)
   └─ Guides for deployment
```

---

## Request Lifecycle Example

### User logs in to the app:

```
1. Frontend (React)
   User clicks Login
   ↓
2. API Call
   POST /api/auth/login
   { username: "...", password: "..." }
   ↓
3. DigitalOcean Router
   Receives request for /api/auth/login
   Routes to Backend service
   ↓
4. Backend (FastAPI)
   Receives request at endpoint /auth/login
   Validates credentials
   Queries Supabase for user
   ↓
5. Supabase (PostgreSQL)
   Returns user data
   ↓
6. Backend Response
   Returns JWT token
   HTTP 200: { token: "...", user: {...} }
   ↓
7. DigitalOcean Router
   Forwards response to Frontend
   ↓
8. Frontend (React)
   Receives token
   Stores in localStorage
   Redirects to dashboard
   ↓
9. User sees dashboard
```

---

## Scaling Architecture (Future)

### Current Setup (Basic - $25/month)
```
1 Container × Backend (512MB)    = $5
1 Container × Frontend (512MB)   = $5
Supabase Free Tier DB            = $0
─────────────────────────────────────
Total: $25/month
```

### Scaled Setup (Standard - $75/month)
```
2 Containers × Backend (512MB)   = $10
2 Containers × Frontend (512MB)  = $10
Supabase Pro Tier DB             = $25
─────────────────────────────────────
Total: $75+/month
```

### Enterprise Setup (Custom - $200+/month)
```
3+ Containers × Backend          = $15+
3+ Containers × Frontend         = $15+
Supabase Custom                  = $20+
Load Balancer                    = $12+
CDN for assets                   = $20+
─────────────────────────────────────
Total: $200+/month
```

---

## Status Monitoring

### Checking App Health

```
✅ Frontend Health
   URL: https://arai-system.ondigitalocean.app
   Status: Should load React app
   
✅ Backend Health
   URL: https://arai-system.ondigitalocean.app/api/health
   Response: { "status": "ok" }
   
✅ Database Health
   Check: Backend can query database
   Verify: API endpoints return data
   
✅ Logs
   Dashboard: Apps → Your App → Runtime logs
   Shows: Build errors, startup issues, runtime errors
```

---

## Troubleshooting by Layer

### Layer 1: DigitalOcean (Routing/Infrastructure)
```
Symptoms: All services unreachable
Checks:
  ├─ Is app showing in dashboard?
  ├─ Click Deployments tab - latest successful?
  ├─ Check Runtime logs for infrastructure errors
  └─ Is plan status active?
```

### Layer 2: Frontend Service
```
Symptoms: Page won't load or shows blank
Checks:
  ├─ npm build command succeeded?
  ├─ Health check ("/") returning 200?
  ├─ Check browser console for JS errors
  ├─ Is REACT_APP_API_URL correct?
  └─ Check logs: "npm start" running?
```

### Layer 3: Backend Service
```
Symptoms: API calls fail or 500 errors
Checks:
  ├─ Health check ("/health") returning 200?
  ├─ Environment variables set correctly?
  ├─ DATABASE_URL connects to Supabase?
  ├─ CORS error? Check ALLOWED_ORIGINS
  └─ Check logs for Python tracebacks
```

### Layer 4: Database (Supabase)
```
Symptoms: API returns valid response but wrong data
Checks:
  ├─ Can login to Supabase dashboard?
  ├─ Database tables exist?
  ├─ Migrations ran successfully?
  ├─ Row-level security policies correct?
  └─ Sufficient quota remaining?
```

---

## Security Model

```
Internet (Public)
    │
    ├─ HTTPS/TLS ✅ (Auto-enabled)
    ├─ Firewall (DigitalOcean)
    │
DigitalOcean Network (Private)
    │
    ├─ Frontend Service
    │  ├─ Cannot access backend directly (goes through router)
    │  └─ Cannot access database (no credentials)
    │
    ├─ Backend Service
    │  ├─ Has database credentials in env vars
    │  ├─ Validates all API requests
    │  ├─ Enforces CORS
    │  └─ Uses JWT tokens
    │
    └─ Database (Supabase)
       ├─ External, managed by Supabase
       ├─ Connection via DATABASE_URL
       ├─ Row-level security policies
       └─ Encrypted passwords
```

---

## Deployment Success Checklist

```
✅ Services Deployed
   ├─ Frontend running on :3000
   ├─ Backend running on :8080
   └─ Health checks passing

✅ Routing Working
   ├─ Frontend loads at root /
   ├─ API accessible at /api/*
   └─ No 404s on valid endpoints

✅ Environment Variables
   ├─ Database connected
   ├─ CORS configured
   ├─ API security keys set
   └─ All secrets populated

✅ Functionality Working
   ├─ Frontend renders correctly
   ├─ Backend API responds
   ├─ Database queries work
   ├─ Authentication functions
   └─ File uploads work (if applicable)

✅ Monitoring Active
   ├─ Logs accessible
   ├─ Metrics displaying
   ├─ Alerts configured
   └─ Backups enabled
```

---

## Quick Reference URLs

| Component | URL |
|-----------|-----|
| **App Live** | https://arai-system.ondigitalocean.app |
| **Frontend** | https://arai-system.ondigitalocean.app |
| **Backend API** | https://arai-system.ondigitalocean.app/api |
| **Health Check** | https://arai-system.ondigitalocean.app/api/health |
| **DigitalOcean Apps Dashboard** | https://cloud.digitalocean.com/apps |
| **Supabase Console** | https://supabase.com/dashboard |

---

## Summary

This architecture provides:
- ✅ **Scalability**: Easy to add more containers
- ✅ **Reliability**: Auto-recovery on failure
- ✅ **Security**: HTTPS, private network, env vars
- ✅ **Simplicity**: Auto-deploy from GitHub
- ✅ **Cost-Effective**: Start at $25/month
- ✅ **Monitoring**: Built-in logs and metrics

---

**Last Updated**: April 21, 2026
**Diagram Version**: 1.0
