# ARAI Analysis System - Comprehensive Features

## Overview

The ARAI (Accessibility Readability Attention Index) System provides AI-powered analysis of UI/UX designs according to WCAG 2.1 standards and cognitive usability principles.

## Analysis Modules

### 1. WCAG 2.1 Accessibility Analyzer

**File**: `backend/app/ai_modules/wcag_analyzer.py`

Implements comprehensive WCAG 2.1 compliance checking across all four POUR principles:

#### Perceivable (P)
- ✓ 1.1.1 Text Alternatives (Level A)
- ✓ 1.3.1 Info and Relationships (Level A)
- ✓ 1.4.3 Contrast (Minimum) - AA Standard (4.5:1 ratio)
- ✓ 1.4.6 Contrast (Enhanced) - AAA Standard (7:1 ratio)
- ✓ 1.4.11 Non-text Contrast - UI Components (3:1 ratio)

#### Operable (O)
- ✓ 2.1.1 Keyboard Accessible (Level A)
- ✓ 2.4.7 Focus Visible (Level AA)
- ✓ 2.5.5 Target Size - AAA (44x44 pixels)
- ✓ 2.5.8 Target Size (Minimum) - AA (24x24 pixels, WCAG 2.2)

#### Understandable (U)
- ✓ 3.2.4 Consistent Identification (Level AA)
- ✓ 3.3.1 Error Identification (Level A)

#### Robust (R)
- ✓ Image Quality Checks
- ✓ Clarity Analysis

### 2. Readability Analyzer

**File**: `backend/app/ai_modules/readability_analyzer.py`

Analyzes text content for comprehension and accessibility:

- **OCR Text Extraction** using Tesseract
- **Flesch Reading Ease Score** (0-100, higher = easier)
- **Flesch-Kincaid Grade Level** (U.S. grade level)
- **Gunning Fog Index** (years of education needed)
- **Word Count & Character Count**
- **Average Line Length**
- **Text Density Analysis**

### 3. Visual Attention Analyzer

**File**: `backend/app/ai_modules/attention_analyzer.py`

Predicts where users will look using deep learning saliency models:

- **Saliency Map Generation** using U-Net architecture
- **Attention Distribution** (top, center, bottom regions)
- **Focus Area Detection**
- **Visual Hierarchy Assessment**
- **Cognitive Load Estimation**

## Scoring System

### ARAI Score Formula

```
ARAI Score = (Accessibility × 0.4) + (Readability × 0.3) + (Attention × 0.3)
```

**Weighting Rationale:**
- **40% Accessibility**: Most critical for legal compliance and equal access
- **30% Readability**: Essential for content comprehension
- **30% Attention**: Important for user experience and cognitive accessibility

### Score Interpretation

| Score | Grade | Conformance Level | Meaning |
|-------|-------|-------------------|---------|
| 90-100 | A | Level AAA | Exceptional accessibility |
| 80-89 | B | Level AA | Industry standard (recommended) |
| 70-79 | C | Level A | Minimum legal compliance |
| 60-69 | D | Partial A | Significant issues present |
| 0-59 | F | Non-conformant | Critical failures |

### Conformance Levels

#### Level AAA (Gold Standard)
- All A, AA, and AAA criteria met
- Enhanced contrast (7:1)
- Large touch targets (44x44px)
- Optimal for maximum accessibility

#### Level AA (Industry Standard)
- All A and AA criteria met
- Standard contrast (4.5:1)
- Minimum touch targets (24x24px)
- **Recommended target for most projects**

#### Level A (Legal Minimum)
- Essential A criteria met
- Basic accessibility present
- May have significant usability issues

#### Non-conformant
- Fails essential A criteria
- Critical accessibility barriers
- Not legally compliant

## Technical Implementation

### Color Contrast Calculation

Based on WCAG 2.1 relative luminance formula:

