# History Feature - Visual Architecture

## 🏗️ System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          ARAI SYSTEM OVERVIEW                              │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                        USER INTERFACE (React)                        │ │
│  │                                                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │                    DASHBOARD PAGE                            │  │ │
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │  │ │
│  │  │  │   Upload     │ │   Results    │ │ History Widget   │   │  │ │
│  │  │  │   Component  │ │  Component   │ │ (5 Recent Items) │   │  │ │
│  │  │  │              │ │              │ │                  │   │  │ │
│  │  │  │ • File       │ │ • Scores     │ │ • Design names   │   │  │ │
│  │  │  │   upload     │ │ • Issues     │ │ • Dates/times    │   │  │ │
│  │  │  │ • Analysis   │ │ • Recommend  │ │ • Scores/grades  │   │  │ │
│  │  │  │   in         │ │   -ations    │ │ • View/Delete    │   │  │ │
│  │  │  │   progress   │ │              │ │                  │   │  │ │
│  │  │  └──────────────┘ └──────────────┘ └────────┬─────────┘   │  │ │
│  │  │                                              │             │  │ │
│  │  │                              [View All History] ───────┐   │  │ │
│  │  │                                                        │   │  │ │
│  │  └────────────────────────────────────────────────────────┼───┘  │ │
│  │                                                            │      │ │
│  │  ┌─────────────────────────────────────────────────────────┼──┐  │ │
│  │  │                    HISTORY PAGE (/history)              │  │  │ │
│  │  │                                                         │  │  │ │
│  │  │  ┌──────────────────────────────────────────────────┐  │  │  │ │
│  │  │  │ All User Analyses (Sorted by Date)              │  │  │  │ │
│  │  │  ├──────────────────────────────────────────────────┤  │  │  │ │
│  │  │  │ Design 1: Homepage Design                        │  │  │  │ │
│  │  │  │ Date: Jan 16, 2:45 PM | Score: 85/100 | Grade B │  │  │  │ │
│  │  │  │ [View Analysis]  [Delete]                         │  │  │  │ │
│  │  │  ├──────────────────────────────────────────────────┤  │  │  │ │
│  │  │  │ Design 2: Mobile UI                              │  │  │  │ │
│  │  │  │ Date: Jan 15, 11:20 AM | Score: 92/100 | Grade A │  │  │  │ │
│  │  │  │ [View Analysis]  [Delete]                         │  │  │  │ │
│  │  │  ├──────────────────────────────────────────────────┤  │  │  │ │
│  │  │  │ Design 3: Dashboard UI                           │  │  │  │ │
│  │  │  │ Date: Jan 14, 9:15 PM | Score: 78/100 | Grade C │  │  │  │ │
│  │  │  │ [View Analysis]  [Delete]                         │  │  │  │ │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │ │
│  │  │                                                         │  │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │         ▲                                                       │ │
│  │         │ Click [View]                                         │ │
│  │         │                                                       │ │
│  │  ┌──────┴──────────────────────────────────────────────────┐  │ │
│  │  │         ANALYSIS REPORT PAGE (/analysis/:id)            │  │ │
│  │  │                                                         │  │ │
│  │  │  • Full design information                             │  │ │
│  │  │  • Accessibility score & issues                        │  │ │
│  │  │  • Readability score & suggestions                     │  │ │
│  │  │  • Attention heatmap & visual hierarchy                │  │ │
│  │  │  • Detailed recommendations                            │  │ │
│  │  │  • Export as PDF                                       │  │ │
│  │  │  • Share with team                                     │  │ │
│  │  └─────────────────────────────────────────────────────────┘  │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  API Layer                                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  GET  /api/v1/analysis/history?limit=50                    │  │
│  │       → Returns: { analyses: [...], total: N }             │  │
│  │                                                              │  │
│  │  DELETE /api/v1/analysis/results/{id}                      │  │
│  │       → Returns: { message: "...", analysis_id: "..." }    │  │
│  │                                                              │  │
│  │  GET  /api/v1/analysis/results/{id}                        │  │
│  │       → Returns: { full analysis report }                  │  │
│  │                                                              │  │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
         │
         │ HTTP Requests (with Auth Token)
         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                                 │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    API Route Handlers                              │ │
