# ARAI System - Quick Reference Card

## 🚀 Quick Start

```bash
# Backend
cd backend && uvicorn app.main:app --reload

# Frontend  
cd frontend && npm start

# Test
./test_system.sh
```

## 🔑 Key URLs

- **App**: http://localhost:3000
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

## 📊 ARAI Score Formula

```
ARAI = (Accessibility × 0.4) + (Readability × 0.3) + (Attention × 0.3)
```

## 🎯 Conformance Levels

| Score | Grade | Level | Meaning |
|-------|-------|-------|---------|
| 90-100 | A | AAA | Exceptional |
| 80-89 | B | AA | Industry standard ⭐ |
| 70-79 | C | A | Minimum legal |
| 60-69 | D | Partial | Issues present |
| 0-59 | F | Non-conformant | Critical failures |

## 🔍 WCAG Criteria Checked

### Perceivable (P)
- ✓ 1.1.1 Text Alternatives (A)
- ✓ 1.3.1 Info & Relationships (A)
- ✓ 1.4.3 Contrast Minimum (AA) - 4.5:1
- ✓ 1.4.6 Contrast Enhanced (AAA) - 7:1
- ✓ 1.4.11 Non-text Contrast (AA) - 3:1

### Operable (O)
- ✓ 2.1.1 Keyboard (A)
- ✓ 2.4.7 Focus Visible (AA)
- ✓ 2.5.5 Target Size (AAA) - 44x44px
- ✓ 2.5.8 Target Size Min (AA) - 24x24px

### Understandable (U)
- ✓ 3.2.4 Consistent ID (AA)
- ✓ 3.3.1 Error ID (A)

## 📁 Key Files

### Backend AI Modules
```
backend/app/ai_modules/
├── wcag_analyzer.py          # Main WCAG checker (650+ lines)
├── readability_analyzer.py   # Text analysis
└── attention_analyzer.py     # Visual attention
```

### Frontend Components
```
frontend/src/components/
├── Analysis/
│   ├── UploadAnalysis.jsx    # Upload UI
│   └── AnalysisResults.jsx   # Results (500+ lines)
└── Dashboard/Dashboard.jsx   # Main app
```

## 🔧 API Endpoints

```bash
# Upload & Analyze
POST /api/v1/analysis/upload
  -F "file=@design.png"
  -F "design_name=Homepage"

# Get Results
GET /api/v1/analysis/results/{id}

# History
GET /api/v1/analysis/history

# Delete
DELETE /api/v1/analysis/results/{id}
```

## 🎨 Severity Levels

| Level | Icon | Action | Deduction |
|-------|------|--------|-----------|
| Critical | 🔴 | Fix now | -10 pts |
| High | 🟠 | This sprint | -5 pts |
| Medium | 🟡 | Next sprint | -2 pts |
| Low | 🔵 | Nice to have | -1 pt |

## 📈 Analysis Output

```json
{
  "arai_score": 85.5,
  "overall_grade": "B",
  "accessibility": {
    "score": 82,
    "conformance_level": "Level AA",
    "issue_count": { "critical": 0, "high": 2 }
  },
  "readability": {
    "score": 88,
    "metrics": { "flesch_reading_ease": 65.2 }
  },
  "attention": {
    "score": 87,
    "attention_distribution": { "top": 0.35 }
  }
}
```

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check port
lsof -i :8000
# Kill if needed
kill -9 <PID>
# Reinstall deps
pip install -r requirements.txt
```

### Frontend Won't Start
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm start
```

### Analysis Fails
```bash
# Check Tesseract
which tesseract
brew install tesseract  # macOS

# Check uploads dir
mkdir -p backend/uploads

# Check permissions
chmod -R 755 backend/uploads
```

## 📚 Documentation

1. **IMPLEMENTATION_SUMMARY.md** - What's been built
2. **IMPLEMENTATION_GUIDE.md** - How to set up
3. **ANALYSIS_FEATURES.md** - What it does
4. **QUICK_START.md** - Get running fast
5. **This file** - Quick reference

## 🎯 Common Tasks

### Analyze a Design
1. Go to http://localhost:3000
2. Login/Signup
3. Upload image (PNG/JPG)
4. Wait 15-30s
5. View results

### View Past Analyses
1. Click "Analysis History" tab
2. Click on any analysis
3. View full report

### Export Results
```bash
# Get analysis JSON
curl http://localhost:8000/api/v1/analysis/results/{id} > results.json
```

## 💡 Tips

- **Target AA compliance** (industry standard)
- **Fix critical issues first**
- **Use test images** from `data/figma_designs/`
- **Re-analyze** after fixes
- **Export reports** for documentation

## 🔗 Resources

- WCAG 2.1: https://www.w3.org/TR/WCAG21/
- WebAIM: https://webaim.org/
- Contrast Checker: https://webaim.org/resources/contrastchecker/

## 📞 Support

Check logs:
- Backend: Terminal running uvicorn
- Frontend: Browser console (F12)
- API: http://localhost:8000/docs

---

**Quick Test**: `./test_system.sh`  
**Full Docs**: See other `.md` files in root directory
