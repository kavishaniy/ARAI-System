# Multiple Image Upload - Visual Architecture

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      START: Upload Page                          │
│                                                                  │
│   [Select Files Area]                                           │
│   "Drag & drop or click to browse"                              │
│                                                                  │
│   Supported: PNG, JPG, JPEG, WebP (Max 10MB each)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    File Selection & Preview                      │
│                                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │            │
│   │  │       │  │  │  │       │  │  │  │       │  │            │
│   │  │Image1 │  │  │  │Image2 │  │  │  │Image3 │  │            │
│   │  │       │  │  │  │       │  │  │  │       │  │            │
│   │  └───────┘  │  │  └───────┘  │  │  └───────┘  │            │
│   │ Homepage    │  │ Mobile      │  │ Tablet      │            │
│   │ (2.5 MB) [X]│  │ (3.1 MB) [X]│  │ (1.8 MB) [X]│            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
│   [+ Add more files]                                            │
│                                                                  │
│   [Analyze 3 Designs]  [Clear All]                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Sequential Analysis (Backend)                   │
│                                                                  │
│   File 1: Homepage                                              │
│   ├─ Status: Analyzing ⟳                                        │
│   ├─ API Call: POST /api/v1/analysis/upload                     │
│   ├─ Processing: AI Model Analysis                              │
│   ├─ Time: 60-180 seconds                                       │
│   └─ Result: { arai_score, accessibility, readability, ... }   │
│                                                                  │
│   File 2: Mobile (Waiting)                                      │
│   ├─ Status: Pending ⏳                                          │
│   └─ Will start after File 1 completes                          │
│                                                                  │
│   File 3: Tablet (Waiting)                                      │
│   ├─ Status: Pending ⏳                                          │
│   └─ Will start after File 2 completes                          │
│                                                                  │
│   Progress: "Analyzing 1/3..."                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Analysis Complete                               │
│                                                                  │
│   All 3 files analyzed successfully ✓                           │
│                                                                  │
│   Combined Results Object:                                      │
│   {                                                              │
│     analyses: [                                                  │
│       { designName, preview, arai_score, grades, ... },        │
│       { designName, preview, arai_score, grades, ... },        │
│       { designName, preview, arai_score, grades, ... }         │
│     ],                                                           │
│     timestamp: "2024-04-13T..."                                 │
│   }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               Results Page: Multiple Images Tab View             │
│                                                                  │
│   [← New Analysis]                                              │
│   Analysis Results - 3 designs analyzed                         │
│                                                                  │
│   IMAGE TABS:                                                   │
│   ┌────────┐ ┌────────┐ ┌────────┐                             │
│   │┌──────┐│ │┌──────┐│ │┌──────┐│                             │
│   ││      ││ ││      ││ ││      ││                             │
│   ││Home  ││ ││Mobile││ ││Tablet││                             │
│   ││      ││ ││      ││ ││      ││                             │
│   │└──────┘│ │└──────┘│ │└──────┘│                             │
│   │75.0/100│ │82.0/100│ │78.0/100│                             │
│   └────────┘ └────────┘ └────────┘                             │
│   [Active]     [Inactive] [Inactive]                            │
│                                                                  │
│   SUMMARY CARDS:                                                │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│   │ Homepage     │ │ Mobile       │ │ Tablet       │           │
│   │              │ │              │ │              │           │
│   │    75.0      │ │    82.0      │ │    78.0      │           │
│   │    Good      │ │  Excellent   │ │    Good      │           │
│   └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                  │
│   DETAILED RESULTS (Homepage selected):                         │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ One score. Three dimensions of inclusivity.            │   │
│   │                                                         │   │
│   │ Accessibility  80.0/100 | Readability  70.0/100        │   │
│   │ Attention      75.0/100                                │   │
│   │                                                         │   │
│   │ [Full detailed analysis...]                            │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User can click other tabs
                   to view those results in detail
                              ↓
                  [← New Analysis] to start over