│  │                                                                    │ │
│  │  @router.get("/analysis/history")                                │ │
│  │  async def get_analysis_history(current_user):                   │ │
│  │    • Get user_id from token                                      │ │
│  │    • Query database for analyses                                 │ │
│  │    • Sort by created_at DESC                                     │ │
│  │    • Return latest 50 analyses                                   │ │
│  │                                                                    │ │
│  │  @router.delete("/analysis/results/{id}")                        │ │
│  │  async def delete_analysis(id, current_user):                    │ │
│  │    • Verify user owns analysis                                   │ │
│  │    • Delete from database                                        │ │
│  │    • Delete associated files from storage                        │ │
│  │    • Return confirmation                                         │ │
│  │                                                                    │ │
│  └────────┬─────────────────────────────────────────────────────────┘ │
│           │                                                            │
│           ▼                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                   Database Functions                               │ │
│  │                                                                    │ │
│  │  get_user_analyses(user_id, limit):                              │ │
│  │    SELECT * FROM analyses                                         │ │
│  │    WHERE user_id = ?                                              │ │
│  │    ORDER BY created_at DESC                                       │ │
│  │    LIMIT limit                                                    │ │
│  │                                                                    │ │
│  │  delete_analysis(analysis_id, user_id):                          │ │
│  │    DELETE FROM analyses                                           │ │
│  │    WHERE id = ? AND user_id = ?                                   │ │
│  │    DELETE FROM storage WHERE path = ?                             │ │
│  │                                                                    │ │
│  │  save_analysis_to_db(user_id, analysis_id, ...):                 │ │
│  │    INSERT INTO analyses (...) VALUES (...)                        │ │
│  │    Returns saved analysis record                                  │ │
│  │                                                                    │ │
│  └────────┬─────────────────────────────────────────────────────────┘ │
│           │                                                            │
│           ▼                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              Supabase PostgreSQL Database                          │ │
│  │                                                                    │ │
│  │  Table: analyses                                                  │ │
│  │  ┌──────────────────────────────────────────────────────────┐    │ │
│  │  │ id              UUID         PRIMARY KEY                │    │ │
│  │  │ user_id         UUID         FOREIGN KEY → auth.users   │    │ │
│  │  │ design_name     VARCHAR      NOT NULL                   │    │ │
│  │  │ filename        VARCHAR                                 │    │ │
│  │  │ arai_score      FLOAT        0-100                      │    │ │
│  │  │ overall_grade   VARCHAR      A-F                        │    │ │
│  │  │ accessibility_score FLOAT                              │    │ │
│  │  │ readability_score   FLOAT                              │    │ │
│  │  │ attention_score     FLOAT                              │    │ │
│  │  │ status          VARCHAR      completed/processing/fail  │    │ │
│  │  │ results         JSONB        Full analysis data         │    │ │
│  │  │ created_at      TIMESTAMP    2026-04-16T14:30:45Z      │    │ │
│  │  │ updated_at      TIMESTAMP    Last updated               │    │ │
│  │  └──────────────────────────────────────────────────────────┘    │ │
│  │                                                                    │ │
│  │  Table: figma_analyses (Same structure for Figma projects)       │ │
│  │                                                                    │ │
│  │  Indexes:                                                         │ │
│  │  • (user_id, created_at DESC) - for efficient history queries    │ │
│  │  • (id) - for single record lookups                              │ │
│  │  • (user_id) - for user data isolation                           │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Timeline

### Scenario 1: User Uploads Design & Views in History

