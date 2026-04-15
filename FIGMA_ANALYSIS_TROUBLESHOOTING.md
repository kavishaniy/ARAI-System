# 🔧 Figma Analysis Troubleshooting Guide

## Issue: "Analyzing... This may take a few minutes" - Results Not Showing

When a user clicks "Analyze All Screens" in the Figma Analyzer, the loading state continues indefinitely, and results never appear.

---

## 🔍 Root Causes & Solutions

### 1. **FIGMA_API_TOKEN Not Set** (Most Common)

#### Symptom
- Loading spinner shows continuously
- Browser console shows: `No Figma token provided`
- Error appears: "No Figma token provided. Set FIGMA_API_TOKEN or provide figma_token parameter."

#### Solution
```bash
# Set the environment variable on your backend server
export FIGMA_API_TOKEN="your_figma_token_here"

# For Railway.app deployment
# Go to Variables in Railway dashboard and add:
# Name: FIGMA_API_TOKEN
# Value: your_figma_token_here

# For local development
# Add to .env or .env.local file in backend:
FIGMA_API_TOKEN=your_figma_token_here
```

**Get your token:**
1. Go to https://www.figma.com/developers/api#auth
2. Click "Create a new personal access token"
3. Copy the token
4. Set it as FIGMA_API_TOKEN environment variable

---

### 2. **Invalid or Incorrect Figma URL**

#### Symptom
- Error: "Invalid Figma URL"
- Results don't show

#### Solution
Use the **full file URL** from Figma:

**❌ Wrong (shortened links)**
```
https://figma.com/design/abc123
https://www.figma.com/file/abc123
```

**✅ Correct (full file URL)**
```
https://www.figma.com/file/abc123XYZ/ProjectName?node-id=0%3A1
https://www.figma.com/file/abc123XYZ/My-Design-File
```

**How to get the correct URL:**
1. Open Figma file in browser
2. Copy the full URL from address bar
3. Paste into Figma Analyzer
4. Should contain `/file/` in the URL

---

### 3. **No Frames/Screens in Figma File**

#### Symptom
- Analysis completes with no results
- Error: "No frames or screens found in the Figma file"

#### Solution
Ensure your Figma file contains at least one:
- Frame (Rectangle tool → Name it)
- Board (newer Figma feature)
- Component
- Page with content

**To add a frame:**
1. In Figma, select the Rectangle tool
2. Draw a rectangle on the canvas
3. In the right panel, change it to "Frame" 
4. Name it (e.g., "Home Screen")
5. Try analyzing again

---

### 4. **Figma API Rate Limit or Token Invalid**

#### Symptom
- Loading continues indefinitely
- Browser console shows: `401 Unauthorized`
- Error: "Unauthorized" or "Invalid token"

#### Solution
```bash
# Verify your token is correct
curl -H "X-Figma-Token: YOUR_TOKEN_HERE" \
  https://api.figma.com/v1/me

# Should return user info, not an error

# If error, regenerate token:
# 1. Go to https://www.figma.com/developers/api#auth
# 2. Delete old token
# 3. Create new token
# 4. Update FIGMA_API_TOKEN environment variable
# 5. Restart backend service
```

---

### 5. **Request Timeout (Analysis Takes Too Long)**

#### Symptom
- Loading spinner shows for several minutes
- Eventually error: "timeout of 300000ms exceeded"
- Browser shows network error

#### Solution
The analysis timeout is set to **5 minutes (300000ms)**. If your project is very large:

**Option 1: Analyze smaller files first**
- Test with a small Figma file (5-10 frames)
- Then try larger files

**Option 2: Increase backend timeout**
```python
# In /backend/app/api/analysis.py
# Update the timeout in the POST request (line ~260)
# This is usually set in the server configuration

# For Uvicorn (local):
uvicorn main:app --timeout-keep-alive=600 --timeout-graceful-shutdown=600

# For production, check your hosting provider's timeout settings
```

**Option 3: Analyze specific pages instead**
- Try analyzing one page at a time
- Use Figma's "Export" to create smaller files

---

### 6. **Backend Service Not Running**

#### Symptom
- Loading never starts or times out immediately
- Browser console shows: `Network Error` or `Connection refused`
- Error: `Failed to fetch`

#### Solution
```bash
# Check if backend is running
curl http://localhost:8000/api/v1/health

# Should return: {"status": "ok"}

# If not, start the backend:
cd /backend

# Local development
python -m uvicorn app.main:app --reload

# Or use the provided script
bash start-backend-fast.sh

# Check logs for errors
tail -f backend.log
```

---

### 7. **CORS Issue**

#### Symptom
- Browser console shows: `CORS error` or `Access-Control-Allow-Origin missing`
- Loading spinner shows, then nothing happens

#### Solution
```bash
# Check CORS configuration in /backend/app/main.py
# Should include your frontend URL

# Local development should have:
allow_origins=["http://localhost:3000", "http://localhost:5173"]

# Production should have:
allow_origins=["https://yourfrontend.com"]

# Restart backend after changes
```

---

## 🧪 Testing Your Setup

### Quick Test Checklist

1. **Check token is set:**
   ```bash
   echo $FIGMA_API_TOKEN
   # Should print your token, not empty
   ```

2. **Test API directly (before using UI):**
   ```bash
   # 1. Get your JWT token from login
   # 2. Test the validation endpoint
   curl -X POST http://localhost:8000/api/v1/analysis/validate-url \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.figma.com/file/YOUR_FILE_KEY/YourFileName"}'
   
   # Should return: {"valid": true, "file_key": "...", "message": "..."}
   ```

