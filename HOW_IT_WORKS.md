# 🎯 How ARAI System Analyzes Your Designs

## Overview

The **ARAI (Accessibility Readability Attention Index)** System uses advanced AI and computer vision to analyze UI/UX designs across three critical dimensions. Here's exactly how it works:

---

## 🔄 The Analysis Flow

```
1. User uploads design (PNG/JPG) → Frontend (React)
                ↓
2. Authentication check → Supabase JWT verification
                ↓
3. File stored → Local + Supabase Storage
                ↓
4. Three parallel AI analyses run → Python Backend (FastAPI)
                ↓
5. Results combined → ARAI Score calculated
                ↓
6. Report generated → Sent back to user
```

---

## 📊 Three Analysis Dimensions

### 1. ♿ **Accessibility Analysis (40% weight)**
**Module:** `comprehensive_wcag_analyzer.py`

#### What It Checks:
- **Contrast Ratios** (WCAG 1.4.3)
  - Samples 50 random regions of the design
  - Calculates luminance of foreground/background colors
  - Formula: `(L1 + 0.05) / (L2 + 0.05)` where L1 > L2
  - Flags violations: < 4.5:1 (normal text), < 3:1 (large text)

- **Color Vision Deficiency Simulation** (WCAG 1.4.1)
  - Simulates 3 types of color blindness:
    - **Protanopia** (red-blind): Red values reduced
    - **Deuteranopia** (green-blind): Green values adjusted
    - **Tritanopia** (blue-blind): Blue channel modified
  - Checks if information is still distinguishable

- **Alt Text Requirements** (WCAG 1.1.1)
  - Uses edge detection (Canny algorithm) to identify images/icons
  - Flags elements that likely need alternative text
  - Categorizes: informative, decorative, functional

- **Touch Target Sizes** (WCAG 2.5.5)
  - Detects interactive elements using edge detection
  - Measures dimensions
  - Flags targets < 44×44 pixels

- **Font Sizes** (WCAG 1.4.4)
  - Analyzes text regions
  - Flags text < 12px (too small)
  - Validates minimum readable sizes

#### How It Works:
```python
# 1. Load image as RGB array
image = PIL.Image.open(image_path).convert('RGB')
image_array = np.array(image)

# 2. Sample random regions
for region in random_regions:
    colors = extract_unique_colors(region)
    
    # 3. Calculate contrast
    contrast = calculate_luminance_ratio(fg_color, bg_color)
    
    # 4. Flag if below threshold
    if contrast < 4.5:
        issues.append({
            "severity": "critical",
            "type": "Low Contrast",
            "location": {"x": x, "y": y, "width": 100, "height": 100}
        })

# 5. Simulate color blindness
protanopia_image = simulate_protanopia(image)
check_distinguishability(protanopia_image)
```

#### Scoring:
```
Score = 100 - (critical_issues × 15) - (high × 10) - (medium × 5) - (low × 2)
```

---

### 2. 📖 **Readability Analysis (30% weight)**
**Module:** `comprehensive_readability_analyzer.py`

#### What It Checks:
- **Flesch-Kincaid Readability Scores**
  - Uses **Tesseract OCR** to extract text from design
  - Calculates reading grade level
  - Formula: `0.39(total words/total sentences) + 11.8(total syllables/total words) - 15.59`

- **Complex Vocabulary Detection**
  - Identifies jargon terms (e.g., "leverage", "synergy", "paradigm")
  - Suggests simpler alternatives
  - Example: "utilize" → "use"

- **Sentence Length**
  - Flags sentences > 20 words (too complex)
  - Recommends breaking into shorter sentences

- **Inclusive Language**
  - Scans for 4 categories of potentially exclusionary language:
    - **Gendered terms**: "guys", "chairman" → "folks", "chairperson"
    - **Ableist terms**: "crazy", "blind to" → "unexpected", "unaware of"
    - **Age-related**: "young blood" → "new talent"
    - **Insensitive**: "master/slave" → "primary/secondary"

- **Typography Evaluation**
  - Line length: Optimal 50-75 characters
  - Line height: Should be 1.5-2.0× font size
  - Letter spacing: Adequate for readability
  - Paragraph spacing

#### How It Works:
```python
# 1. Extract text using OCR
text = pytesseract.image_to_string(image.convert('L'))

# 2. Calculate readability
flesch_score = textstat.flesch_reading_ease(text)
grade_level = textstat.flesch_kincaid_grade(text)

# 3. Check for jargon
for word in text.split():
    if word in JARGON_TERMS:
        issues.append({
            "type": "Complex Vocabulary",
            "word": word,
            "suggestion": JARGON_TERMS[word]
        })

# 4. Check inclusive language
for pattern, term, alternative in NON_INCLUSIVE_PATTERNS:
    if re.search(pattern, text):
        issues.append({
            "type": "Non-Inclusive Language",
            "term": term,
            "alternative": alternative
        })
```

