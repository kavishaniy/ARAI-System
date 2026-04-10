# Railway Deployment Guide for ARAI System

## Overview

ARAI System is a monorepo with:
- **Backend**: FastAPI (Python)
- **Frontend**: React (Node.js)
- **Database**: Supabase (PostgreSQL)

This guide will help you deploy both services to Railway.

---

## Prerequisites

1. **Railway Account**: Sign up at https://railway.app
2. **Git Repository**: Push your code to GitHub
3. **Supabase Setup**: Already configured (credentials in `.env`)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Railway Dashboard                       │
├──────────────────┬──────────────────┬──────────────────────┤
│                  │                  │                      │
│   Backend        │   Frontend       │   Database           │
│   Service        │   Service        │   (Supabase)         │
│                  │                  │                      │
│   Port: 8000     │   Port: 3000     │   PostgreSQL         │
│   Python/FastAPI │   Node/React     │   Cloud              │
│                  │                  │                      │
└──────────────────┴──────────────────┴──────────────────────┘
```

---

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

Ensure your repository structure is correct:
```
arai-system/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── Procfile
│   ├── runtime.txt
│   └── .env (contains Supabase keys)
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── .env (REACT_APP_API_URL)
│   └── public/
└── railway.json
```

### Step 2: Create Railway Services

#### 2a. Connect GitHub Repository
1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. Connect your GitHub account and select the `arai-system` repository
5. Click **"Deploy"**

#### 2b: Create Backend Service

1. In Railway Dashboard, click **"+ New"** → **"Service"**
2. Select **"GitHub Repo"** and choose your branch
3. Configure:
   - **Name**: `arai-backend`
   - **Root Directory**: `backend`
   - **Framework**: Select Python
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. Add **Environment Variables**:
   ```
   HOST=0.0.0.0
   PORT=8000
   DEBUG=False
   ENVIRONMENT=production
   ALLOWED_ORIGINS=https://<your-frontend-domain>.railway.app
   
   # Supabase (copy from backend/.env)
   SUPABASE_URL=https://omguovoobfiuaooupzsw.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SECRET_KEY=sb_secret_7fmbD60R0bYRGtrL81hA1Q_VLWdN0W6
   
   # AI Model Paths
   SALICON_MODEL_PATH=./ai_models/salicon_model
   RICO_MODEL_PATH=./ai_models/rico_model
   ```

5. Click **"Deploy"**

#### 2c: Create Frontend Service

1. Click **"+ New"** → **"Service"**
2. Select **"GitHub Repo"** and choose your branch
3. Configure:
   - **Name**: `arai-frontend`
   - **Root Directory**: `frontend`
   - **Framework**: Select Node.js
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. Add **Environment Variables**:
   ```
   REACT_APP_API_URL=https://<your-backend-domain>.railway.app/api/v1
   CI=false
   ```

5. Click **"Deploy"**

---

## Step 3: Configure Domain & SSL

### For Backend Service:
1. In Railway Dashboard, click on **Backend Service**
2. Go to **"Settings"** → **"Domains"**
3. Click **"Add Custom Domain"** or use the generated Railway domain
4. Note the domain (e.g., `arai-backend-prod.railway.app`)

### For Frontend Service:
1. In Railway Dashboard, click on **Frontend Service**
2. Go to **"Settings"** → **"Domains"**
3. Add your custom domain or use the generated Railway domain
4. Note the domain (e.g., `arai-frontend-prod.railway.app`)

### Update CORS Settings:
After domains are assigned:
1. Go to **Backend Service** → **"Variables"**
2. Update `ALLOWED_ORIGINS` to include your frontend domain
3. Redeploy backend

---

## Step 4: Database Configuration

Supabase is already configured. Verify:

1. Check backend `.env` has correct Supabase credentials
2. Supabase tables are created and migrations applied
3. Row-Level Security (RLS) policies are configured if needed

---

## Step 5: Monitoring & Logs

### View Logs:
1. Click on any service in Railway Dashboard
2. Go to **"Deployments"** tab
3. Click on the latest deployment to see logs

### Common Issues:

**Port binding error:**
```
ERROR: Bind to 0.0.0.0:8000 failed
```
Solution: Railway automatically assigns `$PORT`. Use it in your start command.

**Missing dependencies:**
```
ModuleNotFoundError: No module named 'fastapi'
```
Solution: Ensure `requirements.txt` is in the `backend/` directory.

**CORS errors:**
```
Access to XMLHttpRequest blocked by CORS
```
Solution: Update `ALLOWED_ORIGINS` in backend environment variables.

---

## Environment Variables Reference

### Backend (.env)
| Variable | Production Value | Purpose |
|----------|------------------|---------|
| HOST | 0.0.0.0 | Server bind address |
| PORT | $PORT (Railway) | Server port |
| DEBUG | False | Debug mode |
| ENVIRONMENT | production | Environment type |
| ALLOWED_ORIGINS | https://frontend-domain.railway.app | CORS allowed origins |
| SUPABASE_URL | (from Supabase) | Database URL |
| SUPABASE_KEY | (from Supabase) | Anon key |
| SUPABASE_SERVICE_KEY | (from Supabase) | Service key |

### Frontend (.env)
| Variable | Production Value | Purpose |
|----------|------------------|---------|
| REACT_APP_API_URL | https://backend-domain.railway.app/api/v1 | Backend API URL |
| CI | false | Prevent build warnings |

---

## Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Backend `.env` updated with Supabase credentials
- [ ] Frontend `.env` updated with backend API URL
- [ ] Backend service created with correct root directory
- [ ] Frontend service created with correct root directory
- [ ] Environment variables set for both services
- [ ] Domains assigned and configured
- [ ] CORS settings updated with correct domains
- [ ] First deployment completed successfully
- [ ] Logs checked for errors
- [ ] Frontend can communicate with backend
- [ ] Authentication (Supabase) working

---

## Troubleshooting

### Service won't start
1. Check **Logs** tab in Railway Dashboard
2. Verify **Root Directory** is set correctly
3. Verify **Environment Variables** are complete
4. Check **Start Command** is correct

### Frontend can't reach backend
1. Verify frontend `.env` has correct backend URL
2. Verify backend service is running (check Logs)
3. Check backend `ALLOWED_ORIGINS` includes frontend domain
4. Check network connectivity (ping test)

### Build fails
1. Check **Build Logs** in Railway Dashboard
2. Ensure `requirements.txt` (backend) or `package.json` (frontend) exists
3. Check for syntax errors in configuration files
4. Verify Python/Node versions match development

### Memory/Resource Issues
- Backend: Allocated minimum 512MB RAM (check Railway plan)
- Frontend: Allocated minimum 512MB RAM
- If issues persist, upgrade Railway plan

---

## Redeployment

To redeploy after making changes:

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. Railway will **automatically redeploy** if you have auto-deploy enabled
3. Or manually click **"Deploy"** in Railway Dashboard

---

## Useful Commands

### Monitor Backend Service:
```bash
# View recent logs
railway logs --service arai-backend

# Follow live logs
railway logs --service arai-backend --follow
```

### Monitor Frontend Service:
```bash
railway logs --service arai-frontend --follow
```

### SSH into Service (if needed):
```bash
railway shell --service arai-backend
```

---

## Post-Deployment Verification

1. **Frontend loads**: https://frontend-domain.railway.app
2. **Backend API docs**: https://backend-domain.railway.app/docs
3. **API health check**: https://backend-domain.railway.app/api/v1/health
4. **Authentication works**: Try login/signup on frontend
5. **Design upload works**: Upload a design and verify analysis

---

## Support

- Railway Documentation: https://docs.railway.app
- FastAPI Docs: https://fastapi.tiangolo.com
- React Docs: https://react.dev
- Supabase Docs: https://supabase.com/docs

---

Good luck with your deployment! 🚀
