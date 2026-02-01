# 🎨 Using the Trained Model - Complete Guide

## 📋 Overview

Your trained saliency model is now ready to analyze UI designs! This guide shows you how to use it effectively.

---

## ✅ Prerequisites

Make sure you have:
- ✅ Backend server running (`python -m uvicorn app.main:app --reload`)
- ✅ Trained model in `backend/models/saliency_model.pth`
- ✅ Python 3.x installed
- ✅ Required dependencies installed

---

## 🚀 Method 1: Using the Analysis Script (Command Line)

### Quick Start

```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Analyze any design image
python3 analyze_design.py path/to/your/design.png

# Specify custom output directory
python3 analyze_design.py my_design.png output/analysis_results/
```

### Create a Sample Design

```bash
# Generate a sample UI design for testing
python3 create_sample_design.py

# Then analyze it
python3 analyze_design.py sample_design.png
```

### What You Get

The analysis provides:

1. **📊 Cognitive Load Analysis**
   - Overall complexity score
   - Element density metrics
   - Color complexity
   - Text density
   - Recommendations for simplification

2. **🎯 Critical UI Elements**
   - Identified high-priority elements
   - Saliency scores (where users look first)
   - Location and size information
   - Expected attention percentages

3. **📈 Visual Hierarchy Assessment**
   - Overall hierarchy score
   - Flow analysis (F-pattern, Z-pattern)
   - Issues and warnings
   - Actionable recommendations

4. **🔥 Saliency Heatmap**
   - Visual representation of attention hotspots
   - Saved as PNG image
   - Red = high attention, Blue = low attention

5. **💾 JSON Report**
   - Complete analysis results
   - Machine-readable format
   - All metrics and raw data

### Example Output

```
============================================================
🎨 ARAI Design Analysis Tool
============================================================

📁 Input Image: sample_design.png
📁 Output Directory: analysis_output

🔧 Initializing analyzer with trained model...
✅ Loaded saliency model from models/saliency_model.pth
✅ Analyzer initialized successfully

🚀 Running comprehensive design analysis...
   • Saliency heatmap generation
   • Critical UI element identification
   • Visual hierarchy assessment
   • Cognitive load estimation

✅ Analysis completed successfully!

📊 ANALYSIS RESULTS
------------------------------------------------------------

🧠 COGNITIVE LOAD: 65/100 (Medium complexity)
🎯 CRITICAL ELEMENTS: 8 found
📈 HIERARCHY SCORE: 78/100
⚠️  ISSUES: 2 medium, 1 low

💾 SAVED FILES
✅ JSON Report: analysis_output/analysis_report.json
✅ Heatmap: heatmaps/sample_design_heatmap.png
```

---

## 🌐 Method 2: Using the Web Interface

### Upload via Frontend

1. **Start the Backend**
   ```bash
   cd /Users/kavishani/Documents/FYP/arai-system/backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the Frontend**
   ```bash
   cd /Users/kavishani/Documents/FYP/arai-system/frontend
   npm start
   ```

3. **Access the App**
   - Open browser: http://localhost:3000
   - Sign up or log in
   - Click "Upload Design"
   - Select your image file
   - Click "Analyze"

4. **View Results**
   - Saliency heatmap overlay
   - Attention metrics
   - WCAG compliance report
   - Readability analysis
   - Downloadable PDF report

---

## 🔧 Method 3: Using Python API

### Direct Integration

```python
from app.ai_modules.comprehensive_attention_analyzer import ComprehensiveAttentionAnalyzer

# Initialize analyzer
analyzer = ComprehensiveAttentionAnalyzer(
    model_path='models/saliency_model.pth'
)

# Analyze a design
result = analyzer.analyze_design('path/to/design.png')

# Access results
print(f"Overall Score: {result['score']}")
print(f"Critical Elements: {len(result['critical_elements'])}")

# Get saliency heatmap path
heatmap = result.get('saliency_heatmap_path')
print(f"Heatmap saved to: {heatmap}")

# Access cognitive load
cognitive = result.get('cognitive_load', {})
print(f"Complexity: {cognitive.get('complexity')}")

# Check visual hierarchy
hierarchy = result.get('visual_hierarchy', {})
issues = hierarchy.get('issues', [])
for issue in issues:
    print(f"[{issue['severity']}] {issue['description']}")
