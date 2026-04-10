# 🚀 Railway Deployment - Quick Fix Reference

## The Problem
Railway couldn't determine how to build your monorepo (backend + frontend together).

## The Solution
**Deploy as TWO separate services in the SAME Railway project:**

---

## ⚡ Quick Setup (5 minutes)

### In Railway Dashboard:

**1. Create Backend Service**
```
Source: GitHub Repo
Branch: main
Root Directory: backend
Framework: Python
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**2. Create Frontend Service**
```
Source: GitHub Repo
Branch: main
Root Directory: frontend
Framework: Node.js
Build Command: npm install && npm run build
Start Command: npm start
```

**3. Set Environment Variables**

Backend Service:
```
ALLOWED_ORIGINS=https://<your-frontend-domain>
SUPABASE_URL=https://omguovoobfiuaooupzsw.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Frontend Service:
```
REACT_APP_API_URL=https://<your-backend-domain>/api/v1
```

**4. Deploy**
Both services deploy automatically!

---

## 📋 Deployment Checklist

- [ ] Backend service created
- [ ] Frontend service created
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Backend domain noted
- [ ] Frontend domain noted
- [ ] ALLOWED_ORIGINS updated
- [ ] Backend redeploy completed
- [ ] Frontend loads at domain
- [ ] Backend API responds at /docs endpoint
- [ ] Frontend can call backend

---

## 🔍 Debugging

**View Logs:**
```
Service → Deployments → Click Latest → View Logs
```

**Frontend Can't Call Backend:**
1. Check `REACT_APP_API_URL` in frontend variables
2. Check `ALLOWED_ORIGINS` in backend variables
3. Redeploy backend after changes

**Build Fails:**
1. Check `Root Directory` is set correctly
2. Check `requirements.txt` (backend) or `package.json` (frontend) exists
3. Check logs for specific error

---

## 📚 Detailed Guides

See these files for more info:
- `RAILWAY_DEPLOYMENT_COMPLETE.md` - Full deployment guide
- `RAILWAY_BUILD_FIX.md` - Detailed troubleshooting
- `LOCAL_SETUP_GUIDE.md` - Running locally

---

Good luck! 🎉
