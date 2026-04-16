# 📁 Figma Integration - Complete File Map

## Documentation Files (All New - Read These First!)

```
/Users/kavishani/Documents/FYP/arai-system/
│
├── 📘 FIGMA_QUICK_START.md ⭐ START HERE
│   └── 5-minute setup guide
│       • Get API token
│       • Configure backend  
│       • First test
│
├── 📗 FIGMA_INTEGRATION_FIX.md (Deep Dive)
│   └── Comprehensive technical guide
│       • Problem analysis
│       • 6 common failure points
│       • Architecture overview
│       • Testing checklist
│       • Deployment guide
│
├── 🔧 FIGMA_TROUBLESHOOTING.md (Debugging)
│   └── Error messages & solutions
│       • Quick diagnostics
│       • Common errors with fixes
│       • Testing procedures
│       • Advanced diagnostics
│
├── 📋 FIGMA_QUICK_REFERENCE.md (Cheat Sheet)
│   └── One-page reference
│       • Configuration
│       • Common errors
│       • Performance metrics
│
├── 🗂️ FIGMA_DOCS_INDEX.md (Navigation)
│   └── Find what you need
│       • Quick links
│       • By scenario
│       • Learning paths
│
├── 📊 FIGMA_IMPLEMENTATION_COMPLETE.md (Summary)
│   └── What was done & how to proceed
│       • Code improvements
│       • Deployment checklist
│       • Next steps
│
└── 🧪 test_figma_integration.py (Automated Tests)
    └── Run to verify everything works
        • Token validation
        • File extraction
        • Full pipeline test
```

---

## Backend Code Files (Improved ⭐)

```
backend/
│
├── app/
│   │
│   ├── core/
│   │   │
│   │   ├── figma_client.py ⭐⭐⭐ IMPROVED
│   │   │   ├── FigmaAPIClient
│   │   │   │   ├── extract_file_key() ⭐ More flexible
│   │   │   │   ├── get_file() ⭐ Better errors
│   │   │   │   ├── get_frame_images() ⭐ Longer timeout
│   │   │   │   └── _handle_rate_limit() ✅
│   │   │   │
│   │   │   ├── FigmaExtractor
│   │   │   │   ├── parse_node()
│   │   │   │   └── extract_all_elements()
│   │   │   │
│   │   │   └── Data Classes
│   │   │       ├── FigmaNode
│   │   │       ├── FigmaColor
│   │   │       ├── FigmaTextStyle
│   │   │       └── FigmaPage
│   │   │
│   │   ├── config.py ✅
│   │   │   └── FIGMA_API_TOKEN setting
│   │   │
│   │   └── database.py ✅
│   │
│   ├── services/
│   │   │
│   │   ├── figma_service.py ✅
│   │   │   ├── FigmaAccessibilityAnalyzer
│   │   │   │   ├── analyze_frame()
│   │   │   │   ├── check_contrast()
│   │   │   │   └── check_font_size()
│   │   │   │
│   │   │   ├── FigmaReadabilityAnalyzer
│   │   │   │   ├── analyze_frame()
│   │   │   │   ├── calculate_text_density()
│   │   │   │   └── analyze_hierarchy()
│   │   │   │
│   │   ├── FigmaAttentionAnalyzer
│   │   │   ├── analyze_frame()
│   │   │   └── calculate_prominence()
│   │   │
│   │   ├── FigmaAnalysisService (Orchestrator)
│   │   │   ├── analyze_from_url()
│   │   │   ├── analyze_file()
│   │   │   └── _analyze_frames()
│   │   │
│   │   └── figma_oauth.py ✅
│   │
│   ├── api/
│   │   │
│   │   ├── analysis.py ✅
│   │   │   ├── POST /analysis/figma-screens (Main Endpoint)
│   │   │   │   └── analyze_figma_screens()
│   │   │   │       ├── URL validation
│   │   │   │       ├── Token handling
│   │   │   │       ├── Analysis orchestration
│   │   │   │       ├── Frame processing
│   │   │   │       ├── Image fetching
│   │   │   │       ├── Database save
│   │   │   │       └── Result formatting
│   │   │   │
│   │   │   └── Other endpoints ✅
│   │   │
│   │   ├── figma.py ✅
│   │   │   ├── POST /api/v1/figma/auth/login (OAuth)
│   │   │   ├── GET /api/v1/figma/auth/callback (OAuth)
│   │   │   ├── POST /api/v1/figma/auth/verify
│   │   │   ├── POST /api/v1/figma/auth/disconnect
│   │   │   ├── POST /api/v1/figma/analyze
│   │   │   ├── GET /api/v1/figma/analyze/{id}
│   │   │   ├── POST /api/v1/figma/validate-url
│   │   │   └── GET /api/v1/figma/test-connection
│   │   │
│   │   └── auth.py ✅
│   │
│   ├── models/
│   │   ├── figma_models.py ✅
│   │   │   ├── FigmaRequestModel
│   │   │   ├── FigmaAnalysisResponse
│   │   │   ├── FrameAnalysisResult
│   │   │   ├── AccessibilityScore
│   │   │   ├── ReadabilityScore
│   │   │   └── AttentionScore
│   │   │
│   │   └── user.py
│   │
│   └── main.py ✅ (app initialization)
│
├── requirements.txt ✅
│   └── All dependencies included
│
└── .env (Not in repo - create locally)
    └── FIGMA_API_TOKEN=ffile_your_token
```

