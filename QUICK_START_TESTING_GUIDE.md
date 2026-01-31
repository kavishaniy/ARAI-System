# 🚀 Quick Start Guide - ARAI System

## Installation & Setup (5 minutes)

### Prerequisites
```bash
# Check you have:
- Python 3.8+ installed
- Node.js 14+ installed
- Git installed
```

### Step 1: Clone Repository (if not already done)
```bash
cd /Users/kavishani/Documents/FYP/arai-system
```

### Step 2: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt

# Note: This will install:
# - FastAPI, PyTorch, OpenCV, Tesseract
# - ReportLab (PDF), Pandas (CSV)
# - All AI/ML libraries
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install

# Installs:
# - React, TailwindCSS, Lucide Icons
# - Axios, React Router
```

---

## Running the System

### Terminal 1: Start Backend
```bash
cd backend
python -m app.main

# You should see:
# ✅ Loaded saliency model...
# ℹ️  Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm start

# You should see:
# Compiled successfully!
# http://localhost:3000
```

---

## Testing the Complete System

### 1. Access the Application
```
Open browser → http://localhost:3000
```

### 2. Login/Signup
```
Click "Sign Up" or "Login"
Use your credentials
```

### 3. Upload a Design
```
1. Go to Dashboard
2. Click "Analyze Design" or "Upload"
3. Select an image (PNG, JPG, JPEG, WebP)
4. Click "Analyze"
```

### 4. View Comprehensive Results
After ~15 seconds, you'll see:

#### ✅ ARAI Score Display
- Large circular progress indicator
- Overall score (0-100) + Grade (A-F)
- Breakdown: Accessibility, Readability, Attention

#### ✅ Issue Summary Dashboard
- Color-coded severity counts
- Category breakdown
- Quick statistics

#### ✅ Navigation Tabs
Click through:
- **Overview** - Key metrics at a glance
- **All Issues** - Comprehensive issue list
- **Accessibility** - WCAG compliance details
- **Readability** - Text clarity analysis  
- **Attention** - Visual hierarchy & cognitive load
- **Learn More** - Educational WCAG content
- **Recommendations** - Prioritized action items

#### ✅ Interactive Issue Cards
Click any issue to see:
- 🤖 AI Confidence Score
- 💡 Why it matters
- 🔧 How to fix
- 🧠 AI reasoning

#### ✅ Export Functionality
- Click "Export PDF Report" → Downloads comprehensive PDF
- Click "Export CSV Data" → Downloads issue spreadsheet

---

## Test with Sample Images

### Good Test Images (Low issues):
```
frontend/public/sample-designs/
├── accessible-design.png (ARAI ~90+)
└── clean-ui.png (ARAI ~85+)
```

### Problematic Test Images (Many issues):
```
frontend/public/sample-designs/
├── low-contrast.png (Contrast issues)
├── cluttered-ui.png (Cognitive load issues)
└── complex-text.png (Readability issues)
```

---

## Verifying Each Requirement

### FR-009 to FR-012: Accessibility ✅
**Test:** Upload design with low contrast
**Expected:**
- Issues flagged with contrast ratios
- Color blindness simulation results
- Alt text requirements listed
- Touch target warnings

**Verify in UI:**
- Click "Accessibility" tab
- Look for contrast ratio values (e.g., "3.2:1")
- See WCAG criterion badges
- Check color vision issues

### FR-013 to FR-016: Readability ✅
**Test:** Upload design with text content
**Expected:**
- Flesch-Kincaid scores displayed
- Long sentences flagged (>20 words)
- Jargon detected
- Non-inclusive language warnings
- Typography recommendations

**Verify in UI:**
- Click "Readability" tab
- See readability scores section
- Check word count and grade level
- Look for vocabulary issues
- Review typography suggestions

### FR-017 to FR-020: Attention ✅
**Test:** Upload any UI design
**Expected:**
- Saliency heatmap generated
- Critical elements identified
- Visual hierarchy assessment
- Cognitive load score

**Verify in UI:**
- Click "Attention" tab
- See cognitive load metrics
- Check critical elements list
- Review hierarchy analysis
- Look for attention warnings

### FR-021: ARAI Score ✅
**Test:** Any upload
**Expected:**
- Overall score 0-100
- Grade A-F
- Weighted breakdown displayed
- Interpretation text

**Verify in UI:**
- Large circular score at top
- Three category scores shown
- Weights displayed (40%, 30%, 30%)
- Grade badge visible

### FR-022: Visual Annotations ✅
**Test:** Any upload with issues
**Expected:**
- Color-coded markers on design
- Severity legend
- Numbered labels

**Verify:**
- Check for annotated image
- See red/orange/yellow/blue markers
- Legend showing severity colors

### FR-023: Comprehensive Issue List ✅
**Test:** Any upload with issues
**Expected:**
- Issues organized by severity
- Category tags
- WCAG references
- Location data

**Verify in UI:**
- Click "All Issues" tab
- See issues sorted by severity
- Check for WCAG criterion badges
- Look for category/subcategory labels

### FR-024: Explainable AI ✅
**Test:** Click any issue
**Expected:**
- Confidence score (60-95%)
- Human explanation
- Fix suggestion
- AI reasoning

**Verify in UI:**
- Click to expand an issue
- See "AI Confidence: 85% (High)"
- Read "Why This Matters" section
- Check "How to Fix" section
- View "AI Analysis Method"

### FR-025: Educational Content ✅
**Test:** Click "Learn More" tab
**Expected:**
- WCAG guideline explanations
- Examples and code snippets
- External resource links

**Verify in UI:**
- Click "Learn More" tab
- Expand an educational panel
- See "What it means", "Why important", "How to fix"
- Check for external links

### FR-026: PDF Export ✅
**Test:** Click "Export PDF Report"
**Expected:**
- PDF downloads
- Contains: scores, issues, education
- Professional formatting

**Verify:**
- Click export button
- PDF file downloads
- Open in PDF viewer
- Check all sections present

### FR-027: CSV Export ✅
**Test:** Click "Export CSV Data"
**Expected:**
- CSV downloads
- Structured data with all fields
- Can open in Excel/Sheets

**Verify:**
- Click export button
- CSV file downloads
- Open in Excel or Google Sheets
- Check all columns present

---

## Troubleshooting

### Backend Issues

**Error: "Module not found"**
```bash
cd backend
pip install -r requirements.txt
```

**Error: "Port 8000 already in use"**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in backend/app/main.py
uvicorn.run("app.main:app", host="0.0.0.0", port=8001)
```

