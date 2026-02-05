# CORS Error Fix - Vercel to Render Connection

## Problem
After deployment, the Vercel frontend cannot communicate with the Render backend due to CORS policy:

```
Access to XMLHttpRequest at 'https://arai-system.onrender.com/api/v1/analysis/upload' 
from origin 'https://arai-system.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
- Frontend on Vercel: `https://arai-system.vercel.app`
- Backend on Render: `https://arai-system.onrender.com`
- CORS (Cross-Origin Resource Sharing) security prevents one domain from accessing another
- Backend must explicitly allow the frontend's domain

## Solution Implemented

### 1. **Dynamic CORS Middleware** (`backend/app/main.py`)
✅ Added custom middleware to handle Vercel preview URLs dynamically
✅ Automatically allows all `*.vercel.app` domains (your preview deployments)
✅ Handles preflight OPTIONS requests properly
✅ Maintains security by validating origins

### 2. **Explicit Origin List**
Added these origins:
- `http://localhost:3000` - Local development
- `http://localhost:5173` - Vite dev server
- `https://arai-system.vercel.app` - Production Vercel
- `https://arai-system-kavishaniy.vercel.app` - Vercel preview
- All `*.vercel.app` URLs via pattern matching

### 3. **OPTIONS Request Handler**
Handles browser preflight checks for CORS compliance

## Deployment Steps

### Step 1: Deploy Backend Changes to Render

```bash
cd /Users/kavishani/Documents/FYP/arai-system

# Commit backend changes
git add backend/app/main.py
git commit -m "Fix: Add dynamic CORS middleware for Vercel preview URLs"
git push origin main
```

### Step 2: Set Environment Variable on Render (Optional)

1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Add/Update environment variable:
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://arai-system.vercel.app,https://arai-system-kavishaniy.vercel.app`
5. Click **Save Changes**
6. Render will automatically redeploy

### Step 3: Verify Deployment

Wait for Render to finish deploying (2-5 minutes), then check:

1. **Check Backend Health**:
   ```bash
   curl https://arai-system.onrender.com/health
   ```
   Should return: `{"status":"healthy"}`

2. **Check CORS Debug Endpoint**:
   ```bash
   curl https://arai-system.onrender.com/debug/cors
   ```
   Should show allowed origins

3. **Test from Browser**:
   - Open https://arai-system.vercel.app
   - Login and try to upload a design
   - Check browser console for CORS errors (should be gone!)

## Alternative: Quick Test with Wildcard (NOT RECOMMENDED FOR PRODUCTION)

If you need immediate testing, temporarily use wildcard CORS:

```python
# In backend/app/main.py (TEMPORARY ONLY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # WARNING: Insecure, only for testing
    allow_credentials=False,  # Must be False with "*"
    allow_methods=["*"],
    allow_headers=["*"],
)
```

⚠️ **WARNING**: This is insecure and should only be used for testing. Remove after confirming it works.

## Render Configuration Checklist

### Environment Variables on Render:
Ensure these are set:

```env
ENVIRONMENT=production
ALLOWED_ORIGINS=https://arai-system.vercel.app,https://arai-system-kavishaniy.vercel.app
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
```

### Render Service Settings:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment**: Python 3.11
- **Auto-Deploy**: Enabled (from main branch)

## Vercel Configuration

Your `vercel.json` should have:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://arai-system.onrender.com/api/v1"
  }
}
```

## Testing After Deployment

### Test 1: Browser Console
1. Open https://arai-system.vercel.app
2. Open DevTools (F12)
3. Go to Network tab
4. Try to upload a design
5. Look for the upload request
6. Check Response Headers should include:
   - `Access-Control-Allow-Origin: https://arai-system.vercel.app`
   - `Access-Control-Allow-Credentials: true`

### Test 2: curl from Command Line
```bash
# Test OPTIONS request (preflight)
curl -X OPTIONS \
  -H "Origin: https://arai-system.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -v \
  https://arai-system.onrender.com/api/v1/analysis/upload

# Should return 200 with CORS headers
```

### Test 3: Check Render Logs
1. Go to Render dashboard
2. Select your service
3. Go to **Logs** tab
4. Look for CORS configuration output:
   ```
   🔧 CORS Configuration:
      ALLOWED_ORIGINS env var: https://arai-system.vercel.app
      Configured origins: ['http://localhost:3000', ...]
      Environment: production
   ```
5. When you make a request from Vercel, should see:
   ```
   ✅ Allowing Vercel preview URL: https://arai-system.vercel.app
   ```

## Troubleshooting

### Issue: Still getting CORS error after deployment
**Solution**: 
1. Wait 5-10 minutes for Render to fully deploy
2. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
3. Clear browser cache
4. Check Render logs to confirm new code is deployed

### Issue: Render not auto-deploying
**Solution**:
1. Go to Render dashboard
2. Click **Manual Deploy** > **Deploy latest commit**

### Issue: Environment variable not picked up
**Solution**:
1. After setting env vars in Render, click **Manual Deploy**
2. Check logs to see if new value is printed

### Issue: Works locally but not on Vercel
**Solution**:
1. Verify `REACT_APP_API_URL` in Vercel environment variables
2. Go to Vercel dashboard > Your Project > Settings > Environment Variables
3. Ensure `REACT_APP_API_URL=https://arai-system.onrender.com/api/v1`
4. Redeploy Vercel

### Issue: Render service sleeping (free tier)
**Solution**:
1. Render free tier services sleep after 15 min of inactivity
2. First request takes 30-60 seconds to wake up
3. This can cause timeout/CORS errors
4. Solution: Upgrade to paid tier OR set up a keep-alive ping

## Keep Render Service Awake (Free Tier Workaround)

Create a simple cron job or use a service like cron-job.org:

```bash
# Ping every 10 minutes
*/10 * * * * curl https://arai-system.onrender.com/health
```

Or use a monitoring service like:
- UptimeRobot (https://uptimerobot.com) - Free
- Pingdom - Free tier available
- Better Stack (formerly Better Uptime)

## Security Notes

✅ **Good**: Dynamic validation of Vercel domains
✅ **Good**: Credentials enabled for authenticated requests
✅ **Good**: Explicit allowed origins list
⚠️ **Warning**: Pattern matching all `.vercel.app` domains
🔒 **Recommended**: Add rate limiting for production

## Expected Behavior After Fix

1. ✅ User opens Vercel frontend
2. ✅ Logs in successfully
3. ✅ Uploads design - no CORS error
4. ✅ Backend processes request
5. ✅ Results displayed on frontend

## Monitoring

After deployment, monitor:
- Render service logs for CORS messages
- Vercel deployment logs
- Browser console for any remaining errors
- Response times (Render free tier can be slow)

## Next Steps

1. **Deploy backend** with CORS fixes
2. **Wait for Render** to finish deployment
3. **Test on Vercel** frontend
4. **Monitor logs** for any issues
5. **Consider paid tier** if free tier sleeping is an issue

## Support

If issues persist:
1. Check Render service status page
2. Verify Supabase is accessible
3. Check all environment variables are set correctly
4. Review Render and Vercel logs for specific errors