---

## Frontend Code Files (Using Existing ✅)

```
frontend/
│
└── src/
    │
    └── components/
        │
        └── FigmaAnalyzer.jsx ✅
            ├── Component State
            │   ├── figmaUrl
            │   ├── loading
            │   ├── error
            │   └── analysisScopes
            │
            ├── Event Handlers
            │   ├── handleAnalyzeClick()
            │   │   ├── URL validation
            │   │   ├── API call
            │   │   ├── Error handling ✅
            │   │   └── Results callback
            │   │
            │   └── onChange handlers
            │
            ├── Render Sections
            │   ├── Title
            │   ├── Input Section
            │   │   ├── URL input field
            │   │   ├── Analysis type checkboxes
            │   │   └── Analyze button
            │   │
            │   ├── Progress Display
            │   │   ├── Loading indicator
            │   │   ├── Progress messages
            │   │   └── Step indicators
            │   │
            │   ├── Error Display ✅
            │   │   ├── Error message
            │   │   ├── Helpful tips
            │   │   └── Contact info
            │   │
            │   └── Results Display
            │       ├── Summary cards
            │       ├── Score breakdown
            │       ├── Issues list
            │       └── Recommendations
            │
            └── CSS Styles
                ├── Layout styling
                ├── Input styling
                ├── Button styling
                └── Responsive design
```

---

## Configuration Files

```
/backend/
│
├── .env (REQUIRED - Create Locally)
│   ├── FIGMA_API_TOKEN=ffile_abc123...
│   ├── SUPABASE_URL=...
│   ├── SUPABASE_KEY=...
│   ├── SUPABASE_SERVICE_KEY=...
│   ├── SECRET_KEY=...
│   └── Other settings...
│
├── requirements.txt ✅
│   ├── fastapi==0.104.1
│   ├── httpx (for Figma API calls)
│   ├── requests (for HTTP requests)
│   ├── pillow (image processing)
│   ├── pytesseract (OCR)
│   ├── textstat (readability)
│   └── ... (other deps)
│
└── app/core/config.py
    ├── Settings class
    │   ├── FIGMA_API_TOKEN (environment)
    │   ├── FIGMA_CLIENT_ID
    │   ├── FIGMA_CLIENT_SECRET
    │   ├── FIGMA_REDIRECT_URI
    │   └── Other configs
    │
    └── Loads from: .env file
```

---

## How Files Connect

```
User Input (Browser)
    ↓
frontend/src/components/FigmaAnalyzer.jsx
    │ (Sends POST request)
    ↓
backend/app/api/analysis.py → analyze_figma_screens()
    │ (Extracts URL, validates token)
    ↓
backend/app/core/figma_client.py
    │ • FigmaAPIClient.extract_file_key(url)
    │ • FigmaAPIClient.get_file(file_key)
    │ • FigmaExtractor.parse_nodes()
    │ • FigmaAPIClient.get_frame_images()
    ↓
backend/app/services/figma_service.py
    │ • FigmaAnalysisService.analyze_from_url()
    │ • FigmaAccessibilityAnalyzer.analyze_frame()
    │ • FigmaReadabilityAnalyzer.analyze_frame()
    │ • FigmaAttentionAnalyzer.analyze_frame()
    ↓
backend/app/core/database.py
    │ (Saves results to database)
    ↓
Response sent back to frontend
    ↓
frontend/src/components/FigmaAnalyzer.jsx
    │ (Displays results)
    ↓
User sees: Scores, issues, recommendations
```

