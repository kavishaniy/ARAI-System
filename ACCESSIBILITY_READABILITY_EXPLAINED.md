# 🔍 How Accessibility and Readability Work in Your Web App

**Date:** February 1, 2026  
**Status:** Comprehensive Technical Explanation

---

## 📊 Quick Answer

**NO, Accessibility and Readability analyzers do NOT use datasets or trained models.**

Unlike the attention analyzer (which uses a trained U-Net model), these two analyzers use:
- **Rule-based algorithms** - Following WCAG standards
- **Mathematical formulas** - Calculating contrast ratios, readability scores
- **Pattern matching** - Detecting non-inclusive language
- **Image processing** - Color analysis, OCR text extraction

---

## 🎯 Summary Comparison

| Analyzer | Method | Uses Dataset? | Uses Trained Model? |
|----------|--------|---------------|---------------------|
| **Attention (Saliency)** | Deep Learning (U-Net) | ✅ YES (5000+ images) | ✅ YES (trained model) |
| **Accessibility (WCAG)** | Rule-based algorithms | ❌ NO | ❌ NO |
| **Readability** | Mathematical formulas | ❌ NO | ❌ NO |

---

## 1️⃣ Accessibility Analyzer (WCAG)

### How It Works: **Rule-Based + Mathematical Algorithms**

The accessibility analyzer uses **WCAG 2.1 guidelines** (international standards) implemented as code rules.

### File Location
```
backend/app/ai_modules/comprehensive_wcag_analyzer.py
```

### Analysis Methods

#### A. Contrast Ratio Calculation (FR-010)

**Method:** Mathematical formula based on WCAG standards

**How it works:**
1. **Sample image regions** (50 random areas)
2. **Extract colors** (foreground and background)
3. **Calculate relative luminance** using WCAG formula:
   ```python
   def _calculate_luminance(self, rgb):
       # Convert RGB to relative luminance
       r, g, b = [x/255.0 for x in rgb]
       # Apply sRGB gamma correction
       r = r/12.92 if r <= 0.03928 else ((r+0.055)/1.055)**2.4
       g = g/12.92 if g <= 0.03928 else ((g+0.055)/1.055)**2.4
       b = b/12.92 if b <= 0.03928 else ((b+0.055)/1.055)**2.4
       # Calculate luminance (weighted sum)
       return 0.2126*r + 0.7152*g + 0.0722*b
   ```

4. **Calculate contrast ratio** using WCAG formula:
   ```python
   def _calculate_contrast_ratio(self, rgb1, rgb2):
       l1 = self._calculate_luminance(rgb1)
       l2 = self._calculate_luminance(rgb2)
       lighter = max(l1, l2)
       darker = min(l1, l2)
       return (lighter + 0.05) / (darker + 0.05)
   ```

5. **Compare against WCAG thresholds:**
   - Normal text: **4.5:1** (Level AA)
   - Large text: **3:1** (Level AA)
   - Enhanced: **7:1** (Level AAA)

**Example:**
```
Input: Black text (#000000) on white background (#FFFFFF)
Process:
  - Luminance of black: 0.0
  - Luminance of white: 1.0
  - Contrast ratio: (1.0 + 0.05) / (0.0 + 0.05) = 21:1
Output: ✅ PASS (exceeds 4.5:1 requirement)
```

**No dataset needed** - This is pure mathematics following WCAG standards.

---

#### B. Color Vision Deficiency Simulation (FR-011)

**Method:** Color transformation matrices (scientifically proven formulas)

**How it works:**
1. **Apply color blindness simulation matrices** to the image
2. Simulate three types:
   - **Protanopia** (red-blind, ~1% of males)
   - **Deuteranopia** (green-blind, ~1% of males)
   - **Tritanopia** (blue-blind, ~0.01% of population)

3. **Transformation example for Protanopia:**
   ```python
   def _apply_protanopia(self, image_array):
       # LMS color space transformation matrix
       protanopia_matrix = np.array([
           [0.567, 0.433, 0.0],
           [0.558, 0.442, 0.0],
           [0.0,   0.242, 0.758]
       ])
       # Convert RGB → LMS → Apply filter → Convert back
       return transformed_image
   ```

