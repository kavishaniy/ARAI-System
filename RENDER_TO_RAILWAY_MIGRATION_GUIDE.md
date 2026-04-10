# 🚂 Complete Migration Guide: Render → Railway

## Overview
This guide will walk you through migrating your ARAI System backend from Render to Railway. Railway offers better free tier pricing, better performance, and easier deployment.

### Why Railway?
| Feature | Render | Railway | Winner |
|---------|--------|---------|--------|
| Free Tier | $7/month (limited) | $5/month credit | Railway ✓ |
| Cold Start | 30-60 seconds | 1-3 seconds | Railway ✓ |
| Disk Space | Limited | 10GB | Railway ✓ |
| Database | Separate cost | Included | Railway ✓ |
| Deployment | Manual | Auto from GitHub | Railway ✓ |
| Pricing | Expensive | Affordable | Railway ✓ |

---

## Prerequisites

### What You Need
- [ ] Railway account (create at https://railway.app)
- [ ] GitHub account with your project
- [ ] Current Render project URL
- [ ] Environment variables from Render
- [ ] Your backend code (FastAPI)

### Estimated Time
- Setup: 30 minutes
- Deployment: 10 minutes
- Testing: 15 minutes
- **Total: 55 minutes**

---

## STEP 1: Create Railway Account

### 1.1 Sign Up
1. Go to https://railway.app
2. Click "Sign Up"
3. Sign in with GitHub (recommended)
4. Authorize Railway to access your GitHub repos

### 1.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Search for "arai-system"
4. Click to authorize GitHub access
5. Select your repository

---

## STEP 2: Configure Your Project

### 2.1 Project Settings
Once your repo is connected:

1. Click on your project
2. Go to "Settings" tab
3. Configure these settings:
   - **Project Name:** `arai-system-backend`
   - **Region:** Choose closest to users (e.g., `us-east` for USA)
   - **Automatic Deployments:** Enable

### 2.2 Create Service
1. Click "New Service"
2. Select "GitHub Repo"
3. Choose your repository branch (main)
4. Railway will auto-detect FastAPI

---

## STEP 3: Add Environment Variables

### 3.1 Get Current Environment Variables
From Render dashboard:
1. Go to your current service
2. Click "Environment"
3. Copy all variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_BUCKET=your_bucket_name
   DATABASE_URL=your_postgres_url
   CORS_ORIGINS=https://your-frontend-url
   LITE_MODE=false
   ```

### 3.2 Add to Railway
In Railway dashboard:

1. Click your service
2. Go to "Variables" tab
3. Click "New Variable" for each:

```
SUPABASE_URL = paste_from_render
SUPABASE_KEY = paste_from_render
SUPABASE_BUCKET = paste_from_render
DATABASE_URL = paste_from_render
CORS_ORIGINS = https://your-frontend-url
LITE_MODE = false
PYTHON_VERSION = 3.11.9
PYTHONUNBUFFERED = 1
```

**IMPORTANT:** Keep these exact (Render → Railway)

---

## STEP 4: Configure Deployment Settings

### 4.1 Add Procfile (Optional but Recommended)
Create `Procfile` in backend root:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 4.2 Add railway.json
Create `railway.json` in project root:

```json
{
  "handle": "arai-system-backend",
  "baseDirectory": "backend",
  "entrypoint": "Procfile"
}
```

### 4.3 Update Dockerfile (if using)
Your existing Dockerfile should work, but ensure:
- [ ] Uses Python 3.11
- [ ] Installs Tesseract OCR
- [ ] Port is 8000 or configurable via $PORT
- [ ] Has EXPOSE instruction

---

## STEP 5: Configure Domains & CORS

### 5.1 Get Railway Domain
In Railway:
1. Click your service
2. Go to "Settings"
3. Under "Networking", note your Railway domain:
   ```
   your-service.up.railway.app
   ```

### 5.2 Update Frontend Environment
In `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-service.up.railway.app/api/v1
```

### 5.3 Update CORS
In Railway variables, update:
```
CORS_ORIGINS=https://your-frontend-url.vercel.app,https://your-service.up.railway.app
```

---

## STEP 6: Database & Storage Setup

### 6.1 Keep Existing Supabase
You don't need to change anything if using Supabase:
- Your Supabase database continues to work
- Just update connection string in Railway
- All your data stays intact

### 6.2 Update Storage Bucket URL
If using Supabase Storage:
1. Get your bucket URL from Supabase
2. Verify it works with Railway backend
3. Update any hardcoded URLs in your code

---

## STEP 7: Deploy & Test

### 7.1 Deploy
Railway auto-deploys when you push to GitHub:

```bash
# Just commit and push to GitHub
git add .
git commit -m "Migrate to Railway"
git push origin main
```

Watch the deployment:
1. Go to Railway dashboard
2. Click your service
3. Watch "Deployments" tab for progress
4. Should take 2-5 minutes

### 7.2 Check Logs
In Railway:
1. Click "Logs" tab
2. Look for:
   ```
   ✅ Uvicorn running on http://0.0.0.0:8000
   ✅ Application startup complete
   ```

### 7.3 Test API
```bash
# Get your Railway URL
curl https://your-service.up.railway.app/api/v1/health

# Should return:
# {"status": "ok"}
```

---

## STEP 8: Migrate Data (if needed)

### 8.1 Database Migration
If you were using Render database:

**Option A: Keep Supabase (Recommended)**
- You're already on Supabase
- No migration needed
- Just update connection string

**Option B: Create Railway PostgreSQL**
1. In Railway project
2. Click "Create"
3. Select "PostgreSQL"
4. Railway creates database automatically
5. Use provided connection string

### 8.2 Export Old Data (if needed)
From Render:
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Import to Railway
psql $NEW_DATABASE_URL < backup.sql
```

---

## STEP 9: Monitor & Optimize

### 9.1 Monitor Performance
In Railway:

1. **Metrics Tab**
   - CPU usage
   - Memory usage
   - Request count
   - Response time

2. **Logs Tab**
   - Real-time logs
   - Error tracking
   - Performance insights

### 9.2 Set Up Alerts (Optional)
In Railway:
1. Go to "Settings"
2. Enable "Email Notifications"
3. Alert on deployment failures
4. Alert on high resource usage

### 9.3 Scale Resources (if needed)
In Railway:
1. Go to "Settings"
2. Under "CPU/Memory":
   - Start: 0.5 CPU, 512MB RAM
   - If slow, increase to 1 CPU, 1GB RAM
   - Usually free tier is enough

---

## STEP 10: Update Other Services

### 10.1 Update Frontend API URL
In Vercel or your frontend host:
1. Go to deployment settings
2. Update environment variables:
   ```
   REACT_APP_API_URL=https://your-service.up.railway.app/api/v1
   ```
3. Redeploy frontend

### 10.2 Update Any External Services
If using APIs that whitelist domains:
1. Add new Railway domain to whitelist
2. Remove old Render domain

### 10.3 Update Documentation
- [ ] Update README.md with new API URL
- [ ] Update DEPLOYMENT_GUIDE.md
- [ ] Update team documentation

---

## STEP 11: Decommission Render (Optional)

### 11.1 Verify Everything Works
Before deleting:
1. [ ] Backend API responding
2. [ ] Frontend can call API
3. [ ] Database working
4. [ ] Storage working
5. [ ] Authentication working

### 11.2 Keep Render Active (Recommended)
For 1-2 weeks:
- Keep Render service running
- Have fallback if Railway issues
- Easy to roll back if needed

### 11.3 Delete Render (When Ready)
When confident:
1. Go to Render dashboard
2. Select your service
3. Click "Settings" → "Delete Service"
4. Confirm deletion
5. You're done! 🎉

---

## Troubleshooting

### Issue: Deployment Failed
**Cause:** Missing dependencies or wrong Python version

**Solution:**
1. Check logs in Railway dashboard
2. Ensure `requirements.txt` is in backend root
3. Verify `runtime.txt` has `python-3.11.9`
4. Check Dockerfile uses correct Python version

### Issue: API Not Responding
**Cause:** Environment variables not set correctly

**Solution:**
1. Verify all variables in Railway
2. Check SUPABASE_URL and SUPABASE_KEY
3. Test locally:
   ```bash
   export SUPABASE_URL=your_url
   export SUPABASE_KEY=your_key
   uvicorn app.main:app --reload
   ```

### Issue: CORS Errors
**Cause:** Frontend domain not in CORS_ORIGINS

**Solution:**
1. Get your frontend URL
2. Add to Railway variables:
   ```
   CORS_ORIGINS=https://frontend-url.vercel.app
   ```
3. Redeploy

### Issue: Database Connection Failed
**Cause:** DATABASE_URL not set or wrong format

**Solution:**
1. Copy exact connection string from Supabase
2. Paste into Railway variables
3. Ensure no extra spaces or quotes
4. Restart service (click "Restart" in Railway)

### Issue: Slow Response Time
**Cause:** Low resources or cold start

**Solution:**
1. Increase CPU/Memory in Railway settings
2. Enable "Always On" (if available)
3. Check for long-running tasks
4. Optimize database queries

### Issue: Memory Usage High
**Cause:** PyTorch or large models

**Solution:**
1. Ensure LITE_MODE=true (removes PyTorch)
2. Or increase memory allocation
3. Check for memory leaks in code
4. Monitor with Railway metrics

---

## Verification Checklist

Before declaring migration complete:

### Deployment
- [ ] Railway project created
- [ ] GitHub repo connected
- [ ] Auto-deployments enabled
- [ ] Service is "Running"

### Configuration
- [ ] All environment variables set
- [ ] Python version is 3.11.9
- [ ] CORS_ORIGINS updated
- [ ] Database URL correct

### Testing
- [ ] API health check passes
- [ ] Frontend can call API
- [ ] Authentication works
- [ ] File uploads work
- [ ] Analysis runs correctly

### Performance
- [ ] Response time < 2 seconds
- [ ] CPU usage < 50%
- [ ] Memory usage < 80%
- [ ] No error messages in logs

### Cleanup
- [ ] Frontend environment variables updated
- [ ] Documentation updated
- [ ] Team notified
- [ ] Old Render service backed up

---

## Cost Comparison

### Monthly Cost

**Render:**
- Service: $7/month
- Database: $7/month (if separate)
- Storage: $5/month
- **Total: $19+/month**

**Railway:**
- $5/month credit (usually enough)
- PostgreSQL included
- Storage included
- **Total: $0-5/month**

**Savings: $14-19/month! 💰**

---

## Command Reference

### Git Commands
```bash
# Commit migration changes
git add .
git commit -m "Migrate backend to Railway"
git push origin main

# View recent commits
git log --oneline -5

# Rollback if needed
git revert <commit-id>
git push origin main
```

### Testing Commands
```bash
# Test API health
curl https://your-service.up.railway.app/api/v1/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-service.up.railway.app/api/v1/analysis

# Check environment variables (in Railway logs)
echo $DATABASE_URL
echo $SUPABASE_URL
```

### Local Testing
```bash
# Set environment variables
export SUPABASE_URL=your_url
export SUPABASE_KEY=your_key
export CORS_ORIGINS=http://localhost:3000

# Run FastAPI
cd backend
uvicorn app.main:app --reload --port 8000

# Test API
curl http://localhost:8000/api/v1/health
```

---

## Helpful Resources

- **Railway Docs:** https://docs.railway.app
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment
- **Supabase Guide:** https://supabase.com/docs
- **Python 3.11:** https://www.python.org/downloads/release/python-3119
- **Railway CLI:** https://docs.railway.app/cli/overview

---

## Next Steps

1. **Immediate (Today)**
   - [ ] Create Railway account
   - [ ] Connect GitHub repo
   - [ ] Set environment variables
   - [ ] Deploy

2. **Short Term (This Week)**
   - [ ] Test thoroughly
   - [ ] Update frontend
   - [ ] Monitor performance
   - [ ] Document changes

3. **Long Term (This Month)**
   - [ ] Optimize costs
   - [ ] Set up monitoring
   - [ ] Plan scaling
   - [ ] Archive Render

---

## Support & Help

If you get stuck:

1. **Check Logs**
   - Railway dashboard → Logs tab
   - Look for error messages

2. **Check Variables**
   - Railway dashboard → Variables tab
   - Ensure all required vars are set

3. **Test Locally**
   - Run backend locally with same env vars
   - See if you can reproduce issue

4. **Railway Support**
   - Go to https://railway.app/support
   - Join Railway Discord community

---

## Success! 🎉

You've successfully migrated from Render to Railway!

**Benefits:**
- ✅ Faster deployment
- ✅ Better performance
- ✅ Lower costs
- ✅ Easier scaling
- ✅ Better free tier

**Next:** Monitor your Railway service and enjoy the improved performance!

---

## FAQ

**Q: Will my users experience downtime?**
A: Minimal (< 1 minute during deployment). Keep Render running as fallback during transition.

**Q: Can I rollback if something breaks?**
A: Yes! Keep Render service active for 1-2 weeks. Can switch back anytime.

**Q: Do I lose my data?**
A: No! Data stays in Supabase. Railway just hosts your code.

**Q: Is Railway as reliable as Render?**
A: Yes! Railway has 99.9% uptime SLA and better infrastructure.

**Q: Can I use a custom domain?**
A: Yes! Railway supports custom domains. Configure in Settings.

**Q: How do I monitor Railway?**
A: Railway dashboard has metrics, logs, and alerts built-in.

**Q: Can I still use Render?**
A: Yes! Railway and Render can coexist. You choose which to use.

**Q: What about security?**
A: Railway uses same security practices as Render. All data encrypted in transit.

**Q: Can I scale easily?**
A: Yes! Railway has automatic scaling and pay-as-you-go pricing.

**Q: How is Railway's customer support?**
A: Railway has 24/7 support via Discord, email, and docs.

---

**You're all set! Happy deploying! 🚀**