#### Scoring:
```
Base Score = Flesch-Kincaid normalized to 0-100
Penalties:
  - Jargon: -3 per term
  - Long sentences: -2 per sentence
  - Non-inclusive language: -5 per instance
  - Typography issues: -2 per issue
```

---

### 3. 👁️ **Attention Analysis (30% weight)**
**Module:** `comprehensive_attention_analyzer.py`

#### What It Checks:
- **Saliency Heatmap** (Visual Attention Prediction)
  - Uses deep learning **U-Net CNN model**
  - Trained on MIT Saliency Benchmark + SALICON datasets
  - Predicts where users will look first

- **Critical UI Element Identification**
  - Detects buttons, forms, CTAs using edge detection
  - Verifies they appear in high-saliency regions
  - Flags misplaced important elements

- **Visual Hierarchy Assessment**
  - Analyzes size, position, color prominence
  - Checks F-pattern and Z-pattern reading flows
  - Validates logical information architecture

- **Cognitive Load Estimation**
  - **Element count**: > 7 items violates Miller's Law
  - **Color count**: > 5 colors = too busy
  - **Visual density**: > 30% screen coverage = cluttered
  - **Symmetry**: Measures balance
  - **Complexity**: Edge detection density

#### How It Works:
```python
# 1. Load U-Net saliency model
model = SaliencyModel()  # CNN with encoder-decoder architecture
model.load_state_dict(torch.load('saliency_model.pth'))

# 2. Generate saliency map
image_tensor = transform(image)  # Resize to 256×256
saliency_map = model(image_tensor)  # Forward pass
heatmap = apply_colormap(saliency_map)  # Convert to visual

# 3. Detect critical elements
elements = detect_interactive_elements(image)  # Edge detection
for element in elements:
    attention_score = get_saliency_at_location(element.bbox, saliency_map)
    if attention_score < 0.3:
        issues.append({
            "type": "Low Attention on Critical Element",
            "element": element,
            "attention_score": attention_score
        })

# 4. Estimate cognitive load
num_elements = count_distinct_elements(image)
num_colors = count_unique_colors(image)
density = calculate_visual_density(image)

cognitive_load = (
    (num_elements / 7) * 0.4 +      # Miller's Law: 7±2
    (num_colors / 5) * 0.3 +         # Color complexity
    (density / 0.3) * 0.3            # Visual density
)
```

#### U-Net Architecture:
```
Input (256×256×3 RGB image)
       ↓
Encoder (Downsampling):
  Conv → ReLU → Conv → ReLU → MaxPool
  64 → 128 → 256 → 512 channels
       ↓
Bottleneck (512 channels)
       ↓
Decoder (Upsampling with skip connections):
  Transpose Conv → Concat → Conv → ReLU
  512 → 256 → 128 → 64
       ↓
Output (256×256×1 saliency map)
```

#### Scoring:
```
Base Score = 100
Penalties:
  - Misplaced critical elements: -15 each
  - Poor hierarchy: -10
  - High cognitive load: -20
  - Too many elements: -5 per extra item over 7
  - Too many colors: -3 per extra color over 5
```

---

## 🎯 ARAI Score Calculation

The final **ARAI Score** is a weighted average:

```python
def calculate_arai_score(accessibility, readability, attention):
    return (
        accessibility * 0.40 +  # 40% weight
        readability * 0.30 +    # 30% weight
        attention * 0.30        # 30% weight
    )
```

### Grade System:
- **90-100**: 🎉 Excellent (A+)
- **80-89**: ✅ Very Good (A)
- **70-79**: 👍 Good (B)
- **60-69**: 😐 Fair (C)
- **50-59**: ⚠️ Needs Improvement (D)
- **0-49**: ❌ Poor (F)

---

## 📝 Report Generation

**Module:** `report_generator.py`

### What's Generated:

1. **Annotated Image**
   - Color-coded bounding boxes on issues
   - Red = Critical, Orange = High, Yellow = Medium, Green = Low

2. **Issue List** with:
   - Category (Accessibility/Readability/Attention)
   - Severity level
   - WCAG criterion reference
   - Location coordinates
   - Current vs. required values
   - Fix suggestions