```

---

## Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                       Dashboard                                │
│                                                                │
│  State:                                                        │
│  - currentAnalysis (object)                                    │
│  - activeTab ('upload' | 'results' | 'history')              │
│                                                                │
│  Logic:                                                        │
│  if (currentAnalysis.analyses) {                              │
│    → MultipleAnalysisResults                                 │
│  } else if (currentAnalysis) {                                │
│    → SimplifiedAnalysisResults (legacy)                      │
│  } else if (activeTab === 'upload') {                        │
│    → UploadAnalysisMultiple                                  │
│  }                                                             │
└────────────────────────────────────────────────────────────────┘
         │                                │
         ↓                                ↓
    ┌─────────────────────────┐  ┌──────────────────────────┐
    │ UploadAnalysisMultiple  │  │ MultipleAnalysisResults  │
    │                         │  │                          │
    │ Upload multiple files   │  │ Show results in tabs &   │
    │ Sequential analysis     │  │ summary cards            │
    │ Real-time progress      │  │                          │
    │ Detailed error handling │  │ Delegate to:             │
    │                         │  │                          │
    │ State:                  │  │ SimplifiedAnalysisResults│
    │ - files[]              │  │ (for detailed view)      │
    │ - isAnalyzing          │  │                          │
    │ - analyzingIndex       │  │ State:                   │
    │ - error                │  │ - selectedIndex (which   │
    │                         │  │   image to show)         │
    │ Output:                 │  │                          │
    │ {                       │  │ Features:                │
    │   analyses: [           │  │ - Image tabs            │
    │     {...result},        │  │ - Summary cards         │
    │     {...result},        │  │ - Tab switching         │
    │     {...result}         │  │ - "New Analysis" btn    │
    │   ]                     │  │                          │
    │ }                       │  │ Outputs:                │
    └─────────────────────────┘  │ - onNewAnalysis()       │
                                  └──────────────────────────┘
                                            │
                                            ↓
                          ┌──────────────────────────────┐
                          │SimplifiedAnalysisResults     │
                          │(Unchanged)                   │
                          │                              │
                          │ Shows detailed breakdown of  │
                          │ a single analysis result:    │
                          │ - Main score with ring       │
                          │ - Sub-scores (3-column)      │
                          │ - Category sections          │
                          │ - Issue details              │
                          │ - Solutions & best practices │
                          └──────────────────────────────┘
```

---

## State Management Flow

```
UPLOAD PHASE:
─────────────

Initial State:
  files = []
  isAnalyzing = false
  error = null

↓ User selects file
  
State Update:
  files = [{file, preview, name, analyzed: false}]

↓ User clicks "Analyze"
  
State Update:
  isAnalyzing = true
  analyzingIndex = 0


ANALYSIS PHASE:
───────────────

Loop through files:
  
  For File 0:
    ├─ analyzingIndex = 0
    ├─ Call API: POST /upload
    ├─ Update: files[0].analyzed = true
    ├─ Update: files[0].results = response
    
  For File 1:
    ├─ analyzingIndex = 1
    ├─ Call API: POST /upload
    ├─ Update: files[1].analyzed = true
    ├─ Update: files[1].results = response
    
  For File 2:
    ├─ analyzingIndex = 2
    ├─ Call API: POST /upload
    ├─ Update: files[2].analyzed = true
    ├─ Update: files[2].results = response

Final State:
  isAnalyzing = false
  Call onAnalysisComplete(combinedResults)


RESULTS PHASE:
──────────────

UploadAnalysisMultiple → onAnalysisComplete → Dashboard.handleAnalysisComplete
                                                    ↓
                                        currentAnalysis = {analyses: [...]}
                                                    ↓
                                    Dashboard detects .analyses exists
                                                    ↓
                                      Renders MultipleAnalysisResults
                                                    ↓
                MultipleAnalysisResults State:
                  selectedIndex = 0 (first image)
                                                    ↓
                User can click tabs to change selectedIndex
                                                    ↓
                SimplifiedAnalysisResults renders
                  currentAnalysis.analyses[selectedIndex]
```

---

## Data Transformation

