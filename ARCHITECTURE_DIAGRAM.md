# 🏗️ ARAI Figma Integration - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ARAI SYSTEM                                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────────┐
│   FRONTEND (React)       │         │   BACKEND (FastAPI)          │
│                          │         │                              │
│ FigmaAnalysisPage.jsx    │◄────────┤ /api/v1/figma/*             │
│       │                  │  HTTP   │                              │
│       ├─ Sidebar         │◄────────┤ ┌─────────────────────────┐  │
│       │ (FigmaAnalyzer)  │         │ │ figma_client.py         │  │
│       │                  │         │ ├─ Extract file from API │  │
│       ├─ URL Input       │         │ ├─ Parse pages/frames    │  │
│       ├─ Checkboxes      │         │ └─ Get element data      │  │
│       ├─ Analyze Button  │         │                          │  │
│       ├─ Progress Bar    │         │ ┌─────────────────────────┐  │
│       └─ Results Display │         │ │ figma_service.py        │  │
│                          │         │ ├─ Accessibility Analyzer │  │
│ Port: 3000               │         │ ├─ Readability Analyzer   │  │
│ Tech: React, Tailwind    │         │ ├─ Attention Analyzer     │  │
│        Axios             │         │ └─ Results Orchestration  │  │
│                          │         │                           │  │
│                          │         │ ┌──────────────────────────┐ │
│                          │         │ │ figma.py (API Routes)    │ │
│                          │         │ ├─ POST /analyze          │ │
│                          │         │ ├─ GET /analyze/{id}      │ │
│                          │         │ ├─ POST /validate-url     │ │
│                          │         │ ├─ GET /test-connection   │ │
│                          │         │ └─ Background Tasks       │ │
│                          │         │                           │ │
│                          │         │ ┌──────────────────────────┐ │
│                          │         │ │ Figma API Client         │ │
│                          │         │ └──────────────────────────┘ │
│                          │         │  ^                            │
└──────────────────────────┘         │  │ Token Auth                 │
         │                           │  │                            │
         │ Vercel                    │  │ Railway/Render             │
         │ Port: 3000               │  │ Port: 8000                 │
         │                           └──┼────────────────────────────┘
         │                              │
         └──────────────────────────────┼─────────────────────────────┐
                                        │                             │
                      ┌─────────────────┴──────────────┐              │
                      │                                │              │
                ┌─────▼──────────┐          ┌─────────▼───────┐      │
                │  Figma API     │          │  Supabase       │      │
                │  (Cloud)       │          │  (PostgreSQL)   │      │
                │                │          │                 │      │
                │ figma.com/api  │          │ figma_analyses  │      │
                │                │          │ table           │      │
                └────────────────┘          └─────────────────┘      │
                       ▲                                              │
                       │                                              │
                       │ Personal                                     │
                       │ Token                                        │
                       │                                              │
                figd_xxx...                                          │
                                                                      │
                      Environment Variables:                         │
                      ├─ FIGMA_API_TOKEN                            │
                      ├─ SUPABASE_URL                               │
                      ├─ SUPABASE_KEY                               │
                      └─ SUPABASE_SERVICE_KEY                       │
```

---

## Request Flow

```
USER ACTION                    FRONTEND                BACKEND

1. User enters URL
   └────────────────► Input field stores URL

2. User clicks Analyze
   └────────────────► handleAnalyzeClick()
                        │
                        ├─► Validate URL
                        │   POST /figma/validate-url
                        │   └─────────────────────────────────┐
                        │                                      │
                        │◄─────────────────────────────────────┤ Check URL format
                        │                                      │ Extract file key
                        │                          ┌───────────▼────────┐
                        │                          │ Backend            │
                        │                          │ validates URL      │
                        │                          └────────────────────┘
                        │
                        ├─► Start Analysis
                        │   POST /figma/analyze
                        │   └─────────────────────────────────┐
                        │                                      │
                        │◄─────────────────────────────────────┤ Returns: analysis_id
                        │   { analysis_id: "uuid" }            │
                        │                          ┌───────────▼────────┐
                        │                          │ Backend starts     │
                        │                          │ background task    │
                        │                          │                    │
                        │                          │ 1. Get Figma file  │
                        │                          │ 2. Parse data      │
                        │                          │ 3. Run analyzers   │
                        │                          │ 4. Save to DB      │
                        │                          └────────────────────┘
                        │
                        └─► Poll Results
                            GET /figma/analyze/{id}
                            (every 2 seconds)
                            │
                            ├─► Pending
                            │   Show progress bar
                            │
                            ├─► Processing
                            │   Update progress %
                            │
                            └─► Completed
                                Display results:
                                ├─ Accessibility Score
                                ├─ Readability Score
                                ├─ Attention Score
                                └─ Detailed recommendations
```

---

## Data Flow

```
Figma URL
    │
    ▼
┌──────────────────────┐
│ Figma API Client     │
│ (figma_client.py)    │
└──────┬───────────────┘
       │
       ├─► Extract file key from URL
       ├─► Authenticate with Figma
       ├─► Fetch file structure
       │
       ▼
   File Data (JSON)
   ├─ Pages
   ├─ Frames
   └─ Elements
        ├─ Text
        ├─ Colors
        ├─ Layout
        └─ Typography
       │
       ▼
┌──────────────────────┐
│ Analysis Service     │
│ (figma_service.py)   │
└──────┬───────────────┘
       │
       ├─►┌────────────────────────┐
       │  │ Accessibility Analyzer │
       │  │ - Contrast ratios      │
       │  │ - Font sizes           │
       │  │ - WCAG compliance      │
       │  └────────┬───────────────┘
       │           │
       │           ▼
       │      Score: 0-100
       │
       ├─►┌────────────────────────┐
       │  │ Readability Analyzer   │
       │  │ - Text density         │
       │  │ - Font legibility      │
       │  │ - Line spacing         │
       │  │ - Hierarchy            │
       │  └────────┬───────────────┘
       │           │
       │           ▼
       │      Score: 0-100
       │
       └─►┌────────────────────────┐
          │ Attention Analyzer     │
          │ - Prominence scoring   │
          │ - Focal points         │
          │ - Visual hierarchy     │
          └────────┬───────────────┘
                   │
                   ▼
              Score: 0-100
                   │
                   ▼
        ┌──────────────────────────┐
        │ Results Object           │
        ├─ analysis_id             │
        ├─ status                  │
        ├─ accessibility_score     │
        ├─ readability_score       │
        ├─ attention_score         │
        ├─ overall_score           │
        ├─ frames (detailed)       │
        │  └─ per-frame scores     │
        ├─ recommendations         │
        └─ timestamp               │
                   │
                   ▼
        ┌──────────────────────────┐
        │ Supabase (DB)            │
        │ figma_analyses table      │
        └──────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │ Frontend Display         │
        ├─ Score Cards             │
        ├─ Progress Bars           │
        ├─ Recommendations         │
        └─ Frame Details           │
        └──────────────────────────┘
```

---

## Component Hierarchy

```
App.jsx (Router)
    │
    ├─ Landing Page (/)
    ├─ Login Page (/login)
    ├─ Signup Page (/signup)
    │
    ├─ Dashboard (/dashboard) ─────────┐
    │   ├─ Sidebar                      │ Protected Routes
    │   └─ UploadAnalysis               │
    │                                   │
    ├─ AnalysisReport (/analysis/:id)──┤
    │   ├─ Sidebar                      │
    │   └─ Results Display              │
    │                                   │
    ├─ Projects (/projects) ───────────┤
    │   ├─ Sidebar                      │
    │   └─ Project List                 │
    │                                   │
    ├─ History (/history) ─────────────┤
    │   ├─ Sidebar                      │
    │   └─ Analysis History             │
    │                                   │
    ├─ Settings (/settings) ───────────┤
    │   ├─ Sidebar                      │
    │   └─ User Settings                │
    │                                   │
    └─ FigmaAnalysisPage (/figma) ─────┤ ← NEW!
        ├─ Sidebar (with Figma link)   │
        │   └─ Nav Items:               │
        │       ├─ New Analysis          │
        │       ├─ Figma Analysis ← YOU │
        │       ├─ Projects              │
        │       ├─ History               │
        │       └─ Settings              │
        │                                │
        └─ FigmaAnalyzer Component      │
            ├─ URL Input Section         │
            ├─ Analysis Controls         │
            ├─ Analyze Button            │
            ├─ Progress Section          │
            └─ Results Section           │
                ├─ Score Cards           │
                ├─ Per-Frame Results     │
                └─ Recommendations       │
```

---

## API Endpoints

```
Backend: http://localhost:8000 (local) or https://your-domain.com (prod)

POST /api/v1/figma/analyze
├─ Request:
│  ├─ figma_url: "https://www.figma.com/file/..."
│  └─ analysis_scope: ["accessibility", "readability", "attention"]
│
└─ Response:
   ├─ analysis_id: "550e8400-e29b-41d4-a716-446655440000"
   ├─ status: "pending"
   └─ message: "Analysis started"

GET /api/v1/figma/analyze/{analysis_id}
├─ Request: None (ID in URL)
│
└─ Response:
   ├─ status: "completed" | "pending" | "failed"
   ├─ progress: 75
   ├─ accessibility_score: 85
   ├─ readability_score: 72
   ├─ attention_score: 68
   ├─ overall_score: 75
   ├─ frames: [ ... ]
   └─ recommendations: [ ... ]

POST /api/v1/figma/validate-url
├─ Request:
│  └─ url: "https://www.figma.com/file/..."
│
└─ Response:
   ├─ valid: true
   ├─ file_key: "abc123def456"
   └─ message: "URL is valid"

GET /api/v1/figma/test-connection
├─ Request: None
│
└─ Response:
   └─ connected: true
```

---

## Database Schema

```
┌─────────────────────────────────────────┐
│          figma_analyses                 │
├─────────────────────────────────────────┤
│ id (UUID)                   [PRIMARY KEY]│
│ user_id (UUID)              [FK: users]  │
│ figma_url (TEXT)            [NOT NULL]   │
│ file_key (TEXT)             [NOT NULL]   │
│ analysis_status (TEXT)      [DEFAULT: pending]
│ accessibility_score (FLOAT) │
│ readability_score (FLOAT)   │
│ attention_score (FLOAT)     │
│ overall_score (FLOAT)       │
│ results (JSONB)             [Full results]
│ created_at (TIMESTAMP)      [DEFAULT: now()]
│ updated_at (TIMESTAMP)      [DEFAULT: now()]
├─────────────────────────────────────────┤
│ INDEXES:                                │
│ ├─ user_id (fast user lookups)         │
│ ├─ created_at (sort by date)           │
│ └─ file_key (prevent duplicates)       │
└─────────────────────────────────────────┘
```

---

## Technology Stack

```
┌────────────────────────────────────────────────┐
│             TECHNOLOGY STACK                   │
└────────────────────────────────────────────────┘

Frontend
├─ Framework: React 18
├─ Styling: Tailwind CSS
├─ HTTP: Axios
├─ Icons: Lucide React
├─ Routing: React Router v6
└─ Deployment: Vercel

Backend
├─ Framework: FastAPI
├─ Server: Uvicorn
├─ Python: 3.11+
├─ Async: asyncio
├─ Validation: Pydantic v2
└─ Deployment: Railway/Heroku

Database
├─ Type: PostgreSQL
├─ Service: Supabase (managed)
├─ ORM: Direct SQL queries
└─ Auth: Supabase Auth

External APIs
├─ Figma API v1
│  ├─ Authentication: Personal Token
│  ├─ Endpoint: https://api.figma.com/v1
│  └─ Rate Limit: 300 req/min
└─ Version Control: Git

Deployment
├─ Frontend: Vercel
├─ Backend: Railway/Render
├─ Database: Supabase Cloud
├─ Static Files: CDN
└─ CI/CD: GitHub Actions (optional)
```

---

## Development Environment

```
┌──────────────────────────────────────────┐
│        LOCAL DEVELOPMENT SETUP            │
└──────────────────────────────────────────┘

Port 3000  ◄─── Frontend (npm start)
Port 8000  ◄─── Backend (uvicorn)

Environment Files:
├─ backend/.env
│  ├─ FIGMA_API_TOKEN=figd_...
│  ├─ SUPABASE_URL=https://...
│  └─ SUPABASE_KEY=eyJ...
│
└─ frontend/.env.local
   └─ REACT_APP_API_URL=http://localhost:8000

Figma Token:
   export FIGMA_API_TOKEN="figd_..."
```

---

## Production Architecture

```
┌─────────────────────────────────────────────┐
│       PRODUCTION DEPLOYMENT                 │
└─────────────────────────────────────────────┘

                  ┌──────────────┐
                  │   Figma API  │
                  │ figma.com    │
                  └────────▲─────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────────┐  ┌──────▼─────────┐  ┌────▼────────┐
    │  Vercel    │  │    Railway     │  │ Supabase    │
    │ (Frontend) │  │   (Backend)    │  │ (Database)  │
    │ Port: 443  │  │ Port: 443      │  │ Cloud DB    │
    │            │  │                │  │             │
    │ React App  │  │ FastAPI Server │  │ PostgreSQL  │
    │ Tailwind   │  │ Uvicorn        │  │ figma_...   │
    └────┬───────┘  └────────────────┘  └─────────────┘
         │
    Users (HTTPS)
```

---

## Error Handling Flow

```
User Action
    │
    ├─ Invalid URL?
    │  └─► Error: "Invalid Figma URL format"
    │
    ├─ Token invalid?
    │  └─► Error: "Authentication failed"
    │
    ├─ File not found?
    │  └─► Error: "Figma file not accessible"
    │
    ├─ Analysis failed?
    │  └─► Error: "Analysis processing error"
    │
    ├─ API timeout?
    │  └─► Error: "Request timeout - please retry"
    │
    └─ Success!
       └─► Results displayed
```

---

## Performance Characteristics

```
Operation                   Time          Space
─────────────────────────────────────────────────
URL Validation              <100ms        <1KB
Figma API Call              1-5s          100KB
File Parsing                2-10s         50-500KB
Accessibility Analysis      2-5s          variable
Readability Analysis        1-3s          variable
Attention Analysis          1-3s          variable
Database Write              <100ms        varies
Total (10-50 frames)        10-60s        <1MB
Total (50+ frames)          30-120s       1-5MB
─────────────────────────────────────────────────
```

---

**Created**: April 15, 2026 | **Version**: 1.0
