# ARAI System - DigitalOcean App Platform Deployment Guide

A complete step-by-step guide to deploy your full-stack web application (FastAPI backend + React frontend) to DigitalOcean using App Platform.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ A DigitalOcean account (with $200 credit for new accounts)
- ✅ Your GitHub repository pushed to `main` branch
- ✅ A Supabase project with database configured
- ✅ Admin access to your GitHub account
- ✅ All environment variables documented

---

## 🚀 Step 1: Prepare Your Repository

### 1.1 Create Required Configuration Files

Your project needs an `app.yaml` file at the repository root to tell DigitalOcean how to build and run your app.

**Create `/app.yaml`:**

```yaml
name: arai-system
services:
  # Backend Service (FastAPI)
  - name: backend
    github:
      branch: main
      repo: kavishaniy/ARAI-System
    source_dir: backend
    build_command: pip install -r requirements.txt
    run_command: uvicorn app.main:app --host 0.0.0.0 --port 8080
    http_port: 8080
    envs:
      # Add your environment variables here
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        value: ${db.username}:${db.password}@${db.host}:5432/${db.name}
      - key: ENVIRONMENT
        value: production
      - key: ALLOWED_ORIGINS
        value: https://arai-system.ondigitalocean.app
    health_check:
      http_path: /health

  # Frontend Service (React)
  - name: frontend
    github:
      branch: main
      repo: kavishaniy/ARAI-System
    source_dir: frontend
    build_command: npm ci && npm run build
    run_command: npm start
    http_port: 3000
    envs:
      - key: REACT_APP_API_URL
        value: https://arai-system.ondigitalocean.app/api
    health_check:
      http_path: /

# Database configuration (optional - use Supabase instead)
databases:
  - name: arai_db
    engine: PG
    version: "15"
    production: true

# Static site for CDN (if needed)
static_sites:
  - name: docs
    github:
      branch: main
      repo: kavishaniy/ARAI-System
    source_dir: .
    routes:
      - path: /docs
        target_dir: /docs
```

### 1.2 Update Backend Configuration

**Ensure `backend/app/main.py` includes CORS configuration:**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS Configuration
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

### 1.3 Add .dockerignore (optional but recommended)

**Create `backend/.dockerignore`:**

```
__pycache__
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv
.git
.gitignore
.env
.env.local
*.pem
```

### 1.4 Push Changes to GitHub

```bash
git add app.yaml backend/.dockerignore DEPLOYMENT_GUIDE.md
git commit -m "Add DigitalOcean App Platform configuration"
git push origin main
```

---

## 🌐 Step 2: Set Up DigitalOcean Account