4. **Compare** original vs simulated images
5. **Flag issues** where color differences are significant (>30 units)

**Example:**
```
Input: Red "Error" text on green background
Simulation: Both become brownish/muddy for protanopia users
Output: ⚠️ ISSUE - Content not distinguishable for red-blind users
Suggestion: Add text label or icon, not just color
```

**No dataset needed** - Uses established color science matrices from research.

---

#### C. Alt Text Detection (FR-012)

**Method:** Computer vision (edge detection + shape analysis)

**How it works:**
1. **Convert image to grayscale**
2. **Apply Canny edge detection** (finds boundaries)
3. **Find contours** (closed shapes that might be icons/images)
4. **Filter by size and aspect ratio:**
   ```python
   if 20 < area < 5000:  # Icon-sized elements
       aspect_ratio = width / height
       if 0.5 < aspect_ratio < 2.0:  # Squarish shapes
           # Likely an icon or image
           flag_as_needing_alt_text()
   ```

5. **Flag each detected element** as needing alt text

**Example:**
```
Input: Design with 3 circular icons (no text labels)
Process:
  - Detect 3 closed contours
  - Size: 40x40, 45x42, 38x40 pixels
  - Aspect ratios: 1.0, 1.07, 0.95 (all squarish)
Output: ⚠️ 3 issues - Icons need alt text for screen readers
```

**No dataset needed** - Uses OpenCV image processing algorithms.

---

#### D. Touch Target Size (WCAG 2.5.5)

**Method:** Rule-based checking

**Standards:**
- Minimum touch target: **44×44 pixels** (WCAG 2.5.5)
- Minimum spacing: **8 pixels** between targets

**How it works:**
1. Detect interactive elements (buttons, links)
2. Measure dimensions
3. Compare against standards

**No dataset needed** - Direct measurements against known standards.

---

## 2️⃣ Readability Analyzer

### How It Works: **OCR + Linguistic Formulas + Pattern Matching**

The readability analyzer extracts text and applies established readability formulas.

### File Location
```
backend/app/ai_modules/comprehensive_readability_analyzer.py
```

### Analysis Methods

#### A. Text Extraction (OCR)

**Tool:** Pytesseract (Tesseract OCR engine)

**How it works:**
1. **Convert image to grayscale**
2. **Run OCR** to extract text:
   ```python
   import pytesseract
   text = pytesseract.image_to_string(gray_image, lang='eng')
   ```

**What is Tesseract?**
- Open-source OCR engine by Google
- Pre-trained on millions of text samples
- **NOT your trained model** - It's a separate tool

**Example:**
```
Input: Image with text "Click here to learn more"
OCR Process: Character recognition
Output: "Click here to learn more" (as string)
```

---

#### B. Readability Score Calculation (FR-013)

**Method:** Mathematical formulas from linguistics research

**Uses the `textstat` library** which implements established formulas:

**1. Flesch Reading Ease:**
```python
score = 206.835 - 1.015 × (total_words / total_sentences) 
              - 84.6 × (total_syllables / total_words)

Interpretation:
  90-100: Very Easy (5th grade)
  60-70:  Standard (8th-9th grade)
  0-30:   Very Difficult (college graduate)
```

**2. Flesch-Kincaid Grade Level:**
```python
grade = 0.39 × (total_words / total_sentences) 
      + 11.8 × (total_syllables / total_words) - 15.59

Output: U.S. school grade level needed to understand
```

**3. Other formulas:**
- **Gunning Fog Index** - Estimates years of education needed
- **SMOG Index** - Simple Measure of Gobbledygook
- **Coleman-Liau Index** - Based on characters instead of syllables
- **Automated Readability Index** - For machine scoring

**Example:**
```
Input Text: "The quick brown fox jumps over the lazy dog."
Analysis:
  - Words: 9
  - Sentences: 1
  - Syllables: 11
  - Flesch-Kincaid Grade: 3.4 (4th grade level)
Output: ✅ Easy to read (grade level 3.4)
```

**No dataset needed** - These are mathematical formulas from 1940s-1970s research.

