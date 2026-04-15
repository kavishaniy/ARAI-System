# 🎨 ARAI System - Figma Analyzer Visual Guide & Flowchart

---

## 📊 Complete Feature Flow Diagram

```
                        USER JOURNEY
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  START: User wants to analyze Figma designs                   │
│         (multiple screens/pages)                              │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 1. Open ARAI Web App                                   │  │
│  │    http://localhost:3000                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 2. Navigate to "Figma Analysis" Section                │  │
│  │    (Sidebar → Figma Analysis)                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 3. See FigmaAnalyzer Component                         │  │
│  │    ├─ Title: "Figma Design Analyzer"                  │  │
│  │    ├─ Input: Figma File URL field                     │  │
│  │    ├─ Checkboxes: Analysis Types                      │  │
│  │    │  ☑ Accessibility                                │  │
│  │    │  ☑ Readability                                  │  │
│  │    │  ☑ Attention                                    │  │
│  │    └─ Button: "Analyze All Screens"                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 4. User Inputs Figma URL                              │  │
│  │    Paste: https://www.figma.com/design/abc123/Project │  │
│  │                                                         │  │
│  │    Format: https://www.figma.com/design/{FILE_ID}/... │  │
│  │    or      https://www.figma.com/file/{FILE_ID}/...   │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 5. Click "Analyze All Screens" Button                 │  │
│  │                                                         │  │
│  │    Frontend checks:                                     │  │
│  │    ├─ Is user authenticated? (Has JWT token)           │  │
│  │    ├─ Is URL filled?                                   │  │
│  │    └─ Has checkboxes selected?                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 6. API Call Initiated                                 │  │
│  │    POST /api/v1/analysis/figma-screens                │  │
│  │    Headers: {                                           │  │
│  │      Authorization: "Bearer {JWT_TOKEN}"              │  │
│  │    }                                                    │  │
│  │    Body: {                                              │  │
│  │      figma_url: "https://www.figma.com/design/...",  │  │
│  │      figma_token: null  // Uses FIGMA_API_TOKEN       │  │
│  │    }                                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 7. Button Changes State                               │  │
│  │    Old: "Analyze All Screens"                         │  │
│  │    New: "Analyzing... Please wait (2-5 minutes)"      │  │
│  │                                                         │  │
│  │    + Show Progress Message:                            │  │
│  │    "⏳ Analysis in Progress                            │  │
│  │     Extracting Figma screens and running analysis..." │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│                                                                │
│               BACKEND PROCESSING (2-5 min)                    │
│                                                                │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 8. Backend Receives Request                           │  │
│  │    Server: analyze_figma_screens()                    │  │
│  │                                                         │  │
│  │    Step 1: Validate Authentication                    │  │
│  │    └─ Check JWT token                                 │  │
│  │    └─ Get user ID                                     │  │
│  │                                                         │  │
│  │    Step 2: Validate URL                               │  │
│  │    └─ Check format: "figma.com/design/" or "/file/"  │  │
│  │    └─ Extract file key: "abc123"                      │  │
│  │                                                         │  │
│  │    Step 3: Get Figma Token                            │  │
│  │    └─ Use provided token OR                           │  │
│  │    └─ Use FIGMA_API_TOKEN from environment           │  │
│  │    └─ Raise error if none available                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 9. Initialize FigmaAnalysisService                    │  │
│  │    service = FigmaAnalysisService(                     │  │
│  │      figma_token=FIGMA_API_TOKEN                      │  │
│  │    )                                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 10. Analyze from URL                                  │  │
│  │     result = await service.analyze_from_url(          │  │
│  │       figma_url=url,                                  │  │
│  │       analysis_scope=[                                │  │
│  │         "accessibility",                              │  │
│  │         "readability",                                │  │
│  │         "attention"                                   │  │
│  │       ]                                                │  │
│  │     )                                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 11. Extract All Pages & Frames from Figma            │  │
│  │     FigmaAPIClient.get_file(file_key) →              │  │
│  │     {                                                  │  │
│  │       "file": {                                        │  │
│  │         "name": "MyProject",                          │  │
│  │         "pages": [                                     │  │
│  │           {                                            │  │
│  │             "id": "page_1",                           │  │
│  │             "name": "Page 1",                         │  │
│  │             "children": [                             │  │
│  │               {                                        │  │
│  │                 "id": "frame_1",                      │  │
│  │                 "name": "Login Screen",               │  │
│  │                 "children": [...]  // UI elements     │  │
│  │               },                                       │  │
│  │               { "id": "frame_2", ... },               │  │
│  │               { ... more frames }                     │  │
│  │             ]                                          │  │
│  │           },                                           │  │
│  │           {                                            │  │
│  │             "id": "page_2",                           │  │
│  │             "name": "Page 2",                         │  │
│  │             "children": [ ... ]                       │  │
│  │           },                                           │  │
│  │           { ... more pages }                          │  │
│  │         ]                                              │  │
│  │       }                                                │  │
│  │     }                                                  │  │
│  │                                                         │  │
│  │     Total: 3 pages, 12 screens/frames                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 12. Process Each Page                                 │  │
│  │     FOR page IN pages:                                 │  │
│  │       page_result = await _analyze_page(page)         │  │
│  │                                                         │  │
│  │       FOR frame IN page.children:                     │  │
│  │         frame_result = _analyze_frame(frame)          │  │
│  │         page_result.frames.append(frame_result)       │  │
│  │                                                         │  │
│  │       analysis_results.append(page_result)            │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 13. Analyze Each Frame                                │  │
│  │                                                         │  │
│  │     FOR each Frame:                                    │  │
│  │                                                         │  │
│  │     13A. Extract UI Elements                          │  │
│  │          └─ Text boxes, buttons, images, shapes       │  │
│  │          └─ Get: position, size, color, font         │  │
│  │                                                         │  │
│  │     13B. Accessibility Analysis                       │  │
│  │          └─ FigmaAccessibilityAnalyzer               │  │
│  │          └─ Check:                                    │  │
│  │             • Contrast ratios (text vs background)   │  │
│  │             • Font sizes (≥12px recommended)         │  │
│  │             • Color blind friendly colors            │  │
│  │          └─ Produce: accessibility_score (0-100)     │  │
│  │                                                         │  │
│  │     13C. Readability Analysis                         │  │
│  │          └─ FigmaReadabilityAnalyzer                 │  │
│  │          └─ Check:                                    │  │
│  │             • Text density                           │  │
│  │             • Line spacing                           │  │
│  │             • Paragraph lengths                      │  │
│  │             • Font hierarchy                         │  │
│  │          └─ Produce: readability_score (0-100)       │  │
│  │                                                         │  │
│  │     13D. Attention/Visual Hierarchy Analysis          │  │
│  │          └─ FigmaAttentionAnalyzer                   │  │
│  │          └─ Check:                                    │  │
│  │             • Size contrasts (heading vs body)       │  │
│  │             • Color prominence                       │  │
│  │             • White space distribution               │  │
│  │             • Visual focal points                    │  │
│  │          └─ Produce: attention_score (0-100)         │  │
│  │                                                         │  │
│  │     13E. Calculate ARAI Score                         │  │
│  │          └─ Formula:                                  │  │
│  │             ARAI = (Accessibility × 0.4) +           │  │
│  │                    (Readability × 0.3) +             │  │
│  │                    (Attention × 0.3)                 │  │
│  │          └─ Example:                                  │  │
│  │             ARAI = (80 × 0.4) + (70 × 0.3) + ...    │  │
│  │             ARAI = 32 + 21 + 22.5 = 75.5             │  │
│  │          └─ Produce: arai_score (0-100)              │  │
│  │                                                         │  │
│  │     13F. Assign Grade                                 │  │
│  │          └─ ARAI ≥ 90: Grade A (Excellent)           │  │
│  │          └─ ARAI 80-89: Grade B (Good)               │  │
│  │          └─ ARAI 70-79: Grade C (Fair)               │  │
│  │          └─ ARAI 60-69: Grade D (Poor)               │  │
│  │          └─ ARAI < 60: Grade F (Very Poor)           │  │
│  │                                                         │  │
│  │     13G. Extract Issues & Recommendations            │  │
│  │          └─ From each analyzer:                       │  │
│  │             • Title: "Color Contrast Issue"          │  │
│  │             • Description: What's wrong              │  │
│  │             • Severity: high/medium/low              │  │
│  │             • How to Fix: [steps]                    │  │
│  │             • Best Practice: Standard to follow      │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 14. Fetch Frame Preview Images                        │  │
│  │     FigmaAPIClient.get_frame_images(                  │  │
│  │       file_key,                                       │  │
│  │       frame_ids=[all_frame_ids],                      │  │
│  │       scale=0.5                                        │  │
│  │     ) → {                                              │  │
│  │       "frame_id_1": "https://...",                    │  │
│  │       "frame_id_2": "https://...",                    │  │
│  │       ...                                              │  │
│  │     }                                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 15. Build Response JSON                               │  │
│  │     {                                                  │  │
│  │       "analyses": [                                    │  │
│  │         {                                              │  │
│  │           "designName": "Page 1 - Login Screen",      │  │
│  │           "arai_score": 85,                           │  │
│  │           "overall_grade": "A",                       │  │
│  │           "arai_breakdown": {                         │  │
│  │             "accessibility": 80,                      │  │
│  │             "readability": 88,                        │  │
│  │             "attention": 87                           │  │
│  │           },                                           │  │
│  │           "accessibility": {                          │  │
│  │             "score": 80,                              │  │
│  │             "issues": [...]                           │  │
│  │           },                                           │  │
│  │           "readability": {...},                       │  │
│  │           "attention": {...},                         │  │
│  │           "preview": "https://...",                   │  │
│  │           "frameId": "123:456",                       │  │
│  │           ...                                          │  │
│  │         },                                             │  │
│  │         { ...frame 2... },                            │  │
│  │         { ...frame 3... },                            │  │
│  │         ...                                            │  │
│  │       ],                                               │  │
│  │       "totalScreens": 12,                             │  │
│  │       "totalPages": 3,                                │  │
│  │       "fileName": "MyProject",                        │  │
│  │       "averageAraiScore": 72.3,                       │  │
│  │       "processingTime": 234.5                         │  │
│  │     }                                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 16. Save to Database                                  │  │
│  │     save_figma_analysis_to_db(                         │  │
│  │       analysis_id=uuid,                               │  │
│  │       user_id=current_user.id,                        │  │
│  │       figma_url=url,                                  │  │
│  │       analysis_data=response                          │  │
│  │     )                                                  │  │
│  │                                                         │  │
│  │     Result stored in database for:                    │  │
│  │     ├─ History/retrieval later                        │  │
│  │     ├─ Analytics                                      │  │
│  │     └─ Comparison tracking                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 17. Send Response to Frontend                         │  │
│  │     HTTP 200 OK                                        │  │
│  │     Content-Type: application/json                    │  │
│  │     Body: { ...full response from step 15... }       │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│                                                                │
│               FRONTEND DISPLAY (Instant)                      │
│                                                                │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 18. Frontend Receives Response                        │  │
│  │     .then(response => {                                │  │
│  │       setLoading(false)                               │  │
│  │       onAnalysisComplete(response.data)               │  │
│  │     })                                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 19. Parent Component Receives Data                    │  │
│  │     FigmaAnalysisPage:                                │  │
│  │     setAnalysisResults(response.data)                 │  │
│  │                                                         │  │
│  │     analysisResults is now:                           │  │
│  │     {                                                  │  │
│  │       analyses: [12 screen analyses],                 │  │
│  │       totalScreens: 12,                               │  │
│  │       ...                                              │  │
│  │     }                                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 20. Conditional Render Switches                       │  │
│  │                                                         │  │
│  │     analysisResults ? (                               │  │
│  │       <MultipleAnalysisResults />   ← Shows results   │  │
│  │     ) : (                                              │  │
│  │       <FigmaAnalyzer />             ← Shows form       │  │
│  │     )                                                  │  │
│  │                                                         │  │
│  │     Header also changes:                              │  │
│  │     "Analysis Results"                                │  │
│  │     "MyProject — 12 screens analysed"                │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 21. Display Summary Section                           │  │
│  │     ┌─────────────────────────────────────────────┐   │  │
│  │     │ File: MyProject                             │   │  │
│  │     │ Total Pages: 3                              │   │  │
│  │     │ Total Screens: 12                           │   │  │
│  │     │ Average ARAI: 72.3                          │   │  │
│  │     └─────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 22. Display Screen Cards Grid                        │  │
│  │                                                         │  │
│  │     FOR each analysis IN analyses:                    │  │
│  │       Render ScreenAnalysisCard:                      │  │
│  │                                                         │  │
│  │       ┌──────────────────────────────────────┐        │  │
│  │       │ Screen 1: Login Screen               │        │  │
│  │       ├──────────────────────────────────────┤        │  │
│  │       │ [Preview Image]                      │        │  │
│  │       ├──────────────────────────────────────┤        │  │
│  │       │ ARAI Score: 85                       │        │  │
│  │       │ Grade: A                             │        │  │
│  │       │                                      │        │  │
│  │       │ Accessibility: 80                   │        │  │
│  │       │ Readability:   88                   │        │  │
│  │       │ Attention:     87                   │        │  │
│  │       │                                      │        │  │
│  │       │ Issues: 2                            │        │  │
│  │       │ ├─ Color Contrast                   │        │  │
│  │       │ └─ Font Size                        │        │  │
│  │       │                                      │        │  │
│  │       │ [Expand for details]                 │        │  │
│  │       └──────────────────────────────────────┘        │  │
│  │                                                         │  │
│  │       ┌──────────────────────────────────────┐        │  │
│  │       │ Screen 2: Signup Screen              │        │  │
│  │       │ ...                                  │        │  │
│  │       └──────────────────────────────────────┘        │  │
│  │                                                         │  │
│  │       ... 10 more cards ...                            │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 23. User Interacts with Results                       │  │
│  │                                                         │  │
│  │     Options:                                            │  │
│  │     ├─ Click card → Expand for full details           │  │
│  │     ├─ Read issues and recommendations               │  │
│  │     ├─ See "How to Fix" steps                         │  │
│  │     ├─ View preview image                             │  │
│  │     ├─ Compare screens                                │  │
│  │     └─ Click "New Analysis" → Back to input form      │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ END: User has analysis of all screens                │  │
│  │      with detailed metrics and recommendations        │  │
│  │      for each screen                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ UI Component Hierarchy

```
FigmaAnalysisPage (Container)
│
├─── Sidebar (Navigation)
│
├─── Header Section
│    ├─── Title: "Figma Analysis" OR "Analysis Results"
│    ├─── Subtitle: Description OR "File — # screens"
│    └─── [New Analysis] Button (shows when results exist)
│
└─── Main Content Card
     │
     ├─ Conditional Render:
     │
     ├─ IF analysisResults == null:
     │  │
     │  └─ FigmaAnalyzer Component
     │     ├─ Title: "Figma Design Analyzer"
     │     │
     │     ├─ Input Section:
     │     │  ├─ Label: "Figma File URL"
     │     │  └─ TextInput: URL entry field
     │     │
     │     ├─ Analysis Types Section:
     │     │  ├─ Label: "Analysis Types"
     │     │  ├─ ☑ Accessibility Checkbox
     │     │  ├─ ☑ Readability Checkbox
     │     │  └─ ☑ Attention Checkbox
     │     │
     │     ├─ Button: "Analyze All Screens"
     │     │
     │     └─ Conditional Messages:
     │        ├─ Loading Message (while processing)
     │        └─ Error Message (if error occurs)
     │
     └─ IF analysisResults != null:
        │
        └─ MultipleAnalysisResults Component
           │
           ├─ Summary Grid
           │  ├─ Card: "File Name" → MyProject
           │  ├─ Card: "Total Pages" → 3
           │  ├─ Card: "Total Screens" → 12
           │  └─ Card: "Average ARAI Score" → 72.3
           │
           └─ Screen Analysis Cards Grid
              │
              ├─ Screen Card 1
              │  ├─ Name: "Page 1 - Login Screen"
              │  ├─ Preview: [Image from Figma]
              │  ├─ Main Score:
              │  │  ├─ ARAI: 85
              │  │  └─ Grade: A
              │  ├─ Metric Scores:
              │  │  ├─ Accessibility: 80
              │  │  ├─ Readability: 88
              │  │  └─ Attention: 87
              │  ├─ Issues Summary:
              │  │  ├─ 2 Issues total
              │  │  ├─ Issue 1: Color Contrast
              │  │  └─ Issue 2: Font Size
              │  └─ [Expand] Button
              │
              ├─ Screen Card 2
              │  └─ ... same structure ...
              │
              ├─ Screen Card 3
              │  └─ ... same structure ...
              │
              └─ ... 9 more screen cards ...
