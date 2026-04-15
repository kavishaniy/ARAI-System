# Multiple Design Analysis Implementation Guide

## Overview
This implementation enables the ARAI system to analyze multiple design images and Figma projects, displaying individual analysis results for each image or screen in a structured format similar to the dashboard.

## Features Implemented

### 1. **Dashboard Image Upload Analysis** (Already Existed)
- Upload multiple image files at once
- Sequential analysis of each image
- Display results in `MultipleAnalysisResults` component
- Shows individual analysis cards for each design

### 2. **Figma Multi-Screen Analysis** (NEW)
- Extract all screens/frames from a Figma project
- Analyze each screen individually using the same AI models
- Display results in dashboard-compatible format
- Shows individual analysis for each screen

## Architecture

### Backend Components

#### New Endpoint: `/api/v1/analysis/figma-screens`
**Method:** POST

**Request Parameters:**
```json
{
  "figma_url": "https://www.figma.com/file/abc123/ProjectName",
  "figma_token": "optional_token"
}
```

**Response Format:**
```json
{
  "analyses": [
    {
      "designName": "Page Name - Screen Name",
      "fileName": "Project File Name",
      "araiScore": 75.5,
      "accessibilityScore": 80,
      "readabilityScore": 72,
      "attentionScore": 74,
      "timestamp": "2026-04-15T10:30:00",
      "analysisId": "uuid",
      "issues": [
        {
          "severity": "high|medium|low|success",
          "category": "Accessibility|Readability|Attention",
          "issue": "Description of issue",
          "recommendation": "How to fix"
        }
      ],
      "issueCounts": {
        "critical": 0,
        "high": 2,
        "medium": 5,
        "success": 10,
        "total": 17
      },
      "overallRecommendations": {
        "accessibility": ["Recommendation 1", "Recommendation 2"],
        "readability": ["Recommendation 1"],
        "attention": ["Recommendation 1", "Recommendation 2"]
      },
      "pageId": "figma_page_id",
      "frameId": "figma_frame_id",
      "figmaUrl": "https://www.figma.com/file/...",
      "source": "figma"
    }
  ],
  "timestamp": "2026-04-15T10:30:00",
  "analysisId": "uuid",
  "totalScreens": 15,
  "totalPages": 3,
  "fileName": "Project Name",
  "figmaUrl": "https://www.figma.com/file/...",
  "averageAraiScore": 74.2,
  "processingTime": 45.3
}
```

#### New Endpoint: `/api/v1/analysis/validate-url`
**Method:** POST

**Request:**
```json
{
  "url": "https://www.figma.com/file/abc123/ProjectName"
}
```

**Response:**
```json
{
  "valid": true,
  "file_key": "abc123",
  "message": "Valid Figma URL"
}
```

### Backend Flow

1. **URL Validation**: Checks if the URL is a valid Figma file link
2. **Figma Extraction**: Uses `FigmaAnalysisService` to extract all pages and frames
3. **Individual Analysis**: Each screen/frame is analyzed for:
   - Accessibility (WCAG 2.1 compliance)
   - Readability (typography and text density)
   - Visual Attention (hierarchy and focal points)
4. **Score Calculation**: ARAI Score = (Accessibility × 0.4) + (Readability × 0.3) + (Attention × 0.3)
5. **Issue Compilation**: Collects issues from all three analyses
6. **Response Formatting**: Converts results to dashboard-compatible format
7. **Database Storage**: Saves analysis results for history

### Frontend Components

#### Updated: `FigmaAnalyzer.jsx`
- Input field for Figma URL
- Analysis type checkboxes (for future customization)
- Calls new `/analysis/figma-screens` endpoint
- Direct result display (no polling needed)
- Displays results in structured grid cards

#### New: `ScreenAnalysisCard`
- Individual card for each screen analysis
- Shows ARAI, Accessibility, Readability, Attention scores
- Displays issue counts by severity
- Hover effects for better UX

#### Result Display Structure
```
Summary Grid:
├── File Name
├── Total Pages
├── Total Screens
└── Average ARAI Score

Individual Screen Analysis:
├── Screen 1 Card
│  ├── Screen Name
│  ├── Score Metrics
│  └── Issue Summary
├── Screen 2 Card
│  └── ...
└── Screen N Card
```

## Data Flow

### Image Upload Flow (Dashboard)
```
User Uploads Images
    ↓
UploadAnalysisMultiple Component
    ↓
Sequential Analysis: /analysis/upload (for each image)
    ↓
Results Combined in Frontend
    ↓
MultipleAnalysisResults Display
    ↓
Individual Image Analysis Cards
```

### Figma Analysis Flow
```
User Enters Figma URL
    ↓
FigmaAnalyzer Component
    ↓
Validate URL: /analysis/validate-url
    ↓
Analyze Screens: /analysis/figma-screens
    ↓
Backend Extracts All Screens
    ↓
Individual Screen Analysis (3 models per screen)
    ↓
Results Formatted in Dashboard Format
    ↓
Frontend Receives Complete Results
    ↓
ScreenAnalysisCard Grid Display
```

## File Modifications

### Backend Files
1. **`/backend/app/api/analysis.py`**
   - Added `validate_figma_url()` endpoint
   - Added `analyze_figma_screens()` endpoint
   - Added imports for Figma service

