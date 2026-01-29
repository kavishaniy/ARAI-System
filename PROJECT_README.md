# 🎨 ARAI System - AI-Powered UX Design Critique

> **A**ccessibility **R**eadability **A**ttention **I**ndex

An intelligent web application that leverages artificial intelligence to automatically evaluate UI/UX designs for accessibility compliance (WCAG 2.1), readability, and visual attention flow.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![WCAG](https://img.shields.io/badge/WCAG-2.1-green.svg)](https://www.w3.org/TR/WCAG21/)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Usage Examples](#usage-examples)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**Project Title**: AI-Powered UX Design Critique Web Application  
**Student**: Kavishani Yoganathan (w2052102)  
**Supervisor**: Quang Nguyen  
**Institution**: University of Westminster  
**Degree**: BSc Computer Science (Hons)

### Problem Statement

95.9% of websites fail WCAG compliance testing (WebAIM Million Report, 2024). Current accessibility tools operate post-development, missing critical early-stage design issues. This project addresses this gap by providing AI-powered accessibility analysis during the design phase.

### Solution

The ARAI System combines:
- **Rule-based WCAG 2.1 checking** (11+ criteria across A, AA, AAA levels)
- **Computer vision** for visual structure analysis
- **Natural language processing** for text readability
- **Deep learning** for visual attention prediction

---

## ✨ Features

### 🛡️ Accessibility Analysis (WCAG 2.1)
- ✅ 11+ WCAG criteria automated checks
- ✅ Color contrast calculation (1.4.3, 1.4.6, 1.4.11)
- ✅ Target size validation (2.5.5, 2.5.8)
- ✅ Focus indicator detection (2.4.7)
- ✅ Visual structure analysis (1.3.1)
- ✅ Conformance level determination (A, AA, AAA)

### 📖 Readability Analysis
- ✅ OCR text extraction (Tesseract)
- ✅ Flesch Reading Ease score
- ✅ Flesch-Kincaid Grade Level
- ✅ Gunning Fog Index
- ✅ Text density assessment
- ✅ Line length optimization

### 👁️ Visual Attention Analysis
- ✅ Saliency map prediction (U-Net CNN)
- ✅ Attention distribution (top/center/bottom)
- ✅ Visual hierarchy assessment
- ✅ Hotspot detection
- ✅ Cognitive load estimation

### 📊 ARAI Scoring System
```
ARAI Score = (Accessibility × 40%) + (Readability × 30%) + (Attention × 30%)
```

| Score | Grade | Level | Meaning |
|-------|-------|-------|---------|
| 90-100 | A | AAA | Exceptional accessibility |
| 80-89 | B | AA | Industry standard ⭐ |
| 70-79 | C | A | Minimum legal compliance |
| 60-69 | D | Partial | Significant issues |
| 0-59 | F | Non-conformant | Critical failures |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Tesseract OCR
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/arai-system.git
cd arai-system

# Backend setup
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials

# Frontend setup
cd ../frontend
npm install
```

### Running the Application

```bash
# Terminal 1: Start backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm start

# Terminal 3: Run system test
./test_system.sh
```

### Access Points

- **Application**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              React Frontend                      │
│         (Upload, View Results, History)          │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTP/REST
                 │
┌────────────────▼────────────────────────────────┐
│              FastAPI Backend                     │
│         (Analysis Orchestration)                 │
└────┬──────────┬──────────┬──────────────────────┘
     │          │          │
     ▼          ▼          ▼
┌─────────┐ ┌────────┐ ┌───────────┐
│  WCAG   │ │ Read-  │ │ Attention │
│Analyzer │ │ability │ │ Analyzer  │
│(40%)    │ │(30%)   │ │  (30%)    │
└─────────┘ └────────┘ └───────────┘
     │          │          │
     └──────────┴──────────┘
                │
     ┌──────────▼──────────┐
     │   ARAI Score        │
     │   Calculation       │
     └─────────────────────┘
```

**For detailed architecture diagram, see**: [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[NEXT_STEPS.md](NEXT_STEPS.md)** | 👈 **START HERE!** How to run and test |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | What has been built |
| [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) | Full technical documentation |
| [ANALYSIS_FEATURES.md](ANALYSIS_FEATURES.md) | Detailed feature breakdown |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Visual system architecture |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick commands and tips |
| [QUICK_START.md](QUICK_START.md) | Setup instructions |

---

## 📁 Project Structure

```
arai-system/
├── backend/
│   ├── app/
│   │   ├── ai_modules/           # AI analysis engines
│   │   │   ├── wcag_analyzer.py          # 650+ lines, WCAG 2.1 checker
│   │   │   ├── readability_analyzer.py   # Text analysis
│   │   │   └── attention_analyzer.py     # Visual attention (U-Net)
│   │   ├── api/                  # API endpoints
│   │   │   ├── analysis.py               # Analysis routes
│   │   │   └── auth.py                   # Authentication
│   │   ├── core/                 # Configuration
│   │   └── main.py              # FastAPI app
│   ├── models/                   # Trained ML models
│   └── requirements.txt          # Python dependencies
│
├── frontend/
│   └── src/
│       └── components/
│           ├── Analysis/
│           │   ├── UploadAnalysis.jsx    # Upload interface
│           │   └── AnalysisResults.jsx   # Results display (500+ lines)
│           └── Dashboard/
│               └── Dashboard.jsx         # Main dashboard
│
├── data/
│   ├── figma_designs/            # Test UI mockups
│   ├── salicon/                  # Training dataset
│   └── rico/                     # UI component dataset
│
├── uploads/                      # Uploaded designs & results
│
└── docs/                         # Additional documentation
```

---

## 🛠️ Technologies

### Backend
- **FastAPI** 0.104.1 - Modern web framework
- **PyTorch** 2.1.0 - Deep learning
- **OpenCV** 4.8.1 - Computer vision
- **Tesseract** - OCR text extraction
- **Pillow** 10.1.0 - Image processing
- **NumPy** 1.24.3 - Numerical computing
- **textstat** 0.7.3 - Readability metrics

### Frontend
- **React** 18+ - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

### Database & Auth
- **Supabase** - PostgreSQL + Authentication
- **JWT** - Token-based auth

---

## 💡 Usage Examples

### Basic Analysis

```bash
# Upload and analyze via API
curl -X POST http://localhost:8000/api/v1/analysis/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@design.png" \
  -F "design_name=Homepage Design"
```

### Programmatic Usage

```python
from app.ai_modules.wcag_analyzer import WCAGAnalyzer

analyzer = WCAGAnalyzer()
results = analyzer.analyze_design("design.png")

print(f"Score: {results['score']}/100")
print(f"Conformance: {results['conformance_level']}")
print(f"Issues: {len(results['issues'])}")

# View high severity issues
high_issues = [i for i in results['issues'] if i['severity'] == 'high']
for issue in high_issues:
    print(f"[{issue['wcag_criterion']}] {issue['type']}")
    print(f"  Fix: {issue['recommendation']}")
```

**For more examples, see**: [`examples.py`](examples.py)

---

## 🎯 WCAG Criteria Coverage

| Criterion | Level | What It Checks | Status |
|-----------|-------|----------------|--------|
| 1.1.1 | A | Text alternatives | ✅ |
| 1.3.1 | A | Info & relationships | ✅ |
| 1.4.3 | AA | Contrast (4.5:1) | ✅ |
| 1.4.6 | AAA | Enhanced contrast (7:1) | ✅ |
| 1.4.11 | AA | Non-text contrast (3:1) | ✅ |
| 2.1.1 | A | Keyboard accessible | ✅ |
| 2.4.7 | AA | Focus visible | ✅ |
| 2.5.5 | AAA | Target size (44×44) | ✅ |
| 2.5.8 | AA | Target size min (24×24) | ✅ |
| 3.2.4 | AA | Consistent ID | ✅ |
| 3.3.1 | A | Error identification | ✅ |

---

## 📊 Example Output

```json
{
  "arai_score": 85.5,
  "overall_grade": "B",
  "accessibility": {
    "score": 82,
    "conformance_level": "Level AA",
    "issue_count": {
      "critical": 0,
      "high": 2,
      "medium": 5,
      "low": 3
    },
    "issues": [
      {
        "wcag_criterion": "1.4.3",
        "wcag_level": "AA",
        "type": "Low Color Contrast",
        "severity": "high",
        "description": "Text has 3.2:1 contrast ratio",
        "recommendation": "Increase contrast to at least 4.5:1"
      }
    ]
  },
  "readability": {
    "score": 88,
    "metrics": {
      "flesch_reading_ease": 65.2,
      "flesch_kincaid_grade": 8.5
    }
  },
  "attention": {
    "score": 87,
    "attention_distribution": {
      "top": 0.35,
      "center": 0.45,
      "bottom": 0.20
    }
  }
}
```

---

## 🧪 Testing

```bash
# Run automated system test
./test_system.sh

# Manual testing
1. Open http://localhost:3000
2. Login/Signup
3. Upload design from data/figma_designs/
4. View comprehensive analysis
```

---

## 🤝 Contributing

This is a final year project for academic purposes. However, suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **W3C** for WCAG 2.1 standards
- **WebAIM** for accessibility resources
- **SALICON** and **RICO** dataset creators
- **University of Westminster** for academic support

---

## 📞 Contact

**Student**: Kavishani Yoganathan  
**Student ID**: w2052102  
**Email**: w2052102@my.westminster.ac.uk  
**Supervisor**: Quang Nguyen  
**Institution**: University of Westminster

---

## 🎓 Academic Context

This project is submitted as part of the requirements for:
- **Module**: 6COSC023W - Computer Science Final Project
- **Degree**: BSc Computer Science (Honours)
- **Year**: 2025/2026
- **College**: College of Design, Creative and Digital Industries

### Research Objectives Achievement

✅ **Objective 1**: Multi-model AI architecture (Rule-based + CV + NLP)  
✅ **Objective 2**: Web-based prototype with file upload  
✅ **Objective 3**: Quantitative assessment metrics (ARAI score)  
✅ **Objective 4**: Expert validation framework prepared  
✅ **Objective 5**: Accessible, usable system design

---

## 🔗 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [WebAIM Resources](https://webaim.org/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Understanding WCAG](https://www.w3.org/WAI/WCAG21/Understanding/)

---

## 📈 Project Status

**Status**: ✅ **Production-Ready Core Implementation**

- [x] Backend API complete
- [x] AI analysis modules implemented (650+ lines WCAG analyzer)
- [x] Frontend interface complete (500+ lines results display)
- [x] ARAI scoring system operational
- [x] Comprehensive documentation
- [x] Ready for user evaluation

**Next Steps**: User studies, expert validation, performance optimization

---

<div align="center">

**Built with ❤️ for accessible design**

*Making the web accessible, one design at a time*

[Report Bug](https://github.com/yourusername/arai-system/issues) · [Request Feature](https://github.com/yourusername/arai-system/issues)

</div>
