# Multiple Image Upload & Analysis Implementation Guide

## Overview
The ARAI system now supports uploading and analyzing multiple design images simultaneously, with separate detailed results for each image.

## New Components

### 1. **UploadAnalysisMultiple.jsx**
Enhanced upload component that allows users to select and analyze multiple images at once.

**Key Features:**
- Multi-file selection (drag & drop or browse)
- File preview thumbnails with removable items
- Editable design names for each image
- Sequential analysis of files
- Real-time progress tracking (e.g., "Analyzing 2/4...")
- "Add more files" button to append additional images
- Clear All button to reset selection
- Individual file status indicators (Pending/Analyzing/Complete)

**State Management:**
```javascript
const [files, setFiles] = useState([]); // Array of file objects with metadata
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analyzingIndex, setAnalyzingIndex] = useState(null); // Track current file
const [error, setError] = useState(null);
```

**File Object Structure:**
```javascript
{
  id: unique_id,
  file: File,
  preview: base64_string,
  designName: string,
  analyzed: boolean,
  results: analysis_response || null
}
```

**Analysis Flow:**
- Validates all files before starting
- Analyzes files sequentially (one at a time)
- Updates file status in real-time
- Retries on network errors (3 attempts)
- Calls `onAnalysisComplete` with combined results when all files are done

**Combined Results Format:**
```javascript
{
  analyses: [
    {
      designName: string,
      preview: base64_string,
      arai_score: number,
      overall_grade: string,
      accessibility: { ... },
      readability: { ... },
      attention: { ... }
    },
    // ... more analyses
  ],
  timestamp: ISO_string
}
```

---

### 2. **MultipleAnalysisResults.jsx**
New results display component for showing analysis results for multiple images.

**Key Features:**
- Image selection tabs (showing thumbnail, name, score)
- Summary cards view (quick overview of all scores)
- Detailed results for selected image
- Navigation between images
- "New Analysis" button for returning to upload

**UI Sections:**

#### Header
- "New Analysis" button to start over
- Title: "Analysis Results"
- Subtitle: "{n} designs analyzed"

#### Image Tabs (only shown if multiple images)
- Horizontal scrollable tabs
- Each tab shows:
  - Image thumbnail (80x80px)
  - Design name (truncated with ellipsis)
  - ARAI score (e.g., "75.0/100")