3. **Educational Content**
   - Why each issue matters
   - Real-world impact examples
   - Step-by-step fix instructions
   - Code examples
   - Links to WCAG documentation

4. **Export Options**
   - **PDF**: Full report with images, tables, explanations
   - **CSV**: Spreadsheet of all issues for tracking

---

## 🔧 Technical Stack

### Frontend (React)
```
User Interface → API Calls → Result Display
```
- **React 18**: Component-based UI
- **Axios**: HTTP requests to backend
- **Lucide Icons**: Visual elements
- **Tailwind CSS**: Styling

### Backend (Python FastAPI)
```
API Endpoints → AI Processing → Database Storage
```
- **FastAPI**: High-performance async API
- **PyTorch**: Deep learning for saliency
- **OpenCV**: Image processing
- **Tesseract OCR**: Text extraction
- **Pillow (PIL)**: Image manipulation
- **NumPy**: Numerical computations

### AI Models
- **U-Net CNN**: Saliency prediction (trained on MIT/SALICON datasets)
- **Tesseract 4.0**: OCR engine
- **Custom algorithms**: Contrast, color blindness simulation, element detection

### Data Storage
- **Supabase**: User authentication + PostgreSQL database
- **Local uploads/**: Temporary image storage
- **Cloud Storage**: Design file persistence

---

## 🎨 Example Analysis Flow

```
INPUT: Screenshot of a login form

1. ACCESSIBILITY ANALYZER detects:
   ✓ Email field label has 3.2:1 contrast (should be 4.5:1)
   ✓ Password button is 38×38px (should be 44×44px)
   ✓ Logo has no alt text
   ✓ Red error messages rely only on color

2. READABILITY ANALYZER extracts:
   Text: "Please utilize your credentials to authenticate"
   ✓ "utilize" → suggest "use"
   ✓ "authenticate" → suggest "log in"
   ✓ Flesch-Kincaid grade: 12.5 (college level, too complex)

3. ATTENTION ANALYZER predicts:
   ✓ Saliency heatmap shows users look at logo first
   ✓ But "Login" button should get more attention
   ✓ Visual hierarchy: Title (largest) → Form → Button ✓
   ✓ Cognitive load: 4 elements, 3 colors = LOW ✓

ARAI SCORE: 
   Accessibility: 65 (Fair)
   Readability: 72 (Good)
   Attention: 78 (Good)
   Overall: 70.5 (Good - B grade)

RECOMMENDATIONS:
   1. Increase email label contrast to 4.5:1
   2. Make button 44×44px minimum
   3. Add alt="ARAI Logo" to logo image
   4. Add icon to error messages (not just red color)
   5. Simplify language: "use" instead of "utilize"
```

---

## 🚀 Performance

- **Average analysis time**: 3-5 seconds per design
- **Model inference**: ~500ms (saliency heatmap)
- **OCR processing**: ~1-2 seconds
- **Image processing**: ~1 second
- **Supports**: PNG, JPG, JPEG, WebP up to 10MB

---

## 📚 Key Algorithms

### Luminance Calculation (WCAG)
```python
def relative_luminance(rgb):
    r, g, b = [x / 255.0 for x in rgb]
    r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
    g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
    b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
```

### Contrast Ratio (WCAG)
```python
def contrast_ratio(lum1, lum2):
    lighter = max(lum1, lum2)
    darker = min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)
```

### Protanopia Simulation
```python
def simulate_protanopia(rgb):
    r, g, b = rgb
    return (
        0.567 * r + 0.433 * g,  # Red channel
        0.558 * r + 0.442 * g,  # Green channel
        b                        # Blue unchanged
    )
```

---

## 🎓 Educational Impact

The system doesn't just find problems—it **teaches users**:

1. **What** the issue is (e.g., "Low contrast")
2. **Why** it matters (e.g., "Users with low vision can't read this")
3. **How** to fix it (e.g., "Change text color to #000000")
4. **Where** to learn more (WCAG documentation links)

This transforms ARAI from a tool into a **learning platform** for accessible design.

---

## 🔮 Future Enhancements

Potential improvements:
- Real-time analysis as users design
- AI-powered automatic fix suggestions
- Integration with Figma/Sketch plugins
- Multi-language OCR support
- Video/animation analysis
- Dark mode accessibility checks

---

## 📖 References

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/
- MIT Saliency Benchmark: http://saliency.mit.edu/
- SALICON Dataset: http://salicon.net/
- Flesch-Kincaid: https://en.wikipedia.org/wiki/Flesch–Kincaid_readability_tests

---

**Built with ❤️ for accessible design**