```
Timeline:
─────────────────────────────────────────────────────────────────

T+0s   User on Dashboard → Clicks "Upload Design"
       ↓
       Upload dialog opens
       ↓
T+5s   User selects file (homepage.png)
       ↓
       Preview shows
       ↓
T+10s  User enters name "Homepage Design"
       ↓
       Clicks "Analyze Design" button
       ↓
       [Frontend] POST /api/v1/analysis/upload
       ├─ Form data: file, design_name
       └─ Headers: Authorization, Content-Type

T+15s  [Backend] Receives upload
       ├─ Validates file (type, size)
       ├─ Generates analysis_id (UUID)
       ├─ Creates analysis directory
       └─ Saves file locally

T+20s  [Backend] Starts AI analysis
       ├─ Loads AI models (1-2 seconds on first run)
       ├─ Analyzes accessibility
       ├─ Analyzes readability
       └─ Analyzes attention

T+140s [Backend] Analysis complete
       ├─ Calculates scores
       ├─ Generates grade
       └─ Prepares response

T+145s [Backend] Saves to database
       ├─ INSERT into analyses table
       ├─ user_id: current_user.id
       ├─ arai_score: 85.5
       ├─ overall_grade: 'B'
       ├─ created_at: '2026-04-16T14:30:45Z'
       ├─ results: {full JSON data}
       └─ Returns analysis_id

T+150s [Frontend] Receives response
       ├─ onAnalysisComplete() called
       ├─ setCurrentAnalysis(response.data)
       ├─ setRefreshHistory(prev + 1) ← KEY LINE
       └─ Switches to "results" tab

T+151s [HistorySection] Detects prop change
       ├─ useEffect triggers
       ├─ fetchAnalyses() called
       └─ GET /api/v1/analysis/history

T+153s [Backend] get_analysis_history()
       ├─ Query: SELECT * FROM analyses
       ├─ WHERE user_id = '...'
       ├─ ORDER BY created_at DESC
       ├─ LIMIT 50
       └─ Returns array of analyses

T+155s [Frontend] Receives history
       ├─ setAnalyses(response.analyses)
       └─ Re-renders HistorySection

T+156s USER SEES:
       ├─ Results tab shows: Score 85/100, Grade B
       ├─ History widget shows: New analysis at top
       ├─ Date: "Just now" or "2:30 PM"
       ├─ Scores and grade badge
       └─ [View] and [Delete] buttons

Total time: ~2 minutes from start to visibility in history ✅
```

### Scenario 2: User Navigates to History Page

```
Timeline:
─────────────────────────────────────────────────────────────────

T+0s   User clicks "History" in sidebar
       ↓
       navigate('/history')

T+50ms [HistoryPage] Component mounts
       ├─ State initialized
       ├─ useEffect runs
       └─ fetchHistory() called

T+55ms setLoading(true)
       ↓
       Loading spinner appears

T+60ms GET /api/v1/analysis/history?limit=50
       ├─ Authorization header attached
       └─ Sent to backend

T+120ms [Backend] get_user_analyses()
        ├─ Query database
        ├─ Sort by created_at DESC
        ├─ Return 50 analyses
        └─ Send response

T+170ms [Frontend] setAnalyses(response.analyses)
        ├─ setLoading(false)
        ├─ Component re-renders
        └─ List appears

T+180ms USER SEES:
        ├─ History page fully loaded
        ├─ All analyses in chronological order
        ├─ Each shows:
        │  ├─ Design name
        │  ├─ Date/time
        │  ├─ ARAI score
        │  ├─ Grade badge
        │  └─ [View] [Delete] buttons
        └─ No loading spinner

Total time: ~180ms to full page load ✅
```

### Scenario 3: User Deletes Analysis

