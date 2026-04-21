# 🔧 DigitalOcean App Configuration - STEP BY STEP

You're at the "Configure app" page in DigitalOcean. Here's exactly what to fix:

---

## 📋 Configuration Steps

### Step 1: Fix Backend Service

**Current State:**
```
Name: arai-system-backend ✓
Source directory: backend ✓
Build strategy: Dockerfile ❌ (Wrong - should be Python)
Run command: No run command ❌ (Wrong - needs command)
Instance size: 1 GB RAM ❌ (Too large - use basic)
Containers: 2 ❌ (Wrong - use 1)
Public port: 8000 ❌ (Wrong - should be 8080)
```

**What to Do:**

1. Click **"Edit"** next to `arai-system-backend`

2. Change **Build strategy**:
   - From: "Dockerfile" ❌
   - To: "Python" ✅
   - (This auto-detects from requirements.txt)

3. Set **Run command**:
   - Click "No run command defined"
   - Enter: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
   - Click Save

4. Change **Instance size**:
   - Click "Edit" next to Size
   - From: "1 GB RAM / 1 Shared vCPU" ❌
   - To: "512MB / 1 Shared vCPU" ✅ (Basic plan, cheaper)
   - Containers: Change from 2 → 1
   - Click Save

5. Change **Public port**:
   - From: 8000 ❌
   - To: 8080 ✅
   - Click Save

6. **Add environment variables** (Click "Edit" under Environment variables):
   ```
   DATABASE_URL: postgresql://... (from Supabase)
   SUPABASE_URL: https://xxx.supabase.co (from Supabase)
   SUPABASE_KEY: your_anon_key (from Supabase)
   SECRET_KEY: (generate: python3 -c "import secrets; print(secrets.token_urlsafe(32))")
   SENDGRID_API_KEY: (from SendGrid - optional)
   ALLOWED_ORIGINS: https://your-app-domain.ondigitalocean.app
   ENVIRONMENT: production
   ```
   Click Save

---

### Step 2: Fix Frontend Service

**Current State:**
```
Name: arai-system-frontend ✓
Source directory: frontend ✓
Build strategy: Buildpack ✓ (Correct for Node.js)
Build command: No build command ❌ (Wrong - needs command)
Run command: npm start ✓
Instance size: 1 GB RAM ❌ (Too large)
Containers: 2 ❌ (Wrong - use 1)
Public port: 8080 ❌ (Wrong - should be 3000)
```

**What to Do:**

1. Click **"Edit"** next to `arai-system-frontend`

2. Set **Build command**:
   - Click "No build command defined"
   - Enter: `npm ci && npm run build`
   - Click Save

3. Change **Instance size**:
   - Click "Edit" next to Size
   - From: "1 GB RAM / 1 Shared vCPU" ❌
   - To: "512MB / 1 Shared vCPU" ✅ (Basic plan)
   - Containers: Change from 2 → 1
   - Click Save

4. Change **Public port**:
   - From: 8080 ❌
   - To: 3000 ✅
   - Click Save

5. **Add environment variables** (Click "Edit"):
   ```
   REACT_APP_API_URL: https://your-app-domain.ondigitalocean.app/api
   REACT_APP_ENVIRONMENT: production
   ```
   Click Save

---

### Step 3: App-Level Settings

1. **Change app name**:
   - From: "sea-lion-app" ❌
   - To: "arai-system" ✅
   - (Or any name you prefer - must be lowercase, no spaces)

2. **Select project**:
   - Keep: "first-project" ✓ (or your preferred project)

3. **Region**:
   - "lon1 - London" ✓ (or closest to your users)

---

## 📊 Correct Final Configuration

### Backend (arai-system-backend)
```
Name: arai-system-backend
Source: backend/
Build Strategy: Python (not Dockerfile)
Build Command: (auto - from requirements.txt)
Run Command: uvicorn app.main:app --host 0.0.0.0 --port 8080
Instance: 512MB RAM / 1 vCPU
Containers: 1
Port: 8080
Variables: DATABASE_URL, SUPABASE_URL, SUPABASE_KEY, SECRET_KEY, etc.
Cost: $5/month
```