---

## Key Integration Points

### 1. API Endpoint
**File**: `backend/app/api/analysis.py`
**Function**: `analyze_figma_screens()`
**Route**: `POST /api/v1/analysis/figma-screens`
**Input**: 
```json
{
  "figma_url": "https://www.figma.com/file/...",
  "figma_token": null
}
```

### 2. Figma Client
**File**: `backend/app/core/figma_client.py`
**Classes**:
- `FigmaAPIClient` - Handles API calls
- `FigmaExtractor` - Parses JSON

### 3. Analysis Engine
**File**: `backend/app/services/figma_service.py`
**Classes**:
- `FigmaAccessibilityAnalyzer`
- `FigmaReadabilityAnalyzer`
- `FigmaAttentionAnalyzer`
- `FigmaAnalysisService` (orchestrator)

### 4. UI Component
**File**: `frontend/src/components/FigmaAnalyzer.jsx`
**Features**:
- URL input
- Loading state
- Error display
- Results display

---

## Development Workflow

### To Test Locally
```bash
# 1. Backend setup
cd backend
export FIGMA_API_TOKEN=ffile_...
python -m uvicorn app.main:app --reload

# 2. Run tests
python test_figma_integration.py

# 3. Frontend (in another terminal)
cd frontend
npm start

# 4. Go to http://localhost:3000/analyzer
# Paste a Figma URL and click "Analyze All Screens"
```

### To Deploy
```bash
# 1. Set environment variable in Render
# FIGMA_API_TOKEN=ffile_...

# 2. Commit and push
git add .
git commit -m "Figma integration fixes"
git push origin main

# 3. Render auto-deploys
# 4. Monitor logs
```

---

## File Sizes & Performance

| File | Size | Purpose |
|------|------|---------|
| figma_client.py | ~600 lines | API interaction |
| figma_service.py | ~600 lines | Analysis logic |
| FigmaAnalyzer.jsx | ~390 lines | UI component |
| analysis.py | ~930 lines | HTTP endpoints |
| test_figma_integration.py | ~300 lines | Tests |

---

## Dependencies

### Required Python Packages
```
fastapi - API framework
httpx/requests - HTTP requests to Figma API
pydantic - Data validation
pillow - Image processing
pytesseract - OCR
textstat - Readability metrics
```

### External Services
```
Figma API (https://api.figma.com/v1)
Supabase (Database)
```

---

## Important Locations

| What | Where |
|------|-------|
| Backend main app | `backend/app/main.py` |
| Figma API client | `backend/app/core/figma_client.py` ⭐ |
| Analysis service | `backend/app/services/figma_service.py` ⭐ |
| HTTP endpoints | `backend/app/api/analysis.py` ⭐ |
| Frontend component | `frontend/src/components/FigmaAnalyzer.jsx` ⭐ |
| Tests | `test_figma_integration.py` |
| Configuration | `backend/app/core/config.py` |
| Documentation | `FIGMA_*.md` files (root) |

⭐ = Modified or created for Figma integration

---

## Environment Setup

### Local Development
```bash
# backend/.env
FIGMA_API_TOKEN=ffile_your_token_here
SUPABASE_URL=...
SUPABASE_KEY=...
# ... other settings
```

### Production (Render)
1. Go to service dashboard
2. Settings → Environment Variables
3. Add `FIGMA_API_TOKEN` = `ffile_...`
4. Save and redeploy

### Docker
```dockerfile
ENV FIGMA_API_TOKEN=ffile_...
```

---

## Quick Reference

### Most Important Files
1. `backend/app/core/figma_client.py` - Figma API interaction
2. `backend/app/services/figma_service.py` - Analysis logic
3. `backend/app/api/analysis.py` - Main endpoint
4. `frontend/src/components/FigmaAnalyzer.jsx` - UI
5. `test_figma_integration.py` - Testing

### Most Important Docs
1. `FIGMA_QUICK_START.md` - Setup
2. `FIGMA_INTEGRATION_FIX.md` - How it works
3. `FIGMA_TROUBLESHOOTING.md` - Debugging
4. `FIGMA_QUICK_REFERENCE.md` - Cheat sheet

---

**Navigation Guide**: Check `FIGMA_DOCS_INDEX.md` for full documentation index

Your Figma integration is complete and ready to use! 🚀