```

---

## 📱 Screen Layout Examples

### **View 1: Input Form (Empty State)**

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  ARAI Logo              Sidebar    Figma Analysis              ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Figma Analysis                                                ║
║  Analyze your Figma designs for accessibility, readability...  ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │ Figma Design Analyzer                                  │   ║
║  │                                                         │   ║
║  │ Figma File URL                                         │   ║
║  │ ┌─────────────────────────────────────────────────────┐│   ║
║  │ │ https://www.figma.com/design/...                  ││   ║
║  │ └─────────────────────────────────────────────────────┘│   ║
║  │                                                         │   ║
║  │ Analysis Types                                         │   ║
║  │ ☑ Accessibility    ☑ Readability    ☑ Attention       │   ║
║  │                                                         │   ║
║  │ ┌─────────────────────────────────────────────────────┐│   ║
║  │ │ Analyze All Screens                                 ││   ║
║  │ └─────────────────────────────────────────────────────┘│   ║
║  │                                                         │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### **View 2: Loading State**

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  ARAI Logo              Sidebar    Figma Analysis              ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Figma Analysis                                                ║
║  Analyze your Figma designs for accessibility, readability...  ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │ Figma Design Analyzer                                  │   ║
║  │                                                         │   ║
║  │ Figma File URL                                         │   ║
║  │ ┌─────────────────────────────────────────────────────┐│   ║
║  │ │ https://www.figma.com/design/abc123/MyProject     ││   ║
║  │ └─────────────────────────────────────────────────────┘│   ║
║  │                                                         │   ║
║  │ Analysis Types                                         │   ║
║  │ ☑ Accessibility    ☑ Readability    ☑ Attention       │   ║
║  │                                                         │   ║
║  │ ┌─────────────────────────────────────────────────────┐│   ║
║  │ │ Analyzing... Please wait (this may take 2-5 min)    ││   ║
║  │ │ (DISABLED)                                          ││   ║
║  │ └─────────────────────────────────────────────────────┘│   ║
║  │                                                         │   ║
║  │ ⏳ Analysis in Progress                                 │   ║
║  │ Extracting Figma screens and running analysis...       │   ║
║  │ This typically takes 2-5 minutes depending on size.    │   ║
║  │                                                         │   ║
║  │ 💡 Tip: Check browser console for real-time logs      │   ║
║  │                                                         │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### **View 3: Results Display**

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  ARAI Logo              Sidebar    Analysis Results            ║
║                          [New Analysis] Button                 ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Analysis Results                                              ║
║  MyProject — 12 screens analysed                              ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │                                                         │   ║
║  │ Summary Statistics:                                    │   ║
║  │                                                         │   ║
║  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │   ║
║  │ │ Total Pages │ │Total Screens│ │Average ARAI │       │   ║
║  │ │      3      │ │     12      │ │    72.3     │       │   ║
║  │ └─────────────┘ └─────────────┘ └─────────────┘       │   ║
║  │                                                         │   ║
║  ├─────────────────────────────────────────────────────────┤   ║
║  │                                                         │   ║
║  │ Screen Analysis Cards:                                 │   ║
║  │                                                         │   ║
║  │ ┌──────────────────┐ ┌──────────────────┐              │   ║
║  │ │ Login Screen     │ │ Signup Screen    │              │   ║
║  │ │ [Preview Image]  │ │ [Preview Image]  │              │   ║
║  │ │ ARAI: 85         │ │ ARAI: 78         │              │   ║
║  │ │ Grade: A         │ │ Grade: B         │              │   ║
║  │ │ Acc: 80          │ │ Acc: 75          │              │   ║
║  │ │ Read: 88         │ │ Read: 80         │              │   ║
║  │ │ Attn: 87         │ │ Attn: 78         │              │   ║
║  │ │ Issues: 2        │ │ Issues: 5        │              │   ║
║  │ │ [▼ Expand]       │ │ [▼ Expand]       │              │   ║
║  │ └──────────────────┘ └──────────────────┘              │   ║
║  │                                                         │   ║
║  │ ┌──────────────────┐ ┌──────────────────┐              │   ║
║  │ │ Dashboard        │ │ Settings         │              │   ║
║  │ │ [Preview Image]  │ │ [Preview Image]  │              │   ║
║  │ │ ARAI: 75         │ │ ARAI: 65         │              │   ║
║  │ │ Grade: B         │ │ Grade: C         │              │   ║
║  │ │ ...              │ │ ...              │              │   ║
║  │ └──────────────────┘ └──────────────────┘              │   ║
║  │                                                         │   ║
║  │ ... 8 more screen cards in grid ...                    │   ║
║  │                                                         │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### **View 4: Expanded Card (Detailed Issues)**

```
┌──────────────────────────────────────────────────────┐
│ Login Screen - Page 1                                │
├──────────────────────────────────────────────────────┤
│                                                      │
│ [Preview Image]                                     │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ARAI Score: 85                                       │
│ Grade: A                                             │
│                                                      │
│ Metric Breakdown:                                   │
│ ├─ Accessibility: 80/100  ████████░░                │
│ ├─ Readability: 88/100     ████████░░               │
│ └─ Attention: 87/100       ████████░░               │
│                                                      │
├──────────────────────────────────────────────────────┤
│ Accessibility Issues (2):                           │
│                                                      │
│ ✓ Issue 1: Color Contrast Issue                    │
│   Severity: HIGH                                    │
│   Description: Text has low contrast ratio         │
│   How to Fix:                                       │
│   • Use darker text color                          │
│   • Increase contrast ratio to 4.5:1               │
│   • Test with WCAG checker tool                    │
│   Best Practice: WCAG 2.1 requires 4.5:1 minimum  │
│                                                      │
│ ✓ Issue 2: Font Size Too Small                    │
│   Severity: MEDIUM                                  │
│   Description: Some text is below 12px             │
│   How to Fix:                                       │
│   • Increase to minimum 16px                       │
│   • Ensure 200% zoom doesn't break layout         │
│   • Use relative units (rem/em)                    │
│   Best Practice: Use 16px+ for body text           │
│                                                      │
├──────────────────────────────────────────────────────┤
│ Readability Issues (0):                             │
│ ✓ Readability Check Passed                         │
│                                                      │
├──────────────────────────────────────────────────────┤
│ Attention/Visual Hierarchy Issues (0):              │
│ ✓ Visual Hierarchy Check Passed                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Through Components

