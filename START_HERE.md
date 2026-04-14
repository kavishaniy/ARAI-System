# 🚀 FIGMA ANALYZER - START HERE! (2 MINUTES)

## ✅ You Have Everything Ready!

Your complete Figma integration is ready. Here's the fastest way to get it running:

---

## 🎯 3-Step Quick Start

### Step 1: Set Token (30 seconds)

```bash
export FIGMA_API_TOKEN="figd_tKakj7H4DSZyMcBSQZg1wJX8bSyE-dBgYH7gBJe2"
```

**Save it safely:**
```bash
# Create .env file in backend folder
echo 'FIGMA_API_TOKEN="figd_tKakj7H4DSZyMcBSQZg1wJX8bSyE-dBgYH7gBJe2"' > backend/.env
```

### Step 2: Start Backend (30 seconds)

**Terminal 1:**
```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend
export FIGMA_API_TOKEN="figd_tKakj7H4DSZyMcBSQZg1wJX8bSyE-dBgYH7gBJe2"
python -m uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Step 3: Start Frontend (30 seconds)

**Terminal 2:**
```bash
cd /Users/kavishani/Documents/FYP/arai-system/frontend
npm start
```

**Expected output:**
```
webpack compiled with warnings
  ↳ (Some dependencies are deprecated but still work)
```

---

## 🌐 Open It!

Go to: **http://localhost:3000**

1. Login/Signup
2. Look at sidebar → Click **"Figma Analysis"** (with Figma icon)
3. Paste Figma URL
4. Click **"Analyze"**
5. Done! 🎉

---

## 📋 Required Figma URL Format

✅ **Works:**
```
https://www.figma.com/file/abc123/Design
https://www.figma.com/design/abc123/Design
```

❌ **Doesn't work:**
```
figma.com/file/abc123
figma.com/design/abc123/Design
```

---

## ✨ What It Does

When you paste a Figma URL, the system:

1. **Validates** the URL format
2. **Authenticates** with Figma using your token
3. **Extracts** all design pages and frames
4. **Analyzes** each frame for:
   - 🎯 **Accessibility** (WCAG 2.1 contrast, font sizes)
   - 📖 **Readability** (text density, spacing, hierarchy)
   - 👁️ **Visual Attention** (focal points, prominence)
5. **Returns** scores (0-100) + recommendations

---

## 🔍 Quick Test

### Test 1: Token Works?

```bash
curl -X GET "http://localhost:8000/api/v1/figma/test-connection"
```

**Should return:**
```json
{"connected": true}
```

### Test 2: URL Validation?

```bash
curl -X POST "http://localhost:8000/api/v1/figma/validate-url" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.figma.com/file/YOUR_FILE_ID/Design"
  }'
```

**Should return:**
```json
{"valid": true, "file_key": "YOUR_FILE_ID"}
```

---

## 🎮 Try It With Your Own Figma File

1. Open Figma (figma.com)
2. Create a new design or open existing
3. Copy the URL from browser: `https://www.figma.com/file/...`
4. Paste into Figma Analyzer
5. Click Analyze
6. Watch the magic happen! ✨

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot POST /api/v1/figma/analyze" | Backend not running. Run Step 2. |
| "Invalid URL" | URL format wrong. Use `figma.com/file/...` |
| "Token invalid" | Token not set. Run `export FIGMA_API_TOKEN="..."` |
| "Cannot find /figma route" | Frontend not updated. Restart with `npm start` |
| CORS Error | Check `REACT_APP_API_URL=http://localhost:8000` in `.env.local` |

---

## 📁 Files Created/Modified

```
✅ backend/app/core/figma_client.py      (400 LOC)
✅ backend/app/services/figma_service.py (600 LOC)
✅ backend/app/api/figma.py              (200 LOC)
✅ backend/app/main.py                   (UPDATED)
✅ backend/app/core/database.py          (UPDATED)

✅ frontend/src/components/FigmaAnalyzer.jsx       (250 LOC)
✅ frontend/src/pages/FigmaAnalysisPage.jsx        (NEW)
✅ frontend/src/components/Common/Sidebar.jsx      (UPDATED)
✅ frontend/src/App.jsx                            (UPDATED)
```

---

## 📊 Scores Explained

After analysis, you'll get 3 scores (0-100):

### Accessibility Score
- Based on WCAG 2.1 AA/AAA compliance
- Checks contrast ratios (must be 4.5:1 for AA)
- Validates font sizes (12px minimum)
- **Score = 100 - (10 × issues)**

### Readability Score
- Text density (30-50% optimal)
- Font legibility (16px considered good)
- Line spacing (1.5x multiplier optimal)
- Visual hierarchy (font size variance)

### Attention Score
- Visual hierarchy strength
- Focal point prominence
- Element prominence = Size + Position + Color
- Higher = stronger visual direction

---

## 🔐 Security Notes

⚠️ **IMPORTANT: Never commit your token!**

```bash
# DO NOT commit this to Git
FIGMA_API_TOKEN=figd_tKakj7H4DSZyMcBSQZg1wJX8bSyE-dBgYH7gBJe2
```

**Instead:**
1. Use `.env` files (added to `.gitignore`)
2. Use environment variables in production
3. Use secrets in CI/CD (GitHub Actions, etc.)

---

## 🚀 Production Deployment

When ready to deploy:

### Backend (Railway/Render)
1. Set `FIGMA_API_TOKEN` env var
2. Deploy `backend/` folder
3. Update frontend with new API URL

### Frontend (Vercel)
1. Set `REACT_APP_API_URL` to backend domain
2. Deploy `frontend/` folder
3. Tests automatically

### Database (Supabase)
1. Copy SQL from `FIGMA_SETUP.md`
2. Run in Supabase SQL editor
3. Creates `figma_analyses` table

---

## 📞 Need Help?

See detailed docs:
- 🟢 **2-min**: `FIGMA_QUICK_REFERENCE.md`
- 🟡 **15-min**: `FIGMA_SETUP.md`
- 🔴 **2-3 hrs**: `docs/FIGMA_INTEGRATION_GUIDE.md`
- 🔵 **30-min**: `FIGMA_IMPLEMENTATION_SUMMARY.md`
- 🟣 **As needed**: `FIGMA_TROUBLESHOOTING.md`

---

## ⏱️ Timeline

- **Now**: Start servers (1 min)
- **+1 min**: Open localhost:3000
- **+2 min**: Paste Figma URL
- **+30 sec**: Get scores!

---

## 🎉 Ready?

```bash
# Copy and run these commands:

# Terminal 1
cd backend && export FIGMA_API_TOKEN="figd_tKakj7H4DSZyMcBSQZg1wJX8bSyE-dBgYH7gBJe2" && python -m uvicorn app.main:app --reload

# Terminal 2
cd frontend && npm start

# Open: http://localhost:3000
# Click: "Figma Analysis" in sidebar
# Paste: Your Figma URL
# Click: "Analyze"
# Enjoy! 🚀
```

---

**Status**: ✅ **READY TO GO!**

**Next**: Analyze your first Figma design! 🎨