3. **Test with a known good Figma file:**
   ```
   https://www.figma.com/file/OwlUhf0K5XWyOXWR7bI5xj/UI-Kit
   ```

4. **Check browser console for logs:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for messages like:
     - `🔍 Validating Figma URL: ...`
     - `✅ URL validation passed`
     - `📊 Starting Figma analysis...`
     - `✅ Analysis completed, results received:`

---

## 🐛 Debug Mode: Enable Logging

### Frontend Logging
Already enabled! Check browser console:
```javascript
// You'll see logs like:
console.log('🔍 Validating Figma URL:', figmaUrl);
console.log('✅ URL validation passed');
console.log('📊 Starting Figma analysis...');
console.log('✅ Analysis completed, results received:', analysisRes.data);
console.error('❌ Error:', err);
```

### Backend Logging
Check backend logs:
```bash
# Local development:
# Look at terminal output where backend is running

# Production (Railway.app):
# Go to Logs → App Logs
# Look for entries with [analysis_id] prefix

# Example log output:
# [abc-123-def] 🔍 Starting Figma screens analysis for: https://www.figma.com/file/xyz...
# [abc-123-def] 📁 Extracted file key: xyz123abc
# [abc-123-def] 📊 Analyzing all screens...
# [abc-123-def] ✅ Figma analysis completed: 5 frames across 2 pages
```

---

## 📋 Step-by-Step Debugging

### If results are not showing:

1. **Check if request is being sent:**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Click "Analyze All Screens"
   - Look for `/analysis/figma-screens` request
   - If missing: Check if button is clickable, URL is filled

2. **Check request response:**
   - Click on the `/analysis/figma-screens` request
   - Go to Response tab
   - If you see an error object, read the `detail` field
   - That's your actual error

3. **Check browser console:**
   - Open Console tab
   - Look for red error messages
   - Look for the logs mentioned in "Debug Mode" section

4. **Check backend logs:**
   - If local: Look at terminal output
   - If Railway: Go to Logs panel
   - Search for your analysis ID or "Figma analysis"

5. **Test smaller components:**
   - First test if URL validation works
   - If validation fails: URL is wrong
   - If validation passes but analysis fails: Check token or Figma file content

---

## 🚀 Performance: Why Does It Take So Long?

**Expected times:**
- 1-5 frames: 30-60 seconds
- 5-10 frames: 60-120 seconds  
- 10-20 frames: 2-3 minutes
- 20+ frames: 3-5+ minutes

**Why?**
1. Figma API extraction: 5-10 seconds
2. Accessibility analysis: 10-15 seconds per frame
3. Readability analysis: 5-10 seconds per frame
4. Attention analysis: 10-20 seconds per frame
5. Database storage: 5-10 seconds

**Optimization tips:**
- Test with smaller files first (5-10 frames)
- Don't upload images while Figma analysis is running
- Close unnecessary browser tabs
- Check server load if running locally

---

## 💡 Common Error Messages & Fixes

| Error Message | Cause | Solution |
|---|---|---|
| `No Figma token provided` | FIGMA_API_TOKEN not set | Set environment variable |
| `Invalid Figma URL` | Wrong URL format | Use full file URL with `/file/` |
| `Unauthorized` | Token is invalid | Regenerate token on figma.com |
| `No frames or screens found` | Empty Figma file | Add frames/boards to file |
| `timeout of 300000ms exceeded` | Analysis too slow | Use smaller file or increase timeout |
| `CORS error` | Frontend URL not in CORS list | Check main.py CORS config |
| `Failed to fetch` | Backend not running | Start backend service |
| `Network error` | Connection issue | Check URLs, firewall, VPN |

---

## 📞 Getting Help

### Check These First
1. **Is FIGMA_API_TOKEN set?** `echo $FIGMA_API_TOKEN`
2. **Is backend running?** `curl http://localhost:8000/api/v1/health`
3. **Is Figma URL correct?** Must contain `/file/`
4. **Does Figma file have frames?** Add at least 1 frame
5. **Check browser console** for error details

### If Still Stuck
1. Check backend logs for `[analysis_id]` entries
2. Verify FIGMA_API_TOKEN is correct
3. Try with a sample Figma file
4. Check network connectivity
5. Try with different browser
6. Restart backend service

### Sample Figma File for Testing
```
https://www.figma.com/file/OwlUhf0K5XWyOXWR7bI5xj/UI-Kit
```
(Figma's official UI Kit - good for testing)

---

## ✅ Verification Checklist

Before reporting an issue, verify:

- [ ] FIGMA_API_TOKEN environment variable is set
- [ ] Backend is running (checked with health endpoint)
- [ ] Figma URL is full and contains `/file/`
- [ ] Figma file contains at least one frame/board
- [ ] Browser can access backend (no network errors)
- [ ] No CORS errors in browser console
- [ ] Tried with sample Figma file
- [ ] Checked both browser and backend logs
- [ ] Token is not expired (regenerate if unsure)

If all checks pass but it still doesn't work, include:
- Screenshot of the error
- Browser console logs
- Backend logs (relevant entries with [analysis_id])
- The Figma file URL you're testing with
- Frontend and backend URLs being used

---

**Last Updated:** April 15, 2026  
**Status:** Updated with comprehensive troubleshooting  
**Related:** IMPLEMENTATION_GUIDE.md, QUICK_START_GUIDE.md, API_DOCUMENTATION.md