```

### Batch Processing

```python
import os
from app.ai_modules.comprehensive_attention_analyzer import ComprehensiveAttentionAnalyzer

# Initialize once
analyzer = ComprehensiveAttentionAnalyzer(
    model_path='models/saliency_model.pth'
)

# Process multiple designs
designs_folder = 'designs_to_analyze/'
output_folder = 'analysis_results/'

for filename in os.listdir(designs_folder):
    if filename.endswith(('.png', '.jpg', '.jpeg')):
        image_path = os.path.join(designs_folder, filename)
        
        print(f"Analyzing {filename}...")
        result = analyzer.analyze_design(image_path)
        
        # Save results
        import json
        output_path = os.path.join(output_folder, f"{filename}_analysis.json")
        with open(output_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"✅ Saved to {output_path}")
```

---

## 📊 Understanding the Analysis Results

### 1. Cognitive Load Metrics

| Metric | Range | Meaning |
|--------|-------|---------|
| Overall Score | 0-100 | Higher = more complex |
| Element Density | Low/Medium/High | Number of UI elements |
| Color Complexity | 0-1 | Number of distinct colors |
| Text Density | 0-1 | Amount of text content |

**Recommendations:**
- 0-40: Simple design, good for landing pages
- 41-70: Moderate complexity, balanced
- 71-100: High complexity, consider simplification

### 2. Critical UI Elements

Each element includes:
- **Priority**: high/medium/low
- **Saliency Score**: 0-1 (higher = more attention)
- **Location**: x, y coordinates and dimensions
- **Type**: Button, Text, Image, etc.
- **Attention Metrics**: Expected user focus

**How to use:**
- Elements with high saliency = users notice first
- Ensure CTAs have high saliency scores (>0.6)
- Check if important elements are in top 5

### 3. Visual Hierarchy

**Metrics:**
- **Overall Score**: 0-100 (higher = better hierarchy)
- **F-Pattern Compliance**: How well it follows F-pattern
- **Hierarchy Clarity**: Distinction between levels

**Common Issues:**
- Inverted hierarchy: Bottom gets more attention than top
- Flat hierarchy: No clear distinction between elements
- Poor flow: Confusing reading order

**Recommendations:**
- Most important content should be top-left
- Create clear visual layers (size, color, contrast)
- Follow F-pattern or Z-pattern

### 4. Saliency Heatmap

**Colors:**
- 🔴 Red/Warm: High attention areas
- 🟡 Yellow: Medium attention
- 🔵 Blue/Cool: Low attention areas

**How to read:**
1. Check if CTAs are in warm colors
2. Verify important content isn't in cold zones
3. Look for unwanted hotspots (distractions)

---

## 🎯 Best Practices

### Before Analysis

1. **Image Quality**
   - Use high-resolution images (min 800x600)
   - PNG or JPG format
   - Clean screenshots without watermarks

2. **Design State**
   - Final or near-final designs work best
   - Include all UI elements
   - Use realistic content (not Lorem Ipsum)

### Interpreting Results

1. **Focus on High-Severity Issues First**
   - Fix critical problems before minor ones
   - Prioritize accessibility violations

2. **Context Matters**
   - Landing pages: Simple, clear CTAs
   - Dashboards: Information density OK
   - Mobile: Fewer elements, larger touch targets

3. **Iterate**
   - Analyze → Fix → Re-analyze
   - Compare before/after scores
   - Track improvements over time

### Common Patterns

**Good Designs:**
- ✅ CTA buttons have saliency > 0.6
- ✅ Visual hierarchy score > 70
- ✅ Cognitive load < 60
- ✅ Clear F or Z pattern

**Needs Improvement:**
- ⚠️ Important elements have low saliency
- ⚠️ Hierarchy score < 50
- ⚠️ Cognitive load > 80
- ⚠️ No clear reading pattern

---

## 🔍 Example Analysis Workflow

### Step 1: Initial Analysis

```bash
python3 analyze_design.py homepage_v1.png
```

**Results:**
- Cognitive Load: 78 (High)
- Hierarchy Score: 45 (Needs work)
- Issues: 5 found

### Step 2: Review Issues

```json
{
  "issues": [
    {
      "severity": "high",
      "description": "Primary CTA has low saliency (0.32)"
    },
    {
      "severity": "medium",
      "description": "Too many visual elements competing for attention"
    }
  ]
}
```

### Step 3: Make Changes

- Increase CTA button size and contrast
- Remove or fade non-essential elements
- Reduce color palette from 12 to 5 colors

### Step 4: Re-analyze

```bash
python3 analyze_design.py homepage_v2.png
```

**New Results:**
- Cognitive Load: 52 (Improved! ⬇️ 26 points)
- Hierarchy Score: 68 (Better! ⬆️ 23 points)
- Issues: 2 found (⬇️ 3 issues resolved)

### Step 5: Compare

```bash
# View both reports side by side
cat analysis_output/v1_analysis.json | grep score
cat analysis_output/v2_analysis.json | grep score
```

---

## 🛠️ Advanced Usage

### Custom Model Paths

```python
analyzer = ComprehensiveAttentionAnalyzer(
    model_path='path/to/custom_model.pth'
)
```

### Save Heatmaps to Custom Location

```python
import shutil