```python
def relative_luminance(R, G, B):
    """
    WCAG 2.1 Formula for Relative Luminance
    https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
    """
    # Normalize RGB values
    r, g, b = R/255, G/255, B/255
    
    # Apply gamma correction
    r = r/12.92 if r <= 0.03928 else ((r+0.055)/1.055)**2.4
    g = g/12.92 if g <= 0.03928 else ((g+0.055)/1.055)**2.4
    b = b/12.92 if b <= 0.03928 else ((b+0.055)/1.055)**2.4
    
    # Calculate luminance
    return 0.2126*r + 0.7152*g + 0.0722*b

def contrast_ratio(L1, L2):
    """
    Contrast ratio between two luminance values
    """
    lighter = max(L1, L2)
    darker = min(L1, L2)
    return (lighter + 0.05) / (darker + 0.05)
```

### Computer Vision Techniques

1. **Edge Detection** (Canny Algorithm)
   - Identifies UI components and boundaries
   - Detects visual structure and hierarchy

2. **Contour Detection**
   - Finds interactive elements (buttons, inputs)
   - Measures target sizes

3. **Color Space Analysis**
   - RGB to Grayscale conversion
   - Color dependency detection

4. **Morphological Operations**
   - Line detection for structure
   - Element separation

5. **Statistical Analysis**
   - Color variance and distribution
   - Spatial patterns

### Deep Learning (Attention Prediction)

**Model**: U-Net Architecture

```
Input (256x256x3 RGB image)
    ↓
Encoder (Conv + ReLU + MaxPool) × 3
    ↓
Bottleneck (Conv + ReLU)
    ↓
Decoder (UpConv + Skip + ReLU) × 3
    ↓
Output (256x256x1 Saliency Map)
```

**Training Data**: SALICON, MIT Saliency datasets

## Issue Classification

### Severity Levels

| Level | Description | Action Required | Examples |
|-------|-------------|-----------------|----------|
| **Critical** | Blocks accessibility completely | Fix immediately | No keyboard access, missing alt text on essential images |
| **High** | Major accessibility barrier | Fix in current sprint | Insufficient contrast, targets too small |
| **Medium** | Notable usability issue | Fix in next sprint | Inconsistent styling, unclear hierarchy |
| **Low** | Minor improvement | Nice to have | Could enhance further, AAA optimizations |

### Issue Types

1. **Color Contrast Issues**
   - Low contrast between text and background
   - Non-text element contrast failures
   - Color-only information

2. **Size Issues**
   - Text too small
   - Touch targets too small
   - Spacing insufficient

3. **Structure Issues**
   - Poor visual hierarchy
   - Unclear relationships
   - Missing semantic structure

4. **Content Issues**
   - Complex text
   - Missing alternatives
   - Inconsistent labeling

5. **Interactive Issues**
   - No focus indicators
   - Unclear interactive states
   - Navigation problems

## Recommendations Engine

Each issue generates prioritized, actionable recommendations:

### Recommendation Format

```json
{
  "wcag_criterion": "1.4.3",
  "wcag_level": "AA",
  "type": "Low Contrast",
  "severity": "high",
  "description": "Text has 3.2:1 contrast ratio",
  "recommendation": "Increase contrast to at least 4.5:1",
  "location": "(120, 450)",
  "colors": {
    "foreground": [100, 100, 100],
    "background": [200, 200, 200]
  }
}
```

### Recommendation Priority

1. **Critical Issues First**
   - WCAG Level A failures
   - Blocking accessibility problems

2. **High Priority Next**
   - WCAG Level AA failures
   - Major usability barriers

3. **Medium Priority**
   - WCAG Level AAA failures
   - Noticeable improvements

4. **Low Priority Last**
   - Best practice enhancements
   - Nice-to-have improvements

## Usage Examples

### Basic Analysis

```python
from app.ai_modules.wcag_analyzer import WCAGAnalyzer

analyzer = WCAGAnalyzer()
results = analyzer.analyze_design("design.png")

print(f"Score: {results['score']}")
print(f"Conformance: {results['conformance_level']}")
print(f"Issues found: {len(results['issues'])}")
```

### Detailed Issue Inspection