```
┌─────────────────────┐
│ FigmaAnalysisPage   │ ← Page Container
│ state: {            │
│   analysisResults   │
│ }                   │
└──────────┬──────────┘
           │
           ├──────────────────────────────────┐
           │                                  │
           ▼                                  ▼
   ┌─────────────────┐              ┌─────────────────────┐
   │ FigmaAnalyzer   │              │ MultipleAnalysis    │
   │                 │              │ Results             │
   │ Input Form      │              │                     │
   │ ├─ URL input    │              │ Summary Grid        │
   │ ├─ Checkboxes   │              │ + Screen Cards      │
   │ └─ Button       │              │   (one per screen)  │
   │                 │              │                     │
   │ onAnalysis      │              │ receives:           │
   │ Complete() ─────┼──────────────│ { analyses: [...] } │
   │                 │              │                     │
   └─────────────────┘              └─────────────────────┘

Call Flow:
1. User fills URL + clicks "Analyze"
2. FigmaAnalyzer calls API: /analysis/figma-screens
3. Backend processes (2-5 min)
4. FigmaAnalyzer receives response
5. Calls onAnalysisComplete(response) callback
6. Parent (FigmaAnalysisPage) calls setAnalysisResults(response)
7. Component re-renders with results
8. MultipleAnalysisResults component displays cards
```

