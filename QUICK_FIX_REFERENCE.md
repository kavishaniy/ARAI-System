# ⚡ Figma Analysis - Quick Fix Reference

## Problem: Results Not Showing After "Analyze Design"

### 🚨 Most Likely Cause
**FIGMA_API_TOKEN is not set**

### ⚡ Quick Fix (30 seconds)

```bash
# 1. Set the token
export FIGMA_API_TOKEN="your_figma_token_here"

# 2. Restart backend
bash start-backend-fast.sh

# 3. Try again in browser
```

**Get your token:**
1. Go to https://www.figma.com/developers/api#auth
2. Click "Create a new personal access token"
3. Copy the token
4. Use in command above

---

## 🔍 Verify Your Setup (1 minute)

```bash
# Run this script:
bash verify-setup.sh

# It will show:
# ✅ PASS items = things are working
# ❌ FAIL items = things need fixing
```

---

## 🛠️ Common Issues & Fixes

| Issue | How to Fix |
|-------|-----------|
| Loading never stops | See "Most Likely Cause" above |
| "Invalid Figma URL" | Use full file URL: `https://www.figma.com/file/ABC123/Name` |
| "Unauthorized" | Token is wrong, regenerate it at figma.com |
| "No frames found" | Add frames to your Figma file |
| Backend not running | Run: `bash start-backend-fast.sh` |
| CORS error | Wait a minute and try again, or restart backend |

---

## 🧪 Test Your Setup

```bash
# 1. Check token is set
echo $FIGMA_API_TOKEN

# 2. Check backend is running
curl http://localhost:8000/api/v1/health

# 3. Open browser
open http://localhost:3000

# 4. Go to Figma Analyzer

# 5. Paste this test URL:
https://www.figma.com/file/OwlUhf0K5XWyOXWR7bI5xj/UI-Kit

# 6. Click "Analyze All Screens"

# 7. Wait 2-5 minutes for results
```

---

## 📺 Watch the Console

1. Open browser
2. Press `F12` (Developer Tools)
3. Click "Console" tab
4. You'll see logs like:
   ```
   🔍 Validating Figma URL: https://...
   ✅ URL validation passed
   📊 Starting Figma analysis...
   (wait 2-5 minutes...)
   ✅ Analysis completed, results received: {...}
   ```

---

## 📚 Need More Help?

- **Detailed Guide:** See `FIGMA_ANALYSIS_TROUBLESHOOTING.md`
- **Setup Checker:** Run `bash verify-setup.sh`
- **Current Status:** See `FIGMA_ANALYSIS_FIX_SUMMARY.md`

---

## ✅ Expected Timeline

1. **Validation:** < 10 seconds
2. **Figma Extraction:** 5-10 seconds
3. **Analysis:** 1-5 minutes (depends on file size)
4. **Results Display:** Instant after analysis

**Total: 2-5 minutes**

---

**Quick Reference Card | April 15, 2026**