**Error: "Tesseract not found"**
```bash
# macOS
brew install tesseract

# Linux
sudo apt-get install tesseract-ocr

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

### Frontend Issues

**Error: "npm install failed"**
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 3000 already in use"**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or set different port
PORT=3001 npm start
```

**Error: "API connection refused"**
```bash
# Check backend is running
curl http://localhost:8000/health

# Should return: {"status":"healthy"}
```

---

## Quick Verification Checklist

After starting the system, verify:

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can login/signup successfully
- [ ] Can upload an image
- [ ] Analysis completes (~15 seconds)
- [ ] ARAI score displays
- [ ] All 7 tabs are visible
- [ ] Can click and expand issues
- [ ] Can see confidence scores
- [ ] Educational content loads
- [ ] PDF export works
- [ ] CSV export works

---

## Performance Notes

- **First analysis may be slower** (model loading)
- **Subsequent analyses are faster** (~10-15s)
- **Large images (>5MB) take longer**
- **Optimal size: 1-3MB, 1920x1080px or smaller**

---

## Next Steps

1. ✅ Test with your own designs
2. ✅ Review all issue types
3. ✅ Read educational content
4. ✅ Export reports
5. ✅ Implement fixes
6. ✅ Re-analyze to verify improvements

---

## Support

**Issues?**
- Check terminal logs for error messages
- Verify all dependencies installed
- Ensure ports 3000 and 8000 are free
- Check firewall settings

**Success?**
🎉 You now have a fully functional AI-powered accessibility analysis system!

All 19 functional requirements (FR-009 to FR-027) are implemented and ready to use.