- Active tab highlighted with teal border (#14b8a6)
- Clickable to switch selected image

#### Summary Cards (only shown if multiple images)
- Grid layout showing all scores at a glance
- Card for each image with:
  - Design name
  - ARAI score (large)
  - Overall grade
- Clickable to select that image

#### Detailed Results
- Full SimplifiedAnalysisResults component
- Shows detailed breakdown for currently selected image
- All sections: main score, sub-scores, category analysis

---

### 3. **Dashboard.jsx Updates**
Dashboard now intelligently switches between single and multiple result displays.

**Rendering Logic:**
```javascript
{activeTab === 'results' && currentAnalysis && (
  currentAnalysis.analyses ? (
    <MultipleAnalysisResults 
      results={currentAnalysis} 
      onNewAnalysis={handleNewAnalysis}
    />
  ) : (
    <SimplifiedAnalysisResults 
      results={currentAnalysis} 
    />
  )
)}
```

**Backward Compatibility:**
- If `currentAnalysis.analyses` exists → Show MultipleAnalysisResults
- Otherwise → Show SimplifiedAnalysisResults (legacy)
- Handles both single and multiple image uploads seamlessly

---

## User Workflow

### Uploading Multiple Images

1. **Select Files**
   - Click upload area or drag & drop multiple files
   - Or click "browse files" and select multiple images
   - System shows preview thumbnails with file sizes

2. **Edit Names (Optional)**
   - Click on design names to edit them
   - Defaults to filename (without extension)
   - Helps organize results later

3. **Add/Remove Files**
   - Click X button on any image to remove it
   - Click "Add more files" to append additional images
   - Click "Clear All" to start over

4. **Analyze**
   - Click "Analyze {n} Designs" button
   - System analyzes files sequentially
   - Progress shows: "Analyzing 2/4..."
   - Real-time status indicators on each file

5. **View Results**
   - Automatic navigation to results tab
   - Shows all scores in summary cards
   - Click any card or tab to view detailed results
   - Use image tabs to switch between images

6. **New Analysis**
   - Click "New Analysis" button
   - Returns to upload page
   - Previous results are cleared

---

## Technical Details

### File Validation
- **Supported formats:** PNG, JPG, JPEG, WebP
- **Max size per file:** 10MB
- **Batch validation:** All files validated before analysis starts

### API Integration
- **Endpoint:** `/api/v1/analysis/upload` (same as single image)
- **Method:** POST with multipart/form-data
- **Authentication:** Bearer token required
- **Sequential processing:** Files analyzed one at a time
- **Retry logic:** 3 attempts for network errors

### Error Handling
- File validation errors shown at upload time
- Analysis errors shown for specific files
- Network retries with exponential backoff (2s, 4s, 6s)
- Session expiration checks before each analysis
- User-friendly error messages

### Performance Considerations
- Sequential analysis (not parallel) to avoid server overload
- Lazy loading of previews with FileReader API
- Scrollable image tabs for many images
- Responsive image grid (auto-fit columns)
- CSS scrollbar styling for better UX

---

## CSS Styling

### New Classes
- `.multi-analysis-container` - Main container
- `.image-tabs-container` - Scrollable tabs wrapper
- `.image-tabs` - Tab flex container
- `.image-tab` - Individual tab button
- `.image-tab.active` - Active tab styling
- `.image-tab-image` - Thumbnail image
- `.image-tab-name` - Design name in tab
- `.image-tab-status` - Score display in tab
- `.summary-view` - Overview section
- `.summary-grid` - Responsive grid for cards
- `.summary-card` - Individual score card

### Responsive Breakpoints
- **Desktop (1200px+):** Full layout with 3-column grid
- **Tablet (768px-1200px):** Adjusted spacing, 2-column grid
- **Mobile (<768px):** Single column, smaller tabs

### Theme Integration
- Uses existing ARAI theme colors
- Teal accent (#14b8a6) for active elements
- Navy primary color (#0f2557)
- DM Serif Display + DM Sans typography
- Gradient backgrounds consistent with app

---

## State Management Flow

```
UploadAnalysisMultiple
  ↓ (onAnalysisComplete callback)
Dashboard.handleAnalysisComplete
  ↓ (sets currentAnalysis)
Conditional Render
  ├─ Multiple results? → MultipleAnalysisResults
  └─ Single result? → SimplifiedAnalysisResults

MultipleAnalysisResults
  ├─ State: selectedIndex (which image to show)
  ├─ Renders: Image tabs + Summary cards
  └─ Shows: SimplifiedAnalysisResults for selected image
```

---

## Error Recovery

### File Upload Errors
1. **Validation errors:** Shown immediately, user can remove file and retry
2. **Network errors:** Automatic retry (3 attempts)
3. **Server errors:** Specific error message with guidance
4. **Session expired:** Auto-redirect to login with clear message

### Partial Completion
- If some files fail to analyze:
  - Failed files stay marked as "Pending"
  - User can see which succeeded
  - Can retry failed files (coming soon)

---

## Future Enhancements

### Potential Improvements
1. **Parallel Analysis:** Analyze multiple files concurrently (with rate limiting)
2. **Batch Retry:** Retry specific failed files without re-uploading successful ones
3. **Comparison Mode:** Side-by-side comparison of multiple designs
4. **Export Reports:** Generate PDF/CSV reports for all analyses
5. **Drag-to-Reorder:** Reorder images in preview
6. **Bulk Actions:** Group files by similarity or performance
7. **History Grouping:** Save multiple analyses as a "batch" in history

---

## Testing Checklist

### Upload Functionality
- [ ] Single file upload
- [ ] Multiple files upload (5+)
- [ ] Drag and drop
- [ ] Edit design names
- [ ] Remove individual files
- [ ] Clear all files
- [ ] Add more files button

### Analysis
- [ ] Sequential processing
- [ ] Progress updates accurate
- [ ] Network retry logic
- [ ] Error handling
- [ ] Session expiration
- [ ] File size validation

### Results Display
- [ ] Multiple images show tabs
- [ ] Single image shows simple results
- [ ] Tab switching works
- [ ] Summary cards show correct scores
- [ ] New Analysis button works
- [ ] Responsive on mobile/tablet

### Edge Cases
- [ ] No files selected (error shown)
- [ ] Mix of valid/invalid files
- [ ] Very large files (10MB+)
- [ ] Network timeout during analysis
- [ ] Server errors (500, 502, 503)
- [ ] Rapid tab switching

---

## Code Examples

### Using the Upload Component
```jsx
import UploadAnalysisMultiple from '../Analysis/UploadAnalysisMultiple';

<UploadAnalysisMultiple 
  onAnalysisComplete={(results) => {
    console.log('Results:', results);
    // results.analyses is an array of analysis objects
  }} 
/>
```

### Using Multiple Results Component
```jsx
import MultipleAnalysisResults from '../Analysis/MultipleAnalysisResults';

<MultipleAnalysisResults 
  results={combinedResults}
  onNewAnalysis={() => {
    // Handle new analysis
  }}
/>
```

### Checking Result Type
```javascript
if (currentAnalysis.analyses) {
  // Multiple analyses - use MultipleAnalysisResults
} else {
  // Single analysis - use SimplifiedAnalysisResults
}
```

---

## File Structure
```
frontend/src/components/
├── Analysis/
│   ├── UploadAnalysisMultiple.jsx (NEW)
│   ├── MultipleAnalysisResults.jsx (NEW)
│   ├── SimplifiedAnalysisResults.jsx (unchanged)
│   └── UploadAnalysis.jsx (legacy, can be kept for backward compat)
├── Dashboard/
│   └── Dashboard.jsx (updated)
└── ...
```

---

## Migration Notes

### For Existing Single-Image Uploads
- **No breaking changes:** System detects single vs. multiple
- **Backward compatible:** Old single-image code still works
- **Gradual adoption:** Can use either upload component

### Updating Imports
Old way (still works):
```javascript
import UploadAnalysis from '../Analysis/UploadAnalysis';
```

New way (recommended):
```javascript
import UploadAnalysisMultiple from '../Analysis/UploadAnalysisMultiple';
```

---

## Support & Troubleshooting

### Common Issues

**Q: Analysis stops at 1/4, others show Pending**
A: Check network connection. System will retry automatically. Check browser console for errors.

**Q: Images not showing in tabs**
A: Ensure preview was created successfully. Check browser DevTools Network tab.

**Q: "Add more files" not working**
A: Only available when files list already exists. Try selecting initial files first.

**Q: Results show old analysis**
A: Click "New Analysis" first to clear previous state, then upload new files.

---

## API Contract

### Upload Endpoint (Unchanged)
- **URL:** `/api/v1/analysis/upload`
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  - `file` (File, required)
  - `design_name` (string, optional)
- **Response:** Single analysis object (same as before)

### Single Analysis Response Structure
```json
{
  "arai_score": 75.0,
  "overall_grade": "Good",
  "arai_breakdown": { ... },
  "accessibility": { "score": 80, "issues": [...] },
  "readability": { "score": 70, "issues": [...] },
  "attention": { "score": 75, "issues": [...] }
}
```

### Frontend Transformation
UploadAnalysisMultiple wraps responses into:
```json
{
  "analyses": [
    { "designName": "...", "preview": "...", ...response },
    { "designName": "...", "preview": "...", ...response }
  ],
  "timestamp": "2024-04-13T10:00:00Z"
}
```

---

## Performance Metrics

### Expected Performance
- **File selection:** <100ms
- **Preview generation:** ~500ms per image
- **Single analysis:** 60-180 seconds (depends on model loading)
- **Multiple analyses:** Sequential, so n × 60-180 seconds
- **Results display:** <100ms to switch images

### Optimization Tips
- First analysis is slowest (model loading)
- Subsequent analyses are 30-50% faster
- Keep file sizes <5MB for best performance
- Use modern browsers (Chrome, Firefox, Safari, Edge)

---

## Conclusion
The multiple image upload feature provides a seamless way to analyze multiple designs in a single workflow while maintaining backward compatibility with existing single-image analysis.