### Frontend (arai-system-frontend)
```
Name: arai-system-frontend
Source: frontend/
Build Strategy: Buildpack (auto-detects Node.js)
Build Command: npm ci && npm run build
Run Command: npm start
Instance: 512MB RAM / 1 vCPU
Containers: 1
Port: 3000
Variables: REACT_APP_API_URL, REACT_APP_ENVIRONMENT
Cost: $5/month
```

### Total Cost
```
Backend: $5/month
Frontend: $5/month
Total: $10/month (much better than $48!)
```

---

## 🎯 Quick Action Checklist

Go through each service:

### Backend (arai-system-backend)
- [ ] Click "Edit" 
- [ ] Build Strategy: Change to Python
- [ ] Run Command: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
- [ ] Size: Change to 512MB, Containers: 1
- [ ] Port: Change to 8080
- [ ] Environment Variables: Add all 7 variables
- [ ] Click Save

### Frontend (arai-system-frontend)
- [ ] Click "Edit"
- [ ] Build Command: `npm ci && npm run build`
- [ ] Size: Change to 512MB, Containers: 1
- [ ] Port: Change to 3000
- [ ] Environment Variables: Add REACT_APP_API_URL
- [ ] Click Save

### App Level
- [ ] App name: Change to "arai-system"
- [ ] Project: Keep "first-project"
- [ ] Region: Keep "lon1" or choose yours

---

## ⚠️ IMPORTANT: Environment Variables

Before clicking "Create app", you NEED these values:

### From Supabase (Required)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → Database → Connection strings
4. Copy the PostgreSQL connection string → DATABASE_URL
5. Settings → API → Project URL → SUPABASE_URL
6. Settings → API → Copy "anon public" key → SUPABASE_KEY

### Generate SECRET_KEY (Required)
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copy the output → SECRET_KEY

### From SendGrid (Optional but recommended)
1. Go to https://app.sendgrid.com
2. Settings → API Keys
3. Create API Key with "Mail Send" permission
4. Copy → SENDGRID_API_KEY

### Your Domain (Required)
- After deployment, DigitalOcean gives you a URL
- Use it for: ALLOWED_ORIGINS, REACT_APP_API_URL
- Example: `https://arai-system-abc123.ondigitalocean.app`

---

## 🚀 NEXT STEP

1. ✅ Fix all the configurations above
2. ✅ Add all environment variables
3. ✅ Review the cost (should be ~$10/month, not $48!)
4. ✅ Click **"Create app"**
5. Wait 5-15 minutes for deployment

---

## 📝 Exact Values for Copy-Paste

If you need exact formats:

### Backend Environment Variables
```
DATABASE_URL = postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres
SUPABASE_URL = https://[PROJECT].supabase.co
SUPABASE_KEY = [YOUR_ANON_KEY]
SECRET_KEY = [GENERATE_NEW_WITH_PYTHON_COMMAND]
SENDGRID_API_KEY = SG.[YOUR_KEY] (optional)
ALLOWED_ORIGINS = https://arai-system-xyz.ondigitalocean.app
ENVIRONMENT = production
```

### Frontend Environment Variables
```
REACT_APP_API_URL = https://arai-system-xyz.ondigitalocean.app/api
REACT_APP_ENVIRONMENT = production
```

---

## ✅ Final Verification

Before clicking "Create app":

- [ ] Backend build strategy: Python (not Docker)
- [ ] Backend run command: uvicorn... defined
- [ ] Frontend build command: npm ci && npm run build
- [ ] Backend instance: 512MB, 1 container, port 8080
- [ ] Frontend instance: 512MB, 1 container, port 3000
- [ ] Backend has 7+ environment variables
- [ ] Frontend has 2+ environment variables
- [ ] App name: arai-system (lowercase)
- [ ] Cost: ~$10/month (not $48)
- [ ] All Supabase credentials ready

If all ✓, you're ready to click "Create app"!

---

**Status**: Ready to configure
**Next**: Fix each service as described above
**Time**: ~15 minutes to configure everything
**Then**: Click "Create app" and wait for deployment

Good luck! 🚀

---

**Created**: April 21, 2026
**For**: DigitalOcean App Configuration
**Stage**: Configure app page
