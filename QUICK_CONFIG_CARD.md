# ⚡ Quick Configuration Card - Keep This Open!

Print or bookmark this while configuring in DigitalOcean.

---

## Backend Service: arai-system-backend

| Setting | Current ❌ | Change To ✅ |
|---------|----------|-----------|
| **Build Strategy** | Dockerfile | Python |
| **Run Command** | (not defined) | `uvicorn app.main:app --host 0.0.0.0 --port 8080` |
| **Instance Size** | 1 GB RAM / 2 containers | 512MB RAM / 1 container |
| **Public Port** | 8000 | 8080 |
| **Environment Variables** | (none) | Add 7 variables (see below) |

### Backend Environment Variables (Add these)

```
DATABASE_URL
└─ Get from: Supabase → Settings → Database → Connection strings

SUPABASE_URL
└─ Get from: Supabase → Settings → API → Project URL

SUPABASE_KEY
└─ Get from: Supabase → Settings → API → anon public key

SECRET_KEY
└─ Generate: python3 -c "import secrets; print(secrets.token_urlsafe(32))"

SENDGRID_API_KEY
└─ Get from: SendGrid → Settings → API Keys (OPTIONAL)

ALLOWED_ORIGINS
└─ Use: https://arai-system-abc123.ondigitalocean.app
   (You'll get this after first deploy, or keep empty for now)

ENVIRONMENT
└─ Value: production
```

---

## Frontend Service: arai-system-frontend

| Setting | Current ❌ | Change To ✅ |
|---------|----------|-----------|
| **Build Command** | (not defined) | `npm ci && npm run build` |
| **Run Command** | npm start | npm start ✓ (keep) |
| **Instance Size** | 1 GB RAM / 2 containers | 512MB RAM / 1 container |
| **Public Port** | 8080 | 3000 |
| **Environment Variables** | (none) | Add 2 variables (see below) |

### Frontend Environment Variables (Add these)

```
REACT_APP_API_URL
└─ Value: https://arai-system-abc123.ondigitalocean.app/api
   (Same domain as ALLOWED_ORIGINS, with /api at end)

REACT_APP_ENVIRONMENT
└─ Value: production
```

---

## App Level Settings

| Setting | Value |
|---------|-------|
| **App Name** | arai-system |
| **Project** | first-project |
| **Region** | lon1 (or your choice) |

---

## 🎯 Checklist Before "Create App"

### Backend Service
- [ ] Build Strategy: Python (not Dockerfile)
- [ ] Run Command: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
- [ ] Instance: 512MB RAM, 1 container
- [ ] Port: 8080
- [ ] 7 environment variables added:
  - [ ] DATABASE_URL
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_KEY
  - [ ] SECRET_KEY
  - [ ] SENDGRID_API_KEY (optional)
  - [ ] ALLOWED_ORIGINS
  - [ ] ENVIRONMENT

### Frontend Service
- [ ] Build Command: `npm ci && npm run build`
- [ ] Run Command: `npm start` (already correct)
- [ ] Instance: 512MB RAM, 1 container
- [ ] Port: 3000
- [ ] 2 environment variables added:
  - [ ] REACT_APP_API_URL
  - [ ] REACT_APP_ENVIRONMENT

### App Settings
- [ ] App name: arai-system
- [ ] Project: first-project
- [ ] Region: lon1

### Final Check
- [ ] Cost shows ~$10/month (not $48!)
- [ ] All required fields filled
- [ ] All critical variables added

---

## 💡 Pro Tips

1. **DATABASE_URL Format**
   ```
   postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT.supabase.co:5432/postgres
   ```
   (No spaces, all one line)

2. **SECRET_KEY Generation**
   - Run this in terminal: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
   - Copy the output (it's a long string)
   - Paste into DigitalOcean

3. **REACT_APP_API_URL**
   - Should match your backend domain
   - Must include `/api` at the end
   - Example: `https://arai-system-abc123.ondigitalocean.app/api`

4. **ALLOWED_ORIGINS**
   - After deployment, DigitalOcean shows you the domain
   - Update this variable with that domain
   - You can leave it empty for now, update after first deploy

---

## ⚠️ Common Mistakes to Avoid

❌ Don't leave Build Command empty on Frontend
❌ Don't forget "uvicorn" in Backend Run Command
❌ Don't use 1 GB RAM (use 512MB to save money)
❌ Don't use 2 containers (use 1 each)
❌ Don't forget environment variables
❌ Don't click "Create app" without reviewing
❌ Don't use uppercase in app name (keep lowercase)

---

## 🚀 Exact Order to Follow

1. Click Backend "Edit"
   - [ ] Set Build Strategy
   - [ ] Set Run Command
   - [ ] Change Instance Size
   - [ ] Change Port
   - [ ] Add 7 variables
   - [ ] Click "Save"

2. Click Frontend "Edit"
   - [ ] Set Build Command
   - [ ] Change Instance Size
   - [ ] Change Port
   - [ ] Add 2 variables
   - [ ] Click "Save"

3. Review App Settings
   - [ ] Change app name
   - [ ] Check project
   - [ ] Check region

4. Review Cost
   - [ ] Should be ~$10/month

5. Click "Create app"
   - [ ] All checkboxes above ✓
   - [ ] Ready to deploy!

---

## 📞 Need Credentials?

### Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click Settings (bottom)
4. Click Database
5. Copy Connection String (PostgreSQL) → DATABASE_URL
6. Click API
7. Copy Project URL → SUPABASE_URL
8. Copy anon public key → SUPABASE_KEY

### SendGrid (Optional)
1. Go to https://app.sendgrid.com
2. Settings → API Keys
3. Create API Key with "Mail Send" permission
4. Copy → SENDGRID_API_KEY

### Generate SECRET_KEY
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copy output → SECRET_KEY

---

## ✅ Summary

- Backend: Python, uvicorn, 512MB, port 8080, 7 vars
- Frontend: npm build, 512MB, port 3000, 2 vars
- App: arai-system, cost ~$10/month
- Then: Click "Create app"

**Time: ~15 minutes to configure everything**

---

**Use this card**: Keep it visible while configuring in DigitalOcean
**Print it**: If you prefer physical checklist
**Reference**: Copy exact values from here

Ready? Open DigitalOcean and start configuring! 🚀

---

**Created**: April 21, 2026
**For**: DigitalOcean Configuration
**Status**: Quick reference card