---

#### C. Vocabulary Analysis (FR-014)

**Method:** Dictionary/pattern matching

**How it works:**

**1. Jargon Detection:**
```python
# Pre-defined jargon dictionary
JARGON_TERMS = {
    "leverage": "use",
    "synergy": "cooperation",
    "paradigm": "model",
    "utilize": "use",
    # ... etc
}

# Check extracted text against dictionary
for word in text.split():
    if word in JARGON_TERMS:
        flag_as_jargon(word, suggestion=JARGON_TERMS[word])
```

**2. Complex Word Detection:**
```python
# Heuristic: Words longer than 12 characters
if len(word) > 12:
    flag_as_complex_word()
```

**Example:**
```
Input: "We need to leverage our synergistic capabilities"
Process:
  - "leverage" found in jargon dictionary
  - "synergistic" is 11 chars (borderline complex)
Output: 
  ⚠️ Jargon: "leverage" → Suggest "use"
  ⚠️ Complex: "synergistic" → Suggest simpler term
```

**No dataset needed** - Uses pre-defined dictionary.

---

#### D. Sentence Length Check (FR-014)

**Method:** Simple word counting

**Standard:** Maximum **20 words per sentence** (readability best practice)

**How it works:**
```python
sentences = text.split('.')  # Split by periods
for sentence in sentences:
    word_count = len(sentence.split())
    if word_count > 20:
        flag_as_too_long()
```

**Example:**
```
Sentence: "This is a very long sentence with many clauses 
          and subclauses and additional information that 
          makes it hard to read and understand quickly."
Word count: 22 words
Output: ⚠️ Sentence too long (22 words > 20 word limit)
```

**No dataset needed** - Direct counting against threshold.

---

#### E. Inclusive Language Check (FR-015)

**Method:** Regular expression pattern matching

**How it works:**

**Pre-defined pattern dictionary:**
```python
NON_INCLUSIVE_PATTERNS = {
    "gendered": [
        (r'\bmanpower\b', "manpower", "workforce/staffing"),
        (r'\bchairman\b', "chairman", "chairperson/chair"),
        (r'\bguys\b', "guys", "folks/everyone/team"),
    ],
    "ableist": [
        (r'\bcrazy\b', "crazy", "unexpected/surprising"),
        (r'\binsane\b', "insane", "incredible/extreme"),
        (r'\bdumb\b', "dumb", "ineffective/unclear"),
    ],
    "insensitive": [
        (r'\bmaster\b', "master", "primary/main"),
        (r'\bslave\b', "slave", "secondary/replica"),
        (r'\bblacklist\b', "blacklist", "blocklist/denylist"),
    ]
}

# Match against text using regex
for pattern, term, suggestion in patterns:
    if re.search(pattern, text, re.IGNORECASE):
        flag_non_inclusive(term, suggestion)
```

**Example:**
```
Input: "Add this to the blacklist and check with the guys"
Process:
  - Regex match: "blacklist" found
  - Regex match: "guys" found
Output:
  ⚠️ Non-inclusive: "blacklist" → Use "blocklist"
  ⚠️ Non-inclusive: "guys" → Use "folks/everyone"
```

**No dataset needed** - Uses curated pattern list.

---

#### F. Typography Evaluation (FR-016)

**Method:** Visual measurements + best practice rules

**Standards:**
- Minimum line height: **1.5× font size**
- Optimal line length: **50-75 characters**
- Minimum font size: **12 pixels**

**How it works:**
1. **Estimate line spacing** from image
2. **Measure text density** (text pixels / total pixels)
3. **Compare against standards**

**Example:**
```
Analysis:
  - Detected line height: 1.2× font size
  - Text density: 0.45 (45% of screen is text)
Output:
  ⚠️ Line height too tight (1.2×, should be 1.5×)
  ⚠️ Text density too high (45%, should be <40%)
```

**No dataset needed** - Uses typography best practices.

---

## 🆚 Comparison: Attention vs Accessibility/Readability

### Attention Analyzer (Uses Trained Model)

