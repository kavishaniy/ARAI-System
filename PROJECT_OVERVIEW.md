# ARAI System - Project Overview

## 📋 Executive Summary

**ARAI System** is a Full-Stack AI-Powered Design Analysis Platform that automatically evaluates mobile and web design mockups across three critical dimensions: **Accessibility (WCAG)**, **Readability**, and **Attention (Visual Hierarchy)**. The system generates comprehensive analysis reports with actionable insights, severity-based issue categorization, and improvement recommendations.

**Status**: ✅ **Fully Functional & Deployed**  
**Architecture**: Modern Full-Stack (React Frontend + FastAPI Backend)  
**Deployment**: Vercel (Frontend) + Render/Railway (Backend)

---

## 🎯 Project Objectives

1. **Automate Design Evaluation** - Reduce manual design review time
2. **Multi-Dimensional Analysis** - Evaluate designs across accessibility, readability, and visual hierarchy
3. **Actionable Insights** - Provide clear issues with solutions, not just scores
4. **Educational Value** - Help designers understand UX/UI best practices
5. **Scalability** - Support batch analysis and large-scale design evaluations

---

## 🏗️ System Architecture

### **Frontend Stack**
- **Framework**: React 18.2.0 with React Router v6
- **Styling**: Tailwind CSS 3.4.19 with PostCSS
- **State Management**: React Context + Local Storage
- **Authentication**: Supabase JWT tokens
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Theme Colors**: Navy Blue (#001f3f), Black, White (minimal, sleek design)

### **Backend Stack**
- **Framework**: FastAPI 0.104.1 (async Python web framework)
- **Database**: Supabase (PostgreSQL + Auth)
- **Image Processing**: OpenCV (headless), Pillow
- **Text Analysis**: Pytesseract (OCR), TextStat
- **Server**: Uvicorn (ASGI server)
- **Configuration**: Python-dotenv, Pydantic
- **Validation**: Email-validator, Python-multipart

### **AI/ML Modules**
- **Simplified WCAG Analyzer** - Web Content Accessibility Guidelines compliance
- **Simplified Readability Analyzer** - Text legibility and readability metrics
- **Simplified Attention Analyzer** - Visual hierarchy and focal point detection

### **Data Storage**
- **Supabase PostgreSQL**: User accounts, projects, analysis history
- **File Storage**: Uploads folder (design images)
- **Training Data**: MIT Saliency, RICO, SALICON datasets

---

## 📁 Project Structure

```
arai-system/
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── main.py                  # FastAPI app initialization & CORS config
│   │   ├── api/
│   │   │   ├── auth.py              # Authentication endpoints (login, signup)
│   │   │   └── analysis.py          # Analysis endpoints (upload, analyze)
│   │   ├── ai_modules/
│   │   │   ├── simplified_wcag_analyzer.py        # Accessibility analysis
│   │   │   ├── simplified_readability_analyzer.py # Readability analysis
│   │   │   └── simplified_attention_analyzer.py   # Visual hierarchy analysis
│   │   ├── core/
│   │   │   └── config.py            # Settings & environment variables
│   │   └── models/
│   │       └── [database models]    # Data structures
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Docker configuration
│   ├── Procfile                      # Render deployment config
│   └── runtime.txt                   # Python version specification
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── App.jsx                  # Main app router
│   │   ├── components/
│   │   │   ├── Auth/                # Login & Signup pages
│   │   │   ├── Dashboard/           # Main dashboard
│   │   │   ├── Analysis/            # Analysis results & report display
│   │   │   ├── Pages/               # Projects, History, Settings
│   │   │   ├── Common/              # Shared components (buttons, cards)
│   │   │   └── ui/                  # Basic UI elements
│   │   ├── pages/                   # Page components [currently empty]
│   │   ├── services/
│   │   │   └── auth.js              # Auth service (JWT token management)
│   │   ├── utils/                   # Helper functions
│   │   ├── index.css                # Global styles
│   │   └── index.js                 # React entry point
│   ├── public/                       # Static assets
│   ├── build/                        # Production build output
│   ├── package.json                  # Node dependencies
│   ├── tailwind.config.js            # Tailwind configuration
│   ├── postcss.config.js             # PostCSS plugins
│   └── vercel.json                   # Vercel deployment config
│
├── data/                             # Datasets & training data
│   ├── figma_designs/                # Sample design files
│   ├── mit_saliency/                 # MIT saliency dataset
│   ├── rico/                         # RICO mobile UI dataset
│   └── salicon/                      # SALICON attention dataset
│
├── uploads/                          # User-uploaded design images
│   └── [UUID folders]/               # Organized by upload session
│
└── docs/                             # Documentation
```

---

## 🔄 User Flow & Features

### **1. Authentication**
- **Signup**: Email & password registration via Supabase
- **Login**: JWT token-based authentication
- **Session Management**: Secure token storage in localStorage
- **Password Recovery**: Email verification support

### **2. Dashboard**
- **Project Overview**: List of user's design projects
- **Recent Analyses**: Quick access to latest reports
- **Quick Upload**: Fast design submission
- **Statistics**: Overview of analyses, average scores

### **3. Design Analysis Workflow**
```
User Upload Design Image
    ↓
Backend Image Processing & Analysis
    ├→ WCAG Analyzer (Accessibility)
    ├→ Readability Analyzer (Text & Legibility)
    └→ Attention Analyzer (Visual Hierarchy)
    ↓
Score Calculation & Weighting
    - Accessibility: 40%
    - Readability: 30%
    - Attention: 30%
    - FINAL ARAI Score: Weighted average
    ↓
Issue Detection & Categorization
    - Severity Levels: Critical, High, Medium, Low
    - Deduction: -25, -15, -8, -2 points per issue
    ↓
Report Generation & Visualization
```

### **4. Analysis Report Components**
- **Overall ARAI Score** (0-100): Composite design quality metric
- **Accessibility Score**: WCAG compliance level
- **Readability Score**: Text legibility and comprehension
- **Attention Score**: Visual hierarchy effectiveness
- **Issue List**: Detailed problems with categories
- **Solutions Tab**: Actionable recommendations for each issue
- **Design Visualization**: Original design with annotated issues

### **5. Results Display**
- **Simplified Analysis Results** (Tab-based view)
  - Overview tab with main score
  - Accessibility issues
  - Readability issues
  - Attention issues
- **Detailed Analysis Report**
  - Full issue descriptions
  - Severity indicators (Critical/High/Medium/Low)
  - Solution suggestions
  - Before/after examples

### **6. History & Projects**
- **Analysis History**: Previous analyses with dates & scores
- **Project Management**: Organize designs by project
- **Export**: Generate reports (PDF/JSON)
- **Settings**: User preferences & API management

---

## 🧠 AI Analysis Modules

### **Simplified WCAG Analyzer**
**Purpose**: Evaluate accessibility compliance with Web Content Accessibility Guidelines (WCAG 2.1)

**Key Checks**:
- Color contrast ratios (foreground vs background)
- Text size and readability
- Button/link accessibility (size, spacing)
- Alt text detection for images
- Form field labeling
- Semantic HTML structure detection

**Output**:
- Accessibility Score (0-100)
- List of issues with severity levels
- Specific recommendations

**Example Issues**:
- ❌ "Low contrast text (2.5:1 vs required 4.5:1)"
- ❌ "Buttons too small (15px vs recommended 44px)"
- ❌ "Form fields missing labels"

---

### **Simplified Readability Analyzer**
**Purpose**: Assess text legibility and content comprehension

**Key Metrics**:
- Font size analysis
- Line spacing measurement
- Word length distribution
- Sentence complexity (Flesch-Kincaid readability index)
- Text density (text vs whitespace ratio)
- OCR text detection (using Tesseract)
- Color contrast for text
- Text alignment and justification

**Output**:
- Readability Score (0-100)
- Readability grade level
- List of specific issues
- Improvement suggestions

**Example Issues**:
- ❌ "Font size too small (10px, recommended 14px+)"
- ❌ "High text complexity (Grade 11+ reading level)"
- ❌ "Excessive text density (text fills >80% of space)"

---

### **Simplified Attention Analyzer**
**Purpose**: Evaluate visual hierarchy and focal point effectiveness

**Key Checks**:
- Focal point detection (primary element of attention)
- Visual weight distribution
- Color prominence and contrast
- Typography hierarchy (size, weight differences)
- Element spacing and grouping
- Eye flow path analysis
- Gestalt principle compliance (proximity, similarity)

**Output**:
- Attention Score (0-100)
- Visual hierarchy effectiveness rating
- List of attention issues
- Focal point recommendations

**Example Issues**:
- ❌ "No clear primary focal point"
- ❌ "Multiple competing focal points create confusion"
- ❌ "Call-to-action lacks visual prominence"

---

## 📊 Scoring System

### **Score Calculation Formula**
```
ARAI Score = (Accessibility × 0.4) + (Readability × 0.3) + (Attention × 0.3)
```

### **Individual Analyzer Scoring**
Each analyzer uses a severity-based deduction model:
- **Critical Issue**: -25 points
- **High Issue**: -15 points
- **Medium Issue**: -8 points
- **Low Issue**: -2 points
- **Maximum Score**: 100 (no deductions)

### **Example Score Scenarios**

**Clean Design** (All best practices followed)
- Accessibility: 98, Readability: 97, Attention: 99
- **ARAI Score**: 98 ✅

**Design with 5 High-Severity Issues**
- Accessibility: 60, Readability: 70, Attention: 65
- **ARAI Score**: 65 ✅

---

## 🚀 Deployment Architecture

### **Frontend (Vercel)**
- **Automatic deployments** from `main` branch
- **Preview URLs** for testing: `https://<project>-kavishaniy.vercel.app`
- **Production URL**: `https://arai-system.vercel.app`
- **Environment Variables**: `REACT_APP_API_URL`, `REACT_APP_SUPABASE_URL`

### **Backend (Render/Railway)**
- **Async FastAPI server** with Uvicorn
- **CORS Configuration**: Dynamic origin matching for Vercel previews
- **Database**: Supabase PostgreSQL (hosted)
- **Environment Variables**: `DATABASE_URL`, `SUPABASE_API_KEY`, `ALLOWED_ORIGINS`
- **Port**: 5000 (production), 8000 (local development)

### **CORS Setup**
```
Allowed Origins:
- http://localhost:3000 (local development)
- https://arai-system.vercel.app (production)
- https://arai-system-*.vercel.app (preview URLs)
- Dynamic Vercel preview matching via regex
```

---

## 🔧 Key Technologies & Why They Were Chosen

| Technology | Purpose | Why Chosen |
|-----------|---------|-----------|
| **React** | Frontend framework | Fast, component-based, large ecosystem |
| **FastAPI** | Backend framework | High performance, automatic API docs, async support |
| **Supabase** | Database & Auth | PostgreSQL + built-in auth, free tier suitable |
| **Tailwind CSS** | Styling | Utility-first, rapid design, minimal design capability |
| **OpenCV** | Image processing | Industry-standard, powerful vision algorithms |
| **Pytesseract** | OCR | Free, integrates well with Python stack |
| **Vercel** | Frontend hosting | Zero-config React deployment, preview URLs |
| **Render/Railway** | Backend hosting | Free tier, supports Docker, easy deployments |

---

## 📈 Recent Changes & Fixes

### **Score Calculation Fix (April 10, 2026)**
**Problem**: Scores were showing 100 despite identified issues  
**Solution**: Implemented severity-based score deduction system
- ✅ WCAG analyzer: Proper point deduction per issue
- ✅ Readability analyzer: Text detection improved
- ✅ Attention analyzer: Corrected problem detection
- ✅ ARAI formula: Properly weighted (0.4, 0.3, 0.3)

### **UI Redesign (April 10, 2026)**
**Changes**: Minimal, sleek aesthetic with theme colors
- ✅ Removed gradients and excessive shadows
- ✅ Added navy blue (#001f3f) as primary accent color
- ✅ Improved contrast and readability
- ✅ Updated all analysis result pages
- ✅ Cleaner tab navigation and issue display

---

## 🧪 Testing & Quality Assurance

### **Manual Testing Checklist**
- ✅ User registration & login
- ✅ Design upload with image validation
- ✅ Analysis completion (all three analyzers)
- ✅ Score reasonableness (not always 100)
- ✅ Issue descriptions clarity
- ✅ Solution recommendations quality
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ History & project management
- ✅ Cross-browser compatibility
- ✅ CORS functionality

### **Quick Test (2 minutes)**
1. Go to `http://localhost:3000`
2. Login with test credentials
3. Upload a design mockup
4. Verify scores are reasonable
5. Check issue descriptions and solutions

---

## 🎨 Design System & Theme

### **Color Palette**
| Color | Hex | Usage |
|-------|-----|-------|
| **Navy Blue** | #001f3f | Primary buttons, accents, active states |
| **Black** | #000000 | Primary text, dark elements |
| **White** | #FFFFFF | Backgrounds, cards, surfaces |
| **Gray-400** | #D1D5DB | Secondary text, borders, disabled states |
| **Gray-600** | #6B7280 | Tertiary text, muted elements |
| **Green** | #10B981 | Success indicators, passed checks |
| **Red** | #EF4444 | Critical errors, high severity |
| **Orange** | #F97316 | Warnings, high severity issues |
| **Amber** | #FBBF24 | Medium priority, cautions |

### **Typography**
- **Font Family**: System fonts (Tailwind default)
- **Headings**: Bold, larger sizes (2xl-4xl)
- **Body**: Regular weight, 14-16px
- **Code**: Monospace (if displayed)

### **Component Library**
- Button (primary, secondary, danger states)
- Card (white background, subtle borders)
- Input & Textarea (clean, minimal styling)
- Modal (centered overlay)
- Badge & Labels (status indicators)
- Spinner (navy-900 color)
- Alert (success, error, warning, info)

---

## 📚 API Endpoints

### **Authentication**
```
POST   /api/v1/auth/signup          Register new user
POST   /api/v1/auth/login           User login
POST   /api/v1/auth/logout          User logout
GET    /api/v1/auth/me              Get current user
```

### **Analysis**
```
POST   /api/v1/analysis/upload      Upload design image
GET    /api/v1/analysis/status/:id  Get analysis status
GET    /api/v1/analysis/results/:id Get analysis results
GET    /api/v1/analysis/history     Get user's analysis history
DELETE /api/v1/analysis/:id         Delete analysis record
```

### **Projects**
```
GET    /api/v1/projects             List user's projects
POST   /api/v1/projects             Create new project
PUT    /api/v1/projects/:id         Update project
DELETE /api/v1/projects/:id         Delete project
```

---

## 🔐 Security Features

1. **Authentication**: JWT tokens via Supabase
2. **CORS**: Strict origin validation
3. **Input Validation**: Pydantic model validation
4. **Environment Variables**: Sensitive data via .env
5. **File Upload**: Size limits and type validation
6. **Password**: Supabase handles hashing
7. **HTTPS**: Enforced in production

---

## 🐛 Known Limitations & Future Improvements

### **Current Limitations**
- PyTorch removed from production (memory constraints)
- Simplified analyzers (not full ML-based)
- Single image per analysis (no multi-page analysis)
- No user profile customization

### **Future Enhancements**
1. **Advanced ML Models**: Implement full neural networks for better accuracy
2. **Batch Analysis**: Support multiple designs at once
3. **Design System Export**: Generate design guidelines from analysis
4. **Real-time Collaboration**: Teams working together on designs
5. **Saliency Map Visualization**: Show where users look first
6. **A/B Testing**: Compare two design versions
7. **Analytics Dashboard**: Track design trends over time
8. **Mobile App**: Native iOS/Android versions
9. **Integrations**: Figma, Adobe XD, Sketch plugins
10. **AI Training**: Learn from user feedback and corrections

---

## 📞 Support & Documentation

### **Internal Documentation**
- `FIX_STATUS.txt` - Latest fix details
- `UI_REDESIGN_SUMMARY.md` - Design changes
- `CLEANUP_SUMMARY.md` - Code cleanup notes

### **Getting Started**
1. Clone repository
2. Install backend: `pip install -r backend/requirements.txt`
3. Install frontend: `npm install` (in frontend folder)
4. Configure `.env` files
5. Start backend: `python -m uvicorn app.main:app --reload`
6. Start frontend: `npm start`
7. Access at `http://localhost:3000`

---

## 📊 Project Statistics

- **Frontend Components**: 15+ reusable components
- **Backend Endpoints**: 10+ API routes
- **AI Analyzers**: 3 specialized modules
- **Supported Design Formats**: PNG, JPG, WebP
- **Max File Size**: 10MB
- **Analysis Time**: 5-15 seconds per design
- **Users Supported**: Unlimited (scalable)

---

## 🎓 Learning Outcomes

This FYP project demonstrates:
1. **Full-Stack Web Development** - Modern frontend & backend frameworks
2. **AI/ML Integration** - Computer vision & NLP in web apps
3. **Cloud Deployment** - Heroku, Vercel, Railway, Render
4. **Database Design** - PostgreSQL with Supabase
5. **Authentication Systems** - JWT and OAuth
6. **API Design** - RESTful principles
7. **UI/UX Design** - User-centered design approach
8. **DevOps** - CI/CD, Docker, environment management
9. **Project Management** - Agile development practices
10. **Technical Writing** - Documentation and communication

---

## ✅ Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **Frontend** | ✅ Production Ready | Deployed on Vercel |
| **Backend** | ✅ Production Ready | Running on Render/Railway |
| **Database** | ✅ Operational | Supabase PostgreSQL |
| **Authentication** | ✅ Working | JWT via Supabase |
| **WCAG Analyzer** | ✅ Working | Severity-based scoring |
| **Readability Analyzer** | ✅ Working | OCR + text analysis |
| **Attention Analyzer** | ✅ Working | Visual hierarchy detection |
| **Score Calculation** | ✅ Fixed | Weighted formula implemented |
| **UI Design** | ✅ Complete | Minimal & sleek aesthetic |
| **Documentation** | ✅ Comprehensive | This document + inline comments |

---

## 📝 Presentation Talking Points

### **For Supervisors / Evaluators**

1. **Problem Statement**: Design evaluation is time-consuming and subjective. ARAI automates it.

2. **Unique Value Proposition**: 
   - Combines 3 analysis dimensions (Accessibility + Readability + Attention)
   - Provides actionable insights, not just scores
   - Fully automated end-to-end pipeline

3. **Technical Innovation**:
   - Async backend for high performance
   - Image processing with OpenCV
   - OCR integration with Pytesseract
   - Weighted scoring system reflecting design importance

4. **User Impact**:
   - Designers get instant feedback on their work
   - Accessibility compliance becomes measurable
   - Readability issues identified objectively
   - Visual hierarchy optimized for user engagement

5. **Scalability**:
   - Cloud-based deployment (handles growth)
   - Async architecture (concurrent analysis)
   - Modular analyzers (easy to extend)

6. **Production Readiness**:
   - CORS properly configured
   - Environment-based config
   - Error handling implemented
   - Comprehensive API documentation

---

**Last Updated**: April 10, 2026  
**Version**: 1.0  
**Project Status**: ✅ Complete & Deployed  
**Total Development Time**: Full academic year (FYP)
