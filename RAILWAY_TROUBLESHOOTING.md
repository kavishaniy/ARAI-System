# 🔧 Railway Migration - Troubleshooting Guide

## Issue 1: Deployment Failed with Python Error

### Error Message
```
ERROR: failed to build image: error building image: error executing
build step: exit status 1
```

### Causes
1. Missing `runtime.txt` with Python version
2. Incompatible dependencies
3. Missing system dependencies

### Solutions

**Solution 1: Verify runtime.txt**
```
File: /backend/runtime.txt
Content: python-3.11.9
```

Ensure it exists and has correct format.

**Solution 2: Check requirements.txt**
```bash
# Verify all dependencies are compatible with Python 3.11
pip install -r backend/requirements.txt --dry-run

# Check for conflicting versions
pip check
```

**Solution 3: Add missing system dependencies**

Update Dockerfile to include:
```dockerfile
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1-mesa-glx \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
```

**Solution 4: Rebuild in Railway**
1. Go to Railway dashboard
2. Click your service
3. Go to "Deployments"
4. Click "Redeploy latest commit"
5. Watch logs for errors

---

## Issue 2: API Returns 500 Error

### Error Message
```
HTTP 500: Internal Server Error
```

### Causes
1. Environment variables not set
2. Database connection failed
3. Missing dependencies
4. Code error in FastAPI app

### Solutions

**Solution 1: Verify Environment Variables**
```
In Railway Dashboard → Variables tab:

Required variables:
✓ SUPABASE_URL - Not empty
✓ SUPABASE_KEY - Not empty
✓ CORS_ORIGINS - Your frontend URL
```

**Solution 2: Check Database Connection**
```bash
# Test Supabase connection locally
python -c "
import os
from supabase import create_client

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')

client = create_client(url, key)
print('✅ Connection successful')
"
```

**Solution 3: View Logs**
```
In Railway Dashboard → Logs tab:
- Look for red error messages
- Note the line number and error
- Search error in your code
- Fix and push to GitHub
```

**Solution 4: Test Health Endpoint**
```bash
curl https://your-service.up.railway.app/api/v1/health

# Should return:
# {"status":"ok"}
```

If health endpoint fails, the issue is in app startup.

---

## Issue 3: CORS Errors in Frontend

### Error Message
```
Access to XMLHttpRequest at 'https://your-service.up.railway.app/api/v1/...'
from origin 'https://your-frontend.vercel.app' has been blocked by CORS policy
```

### Causes
1. Frontend URL not in CORS_ORIGINS
2. CORS_ORIGINS has wrong format
3. CORS_ORIGINS has typo

### Solutions

**Solution 1: Check CORS Variable**
```
In Railway → Variables:

CORS_ORIGINS = https://your-frontend.vercel.app

NOT:
CORS_ORIGINS = your-frontend.vercel.app
CORS_ORIGINS = http://your-frontend.vercel.app
CORS_ORIGINS = https://your-frontend.vercel.app/
```

**Solution 2: Support Multiple Domains**
```
CORS_ORIGINS = https://your-frontend.vercel.app,https://www.your-domain.com

(Comma-separated, no spaces)
```

**Solution 3: Test CORS Locally**
```bash
# In backend root
export CORS_ORIGINS=http://localhost:3000
uvicorn app.main:app --reload

# From frontend, test API call
fetch('http://localhost:8000/api/v1/health')
  .then(r => r.json())
  .then(console.log)
```

**Solution 4: Restart Service**
```
In Railway → your service:
Click "Restart" button
Wait for service to restart
Try API call again
```

---

## Issue 4: API Calls Timeout

### Error Message
```
ERR_CONNECTION_TIMEOUT
Request timeout after 40000ms
```

### Causes
1. Analysis takes too long
2. Cold start (service waking up)
3. Insufficient resources
4. Network latency

### Solutions

**Solution 1: Increase Request Timeout**
In frontend code:
```javascript
const response = await axios.post(
  url,
  data,
  {
    headers: { 'Authorization': `Bearer ${token}` },
    timeout: 60000  // Increase from 40000 to 60000ms
  }
);
```

