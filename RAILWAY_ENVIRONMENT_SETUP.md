# 🔐 Railway Environment Setup & Testing Guide

## Environment Variables Reference

### Required Variables for Railway

```bash
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
SUPABASE_BUCKET=designs

# Database (if using separate DB)
DATABASE_URL=postgresql://user:password@host:5432/database

# Frontend Configuration
CORS_ORIGINS=https://your-frontend.vercel.app

# Python Configuration
PYTHON_VERSION=3.11.9
PYTHONUNBUFFERED=1

# Feature Flags
LITE_MODE=false  # true = faster, disables PyTorch
```

---

## Step 1: Get Variables from Render

### 1.1 Export from Render
Go to your Render dashboard:

```
1. Select your service
2. Click "Environment" tab
3. Copy each variable value
4. Paste into text editor
```

### 1.2 Extract Variables
Save to file: `render_env_backup.txt`

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
SUPABASE_BUCKET=designs
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://your-frontend.vercel.app
```

### 1.3 Verify Variables
```bash
# Make sure no sensitive data is empty
grep "^[A-Z_]*=$" render_env_backup.txt

# If empty values exist, get them from:
# - Render dashboard
# - .env file (locally)
# - Supabase dashboard
```

---

## Step 2: Add Variables to Railway

### 2.1 Via Railway Dashboard (Recommended)

```
1. Go to https://railway.app/dashboard
2. Click your service
3. Click "Variables" tab
4. Click "New Variable"
5. Fill in name and value
6. Click "Deploy"
```

### 2.2 Add Each Variable

Copy-paste from your backup file:

| Name | Value |
|------|-------|
| SUPABASE_URL | `paste from backup` |
| SUPABASE_KEY | `paste from backup` |
| SUPABASE_BUCKET | `paste from backup` |
| DATABASE_URL | `paste from backup` |
| CORS_ORIGINS | `paste from backup` |
| PYTHON_VERSION | `3.11.9` |
| PYTHONUNBUFFERED | `1` |
| LITE_MODE | `false` |

### 2.3 Verify Variables Added
```
In Railway dashboard → Variables:
- All variables should show
- All values should be populated
- No "undefined" or empty values
```

---

## Step 3: Test Variables Locally

### 3.1 Create Local .env File
Create `backend/.env`:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
SUPABASE_BUCKET=designs
DATABASE_URL=postgresql://...
CORS_ORIGINS=http://localhost:3000
LITE_MODE=false
PYTHONUNBUFFERED=1
```

### 3.2 Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3.3 Test Import
```bash
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

print('✅ SUPABASE_URL:', os.getenv('SUPABASE_URL')[:20] + '...')
print('✅ SUPABASE_KEY:', os.getenv('SUPABASE_KEY')[:20] + '...')
print('✅ CORS_ORIGINS:', os.getenv('CORS_ORIGINS'))
"
```

### 3.4 Test Database Connection
```bash
python -c "
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()
db_url = os.getenv('DATABASE_URL')

try:
    conn = psycopg2.connect(db_url)
    print('✅ Database connected')
except Exception as e:
    print(f'❌ Database error: {e}')
"
```

### 3.5 Test Supabase Connection
```bash
python -c "
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')

client = create_client(url, key)
print('✅ Supabase connected')
"
```

---

## Step 4: Run Locally

### 4.1 Start FastAPI Server
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 4.2 Check Health Endpoint
```bash
curl http://localhost:8000/api/v1/health

# Should return:
# {"status":"ok"}
```

### 4.3 View API Docs
```
Open in browser: http://localhost:8000/docs
- See all API endpoints
- Try test requests
- Check request/response format
```

### 4.4 Test Full Workflow
```bash
# 1. Get health
curl http://localhost:8000/api/v1/health

# 2. Test authentication (if endpoint exists)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 3. Test file upload (need auth token)
curl -X POST http://localhost:8000/api/v1/analysis/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-image.png"
```

---

## Step 5: Deploy to Railway

### 5.1 Commit Changes
```bash
git add backend/Procfile railway.json
git commit -m "Add Railway configuration"
git push origin main
```

### 5.2 Monitor Deployment
```
In Railway dashboard:
1. Click your service
2. Go to "Deployments" tab
3. Watch the latest deployment
4. Should show "Running" status
```

### 5.3 Check Logs
```
In Railway dashboard:
1. Click "Logs" tab
2. Look for "Application startup complete"
3. No red error messages
```

### 5.4 Get Railway Domain
```
In Railway dashboard:
1. Click your service
2. Go to "Settings"
3. Under "Networking", copy domain:
   https://your-service.up.railway.app
```

---

## Step 6: Test on Railway

### 6.1 Test Health Endpoint
```bash
curl https://your-service.up.railway.app/api/v1/health

# Should return:
# {"status":"ok"}
```

### 6.2 View API Docs
```
Open in browser:
https://your-service.up.railway.app/docs
```

