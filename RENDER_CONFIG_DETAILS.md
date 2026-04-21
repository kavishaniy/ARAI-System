# Render Configuration Details

## Service Configuration

When creating the Web Service on Render, use these EXACT settings:

### Basic Settings
```
Name:                    arai-backend
Environment:             Python 3
Region:                  Singapore (or closest to you)
Branch:                  main
Root Directory:          .
Runtime:                 Python
Plan:                    Starter ($7/month recommended)
```

### Build & Deploy Settings
```
Build Command:           pip install -r backend/requirements.txt
Start Command:           uvicorn app.main:app --host 0.0.0.0 --port $PORT
Auto-deploy:             Yes (default)
```

### Environment Variables
All of these MUST be set:

```
SUPABASE_URL=https://omguovoobfiuaooupzsw.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZ3Vvdm9vYmZpdWFvb3VwenN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDY1NjAsImV4cCI6MjA4NTE4MjU2MH0.BRRME2aqnHXqotxoY045SUDchaZ5govCikVOF1HtEeU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZ3Vvdm9vYmZpdWFvb3VwenN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYwNjU2MCwiZXhwIjoyMDg1MTgyNTYwfQ.Pad--fqML_zfXONlyKG6tC3O6G0ZJR1blJ6NbWStqH8
SECRET_KEY=sb_secret_7fmbD60R0bYRGtrL81hA1Q_VLWdN0W6
SESSION_SECRET_KEY=arai_session_secret_key_change_in_production
FIGMA_API_TOKEN=figd_LULtMcOVu8m1uy_eO3DDYQCI4vguojh2A1IvEku9
FIGMA_CLIENT_ID=0zUuRy2IrZ4IeA98hRRhF8
FIGMA_CLIENT_SECRET=gCva505ietO1MLe0JpJfj4V2Owwz6n
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://arai-system.vercel.app,https://arai-system-git-main-kavishaniy.vercel.app,https://arai-system-kavishaniy.vercel.app
FRONTEND_URL=https://arai-system.vercel.app
PYTHONUNBUFFERED=1
```

---

## Expected Behavior After Deployment

### Healthy State
- ✅ Build completes in 2-5 minutes
- ✅ Service shows "Live" status
- ✅ Logs show no errors
- ✅ `https://your-service.onrender.com/health` returns `{"status":"healthy"}`
- ✅ `https://your-service.onrender.com/` returns API info

### First Request After Sleep (Free Tier Only)
- Takes 30-60 seconds to respond
- This is normal - service is waking up
- Upgrade to Starter ($7/mo) to avoid this

---

## Common Build Issues & Solutions

### Issue: "requirements.txt not found"
**Solution:** 
- Build command should be: `pip install -r backend/requirements.txt`
- Root directory should be: `.`
- Don't set a custom root directory if repo structure is correct

### Issue: "Python version mismatch"
**Solution:**
- Render defaults to Python 3.13+ which is compatible
- Our code requires Python 3.11+
- If needed, create `runtime.txt` with: `python-3.11.9`

### Issue: "Build fails with dependency error"
**Solution:**
- Check all packages in `requirements.txt` are available
- Some packages may need system dependencies
- If it fails, check Render build logs for specific error

---

## After Successful Deployment

1. **Get Your URL:**
   - Go to Render dashboard
   - Find "Public Domain" section
   - Example: `https://arai-backend.onrender.com`

2. **Update Vercel:**
   ```
   REACT_APP_API_URL=https://arai-backend.onrender.com/api/v1
   ```

3. **Update ALLOWED_ORIGINS (if needed):**
   - Current setting accepts all your Vercel URLs
   - Should work as-is

4. **Test Connection:**
   ```bash
   curl https://arai-backend.onrender.com/health
   curl https://arai-backend.onrender.com/
   ```

---

## Plan Comparison

| Feature | Free | Starter | Professional |
|---------|------|---------|---------------|
| **Cost** | $0 | $7/mo | $25/mo |
| **Always-on** | ❌ (sleeps) | ✅ | ✅ |
| **Sleep after** | 15 min | Never | Never |
| **Restart time** | 30-60 sec | Instant | Instant |
| **RAM** | 512 MB | 512 MB | 1 GB+ |
| **CPU** | Shared | Shared | Dedicated |
| **Recommended** | Testing only | **Production** | Large scale |

**For your FYP: Choose Starter ($7/month)** ✅

---

## Useful Render Dashboard Features

- **Logs:** View real-time logs of your service
- **Metrics:** CPU, memory, disk usage
- **Environment:** Add/edit environment variables
- **Deploys:** See all previous deployments
- **Auto-deploy:** Can disable if needed
- **Manual Redeploy:** Button to trigger new build

---

## Need More Help?

- Render Docs: https://render.com/docs
- Python Deployment: https://render.com/docs/python
- Troubleshooting: https://render.com/docs/troubleshooting