```
RAW FILES (User Input)
┌─────────────────────────────────────────┐
│ File('homepage.png')                    │
│ File('mobile.png')                      │
│ File('tablet.png')                      │
└─────────────────────────────────────────┘
                ↓
PROCESSED BY UploadAnalysisMultiple
┌─────────────────────────────────────────┐
│ files = [                               │
│   {                                     │
│     id: 1234567,                        │
│     file: File,                         │
│     preview: "data:image/png;base64...",│
│     designName: "homepage",             │
│     analyzed: false,                    │
│     results: null                       │
│   },                                    │
│   { ... (mobile) },                     │
│   { ... (tablet) }                      │
│ ]                                       │
└─────────────────────────────────────────┘
                ↓
ANALYZED BY API (Sequential)
┌─────────────────────────────────────────┐
│ POST /api/v1/analysis/upload            │
│ ├─ Input: File('homepage.png')          │
│ └─ Output: {                            │
│     arai_score: 75.0,                   │
│     overall_grade: "Good",              │
│     accessibility: {...},              │
│     readability: {...},                 │
│     attention: {...}                    │
│   }                                     │
│                                         │
│ (Repeat for mobile, tablet...)          │
└─────────────────────────────────────────┘
                ↓
COMBINED BY UploadAnalysisMultiple
┌─────────────────────────────────────────┐
│ {                                       │
│   analyses: [                           │
│     {                                   │
│       designName: "homepage",           │
│       preview: "data:image/png...",     │
│       arai_score: 75.0,                 │
│       overall_grade: "Good",            │
│       accessibility: {...},             │
│       readability: {...},               │
│       attention: {...}                  │
│     },                                  │
│     { ... (mobile) },                   │
│     { ... (tablet) }                    │
│   ],                                    │
│   timestamp: "2024-04-13T..."           │
│ }                                       │
└─────────────────────────────────────────┘
                ↓
DISPLAYED BY MultipleAnalysisResults
┌─────────────────────────────────────────┐
│ Image Tabs:                             │
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │Home  │ │Mobile│ │Tablet│             │
│ │75.0  │ │82.0  │ │78.0  │             │
│ └──────┘ └──────┘ └──────┘             │
│                                         │
│ Summary Cards: (Same data)              │
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │75.0  │ │82.0  │ │78.0  │             │
│ │Good  │ │Excel │ │Good  │             │
│ └──────┘ └──────┘ └──────┘             │
│                                         │
│ Detailed View:                          │
│ SimplifiedAnalysisResults({              │
│   arai_score: 75.0,                     │
│   accessibility: {...},                 │
│   ... (selected image data)             │
│ })                                      │
└─────────────────────────────────────────┘
```

---

## Responsive Design Breakpoints

```
DESKTOP (1200px+)
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Image Tabs (Horizontal Scroll)                      │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ... ┌──────┐           │ │
│ │ │ Home │ │Mobile│ │Tablet│ ... │ Page5│           │ │
│ │ └──────┘ └──────┘ └──────┘ ... └──────┘           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Summary Cards (3-column grid)                       │ │
│ │ ┌────────┐ ┌────────┐ ┌────────┐                  │ │
│ │ │ 75.0   │ │ 82.0   │ │ 78.0   │                  │ │
│ │ │ Good   │ │Excellent│ │ Good   │                  │ │
│ │ └────────┘ └────────┘ └────────┘                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Detailed Results (Full width)                       │ │
│ │ [Detailed analysis content...]                      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘


TABLET (768px - 1200px)
┌────────────────────────────────────┐
│ ┌──────────────────────────────────┐│
│ │ Image Tabs (Horizontal Scroll)   ││
│ │ ┌──────┐ ┌──────┐ ┌──────┐      ││
│ │ │ Home │ │Mobile│ │Tablet│      ││
│ │ └──────┘ └──────┘ └──────┘      ││
│ └──────────────────────────────────┘│
│                                     │
│ ┌──────────────────────────────────┐│
│ │ Summary Cards (2-column grid)    ││
│ │ ┌────────────┐ ┌────────────┐   ││
│ │ │ 75.0/Good  │ │ 82.0/Excel │   ││
│ │ └────────────┘ └────────────┘   ││
│ │ ┌────────────┐                   ││
│ │ │ 78.0/Good  │                   ││
│ │ └────────────┘                   ││
│ └──────────────────────────────────┘│
│                                     │
│ ┌──────────────────────────────────┐│
│ │ Detailed Results (Full width)    ││
│ │ [Adjusted content...]            ││
│ └──────────────────────────────────┘│
└────────────────────────────────────┘


MOBILE (<768px)
┌──────────────────────┐
│ ┌────────────────────┐│
│ │ Image Tabs         ││
│ │ ┌──────┐ ┌──────┐ ││
│ │ │ Home │ │Mobile│ ││
│ │ │▼     │ │      │ ││
│ │ └──────┘ └──────┘ ││
│ └────────────────────┘│
│                       │
│ ┌────────────────────┐│
│ │Summary Cards (1col)││
│ │ ┌────────────────┐ ││
│ │ │ Home  │ 75.0   │ ││
│ │ │       │ Good   │ ││
│ │ └────────────────┘ ││
│ │ ┌────────────────┐ ││
│ │ │ Mobile│ 82.0   │ ││
│ │ │       │ Excel  │ ││
│ │ └────────────────┘ ││
│ │ ┌────────────────┐ ││
│ │ │ Tablet│ 78.0   │ ││
│ │ │       │ Good   │ ││
│ │ └────────────────┘ ││
│ └────────────────────┘│
│                       │
│ ┌────────────────────┐│
│ │Detailed Results    ││
│ │[Mobile optimized]  ││
│ └────────────────────┘│
└──────────────────────┘
```

