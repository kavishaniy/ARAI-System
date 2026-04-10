# Railway Build Error Fix - ARAI System Monorepo

## Problem
```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

## Root Cause
Railway couldn't detect the build configuration because:
1. Your repository is a **monorepo** with backend (Python) and frontend (Node.js)
2. Railpack detected both languages and didn't know which one to use
3. No `start.sh` script or proper configuration files in root directory

## Solution

### Option 1: Deploy as Separate Services (Recommended)

This is the **best approach** for a monorepo. Deploy backend and frontend as separate Railway services.

#### Step 1: Create Two Separate Services

**Backend Service:**
1. In Railway Dashboard: **"New Project"** → **"GitHub Repo"**
2. Choose your `arai-system` repository
3. In service settings:
   - **Name**: `arai-backend`
   - **Root Directory**: `backend`
   - **Auto-detect** or manually select **Python**
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Frontend Service:**
1. Click **"+ New Service"** in the same project
2. Choose same `arai-system` repository
3. In service settings:
   - **Name**: `arai-frontend`
   - **Root Directory**: `frontend`
   - **Auto-detect** or manually select **Node.js**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (or `serve -s build -l $PORT`)

#### Step 2: Configure Environment Variables

**Backend Service Variables:**
```
HOST=0.0.0.0
PORT=8000
DEBUG=False
ENVIRONMENT=production
ALLOWED_ORIGINS=https://<your-frontend-railway-domain>

# Supabase (from backend/.env)
SUPABASE_URL=https://omguovoobfiuaooupzsw.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SECRET_KEY=sb_secret_7fmbD60R0bYRGtrL81hA1Q_VLWdN0W6
SALICON_MODEL_PATH=./ai_models/salicon_model
RICO_MODEL_PATH=./ai_models/rico_model
```

**Frontend Service Variables:**
```
REACT_APP_API_URL=https://<your-backend-railway-domain>/api/v1
CI=false
```

#### Step 3: Assign Domains

1. **Backend Service** → Settings → Domains → Add domain (note it)
2. **Frontend Service** → Settings → Domains → Add domain (note it)
3. Update `ALLOWED_ORIGINS` in backend with frontend domain
4. Redeploy backend

---

### Option 2: Deploy with Unified Build Script (Alternative)

If you want to deploy as a single service with both backend and frontend:

#### Create Root-Level Files:

**1. Root `Procfile`** (already exists):
```plaintext
web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**2. Root `package.json`** (create if deploying as Node):
```json
{
  "name": "arai-system",
  "version": "1.0.0",
  "description": "ARAI System Monorepo",
  "scripts": {
    "build": "cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt"
  }
}
```

**Note**: This approach is NOT recommended because:
- Railway will prefer Node.js and ignore Python backend
- Building both in one service causes memory issues
- Better to use separate services (Option 1)

---

## Recommended Fix: Deploy as Two Services

### Quick Checklist:

1. ✅ **Create Backend Service**
   - [ ] Root Directory: `backend`
   - [ ] Language: Python
   - [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - [ ] Environment Variables: Set all Supabase keys

2. ✅ **Create Frontend Service**
   - [ ] Root Directory: `frontend`
   - [ ] Language: Node.js
   - [ ] Build Command: `npm install && npm run build`
   - [ ] Start Command: `npm start`
   - [ ] Environment Variables: Set REACT_APP_API_URL

3. ✅ **Configure Domains**
   - [ ] Get backend domain
   - [ ] Get frontend domain
   - [ ] Update ALLOWED_ORIGINS in backend

4. ✅ **Test Deployment**
   - [ ] Frontend loads
   - [ ] Backend API responds
   - [ ] Frontend can call backend

---

## File Structure for Railway Success

Ensure your repository has this structure:

```
arai-system/
├── .github/              # GitHub workflows
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py       # FastAPI app entry point
│   │   ├── api/
│   │   └── ...
│   ├── ai_models/
│   ├── requirements.txt  ✅ MUST EXIST
│   ├── Procfile         ✅ MUST EXIST
│   ├── runtime.txt      ✅ Python version
│   ├── railway.json     ✅ Configuration
│   └── .env             ✅ Environment variables
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── ...
│   ├── package.json     ✅ MUST EXIST
│   ├── railway.json     ✅ Configuration
│   ├── .env             ✅ Environment variables
│   └── build/           (generated during build)
├── uploads/
├── data/
├── docs/
├── railway.json         (for root-level config, optional)
├── Procfile             (only if single service)
└── README.md
```

---

## Detailed Deploy Steps for Railway Dashboard

### Step 1: Access Railway Dashboard
1. Go to https://railway.app/dashboard
2. Click on your project (or create new)

### Step 2: Remove Old/Failed Service
If you have a broken deployment:
1. Click on the service
2. Settings → Danger Zone → Delete Service
3. Confirm deletion

### Step 3: Add Backend Service
1. Click **"+ New"**
2. Select **"GitHub Repo"**
3. Select `arai-system` repository and `main` branch
4. After connection:
   - **Service Name**: `backend`
   - **Root Directory**: `backend`
   - **Framework**: Should auto-detect Python; if not, manually select
   - Click **Deploy**

### Step 4: Add Frontend Service
1. Click **"+ New"**
2. Select **"GitHub Repo"**
3. Select `arai-system` repository and `main` branch
4. After connection:
   - **Service Name**: `frontend`
   - **Root Directory**: `frontend`
   - **Framework**: Should auto-detect Node; if not, manually select
   - Click **Deploy**

### Step 5: Configure Variables
1. **Backend Service** → Variables → Add all from backend/.env
2. **Frontend Service** → Variables → Add REACT_APP_API_URL (update with backend domain)

### Step 6: Deploy
1. Both services should auto-deploy when you push to main
2. Check **Deployments** tab to see progress
3. View logs if issues occur

---

## Common Errors & Fixes

### Error: "Cannot find module 'fastapi'"
**Cause**: `requirements.txt` not found in backend directory
**Fix**: Ensure `backend/requirements.txt` exists and is in the repo

### Error: "Cannot find module 'react'"
**Cause**: `package.json` not found in frontend directory
**Fix**: Ensure `frontend/package.json` exists and is in the repo

### Error: "CORS error in console"
**Cause**: Frontend domain not in backend `ALLOWED_ORIGINS`
**Fix**: 
1. Note frontend Railway domain
2. Add to backend environment variables: `ALLOWED_ORIGINS=https://your-frontend-domain`
3. Redeploy backend

### Error: "Cannot GET /"
**Cause**: Frontend not building correctly
**Fix**:
1. Check Build Logs
2. Ensure `npm run build` completes successfully
3. Ensure start command serves the built files

---

## After Successful Deployment

### Test Your Application:
```bash
# Test frontend
curl https://<your-frontend-domain>

# Test backend API
curl https://<your-backend-domain>/docs

# Test API health
curl https://<your-backend-domain>/api/v1/health
```

### Monitor Logs:
- **Backend**: Service → Deployments → Logs
- **Frontend**: Service → Deployments → Logs

### Update DNS (if using custom domains):
If you're using custom domains instead of Railway subdomains:
1. Get Railway domain IP
2. Update DNS records at your registrar
3. Railway will handle SSL automatically

---

## Next Steps

1. **Delete** the current failed service (if it exists)
2. **Create** backend service with root directory: `backend`
3. **Create** frontend service with root directory: `frontend`
4. **Set** environment variables for both
5. **Deploy** and monitor logs
6. **Test** the live application

Good luck! 🚀