### 6.3 Test with Frontend
```javascript
// In browser console
fetch('https://your-service.up.railway.app/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('✅ API working:', d))
  .catch(e => console.error('❌ API error:', e))
```

### 6.4 Full Integration Test
1. Update frontend `.env.production`
2. Deploy frontend
3. Test upload in production
4. Verify analysis works
5. Check results display

---

## Environment Variables Cheat Sheet

### For Development (Local)
```bash
# .env file
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=xxxxx (public key)
CORS_ORIGINS=http://localhost:3000
LITE_MODE=true  # Faster for testing
PYTHONUNBUFFERED=1
```

### For Staging (Railway)
```bash
# Railway Variables
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=xxxxx (public key)
CORS_ORIGINS=https://staging.vercel.app
LITE_MODE=false  # Full features
PYTHONUNBUFFERED=1
PYTHON_VERSION=3.11.9
```

### For Production (Railway)
```bash
# Railway Variables (same as staging)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=xxxxx (public key)
CORS_ORIGINS=https://your-domain.com
LITE_MODE=false
PYTHONUNBUFFERED=1
PYTHON_VERSION=3.11.9
```

---

## Validation Checklist

### Variables ✅
- [ ] SUPABASE_URL is set (not empty)
- [ ] SUPABASE_KEY is set (not empty)
- [ ] SUPABASE_BUCKET is set correctly
- [ ] DATABASE_URL has correct format
- [ ] CORS_ORIGINS matches your frontend URL
- [ ] No typos in variable names
- [ ] No extra spaces or quotes

### Local Testing ✅
- [ ] `pip install -r requirements.txt` succeeds
- [ ] `python -c "from app.main import app"` works
- [ ] `uvicorn app.main:app --reload` starts
- [ ] Health endpoint returns status
- [ ] API docs page loads
- [ ] No import errors in logs

### Railway Testing ✅
- [ ] Deployment shows "Running"
- [ ] Logs show "Application startup complete"
- [ ] Health endpoint responds
- [ ] No 500 errors in logs
- [ ] No CORS errors
- [ ] Frontend can call API

### Integration Testing ✅
- [ ] Frontend loads without errors
- [ ] Login/authentication works
- [ ] File upload works
- [ ] Analysis processes correctly
- [ ] Results display properly
- [ ] No API errors in browser console

---

## Common Variable Mistakes

❌ **WRONG:**
```
SUPABASE_URL = https://xxxxx.supabase.co  (extra spaces)
SUPABASE_KEY = "eyJ0eXAi..."  (extra quotes)
CORS_ORIGINS = http://localhost:3000/  (trailing slash)
DATABASE_URL = user:pass@host/db  (missing postgresql://)
```

✅ **CORRECT:**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ0eXAi...
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## Variable Sources

### Get SUPABASE_URL and SUPABASE_KEY
```
1. Go to https://supabase.com
2. Login to your project
3. Settings → API
4. Copy "Project URL" → SUPABASE_URL
5. Copy "anon public" key → SUPABASE_KEY
```

### Get DATABASE_URL
```
1. Go to https://supabase.com
2. Settings → Database
3. Copy connection string "URI"
4. Format: postgresql://user:pass@host:5432/db
```

### Get CORS_ORIGINS
```
For Vercel: https://your-project.vercel.app
For custom domain: https://your-domain.com
For localhost: http://localhost:3000
```

---

## Testing Commands Reference

```bash
# Health check
curl https://your-service.up.railway.app/api/v1/health

# Get API docs
curl https://your-service.up.railway.app/docs

# Test with headers
curl -H "Authorization: Bearer $TOKEN" \
  https://your-service.up.railway.app/api/v1/analysis

# Check service status
curl -I https://your-service.up.railway.app

# Test local server
curl http://localhost:8000/api/v1/health

# View logs (in Railway)
# Railway dashboard → Logs tab
```

---

## Quick Troubleshooting

| Problem | Check |
|---------|-------|
| API returns 500 | Check SUPABASE_URL and SUPABASE_KEY |
| CORS error | Check CORS_ORIGINS variable |
| Database error | Check DATABASE_URL format |
| Won't start | Check Python version and imports |
| Slow response | Check LITE_MODE setting |
| Memory error | Set LITE_MODE=true |

---

## Security Notes

⚠️ **IMPORTANT:**
1. Never commit `.env` file to GitHub
2. Never share variable values
3. Use environment variables, not hardcoded values
4. Rotate keys periodically
5. Use public key for SUPABASE_KEY (client-side)
6. Use service role key in separate environment if needed

---

## Next Steps

1. ✅ Get all variables from Render
2. ✅ Test variables locally
3. ✅ Add variables to Railway
4. ✅ Deploy to Railway
5. ✅ Test Railway deployment
6. ✅ Update frontend API URL
7. ✅ Test full integration
8. ✅ Monitor performance

---

**You're all set! Your Railway backend is ready! 🚀**
