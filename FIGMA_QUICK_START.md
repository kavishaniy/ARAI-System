# Figma Integration - Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Figma API Token (2 minutes)

1. Go to **https://www.figma.com/developers/api#auth**
2. Sign in with your Figma account (free tier works!)
3. Click "Create a new personal access token"
4. Give it a name: `ARAI System`
5. Copy the token (looks like: `ffile_abc123...`)
6. **Keep this secret!** 🔐

### Step 2: Configure Backend (1 minute)

**Option A: Local Development**
```bash
cd backend
echo "FIGMA_API_TOKEN=ffile_your_token_here" >> .env

# Verify it worked
cat .env | grep FIGMA_API_TOKEN
```

**Option B: Production (Render)**
1. Go to your Render service dashboard
2. Go to "Environment" → "Environment Variables"
3. Add new variable: `FIGMA_API_TOKEN` = `ffile_...`
4. Click "Save Changes"
5. Service will auto-redeploy

### Step 3: Test It (2 minutes)

```bash
# Test 1: Check token works
curl -H "X-Figma-Token: ffile_your_token" \
  https://api.figma.com/v1/me

# Test 2: Check backend is running
curl http://localhost:8000/api/v1/figma/test-connection

# Test 3: Run full test suite
python test_figma_integration.py
```

### Step 4: Try Analysis (instant)

**Get a Figma file to test with:**
1. Open any Figma file or create one
2. Make sure it has at least 1 Frame or Board
3. Make it public: File → Share → "Anyone with link"
4. Copy the URL from address bar

**Test the analysis:**
```bash
curl -X POST http://localhost:8000/api/v1/analysis/figma-screens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "figma_url": "https://www.figma.com/file/YOUR_FILE_KEY/YourFileName",
    "figma_token": null
  }'
```

Done! 🎉

---

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| **401 Unauthorized** | Token not set or expired. Regenerate at figma.com/developers/api |
| **Invalid URL** | Use `https://www.figma.com/file/ABC123/Name` format |
| **No frames found** | Create at least 1 Frame/Board in your Figma file |
| **403 Access Denied** | Make file public or share with your account |
| **Timeout** | Try again, or use smaller file for testing |

---

## Architecture Overview

```
Your Figma File
    ↓
📥 Extract FILE_KEY from URL
    ↓
🔌 Fetch file JSON via Figma API
    ↓
📊 Extract frames/screens
    ↓
📸 Convert to PNG images
    ↓
🧠 Run analysis (accessibility, readability, attention)
    ↓
💾 Save results to database
    ↓
✅ Display to user
```

---

## File Locations

| File | Purpose |
|------|---------|
| `backend/app/core/figma_client.py` | Figma API client (token, file fetch, image URLs) |
| `backend/app/services/figma_service.py` | Analysis orchestration (accessibility, readability, attention) |
| `backend/app/api/analysis.py` | HTTP endpoints (POST /figma-screens) |
| `frontend/src/components/FigmaAnalyzer.jsx` | React UI form & results |
| `FIGMA_INTEGRATION_FIX.md` | Deep dive guide & troubleshooting |
| `test_figma_integration.py` | Automated test suite |

---

## What's Already Working ✅

1. **URL → FILE_KEY extraction** (regex parsing)
2. **Figma API connection** (with rate limiting & retries)
3. **Frame extraction** from JSON
4. **Image rendering** (PNG export from Figma)
5. **Analysis pipeline** (accessibility, readability, attention)
6. **Result aggregation** (all frames together or per-frame)
7. **Error handling** (403, 404, 429, timeouts)
8. **Caching** (OAuth tokens, analysis state)

---

## What You Need to Do

1. ✅ **Set FIGMA_API_TOKEN** in `.env` or Render
2. ✅ **Test with your Figma file**
3. ✅ **Monitor logs** for any errors
4. ✅ **Report issues** if anything breaks

---

## Next Steps

### For Testing
```bash
# Run interactive test
python test_figma_integration.py

# Check logs
tail -f backend.log | grep -i figma

# Restart backend
./start_backend.sh
```

### For Production
- [ ] Set `FIGMA_API_TOKEN` in Render environment variables
- [ ] Test with 3+ different Figma files
- [ ] Monitor logs for 24 hours
- [ ] Share feedback with the team

### For Advanced Features
- Add caching to Redis (avoid re-analyzing same file)
- Implement job queue for large files (Celery)
- Add progress WebSocket updates
- Support component analysis
- Add color palette extraction
- Generate design system recommendations

---

## Questions?

1. **"My token keeps expiring"** → Regenerate at figma.com/developers/api
2. **"Analysis is slow"** → Large files take 15-60s. Normal.
3. **"Where are frame images?"** → They're cached, might be slow
4. **"Can I share private files?"** → Share file first, then analyze
5. **"Rate limited?"** → Wait 2 minutes, system auto-retries

---

## Support Resources

- 📚 **Full Guide**: `FIGMA_INTEGRATION_FIX.md`
- 🔧 **Troubleshooting**: `FIGMA_TROUBLESHOOTING.md`
- 🧪 **Test Suite**: `test_figma_integration.py`
- 📖 **Figma API Docs**: https://www.figma.com/developers/api
- 🆘 **Check Logs**: `backend.log`

---

## TL;DR

```bash
# 1. Get token: https://www.figma.com/developers/api#auth
# 2. Set it:
export FIGMA_API_TOKEN=ffile_...

# 3. Test it:
curl -H "X-Figma-Token: ffile_..." https://api.figma.com/v1/me

# 4. Done! ✅
```

Your system is ready to analyze Figma designs! 🚀