**Technology:** Deep Learning
```
Training Process:
1. Collect dataset (5000+ UI images)
2. Create ground truth saliency maps
3. Train U-Net model (40 epochs)
4. Save trained weights (29 MB)
5. Load model in web app
6. Use for predictions
```

**Why it needs training:**
- Predicting **where humans look** is complex
- Requires learning from human eye-tracking data
- Pattern recognition needs millions of parameters

---

### Accessibility Analyzer (No Training Needed)

**Technology:** Rule-based algorithms
```
Implementation:
1. Define WCAG standards in code
2. Implement mathematical formulas
3. Apply directly to images
4. No training required
```

**Why no training needed:**
- WCAG standards are **fixed rules** (e.g., 4.5:1 contrast)
- Formulas are **mathematically defined**
- Not learning patterns, just checking compliance

---

### Readability Analyzer (No Training Needed)

**Technology:** Linguistic formulas + Pattern matching
```
Implementation:
1. Use established readability formulas (from 1940s-1970s)
2. Define jargon/pattern dictionaries
3. Apply formulas to extracted text
4. No training required
```

**Why no training needed:**
- Readability formulas are **proven equations**
- Jargon detection uses **predefined lists**
- Counting words/syllables doesn't need learning

---

## 📊 Data Flow Comparison

### Attention Analysis (Machine Learning)
```
User uploads design
  → Image sent to backend
    → Loaded by trained U-Net model
      → Model processes with learned weights
        → Generates saliency map prediction
          → Returns heatmap overlay
```
**Uses:** Trained model (7.7M learned parameters)

---

### Accessibility Analysis (Rule-Based)
```
User uploads design
  → Image sent to backend
    → Analyzer samples colors
      → Calculates luminance (math formula)
        → Calculates contrast ratio (math formula)
          → Compares against WCAG threshold
            → Returns pass/fail + issues
```
**Uses:** Mathematical formulas (no learning)

---

### Readability Analysis (Formula-Based)
```
User uploads design
  → Image sent to backend
    → Tesseract OCR extracts text
      → Count words/sentences/syllables
        → Apply Flesch-Kincaid formula
          → Match against jargon dictionary
            → Returns readability score + issues
```
**Uses:** Established formulas + dictionaries (no learning)

---

## 🔧 Technical Implementation

### File: `backend/app/api/analysis.py`

**How all three analyzers are initialized:**

```python
# Line 26-27: Accessibility (NO MODEL)
wcag_analyzer = ComprehensiveWCAGAnalyzer()  # Just creates object, no loading

# Line 28: Readability (NO MODEL)
readability_analyzer = ComprehensiveReadabilityAnalyzer()  # Just creates object

# Line 33-34: Attention (USES TRAINED MODEL)
MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "saliency_model.pth"
attention_analyzer = ComprehensiveAttentionAnalyzer(str(MODEL_PATH))  # Loads 29MB model
```

**Notice the difference:**
- WCAG and Readability: `__init__()` - No parameters, just creates object
- Attention: `__init__(model_path)` - Requires model file, loads weights

---

## 🎯 Summary Table

| Feature | Accessibility | Readability | Attention |
|---------|--------------|-------------|-----------|
| **Technology** | Rule-based algorithms | Mathematical formulas | Deep Learning (U-Net) |
| **Uses Dataset?** | ❌ NO | ❌ NO | ✅ YES (5000+ images) |
| **Uses Trained Model?** | ❌ NO | ❌ NO | ✅ YES (29 MB file) |
| **Based On** | WCAG standards | Linguistic research | Learned patterns |
| **Initialization** | Create object | Create object | Load model weights |
| **Processing** | Apply formulas | Apply formulas | Neural network inference |
| **File Size** | ~50 KB (code) | ~30 KB (code) | ~29 MB (model) |
| **Speed** | Very fast | Fast | Slower (model inference) |
| **Updates** | Change code rules | Change formulas | Retrain model |

---

## 🧪 Testing Each Analyzer