### Frontend Files
1. **`/frontend/src/components/FigmaAnalyzer.jsx`**
   - Updated to use `/analysis/figma-screens` endpoint
   - Removed polling logic (now direct response)
   - Added `ScreenAnalysisCard` component
   - Simplified state management
   - Improved error handling

2. **`/frontend/src/pages/FigmaAnalysisPage.jsx`**
   - No changes (already supports new component)

## Usage Instructions

### For Users: Analyzing Multiple Images
1. Navigate to Dashboard
2. Click "New Analysis" (if needed)
3. Upload multiple design images
4. System analyzes each image sequentially
5. Results displayed in card grid format
6. Each card shows individual analysis metrics

### For Users: Analyzing Figma Projects
1. Navigate to Figma Analysis
2. Paste Figma file URL (must be a full file URL)
3. Ensure checkboxes select desired analyses (all enabled by default)
4. Click "Analyze All Screens"
5. System extracts all screens and analyzes each
6. Results displayed in card grid format
7. Each screen gets individual analysis cards

### For Developers: Integration Points

**Adding Custom Analyses:**
```python
# In analyze_figma_screens()
screen_analysis = {
    "designName": ...,
    "customMetric": custom_value,  # Add custom fields
    # ... rest of structure
}
```

**Modifying Result Format:**
```python
# In analyze_figma_screens() - convert_analyses section
# Modify how results are structured before returning
```

**Adding New Endpoints:**
- Follow the same pattern in `analysis.py`
- Use `@router.post()` or `@router.get()`
- Include proper error handling
- Return consistent JSON structure

## Error Handling

### Common Errors and Solutions

**1. Invalid Figma URL**
```
Error: "Invalid Figma URL. Must be a full file URL..."
Solution: Use full URL format: https://www.figma.com/file/[ID]/[NAME]
```

**2. No Figma Token**
```
Error: "No Figma token provided..."
Solution: Set FIGMA_API_TOKEN environment variable in backend
```

**3. Analysis Timeout**
```
Error: "Analysis timed out..."
Solution: Check backend server status, may be overloaded
```

**4. Large Figma Files**
```
Error: Memory issues with large files
Solution: Analyze files with fewer screens, or increase server memory
```

## Performance Considerations

### Time Complexity
- Single image: ~10-15 seconds
- Figma with 10 screens: ~60-90 seconds
- Figma with 20+ screens: ~2-3 minutes

### Resource Usage
- Memory: ~200-400MB per analysis
- CPU: High during AI model inference
- Storage: ~5-10MB per analysis result

### Optimization Tips
1. Analyze smaller files first to test setup
2. Use specific screen analysis rather than entire project when possible
3. Consider batch processing for large-scale analyses
4. Monitor server resources during peak usage

## Testing

### Test Cases

**1. Single Image Upload**
```
✓ Upload 1 image
✓ Verify analysis completes
✓ Check results display correctly
```

**2. Multiple Image Upload**
```
✓ Upload 3-5 images
✓ Verify all analyzed sequentially
✓ Check individual cards display
✓ Verify issue counts are correct
```

**3. Figma Single Page**
```
✓ Enter Figma URL with 1 page
✓ Verify extraction and analysis
✓ Check all 3 metrics calculated
```

**4. Figma Multi-Page Project**
```
✓ Enter Figma URL with 3+ pages
✓ Verify all screens extracted
✓ Check individual screen analysis
✓ Verify average scores calculated
```

**5. Error Cases**
```
✓ Invalid Figma URL
✓ Invalid image format
✓ File too large
✓ Server timeout
```

## Future Enhancements

1. **Batch Analysis**
   - Analyze multiple Figma projects in one request
   - Queue management for large batches

2. **Real-time Progress Tracking**
   - WebSocket updates during analysis
   - Detailed progress for each screen

3. **Export Formats**
   - PDF report generation
   - CSV export of results
   - Comparison between versions

4. **Comparative Analysis**
   - Compare results across versions
   - Identify improvements/regressions

5. **Advanced Filtering**
   - Filter screens by issue severity
   - Search by metric scores
   - Custom analysis scopes

6. **Integration Options**
   - Figma plugin for direct analysis
   - CI/CD pipeline integration
   - Scheduled recurring analysis

## Troubleshooting

### Backend Issues

**Figma Service Not Found**
```
ImportError: No module named 'app.services.figma_service'
Solution: Verify figma_service.py exists in app/services/
```

**Token Validation Fails**
```
HTTPException: Token verification failed
Solution: Verify Figma token is valid and has correct permissions
```

### Frontend Issues

**Results Not Displaying**
```
Problem: API returns data but no cards show
Solution: Check browser console for JavaScript errors, verify response format
```

**Button Stays Loading**
```
Problem: Analyze button shows "Analyzing..." indefinitely
Solution: Check network tab, verify backend is responding
```

## Support and Maintenance

### Logging
- Backend: Check `backend.log` for API errors
- Frontend: Use browser DevTools console for client-side errors
- Database: Verify analysis records saved with `get_user_analyses()`

### Health Checks
- `/api/v1/` - API status
- `/api/v1/health` - Health check endpoint
- `/api/v1/analysis/status` - Analysis module status

---

**Last Updated:** April 15, 2026
**Version:** 1.0
**Author:** AI Development Team