---

## 📊 Data Structure Visualization

```
Response Structure (Simplified):

{
  "analyses": [
    {
      "Screen Analysis 1"
      ├─ designName: "Page 1 - Login Screen"
      ├─ arai_score: 85
      ├─ overall_grade: "A"
      ├─ arai_breakdown:
      │  ├─ accessibility: 80
      │  ├─ readability: 88
      │  └─ attention: 87
      ├─ accessibility:
      │  ├─ score: 80
      │  └─ issues: [
      │     {
      │       title: "Color Contrast",
      │       severity: "high",
      │       how_to_fix: [steps]
      │     },
      │     ...
      │  ]
      ├─ readability: { ... }
      ├─ attention: { ... }
      ├─ preview: "https://..."
      └─ frameId: "123:456"
    },
    {
      "Screen Analysis 2"
      ...
    },
    ...
  ],
  "totalScreens": 12,
  "totalPages": 3,
  "averageAraiScore": 72.3
}
```

---

## ✨ Summary

This comprehensive diagram and visual guide shows:

1. **Complete user journey** from opening the app to viewing results
2. **All backend processing steps** with detailed explanations
3. **Component hierarchy** and how they interact
4. **UI layouts** at each stage of the process
5. **Data structures** passed between components
6. **Timeline** of what happens when and how long it takes

Everything is **already implemented and working** in your system!

