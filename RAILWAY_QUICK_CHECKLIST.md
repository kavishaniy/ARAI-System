# ⚡ Railway Migration - Quick Checklist

## Pre-Migration (Do First)

- [ ] Create Railway account at https://railway.app
- [ ] Have your GitHub credentials ready
- [ ] Copy environment variables from Render
- [ ] Note your Render API URL
- [ ] Backup your Render environment variables

---

## Step-by-Step Deployment

### 1. Create Railway Project (5 min)
```
1. Go to railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your arai-system repository
5. Select "backend" folder (optional)
```
- [ ] Project created
- [ ] Repository connected
- [ ] Deployment started

### 2. Configure Variables (5 min)
```
In Railway Dashboard → Variables:
```

| Variable | Value |
|----------|-------|
| SUPABASE_URL | `paste from Render` |
| SUPABASE_KEY | `paste from Render` |
| SUPABASE_BUCKET | `paste from Render` |
| DATABASE_URL | `paste from Render` |
| CORS_ORIGINS | `https://your-frontend-url` |
| LITE_MODE | `false` |
| PYTHON_VERSION | `3.11.9` |
| PYTHONUNBUFFERED | `1` |

- [ ] All variables added
- [ ] Values copied correctly
- [ ] No extra spaces or quotes

### 3. Check Deployment (5 min)
```
In Railway Dashboard → Deployments:
```
- [ ] Deployment showing "Running"
- [ ] No error messages
- [ ] Logs showing "Application startup complete"

### 4. Get Railway Domain (1 min)
```
In Railway Dashboard → Settings:
```
Copy your domain:
```
https://your-service.up.railway.app
```
- [ ] Domain copied
- [ ] Tested in browser: should show API docs

### 5. Update Frontend (5 min)
In `frontend/.env.production`:
```env
REACT_APP_API_URL=https://your-service.up.railway.app/api/v1
```

Then deploy frontend:
```bash
git add .
git commit -m "Update API URL to Railway"
git push
```

- [ ] Frontend environment updated
- [ ] Frontend redeployed
- [ ] API calls working

### 6. Test Everything (10 min)
Test all features:
- [ ] Health check: `curl https://your-service.up.railway.app/api/v1/health`
- [ ] Login works
- [ ] Upload design works
- [ ] Analysis completes
- [ ] Results display
- [ ] No CORS errors

### 7. Monitor Performance (5 min)
In Railway:
1. Go to "Metrics" tab
2. Check:
   - [ ] CPU usage < 50%
   - [ ] Memory usage < 80%
   - [ ] Response time < 2 seconds
   - [ ] No errors in logs

### 8. Optional: Delete Render (2 min)
When confident (after 1-2 weeks):
```
1. Go to Render.com
2. Select service
3. Settings → Delete Service
4. Confirm deletion
```

- [ ] Backup taken
- [ ] Railway confirmed working
- [ ] Team notified
- [ ] Service deleted

---

## Total Time: ~40 minutes

---

## Quick Commands

```bash
# Test API is working
curl https://your-service.up.railway.app/api/v1/health

# Check if Railway domain works
curl -I https://your-service.up.railway.app

# Monitor logs locally
# (In Railway dashboard → Logs tab)

# Commit changes to trigger deployment
git add .
git commit -m "Railway migration"
git push origin main
```

---

## Environment Variables Template

Copy this and fill in your values:

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
SUPABASE_BUCKET=your_bucket_name_here
DATABASE_URL=postgresql://user:password@host/db
CORS_ORIGINS=https://your-frontend-url.vercel.app
LITE_MODE=false
PYTHON_VERSION=3.11.9
PYTHONUNBUFFERED=1
```

---

## Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| Deployment failed | Check "Logs" in Railway dashboard |
| API not responding | Verify SUPABASE_URL and SUPABASE_KEY variables |
| CORS errors | Add frontend URL to CORS_ORIGINS variable |
| Slow response | Increase CPU/Memory in Railway Settings |
| High memory usage | Set LITE_MODE=true |

---

## Success Indicators ✅

You're done when:

- ✅ Railway service shows "Running"
- ✅ API responds to curl commands
- ✅ Frontend can call API without CORS errors
- ✅ Analysis features work end-to-end
- ✅ No errors in Railway logs
- ✅ Performance metrics are good

---

## Important URLs

- **Railway Dashboard:** https://railway.app/dashboard
- **Your Service:** https://your-service.up.railway.app
- **API Docs:** https://your-service.up.railway.app/docs
- **Logs:** In Railway dashboard → Logs tab
- **Metrics:** In Railway dashboard → Metrics tab

---

## Files Created for Railway

- ✅ `Procfile` - Railway startup command
- ✅ `railway.json` - Railway configuration
- ✅ `requirements.txt` - Python dependencies (already exists)
- ✅ `Dockerfile` - Container configuration (already exists)
- ✅ `runtime.txt` - Python version (already exists)

---

## Estimated Costs

| Platform | Free Tier | Typical Cost |
|----------|-----------|--------------|
| Render | $0 (limited) | $14+/month |
| Railway | $5 credit | $0-5/month |

**You save: $9-14/month! 💰**

---

## Need Help?

1. **Check Logs** → Railway dashboard → Logs tab
2. **Check Variables** → Railway dashboard → Variables tab
3. **Check Status** → Railway dashboard → Service status
4. **Railway Support** → https://railway.app/support
5. **Discord Community** → Join Railway Discord

---

**Good luck! You've got this! 🚀**