```python
# Get high severity issues only
high_issues = [
    issue for issue in results['issues'] 
    if issue['severity'] == 'high'
]

for issue in high_issues:
    print(f"[{issue['wcag_criterion']}] {issue['type']}")
    print(f"  {issue['description']}")
    print(f"  Fix: {issue['recommendation']}")
    print()
```

### Check Specific Criteria

```python
# Check if passes WCAG AA
conformance = results['conformance_details']
if conformance['passes_aa']:
    print("✓ Passes WCAG 2.1 Level AA")
else:
    print(f"✗ {conformance['aa_failures']} AA failures")
```

## API Response Structure

```json
{
  "analysis_id": "uuid-string",
  "design_name": "Homepage Design",
  "timestamp": "2026-01-29T10:30:00",
  "arai_score": 85.5,
  "overall_grade": "B",
  
  "accessibility": {
    "score": 82,
    "conformance_level": "Level AA",
    "conformance_details": {
      "level": "Level AA",
      "passes_a": true,
      "passes_aa": true,
      "passes_aaa": false,
      "a_failures": 0,
      "aa_failures": 0,
      "aaa_failures": 3
    },
    "issue_count": {
      "critical": 0,
      "high": 2,
      "medium": 5,
      "low": 3
    },
    "issues": [...],
    "recommendations": [...],
    "wcag_criteria_status": {...}
  },
  
  "readability": {
    "score": 88,
    "metrics": {
      "flesch_reading_ease": 65.2,
      "flesch_kincaid_grade": 8.5,
      "word_count": 245,
      "avg_line_length": 58
    },
    "issues": [...],
    "recommendations": [...]
  },
  
  "attention": {
    "score": 87,
    "attention_distribution": {
      "top": 0.35,
      "center": 0.45,
      "bottom": 0.20
    },
    "recommendations": [...]
  }
}
```

## Best Practices

### For Designers

1. **Run Analysis Early**
   - Analyze wireframes and early prototypes
   - Catch issues before development

2. **Iterate Based on Feedback**
   - Address high-severity issues first
   - Re-analyze after changes

3. **Target AA Compliance**
   - Level AA is industry standard
   - Balance between accessibility and design freedom

4. **Use Recommendations**
   - Follow specific fix suggestions
   - Learn accessibility principles

### For Developers

1. **Integrate in CI/CD**
   - Automate accessibility checks
   - Block merges with critical issues

2. **Track Progress**
   - Monitor ARAI scores over time
   - Set minimum score thresholds

3. **Validate Implementations**
   - Compare design vs. implemented contrast
   - Verify interactive element sizes

## Limitations

### Current Limitations

1. **Static Analysis Only**
   - Analyzes visual designs, not interactive behavior
   - Cannot test keyboard navigation or screen readers

2. **OCR Dependency**
   - Text detection accuracy depends on image quality
   - May miss text in complex backgrounds

3. **Heuristic Checks**
   - Some checks are estimates (e.g., button detection)
   - May have false positives/negatives

4. **No Code Analysis**
   - Doesn't check HTML semantics or ARIA labels
   - Complement with tools like Axe or WAVE for code

### Future Enhancements

- [ ] Figma plugin integration
- [ ] Real-time design feedback
- [ ] Animation and interaction analysis
- [ ] Multi-language support
- [ ] Customizable WCAG profiles
- [ ] Machine learning from expert feedback

## Resources

### WCAG Documentation
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding WCAG](https://www.w3.org/WAI/WCAG21/Understanding/)
- [How to Meet WCAG](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools & Standards
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [W3C Accessibility Guidelines](https://www.w3.org/WAI/)
- [Accessible Color Palette Builder](https://toolness.github.io/accessible-color-matrix/)

### Research Papers
- Itti & Koch (1998) - Saliency-Based Visual Attention
- Bylinskii et al. (2017) - Learning Visual Importance
- Power et al. (2012) - Guidelines Are Only Half the Story

---

**For implementation details, see**: `IMPLEMENTATION_GUIDE.md`  
**For quick start, see**: `QUICK_START.md`