### 2.1 Create DigitalOcean Account
1. Visit [DigitalOcean Sign Up](https://cloud.digitalocean.com/registrations/new)
2. Sign up with GitHub (recommended) or email
3. Add payment method
4. You'll receive $200 credit (valid for 60 days)

### 2.2 Create a Personal Access Token
1. Go to [API Settings](https://cloud.digitalocean.com/account/api/tokens)
2. Click "Generate New Token"
3. Name: `arai-deployment`
4. Select "Read and Write" scope
5. Save the token securely (you'll need it)

---

## 🔐 Step 3: Configure Supabase (Database)

Your backend uses Supabase. Configure it in DigitalOcean:

### 3.1 Get Supabase Credentials

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your `ARAI` project
3. Go to **Settings** → **Database** → **Connection strings**
4. Copy the **Connection string** (you'll see it in different formats)
5. For FastAPI, use the **Python** format

### 3.2 Document Your Environment Variables

Create a `.env.production` file (locally, don't commit):

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=YOUR_ANON_PUBLIC_KEY
SECRET_KEY=YOUR_SECRET_KEY_HERE
SENDGRID_API_KEY=YOUR_SENDGRID_KEY
ALLOWED_ORIGINS=https://your-app-domain.ondigitalocean.app,https://yourdomain.com
ENVIRONMENT=production
```

---

## 📱 Step 4: Create App on DigitalOcean

### 4.1 Start the Deployment Process

1. Log in to [DigitalOcean Dashboard](https://cloud.digitalocean.com/apps)
2. Click **Create** (top-right) → **Apps**
3. You'll see: "Where's your source code?"

### 4.2 Connect GitHub Repository

1. Click **GitHub** 
2. If first time, authorize DigitalOcean to access GitHub:
   - Click "Authorize DigitalOcean"
   - GitHub login page opens
   - Approve permissions
   - Select repositories to make available (select "ARAI-System")
3. Select your repository: `kavishaniy/ARAI-System`
4. Select branch: `main`
5. Check "Autodeploy on push" ✅
6. Click **Next**

### 4.3 Configure Build Settings

DigitalOcean should auto-detect your services from `app.yaml`.

**For Backend:**
- Component type: **Python**
- Source directory: `backend`
- Build command: `pip install -r requirements.txt`
- Run command: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
- HTTP port: `8080`
- ✅ Check "Run a health check"
- Health check path: `/health`

**For Frontend:**
- Component type: **Node.js**
- Source directory: `frontend`
- Build command: `npm ci && npm run build`
- Run command: `npm start`
- HTTP port: `3000`

---

## 🔧 Step 5: Add Environment Variables

For each service, add your environment variables:

### Backend Environment Variables

| Key | Value | Required |
|-----|-------|----------|
| `DATABASE_URL` | `postgresql://...` | ✅ Yes |
| `SUPABASE_URL` | `https://xxx.supabase.co` | ✅ Yes |
| `SUPABASE_KEY` | Your anon key | ✅ Yes |
| `SECRET_KEY` | Random secure string | ✅ Yes |
| `SENDGRID_API_KEY` | Your SendGrid key | ✅ Yes |
| `ALLOWED_ORIGINS` | `https://your-app.ondigitalocean.app` | ✅ Yes |
| `ENVIRONMENT` | `production` | Optional |

### Frontend Environment Variables

| Key | Value | Required |
|-----|-------|----------|
| `REACT_APP_API_URL` | `https://your-backend-domain/api` | ✅ Yes |
| `REACT_APP_ENV` | `production` | Optional |

---

## 💰 Step 6: Choose Your Plan

### Pricing Breakdown

**DigitalOcean App Platform pricing (as of 2026):**

| Component | Basic Plan | Cost/Month |
|-----------|-----------|-----------|
| Backend Service (512MB RAM) | $5 | $5 |
| Frontend Service (512MB RAM) | $5 | $5 |
| Database (PostgreSQL 1GB) | $15 | $15 |
| **Total** | | **$25/month** |

Since you have $200 credit, you can run for **~8 months free**.

### Plan Selection Steps

1. Scroll down to "App Tier"
2. Select **Basic** plan (sufficient for development/MVP)
3. For production with high traffic, consider **Standard** ($25+/service)
4. Enter number of containers (usually 1 for each service)
5. Click **Next**

---

## 🚀 Step 7: Deploy Your App

### 7.1 Final Review

1. Review all settings:
   - Repository and branch correct
   - Services configured properly
   - Environment variables added
   - Pricing plan selected

2. Click **Create Resources**

### 7.2 Monitor Deployment

You'll see a deployment log in real-time:

```
Building backend...
Building frontend...
Deploying backend...
Deploying frontend...
Creating database...
App deployed successfully!
```

**⏱️ Expected time: 5-15 minutes**

---

## ✅ Step 8: Verify Your Deployment

### 8.1 Access Your Application

Once deployment completes:
1. Click your app name in the dashboard
2. Find your **Live App** URL (looks like `https://arai-system-xxxxx.ondigitalocean.app`)
3. Click the link to visit your app

### 8.2 Test Your Application

**Frontend Tests:**
- Navigate to the app URL
- Verify all pages load
- Test authentication/login

**Backend Tests:**
- Visit `https://your-url/api/health` - should return `{"status": "ok"}`
- Check browser console for API errors
- Test key features

### 8.3 Check Logs

In the DigitalOcean dashboard:
1. Select your app
2. Click **Runtime logs** tab
3. Review for any errors

---

## 🔄 Step 9: Set Up Automatic Redeployment

Your app is already configured for automatic redeployment!

**How it works:**
1. You push code to `main` branch on GitHub
2. DigitalOcean detects the push
3. Automatically rebuilds and deploys
4. No manual intervention needed

**To test:**
```bash
# Make a small change
echo "# Updated on $(date)" >> backend/app/main.py

# Push to GitHub
git add .
git commit -m "Test automatic deployment"
git push origin main

# Watch the deployment in DigitalOcean dashboard
# (Apps → Your App → Deployments)
```

---

## 🛠️ Step 10: Custom Domain Setup

To use your own domain instead of `your-app.ondigitalocean.app`:

### 10.1 In DigitalOcean Dashboard

1. Go to **Apps** → Your App → **Settings**
2. Scroll to "Domains"
3. Click **Add Domain**
4. Enter your domain (e.g., `arai.yourdomain.com`)

### 10.2 Update DNS Records

In your domain registrar (GoDaddy, Namecheap, etc.):

1. Go to DNS settings
2. Add a **CNAME** record:
   - Name: `arai` (or your subdomain)
   - Value: `ondigitalocean.app` (DigitalOcean will provide exact value)
   - TTL: 3600

3. Add **A** record (if needed):
   - IP: Provided by DigitalOcean
   - TTL: 3600

4. Wait 24-48 hours for DNS propagation

### 10.3 Update CORS Settings

Update your backend's `ALLOWED_ORIGINS` environment variable:

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🔒 Security Checklist

Before going to production:

- ✅ All environment variables set securely
- ✅ Database password is strong
- ✅ `SECRET_KEY` is random and unique
- ✅ CORS only allows your domain
- ✅ No sensitive data in git history
- ✅ HTTPS is enforced (DigitalOcean auto-enables)
- ✅ Regular database backups enabled
- ✅ Rate limiting configured on API
- ✅ Input validation on all endpoints
- ✅ Error logging enabled

---

## 🐛 Troubleshooting

### App Won't Deploy

**Error: Build failed**
```
Solution:
1. Check build command syntax
2. Verify all dependencies are in requirements.txt
3. Check logs for specific errors
4. Run locally first: `python -m venv venv && pip install -r backend/requirements.txt`
```

**Error: Service not responding**
```
Solution:
1. Check health check endpoint exists
2. Verify PORT environment variable is used
3. Check logs for runtime errors
4. Increase timeout in health check settings
```

### Database Connection Issues

```
Error: "FATAL: password authentication failed"

Solution:
1. Copy DATABASE_URL correctly from Supabase
2. Check password doesn't have special characters (URL-encode if needed)
3. Verify Supabase database is not paused
4. Check IP whitelisting in Supabase settings
```

### Frontend Can't Connect to Backend

```
Error: "CORS error" in browser console

Solution:
1. Update ALLOWED_ORIGINS in backend env vars
2. Include both domain and port if needed
3. Check REACT_APP_API_URL is correct
4. Rebuild frontend after changing env vars
```

### Port Issues

```
Error: "Address already in use"

Solution:
- Backend must use port 8080 (set in run command)
- Frontend must use port 3000 (set in run command)
- Don't hardcode localhost - use 0.0.0.0
```

---

## 📊 Monitoring & Maintenance

### Enable Monitoring

1. **Logs**: Apps → Your App → **Runtime logs**
2. **Metrics**: Apps → Your App → **Insights**
   - CPU usage
   - Memory usage
   - Request count
   - Error rate

### Automatic Backups

For PostgreSQL database:
1. Go to **Databases** → Your Database
2. Enable automated backups (recommended)
3. Backups retained for 7 days

### Scale Your App

To handle more traffic:
1. Go to **Apps** → Your App → **Settings**
2. Increase instance count for services
3. Upgrade to larger instance size

---

## 💡 Cost Optimization Tips

**Current setup: ~$25/month**

To reduce costs:
- Use Supabase free tier for development ($0)
- Reduce instance size to 256MB RAM (not recommended for production)
- Remove database from DigitalOcean (use Supabase only)
- Consolidated setup: Backend + Frontend + Database = ~$45/month

**Estimated monthly costs with included credit:**
- Year 1: Free ($200 credit covers ~8 months)
- Year 2+: ~$300/year

---

## 🎯 What's Next?

After successful deployment:

1. **Set up monitoring alerts** - Get notified of failures
2. **Configure email notifications** - For deployment status
3. **Set up CI/CD** - Automated testing before deployment
4. **Enable SSL/TLS** - DigitalOcean does this automatically
5. **Configure rate limiting** - Protect your API
6. **Set up analytics** - Track user behavior
7. **Plan for scaling** - Monitor resource usage

---

## 📞 Support & Resources

- **DigitalOcean Docs**: https://docs.digitalocean.com/products/app-platform/
- **DigitalOcean Support**: Support portal in dashboard
- **Community**: DigitalOcean Community forums
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **Supabase Docs**: https://supabase.com/docs

---

## ✨ Summary

**You now have:**
✅ Full deployment guide
✅ Configuration files ready
✅ Environment variables documented
✅ Cost estimates calculated
✅ Troubleshooting guide included

**Next Action:**
Push the `app.yaml` to GitHub and create your app in DigitalOcean!

---

**Last Updated**: April 21, 2026
**Version**: 1.0