result = analyzer.analyze_design('design.png')
heatmap = result['saliency_heatmap_path']

# Copy to custom location
shutil.copy(heatmap, 'reports/heatmaps/design_heatmap.png')
```

### Extract Specific Metrics

```python
result = analyzer.analyze_design('design.png')

# Just cognitive load
cog_load = result['cognitive_load']['overall_score']

# Just critical elements
ctas = [e for e in result['critical_elements'] 
        if e['type'] == 'Button/CTA']

# Just high-severity issues
critical_issues = [i for i in result['visual_hierarchy']['issues']
                   if i['severity'] == 'high']
```

---

## 📝 Output Files

### Generated Files

```
analysis_output/
├── analysis_report.json          # Complete analysis results
└── sample_design_heatmap.png     # Saliency heatmap

heatmaps/
└── original_heatmap.png           # Raw heatmap (no overlay)
```

### JSON Report Structure

```json
{
  "score": 75.5,
  "saliency_heatmap_path": "heatmaps/design_heatmap.png",
  "attention_distribution": {
    "high_attention_percentage": 25.0,
    "average_attention": 0.45,
    "max_attention": 0.89
  },
  "critical_elements": [...],
  "visual_hierarchy": {...},
  "cognitive_load": {...}
}
```

---

## ❓ Troubleshooting

### Issue: Model not found

```bash
❌ Error: Model file not found: models/saliency_model.pth
```

**Solution:**
```bash
# Check model exists
ls -la backend/models/saliency_model.pth

# If missing, download from Google Colab or re-train
```

### Issue: Image file not found

**Solution:**
```bash
# Use absolute path
python3 analyze_design.py /full/path/to/image.png

# Or relative to backend folder
python3 analyze_design.py ../uploads/design.png
```

### Issue: Out of memory

**Solution:**
```python
# Resize large images before analysis
from PIL import Image

img = Image.open('large_design.png')
img = img.resize((1200, 800), Image.LANCZOS)
img.save('resized_design.png')
```

---

## 🚀 Next Steps

1. **Analyze Your Designs**
   - Start with existing screenshots
   - Run analysis on key pages
   - Identify improvement areas

2. **Compare Variations**
   - Test A/B designs
   - Measure improvement quantitatively
   - Document changes

3. **Automate**
   - Integrate into CI/CD pipeline
   - Auto-analyze on new commits
   - Generate reports automatically

4. **Share Results**
   - Export PDF reports
   - Share heatmaps with team
   - Track metrics over time

---

## 📚 Additional Resources

- **Model Training**: See `GOOGLE_COLAB_TRAINING_GUIDE.md`
- **API Documentation**: http://localhost:8000/docs
- **Frontend Usage**: See `frontend/README.md`
- **Test Script**: Run `python3 test_model.py`

---

## ✨ Tips for Best Results

1. **Use Real Content**: Avoid placeholder text
2. **Full Page Screenshots**: Include all UI elements
3. **Consistent Lighting**: Good contrast helps analysis
4. **Multiple Iterations**: Analyze → Improve → Re-analyze
5. **Track Progress**: Save all analysis reports for comparison

---

**Happy Analyzing! 🎨✨**