### Test Accessibility (No Model)
```bash
cd backend
python3 -c "
from app.ai_modules.comprehensive_wcag_analyzer import ComprehensiveWCAGAnalyzer
analyzer = ComprehensiveWCAGAnalyzer()  # No model loading!
print('✅ Accessibility analyzer ready (no model needed)')
print(f'Contrast AA threshold: {analyzer.CONTRAST_AA_NORMAL}:1')
"
```

### Test Readability (No Model)
```bash
python3 -c "
from app.ai_modules.comprehensive_readability_analyzer import ComprehensiveReadabilityAnalyzer
analyzer = ComprehensiveReadabilityAnalyzer()  # No model loading!
print('✅ Readability analyzer ready (no model needed)')
print(f'Max sentence length: {analyzer.MAX_SENTENCE_LENGTH} words')
"
```

### Test Attention (Requires Model)
```bash
python3 -c "
from app.ai_modules.comprehensive_attention_analyzer import ComprehensiveAttentionAnalyzer
analyzer = ComprehensiveAttentionAnalyzer('models/saliency_model.pth')  # Loads model!
print('✅ Attention analyzer ready (model loaded)')
print(f'Device: {analyzer.device}')
"
```

---

## ❓ Common Questions

### Q1: Why doesn't accessibility use machine learning?

**A:** Because WCAG standards are **fixed, measurable rules**:
- Contrast ratio 4.5:1 is a mathematical formula
- Color transformations for color blindness are scientifically proven
- No need to "learn" these - they're defined standards

### Q2: Could we train a model for accessibility?

**A:** Technically yes, but it would be:
- **Less accurate** than mathematical formulas
- **Slower** to run
- **Harder to explain** (black box vs clear rules)
- **Not legally defensible** (WCAG requires specific calculations)

### Q3: Why doesn't readability use machine learning?

**A:** Because readability formulas are:
- **Proven** by decades of research
- **Simple** to calculate (word/syllable counting)
- **Transparent** (can explain exactly why a score is low)
- **Fast** (no model inference needed)

### Q4: What about the OCR (Tesseract) - is that a trained model?

**A:** YES, but it's **not YOUR model**:
- Tesseract is a **pre-trained** OCR engine by Google
- Trained on millions of text samples (not your dataset)
- Used as a **tool** (like NumPy or OpenCV)
- You don't train it, just use it

### Q5: So only attention analysis uses MY trained model?

**A:** Correct! Your web app uses:
- **Your trained model:** Attention/saliency prediction only
- **Third-party tools:** Tesseract OCR (pre-trained by Google)
- **No models:** Accessibility and readability (pure algorithms)

---

## 📚 Key Takeaways

1. ✅ **Attention analyzer** uses YOUR trained U-Net model (29 MB, 7.7M parameters)

2. ❌ **Accessibility analyzer** does NOT use models - uses:
   - WCAG mathematical formulas
   - Color science matrices
   - Image processing algorithms

3. ❌ **Readability analyzer** does NOT use models - uses:
   - Established linguistic formulas (Flesch-Kincaid, etc.)
   - Pre-defined jargon dictionaries
   - Pattern matching (regex)

4. 🔧 **Why the difference?**
   - Attention: **Complex pattern recognition** → Needs machine learning
   - Accessibility: **Fixed standards** → Mathematical formulas work better
   - Readability: **Proven equations** → No need for learning

5. 🚀 **Result:** Your web app combines:
   - **AI-powered** attention prediction (your trained model)
   - **Standards-based** accessibility checking (WCAG rules)
   - **Formula-based** readability scoring (established metrics)

---

## 📁 Documentation

**Created files:**
- `ACCESSIBILITY_READABILITY_EXPLAINED.md` ← You are here
- `CONFIRMATION_MODEL_IS_USED.md` - Model verification
- `MODEL_VERIFICATION_REPORT.md` - Technical details

**Source files:**
- `backend/app/ai_modules/comprehensive_wcag_analyzer.py` - Accessibility
- `backend/app/ai_modules/comprehensive_readability_analyzer.py` - Readability
- `backend/app/ai_modules/comprehensive_attention_analyzer.py` - Attention

---

**Generated:** February 1, 2026  
**Summary:** Only attention analysis uses trained models; accessibility and readability use rule-based algorithms and mathematical formulas.