**Solution 2: Increase Railway Resources**
```
In Railway → Settings:
- CPU: Set to 1.0 (or higher)
- Memory: Set to 1GB (or higher)
- Cost: May affect billing
```

**Solution 3: Enable Keep-Alive**
```
In Railway → Variables:
Add: PYTHONUNBUFFERED=1
```

**Solution 4: Check Service Status**
```
In Railway → Metrics:
- Is service using CPU?
- Is service using Memory?
- Any crashes in logs?
```

---

## Issue 5: High Memory Usage

### Symptoms
```
Service using 80%+ of available memory
Memory keeps increasing over time
Service restarts frequently
```

### Causes
1. PyTorch models loaded (if LITE_MODE=false)
2. Memory leak in code
3. Large file uploads
4. Insufficient allocated memory

### Solutions

**Solution 1: Enable LITE_MODE**
```
In Railway → Variables:
LITE_MODE = true

This disables PyTorch and saves ~300MB
```

**Solution 2: Increase Memory**
```
In Railway → Settings:
- Increase memory allocation
- Start with 1GB, monitor usage
- May increase costs
```

**Solution 3: Find Memory Leak**
```python
# Add to your code to track memory
import psutil
import os

process = psutil.Process(os.getpid())
mem = process.memory_info().rss / 1024 / 1024  # MB
print(f"Memory usage: {mem}MB")
```

**Solution 4: Restart Service Regularly**
```
In Railway → Settings:
- Look for auto-restart options
- Or manually restart in Deployments
```

---

## Issue 6: Database Connection Failed

### Error Message
```
Failed to connect to database
Connection refused
FATAL: password authentication failed
```

### Causes
1. DATABASE_URL is wrong
2. Supabase credentials expired
3. Database down
4. Wrong credentials

### Solutions

**Solution 1: Verify DATABASE_URL**
```
In Railway → Variables:

DATABASE_URL should be:
postgresql://user:password@host:5432/database

NOT:
postgres://...  (deprecated)
Just the hostname (incomplete)
```

**Solution 2: Get Fresh Credentials**
```
From Supabase:
1. Go to supabase.com
2. Select your project
3. Settings → Database → Connection string
4. Copy "URI" connection string
5. Paste into Railway DATABASE_URL
```

**Solution 3: Test Connection Locally**
```bash
# Set environment variable
export DATABASE_URL="postgresql://user:pass@host/db"

# Test connection
python -c "
import psycopg2
import os

try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    print('✅ Connection successful')
except Exception as e:
    print(f'❌ Connection failed: {e}')
"
```

**Solution 4: Check Supabase Status**
```
1. Go to status.supabase.io
2. Check if there are incidents
3. Wait if database is restarting
4. Retry connection
```

---

## Issue 7: Service Won't Start

### Symptoms
```
Service keeps restarting
Error in logs on startup
Never reaches "Application startup complete"
```

### Causes
1. Import error in app.main
2. Invalid environment variables
3. Missing dependencies
4. Syntax error in code

### Solutions

**Solution 1: Check Logs**
```
In Railway → Logs:
- Find the first error message
- Note the error type and line
- Fix in your code
```

**Solution 2: Test Locally**
```bash
cd backend
python -c "from app.main import app"

# If error, it will show here
# Fix error and retry
```

**Solution 3: Install Missing Dependencies**
```bash
# Check if all imports can be imported
cd backend
python -c "
import fastapi
import uvicorn
import pydantic
import supabase
# Add all imports from your code
"

# If any fail, add to requirements.txt
```

**Solution 4: Verify Startup Command**
```
In Railway or Procfile:
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT

Should not have:
- Typos in "app.main:app"
- Invalid port numbers
- Python syntax errors
```

---

## Issue 8: File Upload Fails

### Error Message
```
413 Payload Too Large
File upload exceeds maximum size
```