---

## Error Handling Flow

```
USER SELECTS FILES
        ↓
VALIDATION CHECK
├─ File type valid?
│  └─ Invalid? Show error, halt
├─ File size <10MB?
│  └─ Too large? Show error, halt
└─ At least 1 file?
   └─ None? Show error when analyzing

        ↓ All valid
SEND TO ANALYSIS
        ↓
API CALL (File 1)
├─ Network error?
│  ├─ Retry 1 → Wait 2s
│  ├─ Retry 2 → Wait 4s
│  ├─ Retry 3 → Wait 6s
│  └─ Still failing? Error message
├─ Server error (5xx)?
│  └─ Retry logic (same as above)
├─ Auth error (401)?
│  └─ Redirect to login
└─ Success?
   └─ Store results, move to File 2

        ↓ Repeat for all files
API CALL (File N)
        ↓
ALL COMPLETE OR FAILED
├─ All succeeded? Show results
├─ Some failed? Show partial results
│  └─ Mark failed files as "Pending"
└─ All failed? Show error, option to retry
```

---

## Browser Compatibility

```
✅ Chrome 90+ ................... Full support
✅ Firefox 88+ .................. Full support
✅ Safari 14+ ................... Full support
✅ Edge 90+ ..................... Full support
✅ iOS Safari 14+ ............... Full support
✅ Android Chrome 90+ ........... Full support

Features Used:
- FileReader API (preview generation)
- Fetch/Axios (API calls)
- Flexbox/Grid (layout)
- CSS transforms (animations)
- JavaScript ES6+ (arrow functions, destructuring)
- React 16.8+ (hooks)
```

---

## Performance Timeline

```
T+0s       User drops 3 files
├─ <100ms: File reading starts
├─ ~500ms: Previews generated
└─ File list displayed

T+1s       User clicks "Analyze"
├─ Validation check
└─ File 1 analysis begins

T+1-180s   File 1 Analysis
├─ ~120s: AI model loads (first time only)
├─ ~60s: Design analysis
└─ Results stored

T+180s     File 2 Analysis begins
├─ ~60s: Analysis (model already loaded)
└─ Results stored

T+240s     File 3 Analysis begins
├─ ~60s: Analysis
└─ Results stored

T+300s     All complete
├─ Results combined
├─ <100ms: Dashboard renders
└─ Results page displayed
```

---

## Key Improvements Over Single Upload

```
BEFORE (Single Image)           AFTER (Multiple Images)
──────────────────────           ──────────────────────

1 image → Upload → Analyze      N images → Upload → Analyze

Result visible in 1-3 min       All results in n × (1-3) min

Go back → Upload again          Go back → Upload more

One screenshot per analysis     All screenshots in summary

Hard to compare 2 designs       Easy tab-switching to compare

Manual workflow repeat           One workflow, many images
```

---

## Summary

The multiple image upload feature provides:
1. **Efficiency**: Analyze multiple designs in one workflow
2. **Usability**: Beautiful results display with tabs and cards
3. **Flexibility**: Sequential processing prevents overload
4. **Reliability**: Error recovery and retries
5. **Compatibility**: Works alongside existing code
6. **Responsiveness**: Mobile, tablet, and desktop optimized

All components are production-ready and fully tested.
