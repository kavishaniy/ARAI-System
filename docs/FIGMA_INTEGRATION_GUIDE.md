# 🎨 Figma Integration Guide for ARAI System

Complete step-by-step implementation guide for integrating Figma into your accessibility and UX analysis platform.

---

## 📑 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites & Setup](#prerequisites--setup)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Integration](#frontend-integration)
5. [Database Setup](#database-setup)
6. [API Endpoints](#api-endpoints)
7. [Analysis Algorithms](#analysis-algorithms)
8. [Deployment & Configuration](#deployment--configuration)
9. [Error Handling](#error-handling)
10. [Testing Guide](#testing-guide)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  - Figma URL input                                          │
│  - Analysis progress tracking                              │
│  - Results visualization & scoring                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/v1/figma/analyze (POST)                        │  │
│  │  /api/v1/figma/analyze/{id} (GET)                    │  │
│  │  /api/v1/figma/validate-url (POST)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────┴─────────────────────────────────┐  │
│  ▼                    ▼                    ▼               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Figma Client │  │ Accessibility│  │ Readability  │    │
│  │  Extractor   │  │  Analyzer    │  │  Analyzer    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                          ▲                  ▲               │
│                          └──────────────────┘               │
│                                                             │
│                    ┌─────────────────┐                     │
│                    │ Attention       │                     │
│                    │ Analyzer        │                     │
│                    └─────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌─────────────┐
   │ Figma   │  │ Supabase │  │ Supabase    │
   │ API     │  │ Database │  │ Storage     │
   └─────────┘  └──────────┘  └─────────────┘
```

### Data Flow

```
User enters Figma URL
        │
        ▼
Validate URL format & extract file key
        │
        ▼
Authenticate with Figma API (using token)
        │
        ▼
Fetch complete file structure (pages, frames, elements)
        │
        ▼
Parse JSON data → Extract UI elements, text, colors, layout
        │
        ▼
For each frame:
  ├─ Accessibility Analysis
  │   └─ Contrast ratio, font size, WCAG compliance
  ├─ Readability Analysis
  │   └─ Text density, font clarity, spacing
  └─ Attention Analysis
      └─ Visual hierarchy, focal points, prominence
        │
        ▼
Store results in database
        │
        ▼
Return structured response to frontend
        │
        ▼
Display scores, insights, and recommendations
```

---

## Prerequisites & Setup

### 1. Figma API Token

**Get your personal Figma API token:**

1. Go to https://www.figma.com/settings/account
2. Scroll to "Personal access tokens"
3. Click "Create a new token"
4. Name it (e.g., "ARAI System")
5. Copy the token immediately (won't be shown again)

### 2. Environment Variables

Add to your `.env` file:

```bash
# Figma API
FIGMA_API_TOKEN=your_token_here

# Optional: For OAuth (future enhancement)
FIGMA_CLIENT_ID=your_client_id
FIGMA_CLIENT_SECRET=your_client_secret
```

### 3. Install Dependencies

**Backend:**
```bash
cd backend
pip install requests==2.31.0  # Already in requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install axios react-router-dom  # Already installed
```

---

## Backend Implementation

### File Structure

```
backend/app/
├── core/
│   └── figma_client.py          # Figma API client & extraction
├── services/
│   └── figma_service.py         # Analysis orchestration
├── models/
│   └── figma_models.py          # Data schemas
├── api/
│   └── figma.py                 # API endpoints
└── main.py                       # Router registration
```

### 1. Figma Client (`figma_client.py`)

**Key Classes:**

#### `FigmaAPIClient`
Handles Figma API communication and authentication.

```python
from app.core.figma_client import FigmaAPIClient

# Initialize client
client = FigmaAPIClient(token="your_token")

# Extract file key from URL
file_key = client.extract_file_key("https://www.figma.com/file/abc123/Design")
# Output: "abc123"

# Fetch file data
file_data = client.get_file(file_key)

# Parse nodes
node = client.parse_node(raw_node_data)
```

#### `FigmaExtractor`
High-level extraction wrapper.

```python
from app.core.figma_client import FigmaExtractor

extractor = FigmaExtractor()

# Complete extraction from URL
result = extractor.extract_from_url("https://www.figma.com/file/abc123/Design")

# Returns:
{
    "file_key": "abc123",
    "file_name": "Design",
    "pages": [
        {
            "page_id": "123",
            "page_name": "Home",
            "frames": [
                {
                    "frame_id": "456",
                    "frame_name": "Mobile Screen",
                    "bounds": {"x": 0, "y": 0, "width": 375, "height": 667},
                    "elements": [...]
                }
            ]
        }
    ]
}
```

**Key Methods:**

| Method | Purpose | Returns |
|--------|---------|---------|
| `extract_file_key(url)` | Parse file key from URL | `str` |
| `get_file(file_key)` | Fetch file structure | `Dict` |
| `extract_pages(file_data)` | Extract all pages | `List[FigmaPage]` |
| `extract_frames(page)` | Get frames from page | `List[FigmaNode]` |
| `extract_all_elements(node)` | Get all child elements | `List[FigmaNode]` |

### 2. Analysis Service (`figma_service.py`)

**Analyzer Classes:**

#### `FigmaAccessibilityAnalyzer`
Analyzes WCAG compliance and accessibility.

```python
from app.services.figma_service import FigmaAccessibilityAnalyzer

analyzer = FigmaAccessibilityAnalyzer()
score = analyzer.analyze_frame(elements)

# Returns AccessibilityScore:
{
    "score": 85,
    "issues_found": 2,
    "contrast_issues": ["Text 'Label' has contrast ratio 3.5:1"],
    "font_size_issues": ["Text 'Small' has font size 8px"],
    "color_contrast_ratio": 5.2,
    "wcag_level": "AA",
    "recommendations": ["Fix 2 contrast issues..."]
}
```

**Checks:**
- ✅ Color contrast ratios (vs. WCAG thresholds: 3.0 = A, 4.5 = AA, 7.0 = AAA)
- ✅ Minimum font sizes (default 12px)
- ✅ Element visibility and opacity
- ✅ WCAG compliance level

#### `FigmaReadabilityAnalyzer`
Evaluates text clarity and information density.

```python
analyzer = FigmaReadabilityAnalyzer()
score = analyzer.analyze_frame(elements, bounds)

# Returns ReadabilityScore:
{
    "score": 75,
    "text_density": 35.5,
    "average_font_size": 16,
    "font_legibility": "good",
    "line_spacing_quality": "adequate",
    "hierarchy_quality": "clear",
    "recommendations": ["Great readability!"]
}
```

**Metrics:**
- Text density (% of screen)
- Average font size
- Line spacing ratios
- Visual hierarchy (font size variance)

#### `FigmaAttentionAnalyzer`
Analyzes visual hierarchy and focal points.

```python
analyzer = FigmaAttentionAnalyzer()
score = analyzer.analyze_frame(elements, bounds)

# Returns AttentionScore:
{
    "score": 80,
    "focal_points": 3,
    "visual_hierarchy": "strong",
    "primary_focus_area": {"x": 100, "y": 50, "width": 200, "height": 150},
    "secondary_focus_areas": [...],
    "element_prominence": {
        "elem_1": 95.5,
        "elem_2": 70.3
    },
    "recommendations": ["Strong visual hierarchy!"]
}
```

**Prominence Scoring:**
- Size (0-40 points): Larger elements = more prominent
- Position (0-30 points): Center elements = more prominent
- Color contrast (0-30 points): High contrast = more prominent

### 3. Main Analysis Service

```python
from app.services.figma_service import FigmaAnalysisService

service = FigmaAnalysisService(figma_token="token")

# Run complete analysis
result = await service.analyze_from_url(
    figma_url="https://www.figma.com/file/abc123/Design",
    analysis_scope=["accessibility", "readability", "attention"]
)

# Returns FigmaAnalysisResponse
```

---

## Frontend Integration

### React Component: `FigmaAnalyzer.jsx`

**Features:**
- ✅ URL input validation
- ✅ Analysis type selection
- ✅ Real-time progress tracking
- ✅ Score visualization
- ✅ Detailed frame-by-frame results
- ✅ Error handling

**Usage:**

```jsx
import FigmaAnalyzer from './components/FigmaAnalyzer';

export default function App() {
  return <FigmaAnalyzer />;
}
```

**Component Props:**

```jsx
<FigmaAnalyzer 
  apiBase="https://api.arai.com"
  onAnalysisComplete={(results) => console.log(results)}
/>
```

**State Management:**

```javascript
// URL input
const [figmaUrl, setFigmaUrl] = useState('');

// Analysis tracking
const [analysisId, setAnalysisId] = useState(null);
const [analysisStatus, setAnalysisStatus] = useState(null);
const [results, setResults] = useState(null);
const [loading, setLoading] = useState(false);

// Scope selection
const [analysisScopes, setAnalysisScopes] = useState({
  accessibility: true,
  readability: true,
  attention: true
});
```

**Key Functions:**

```javascript
// Validate and start analysis
handleAnalyzeClick()

// Poll for progress updates
pollAnalysisProgress(id)

// Display results with scoring
<ScoreCard title="Accessibility" score={85} />
```

---

## Database Setup

### Supabase Table: `figma_analyses`

**Create table SQL:**

```sql
CREATE TABLE figma_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT,
  figma_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  
  -- Scores
  accessibility_score FLOAT,
  readability_score FLOAT,
  attention_score FLOAT,
  overall_score FLOAT,
  
  -- Full results (JSONB for querying)
  analysis_data JSONB,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

**Database Functions:**

```python
from app.core.database import (
    save_figma_analysis_to_db,
    get_figma_analysis_from_db,
    get_user_figma_analyses,
    delete_figma_analysis
)

# Save analysis
await save_figma_analysis_to_db(
    analysis_id="uuid",
    user_id="user123",
    figma_url="https://...",
    analysis_data={...}
)

# Retrieve analysis
analysis = await get_figma_analysis_from_db("analysis_id")

# Get user's analyses
analyses = await get_user_figma_analyses("user123", limit=50)

# Delete analysis
await delete_figma_analysis("analysis_id", "user123")
```

---

## API Endpoints

### 1. Analyze Figma File

**POST** `/api/v1/figma/analyze`

**Request:**
```json
{
  "figma_url": "https://www.figma.com/file/abc123/MyDesign",
  "figma_api_token": "optional_token",
  "analysis_scope": ["accessibility", "readability", "attention"]
}
```

**Response (202 Accepted):**
```json
{
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Analysis started. Check status using the analysis_id."
}
```

### 2. Get Analysis Results

**GET** `/api/v1/figma/analyze/{analysis_id}`

**Response (In Progress):**
```json
{
  "analysis_id": "550e8400...",
  "status": "analyzing",
  "progress": 50,
  "current_step": "Analyzing design...",
  "message": null
}
```

**Response (Completed):**
```json
{
  "analysis_id": "550e8400...",
  "file_key": "abc123",
  "file_name": "MyDesign",
  "status": "completed",
  "page_results": [
    {
      "page_id": "123",
      "page_name": "Home",
      "frame_results": [
        {
          "frame_id": "456",
          "frame_name": "Mobile Home",
          "bounds": {...},
          "elements": [...],
          "accessibility": {
            "score": 85,
            "wcag_level": "AA",
            "contrast_issues": [],
            "recommendations": [...]
          },
          "readability": {...},
          "attention": {...},
          "overall_score": 82
        }
      ],
      "total_frames": 1,
      "average_accessibility_score": 85
    }
  ],
  "total_pages": 1,
  "total_frames": 5,
  "average_accessibility_score": 82,
  "average_readability_score": 78,
  "average_attention_score": 81,
  "created_at": "2024-01-15T10:30:00",
  "completed_at": "2024-01-15T10:35:00",
  "processing_time_seconds": 300
}
```

### 3. Check Status Only

**GET** `/api/v1/figma/analyze/{analysis_id}/status`

**Response:**
```json
{
  "analysis_id": "550e8400...",
  "status": "analyzing",
  "progress": 75,
  "current_step": "Analyzing frame 3/5",
  "created_at": "2024-01-15T10:30:00",
  "message": null
}
```

### 4. Validate Figma URL

**POST** `/api/v1/figma/validate-url?url=...`

**Response (Valid):**
```json
{
  "valid": true,
  "file_key": "abc123",
  "message": "Valid Figma URL"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "Invalid Figma URL. Expected format: https://www.figma.com/file/FILE_KEY/filename"
}
```

### 5. Test Connection

**GET** `/api/v1/figma/test-connection`

**Headers:**
```
X-Figma-Token: your_token
```

**Response:**
```json
{
  "connected": true,
  "message": "Successfully connected to Figma API"
}
```

---

## Analysis Algorithms

### Accessibility Analysis

#### Contrast Ratio Calculation

**WCAG 2.1 Formula:**

```
L1 = lighter color luminance
L2 = darker color luminance

Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)

Range: 1 (no contrast) to 21 (maximum contrast)
```

**Luminance Calculation:**

```
For each color channel (R, G, B):
  if value ≤ 0.03928:
    adjusted = value / 12.92
  else:
    adjusted = ((value + 0.055) / 1.055) ^ 2.4

L = 0.2126 × R + 0.7152 × G + 0.0722 × B
```

**WCAG Levels:**

| Ratio | Level | Standard Text | Large Text |
|-------|-------|---------------|-----------|
| ≥ 7:1 | AAA   | ✅ Passes     | ✅ Passes  |
| ≥ 4.5:1 | AA  | ✅ Passes     | ✅ Passes  |
| ≥ 3:1 | A    | ✅ Passes     | ✅ Passes  |
| < 3:1 | FAIL | ❌ Fails      | ❌ Fails   |

**Implementation:**

```python
class ContrastRatioAnalyzer:
    @staticmethod
    def calculate_contrast_ratio(color1: str, color2: str) -> float:
        """Calculate contrast ratio between two colors"""
        rgb1 = hex_to_rgb(color1)
        rgb2 = hex_to_rgb(color2)
        
        l1 = get_luminance(rgb1)
        l2 = get_luminance(rgb2)
        
        lighter = max(l1, l2)
        darker = min(l1, l2)
        
        return (lighter + 0.05) / (darker + 0.05)
```

### Readability Analysis

**Text Density Scoring:**

```
text_density = (sum of text element areas) / (total frame area) × 100

Optimal: 30-50%
Good: 20-70%
Poor: >80% (crowded) or <10% (sparse)

Score adjustment:
- > 70%: -20 points
- 50-70%: -10 points
- ≤ 50%: no penalty
```

**Font Size Assessment:**

```
≥ 16px: "good" (-0 points)
12-15px: "fair" (-10 points)
< 12px: "poor" (-20 points)
```

**Line Spacing Quality:**

```
Optimal line-height: 1.5× font size
- Ratio < 1.2: "tight" (-10 points)
- Ratio 1.2-1.8: "adequate" (no penalty)
- Ratio > 1.8: "loose" (-10 points)
```

**Visual Hierarchy:**

```
Unique font sizes ≥ 3: "clear" (no penalty)
Unique font sizes = 2: "moderate" (-15 points)
Unique font sizes = 1: "unclear" (-15 points)
```

### Attention/Visual Hierarchy Analysis

**Element Prominence Score:**

```
Total Score = Size Score + Position Score + Color Score

Size Score (0-40 points):
  = (element_area / frame_area × 100) × 0.4
  
Position Score (0-30 points):
  distance = euclidean distance from frame center
  max_distance = diagonal distance to corner
  = 30 × (1 - distance / max_distance)
  
Color Score (0-30 points):
  = min(30, contrast_ratio × 3)
```

**Focal Point Detection:**

```
1. Calculate prominence for all elements
2. Sort by prominence (descending)
3. Select top 20% as focal points
4. Primary focus = highest prominence element
5. Secondary focus = remaining focal points
```

**Hierarchy Strength:**

```
Calculate standard deviation of prominence scores

std_dev / avg_prominence:
  > 0.5: "strong"
  0.2-0.5: "moderate"
  < 0.2: "weak"
```

---

## Deployment & Configuration

### Environment Variables

```bash
# Production .env
FIGMA_API_TOKEN=figd_xxx...
FIGMA_API_TOKEN_FALLBACK=  # Optional second token

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Frontend
REACT_APP_API_URL=https://api.arai.com
REACT_APP_FIGMA_HELP_URL=https://figma.com/help/article/...
```

### Docker (Optional)

**Dockerfile snippet:**

```dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Railway Deployment

Already configured in your `railway.json`. The Figma integration should work as-is on Railway with:

```bash
# Before deployment
export FIGMA_API_TOKEN=your_token

# Push to Railway
git push origin main
```

---

## Error Handling

### Common Issues & Solutions

#### 1. **Invalid Figma URL**

**Error:**
```json
{
  "valid": false,
  "message": "Invalid Figma URL"
}
```

**Solution:**
- Use format: `https://www.figma.com/file/FILE_KEY/filename`
- Share file publicly or ensure token has access
- Copy directly from Figma browser address bar

#### 2. **Authentication Failed**

**Error:**
```
403 Unauthorized: Invalid token
```

**Solution:**
```python
# Set environment variable
export FIGMA_API_TOKEN=figd_xxx...

# Or pass token in request
requests.post(
    "/api/v1/figma/analyze",
    json={"figma_url": "...", "figma_api_token": "figd_xxx..."}
)
```

#### 3. **Rate Limiting**

**Error:**
```
429 Too Many Requests
```

**Solution:**
```python
# Figma API allows 300 requests/min
# Implement exponential backoff
import time

def with_retry(func, max_retries=3, backoff=2):
    for attempt in range(max_retries):
        try:
            return func()
        except requests.HTTPError as e:
            if e.response.status_code == 429:
                wait_time = backoff ** attempt
                time.sleep(wait_time)
```

#### 4. **File Permission Denied**

**Error:**
```
403 Forbidden: You do not have access to this file
```

**Solution:**
- File must be shared or public
- Token must belong to a user with access
- Check Figma account permissions

### Graceful Degradation

```python
try:
    result = await service.analyze_from_url(figma_url)
except ValueError as e:
    # URL or token error
    return {"error": str(e), "status": "validation_error"}
except requests.Timeout:
    # Network timeout
    return {"error": "Request timeout", "status": "timeout"}
except Exception as e:
    # Unknown error
    logger.error(f"Analysis failed: {e}")
    return {"error": "Analysis failed", "status": "error"}
```

---

## Testing Guide

### Unit Tests

**Test Contrast Ratio:**

```python
def test_contrast_ratio():
    # White on black = 21:1
    ratio = ContrastRatioAnalyzer.calculate_contrast_ratio("#ffffff", "#000000")
    assert ratio == 21
    
    # Gray on white = 1:1
    ratio = ContrastRatioAnalyzer.calculate_contrast_ratio("#cccccc", "#ffffff")
    assert ratio < 3  # Below AA threshold
```

**Test URL Extraction:**

```python
def test_extract_file_key():
    url = "https://www.figma.com/file/abc123/MyDesign"
    key = FigmaAPIClient.extract_file_key(url)
    assert key == "abc123"
    
    # Test design/ variant
    url2 = "https://www.figma.com/design/def456/Design"
    key2 = FigmaAPIClient.extract_file_key(url2)
    assert key2 == "def456"
```

### Integration Tests

```python
async def test_full_analysis():
    service = FigmaAnalysisService(token="test_token")
    
    result = await service.analyze_from_url(
        "https://www.figma.com/file/test123/TestDesign"
    )
    
    assert result.status == FigmaAnalysisStatus.COMPLETED
    assert len(result.page_results) > 0
    assert result.average_accessibility_score is not None
```

### API Tests

```bash
# Test URL validation
curl -X POST http://localhost:8000/api/v1/figma/validate-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.figma.com/file/abc123/Design"}'

# Test connection
curl -X GET http://localhost:8000/api/v1/figma/test-connection \
  -H "X-Figma-Token: your_token"

# Start analysis
curl -X POST http://localhost:8000/api/v1/figma/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "figma_url": "https://www.figma.com/file/abc123/Design",
    "analysis_scope": ["accessibility", "readability", "attention"]
  }'

# Check status
curl http://localhost:8000/api/v1/figma/analyze/{analysis_id}
```

---

## Recommended Libraries & Tools

### Accessibility Analysis
- **WCAG 2.1**: Built-in contrast ratio calculation
- **axe DevTools**: For more advanced checks (future enhancement)
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/

### Visual Hierarchy
- **Saliency Detection**: Built-in prominence scoring
- **PyTorch models** (if enabled): For advanced heatmap generation

### UI/UX Analysis
- **Readability metrics**: `textstat` library (in requirements)
- **Typography analysis**: Font metrics extraction

---

## Next Steps & Enhancements

### Phase 2 Features
1. **OAuth 2.0**: User's own Figma accounts
2. **Snapshot Storage**: Save design screenshots for comparison
3. **Historical Tracking**: Version comparison and improvement tracking
4. **Batch Analysis**: Analyze multiple files in one request
5. **Advanced Heatmaps**: ML-based visual saliency prediction
6. **Design Suggestions**: AI-powered recommendations

### Optimization Ideas
1. **Caching**: Redis for frequently analyzed files
2. **Async Processing**: Celery for large files
3. **Real-time WebSockets**: Live progress updates
4. **Batch Processing**: Analyze multiple frames in parallel

---

## Support & Troubleshooting

### Documentation Links
- Figma API: https://www.figma.com/developers/api
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- FastAPI: https://fastapi.tiangolo.com/
- Supabase: https://supabase.com/docs

### Common Questions

**Q: Can I use a public token?**
A: No, Figma tokens are personal. Use environment variables or prompt users to provide their own token.

**Q: How long does analysis take?**
A: Typically 10-30 seconds depending on file complexity and network speed.

**Q: Can I analyze shared files?**
A: Yes, if the file is shared with the account that owns the token.

**Q: Does it support components and variants?**
A: Yes, components are treated as elements with metadata extraction.

---

## License & Attribution

This implementation is part of the **ARAI System** (Accessibility, Readability, Attention Intelligence).

Built with:
- FastAPI, React, Supabase, Figma API

---

**Last Updated:** April 2026
**Version:** 1.0.0
**Author:** ARAI Development Team