```
Timeline:
─────────────────────────────────────────────────────────────────

T+0s   User clicks [Delete] button on analysis
       ↓
       window.confirm() dialog shows
       "Are you sure you want to delete this analysis?"

T+2s   User clicks "OK" (confirms)
       ↓
       setDeleting(analysisId)
       ↓
       Button text changes to "Deleting..."
       ↓
       Button disabled

T+5ms  DELETE /api/v1/analysis/results/{analysisId}
       ├─ Authorization header attached
       └─ Sent to backend

T+100ms [Backend] delete_analysis_endpoint()
        ├─ Verify user owns analysis
        ├─ Get analysis record
        ├─ Delete from storage (if file exists)
        ├─ DELETE FROM analyses
        └─ Return success

T+200ms [Frontend] Delete successful
        ├─ setAnalyses(filtered array)
        ├─ setDeleting(null)
        └─ Component re-renders

T+210ms USER SEES:
        ├─ Analysis removed from list
        ├─ Button back to normal
        ├─ List re-renders
        └─ Item smoothly disappears

Total time: ~210ms ✅
```

---

## 🎯 Component Interaction Diagram

```
                    User Interactions
                           │
                    ┌──────┴──────┬──────────────┐
                    ▼             ▼              ▼
        ┌─────────────────┐ ┌───────────────┐ ┌──────────────┐
        │ Upload & Analyze│ │ View History  │ │ Delete Entry │
        └────────┬────────┘ └───────┬───────┘ └──────┬───────┘
                 │                  │                 │
                 └──────────────────┼─────────────────┘
                                    │
                            ┌───────▼────────┐
                            │ analysisService│
                            │                │
                            │ • uploadAndAnal│
                            │   yze()        │
                            │ • getHistory() │
                            │ • deleteAnalys │
                            │   is()         │
                            └───────┬────────┘
                                    │
                        API Requests (Axios)
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
         ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
         │ POST /upload     │ │ GET /history │ │ DELETE /..   │
         └────────┬─────────┘ └──────┬───────┘ └──────┬───────┘
                  │                  │                 │
                  └──────────────────┼─────────────────┘
                                     │
                               Backend API
                                     │
                    ┌────────────────┼───────────────┐
                    ▼                ▼               ▼
         ┌──────────────────┐ ┌────────────────┐ ┌──────────────┐
         │ save_analysis_to │ │get_user_analys │ │delete_analysi│
         │ _db()            │ │es()            │ │s()           │
         └────────┬─────────┘ └────────┬───────┘ └──────┬───────┘
                  │                    │                 │
                  └────────────────────┼─────────────────┘
                                       │
                                 Supabase
                                       │
                      ┌────────────────┼───────────────┐
                      ▼                ▼               ▼
                  analyses table    Storage         RLS Policies
                  ────────────      ───────         ────────────
                  INSERT            DELETE          user_id filter
                  ────────────      ───────         ────────────


Frontend Component Flow:
────────────────────────

Dashboard
├─ UploadAnalysisMultiple
│  └─ onAnalysisComplete(data)
│     ├─ setRefreshHistory(+1)
│     └─ HistorySection detects change
│        └─ useEffect triggers
│           └─ fetchAnalyses()
│              └─ setAnalyses([...])
│                 └─ Re-render with new data

HistoryPage
├─ useEffect (on mount)
│  └─ fetchHistory()
│     └─ setAnalyses([...])
├─ handleViewReport(id)
│  └─ navigate(`/analysis/${id}`)
└─ handleDelete(id)
   ├─ confirm dialog
   ├─ deleteAnalysis(id)
   └─ setAnalyses(filtered)
```

---

## 📈 State Management