### Causes
1. File size > 10MB limit
2. Request body limit set too low
3. Network connection interrupted
3. Storage quota exceeded

### Solutions

**Solution 1: Increase FastAPI Size Limit**
In `app/main.py`:
```python
from fastapi import FastAPI

app = FastAPI()

# Add this before your routes
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    max_upload_file_size=10 * 1024 * 1024  # 10MB
)
```

**Solution 2: Check Supabase Storage Quota**
```
In Supabase:
1. Go to Storage
2. Check usage vs quota
3. Increase quota if needed
```

**Solution 3: Test Upload Locally**
```bash
# Test 10MB file upload
curl -X POST \
  http://localhost:8000/api/v1/analysis/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-design.png"
```

**Solution 4: Check Network**
```
If upload fails midway:
- Check internet connection
- Try with smaller file
- Try from different network
```

---

## Issue 9: Analysis Takes Too Long

### Symptoms
```
Analysis request times out
Takes >5 minutes to complete
Frontend shows "analyzing..." forever
```

### Causes
1. PyTorch models are slow (if LITE_MODE=false)
2. Insufficient CPU resources
3. Complex image processing
4. First request (models loading)

### Solutions

**Solution 1: Enable LITE_MODE** (Fast)
```
In Railway → Variables:
LITE_MODE = true

- Disables PyTorch
- Uses CPU: ~30 seconds
- Disables attention analysis
```

**Solution 2: Increase CPU** (Better Quality)
```
In Railway → Settings:
- Increase CPU to 1.0 or 2.0
- Keep LITE_MODE=false
- More cost but better features
```

**Solution 3: Optimize Image Processing**
```python
# In your analyzer, compress image first
from PIL import Image

img = Image.open('design.png')
# Resize if > 2000x2000
if img.width > 2000 or img.height > 2000:
    img.thumbnail((2000, 2000), Image.LANCZOS)
    img.save('design_optimized.png')
```

**Solution 4: Cache Results**
```python
# Cache analysis results in database
# If same image uploaded twice, return cached result
```

---

## Issue 10: Costs Higher Than Expected

### Symptoms
```
Railway billing higher than expected
Daily costs increasing
```

### Causes
1. Resource limits too high
2. High egress traffic
3. Keep-alive connections
4. Continuous deployment

### Solutions

**Solution 1: Optimize Resources**
```
In Railway → Settings:
- CPU: Start with 0.5
- Memory: Start with 512MB
- Increase only if needed
```

**Solution 2: Reduce LITE_MODE**
```
In Railway → Variables:
LITE_MODE = true

Saves ~300MB memory (large savings)
```

**Solution 3: Monitor Usage**
```
In Railway → Metrics:
- Watch CPU usage
- Watch Memory usage
- Watch request count
```

**Solution 4: Implement Caching**
```python
# Cache analysis results
# Reduce redundant processing
# Save on computation costs
```

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Deployment failed | Check `runtime.txt` and `requirements.txt` |
| API 500 error | Verify SUPABASE_URL and SUPABASE_KEY variables |
| CORS error | Add frontend URL to CORS_ORIGINS variable |
| Timeout | Increase request timeout or Railway CPU |
| High memory | Set LITE_MODE=true |
| Won't start | Check logs for import/syntax errors |
| Upload fails | Check file size and Supabase quota |
| Too slow | Enable LITE_MODE or increase CPU |
| High costs | Reduce resources and enable LITE_MODE |
| Connection failed | Verify DATABASE_URL format |

---

## Getting Help

1. **Check Logs First**
   - Railway Dashboard → Logs tab
   - Read error message carefully

2. **Search for Error**
   - Copy exact error message
   - Search on Google/Stack Overflow

3. **Ask Railway Support**
   - https://railway.app/support
   - Join Railway Discord community

4. **Test Locally**
   - Reproduce issue on local machine
   - Easier to debug locally

---

**Still stuck? Check the main migration guide: RENDER_TO_RAILWAY_MIGRATION_GUIDE.md**