```
Dashboard Component:
┌─────────────────────────────────────┐
│ const [refreshHistory, setRefresh...]│
│                                     │
│ 0 → 1 → 2 → 3 ... (increments)     │
│                    │                │
│                    └─ Passed to     │
│                       HistorySection│
│                       as prop       │
└─────────────────────────────────────┘

HistorySection Component:
┌─────────────────────────────────────┐
│ useEffect(() => {                   │
│   fetchAnalyses();                  │
│ }, [refreshTrigger])                │
│                                     │
│ When refreshTrigger changes:        │
│ 1. Dependency detected              │
│ 2. useEffect runs                   │
│ 3. fetchAnalyses() called           │
│ 4. API request sent                 │
│ 5. Data fetched                     │
│ 6. setAnalyses() updates state      │
│ 7. Component re-renders             │
│ 8. User sees new data               │
└─────────────────────────────────────┘

HistoryPage Component:
┌─────────────────────────────────────┐
│ const [analyses, setAnalyses]       │
│ const [loading, setLoading]         │
│ const [error, setError]             │
│ const [deleting, setDeleting]       │
│                                     │
│ useEffect on mount:                 │
│ 1. setLoading(true)                 │
│ 2. fetchHistory()                   │
│ 3. API response received            │
│ 4. setAnalyses(data)                │
│ 5. setLoading(false)                │
│ 6. Component re-renders with data   │
│                                     │
│ On delete:                          │
│ 1. setDeleting(id)                  │
│ 2. Call API                         │
│ 3. setAnalyses(filtered)            │
│ 4. setDeleting(null)                │
│ 5. UI updates                       │
└─────────────────────────────────────┘
```

---

## 🔄 Lifecycle Hooks

```
HistorySection Lifecycle:
═════════════════════════

Mount Phase:
  useEffect(() => fetchAnalyses(), [refreshTrigger])
  • Component mounts
  • refreshTrigger in dependency array
  • fetchAnalyses() runs immediately
  • Loading state starts
  • API request sent

Update Phase:
  When refreshTrigger prop changes:
  • useEffect dependency detected
  • Old effect cleanup (if any)
  • New effect runs
  • fetchAnalyses() called again
  • New data fetched
  • Component re-renders

Unmount Phase:
  When component unmounts:
  • Effect cleanup (if any)
  • No active requests
  • State cleared


HistoryPage Lifecycle:
══════════════════════

Mount Phase:
  • State initialized
  • useEffect(() => fetchHistory(), [])
  • Empty dependency array → runs once
  • fetchHistory() executes
  • Loading spinner appears
  • API request sent

Update Phase:
  • handleViewReport() → navigate
  • handleDelete() → update state
  • Component re-renders on state change

Unmount Phase:
  • Component removed from DOM
  • No cleanup needed
```

---

## 🎨 UI State Management

```
HistoryPage States:
═══════════════════

State 1: Loading
├─ loading = true
├─ analyses = []
├─ Show: Spinner + "Loading history..."
└─ Buttons: Disabled

State 2: Error
├─ loading = false
├─ error = "Error message"
├─ Show: Error box + message
└─ Buttons: Retry option

State 3: Empty
├─ loading = false
├─ error = null
├─ analyses.length = 0
├─ Show: Empty state icon + "No analyses yet"
└─ Button: "Start Analyzing"

State 4: Loaded
├─ loading = false
├─ error = null
├─ analyses = [...data]
├─ Show: Full list of analyses
└─ Buttons: [View] [Delete] enabled

State 5: Deleting
├─ deleting = analysisId
├─ Show: Button text "Deleting..."
└─ Action: API call in progress


Individual Item States:
══════════════════════

Each analysis item can be:
├─ Normal
│  ├─ Hovering
│  └─ Not deleting
├─ Deleting
│  ├─ Button disabled
│  └─ Text shows "Deleting..."
└─ Deleted
   ├─ Item removed from DOM
   └─ List re-renders
```

---

Perfect! This comprehensive architecture documentation shows exactly how the history feature is implemented and flows through the system. All three documentation files provide different perspectives:

1. **HISTORY_QUICK_START.md** - For users (how to use)
2. **HISTORY_FEATURE_IMPLEMENTATION.md** - For developers (technical details)
3. **HISTORY_FEATURE_SUMMARY.md** - Executive overview
4. **CODE_CHANGES_HISTORY.md** - Specific code changes
5. **Architecture diagrams** - Visual representation (this file)

Let me create one final file to wrap everything up:
