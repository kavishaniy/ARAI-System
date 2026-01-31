# 🔄 ARAI System Architecture & Data Flow

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                         (React Frontend)                         │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │   Login    │  │   Upload   │  │  Results   │               │
│  │   Page     │→ │    Page    │→ │   Page     │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/REST API
                          │ (Axios with JWT)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                                │
│                     (FastAPI Backend)                            │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  /auth/signup    │         │ /analysis/upload │            │
│  │  /auth/login     │         │ /analysis/list   │            │
│  │  /auth/verify    │         │ /analysis/{id}   │            │
│  └──────────────────┘         └──────────────────┘            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Accessibility│  │ Readability  │  │  Attention   │
│   Analyzer   │  │   Analyzer   │  │   Analyzer   │
│              │  │              │  │              │
│  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
│  │ Contrast│  │  │  │  OCR   │  │  │  │ U-Net  │  │
│  │ Checker │  │  │  │(Tesser)│  │  │  │  CNN   │  │
│  └────────┘  │  │  └────────┘  │  │  └────────┘  │
│              │  │              │  │              │
│  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
│  │ Color  │  │  │  │ Flesch │  │  │  │Saliency│  │
│  │Blindness│  │  │  │Kincaid │  │  │  │  Map   │  │
│  └────────┘  │  │  └────────┘  │  │  └────────┘  │
│              │  │              │  │              │
│  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
│  │ Alt    │  │  │  │Inclusive│  │  │  │Cognitive│  │
│  │ Text   │  │  │  │Language │  │  │  │  Load  │  │
│  └────────┘  │  │  └────────┘  │  │  └────────┘  │
└──────┬───────┘  └───────┬──────┘  └───────┬──────┘
       │                  │                  │
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ▼
              ┌───────────────────────┐
              │   Report Generator    │
              │                       │
              │  - ARAI Score Calc    │
              │  - Issue Aggregation  │
              │  - Visual Annotations │
              │  - Educational Content│
              │  - PDF/CSV Export     │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Data Persistence    │
              │                       │
              │  ┌─────────────────┐  │
              │  │    Supabase     │  │
              │  │   PostgreSQL    │  │
              │  │   (User Data)   │  │
              │  └─────────────────┘  │
              │                       │
              │  ┌─────────────────┐  │
              │  │    Supabase     │  │
              │  │    Storage      │  │
              │  │  (Design Files) │  │
              │  └─────────────────┘  │
              └───────────────────────┘
```

---

## Detailed Analysis Flow

### Step 1: User Upload
```
┌──────────────────────────────────────────────────────────┐
│  USER UPLOADS DESIGN                                     │
│  - File: login.png (2.3 MB)                              │
│  - Name: "Mobile Login Screen"                           │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│  FRONTEND VALIDATION                                     │
│  ✓ File type: PNG, JPG, JPEG, WEBP                      │
│  ✓ Size: < 10 MB                                         │
│  ✓ JWT token present                                     │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
                POST /api/v1/analysis/upload
                Authorization: Bearer eyJhbG...
                Content-Type: multipart/form-data
```

### Step 2: Backend Processing
```
┌──────────────────────────────────────────────────────────┐
│  BACKEND RECEIVES REQUEST                                │
│  1. Verify JWT token with Supabase                       │
│  2. Validate file format & size                          │
│  3. Generate analysis_id = uuid4()                       │
│  4. Save to /uploads/{analysis_id}/original.png          │
│  5. Upload to Supabase Storage                           │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
           PARALLEL ANALYSIS EXECUTION
           (All 3 run simultaneously)
```

### Step 3: Accessibility Analysis
```
┌────────────────────────────────────────────────────────────┐
│  COMPREHENSIVE WCAG ANALYZER                               │
│                                                            │
│  INPUT: /uploads/{id}/original.png                        │
│                                                            │
│  1. LOAD IMAGE                                             │
│     image = PIL.Image.open()                               │
│     array = np.array(image)  # Convert to NumPy           │
│                                                            │
│  2. CONTRAST ANALYSIS (50 random samples)                  │
│     for region in sample_regions(50):                      │
│         colors = extract_colors(region)                    │
│         fg_lum = relative_luminance(foreground)            │
│         bg_lum = relative_luminance(background)            │
│         ratio = (max + 0.05) / (min + 0.05)                │
│         if ratio < 4.5:                                    │
│             issues.append({                                │
│                 "severity": "critical",                    │
│                 "type": "Low Contrast",                    │
│                 "location": {"x": 120, "y": 340, ...},     │
│                 "current_ratio": 3.2,                      │
│                 "required_ratio": 4.5                      │
│             })                                             │
│                                                            │
│  3. COLOR BLINDNESS SIMULATION                             │
│     protanopia_sim = simulate_protanopia(image)            │
│     deuteranopia_sim = simulate_deuteranopia(image)        │
│     tritanopia_sim = simulate_tritanopia(image)            │
│     check_distinguishability(all_sims)                     │
│                                                            │
│  4. ALT TEXT REQUIREMENTS                                  │
│     edges = cv2.Canny(gray_image, 100, 200)                │
│     contours = cv2.findContours(edges)                     │
│     for contour in contours:                               │
│         if is_image_like(contour):                         │
│             issues.append({                                │
│                 "type": "Missing Alt Text",                │
│                 "element_type": "icon"                     │
│             })                                             │
│                                                            │
│  5. TOUCH TARGET SIZE                                      │
│     buttons = detect_interactive_elements(image)           │
│     for button in buttons:                                 │
│         if button.width < 44 or button.height < 44:        │
│             issues.append({...})                           │
│                                                            │
│  OUTPUT:                                                   │
│  {                                                         │
│    "score": 67.5,                                          │
│    "wcag_level": "AA (Partial)",                           │
│    "issues": [12 issues],                                  │
│    "visualizations": {                                     │
│      "annotated_image": "...",                             │
│      "protanopia_sim": "...",                              │
│      "deuteranopia_sim": "...",                            │
│      "tritanopia_sim": "..."                               │
│    }                                                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
```

### Step 4: Readability Analysis
```
┌────────────────────────────────────────────────────────────┐
│  COMPREHENSIVE READABILITY ANALYZER                        │
│                                                            │
│  INPUT: /uploads/{id}/original.png                        │
│                                                            │
│  1. TEXT EXTRACTION (OCR)                                  │
│     gray = image.convert('L')  # Grayscale                 │
│     text = pytesseract.image_to_string(gray)               │
│     → "Please utilize your credentials to authenticate"    │
│                                                            │
│  2. READABILITY SCORES                                     │
│     flesch_ease = textstat.flesch_reading_ease(text)       │
│     # Formula: 206.835 - 1.015(words/sentences)            │
│     #           - 84.6(syllables/words)                    │
│     # Score: 45.2 (College level)                          │
│                                                            │
│     grade_level = textstat.flesch_kincaid_grade(text)      │
│     # Formula: 0.39(words/sent) + 11.8(syll/words) - 15.59 │
│     # Grade: 12.5 (College freshman)                       │
│                                                            │
│  3. VOCABULARY ANALYSIS                                    │
│     words = text.lower().split()                           │
│     for word in words:                                     │
│         if word in JARGON_TERMS:                           │
│             issues.append({                                │
│                 "type": "Complex Vocabulary",              │
│                 "word": "utilize",                         │
│                 "suggestion": "use",                       │
│                 "severity": "medium"                       │
│             })                                             │
│                                                            │
│  4. SENTENCE LENGTH                                        │
│     sentences = sent_tokenize(text)                        │
│     for sentence in sentences:                             │
│         word_count = len(sentence.split())                 │
│         if word_count > 20:                                │
│             issues.append({                                │
│                 "type": "Long Sentence",                   │
│                 "length": word_count,                      │
│                 "recommended": 20                          │
│             })                                             │
│                                                            │
│  5. INCLUSIVE LANGUAGE CHECK                               │
│     for pattern, term, alternative in PATTERNS:            │
│         if re.search(pattern, text, re.IGNORECASE):        │
│             issues.append({                                │
│                 "type": "Non-Inclusive Language",          │
│                 "category": "gendered/ableist/age",        │
│                 "term": term,                              │
│                 "alternative": alternative,                │
│                 "severity": "high"                         │
│             })                                             │
│                                                            │
│  6. TYPOGRAPHY EVALUATION                                  │
│     line_lengths = analyze_line_lengths(image)             │
│     line_heights = analyze_line_spacing(image)             │
│     if not (50 <= avg_line_length <= 75):                  │
│         issues.append({...})                               │
│                                                            │
│  OUTPUT:                                                   │
│  {                                                         │
│    "score": 71.8,                                          │
│    "text_found": true,                                     │
│    "word_count": 127,                                      │
│    "readability_scores": {                                 │
│      "flesch_reading_ease": 45.2,                          │
│      "flesch_kincaid_grade": 12.5,                         │
│      "grade_level": "College"                              │
│    },                                                      │
│    "issues": [8 issues],                                   │
│    "issue_summary": {                                      │
│      "vocabulary": 3,                                      │
│      "sentence_length": 2,                                 │
│      "inclusive_language": 1,                              │
│      "typography": 2                                       │
│    }                                                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
```

### Step 5: Attention Analysis
```
┌────────────────────────────────────────────────────────────┐
│  COMPREHENSIVE ATTENTION ANALYZER                          │
│                                                            │
│  INPUT: /uploads/{id}/original.png                        │
│                                                            │
│  1. LOAD SALIENCY MODEL                                    │
│     model = SaliencyModel()  # U-Net CNN                   │
│     model.load_state_dict(torch.load('saliency.pth'))      │
│     model.eval()                                           │
│                                                            │
│  2. GENERATE SALIENCY MAP                                  │
│     transform = Compose([                                  │
│         Resize((256, 256)),                                │
│         ToTensor()                                         │
│     ])                                                     │
│     input_tensor = transform(image).unsqueeze(0)           │
│                                                            │
│     # Forward pass through U-Net                           │
│     with torch.no_grad():                                  │
│         saliency_output = model(input_tensor)              │
│         # Output: 256×256 probability map (0-1)            │
│                                                            │
│     # Apply colormap for visualization                     │
│     heatmap = cv2.applyColorMap(                           │
│         (saliency_output * 255).astype('uint8'),           │
│         cv2.COLORMAP_JET                                   │
│     )                                                      │
│     overlay = cv2.addWeighted(image, 0.5, heatmap, 0.5, 0) │
│                                                            │
│  3. IDENTIFY CRITICAL ELEMENTS                             │
│     edges = cv2.Canny(gray_image, 50, 150)                 │
│     contours = cv2.findContours(edges)                     │
│                                                            │
│     for contour in contours:                               │
│         bbox = cv2.boundingRect(contour)                   │
│         element_type = classify_element(bbox, image)       │
│                                                            │
│         if element_type in ['button', 'form', 'cta']:      │
│             attention_score = get_saliency_at(bbox)        │
│             if attention_score < 0.3:  # Low attention     │
│                 issues.append({                            │
│                     "type": "Low Attention on CTA",        │
│                     "element": "Login Button",             │
│                     "attention_score": 0.18,               │
│                     "expected": "> 0.3",                   │
│                     "severity": "high"                     │
│                 })                                         │
│                                                            │
│  4. VISUAL HIERARCHY ASSESSMENT                            │
│     elements = detect_all_elements(image)                  │
│     sorted_by_size = sort_by_area(elements)                │
│     sorted_by_position = sort_by_y_coordinate(elements)    │
│     sorted_by_contrast = sort_by_prominence(elements)      │
│                                                            │
│     # Check if important elements are prominent            │
│     if 'cta_button' not in top_3_prominent:                │
│         issues.append({                                    │
│             "type": "Poor Visual Hierarchy",               │
│             "description": "CTA not prominent enough"      │
│         })                                                 │
│                                                            │
│  5. COGNITIVE LOAD ESTIMATION                              │
│     # Count distinct elements                              │
│     num_elements = len(detect_distinct_objects(image))     │
│     # Miller's Law: 7±2 items in working memory            │
│                                                            │
│     # Count colors                                         │
│     unique_colors = count_unique_colors(image, threshold=30)│
│                                                            │
│     # Calculate visual density                             │
│     non_white_pixels = count_non_white(image)              │
│     total_pixels = width * height                          │
│     density = non_white_pixels / total_pixels              │
│                                                            │
│     # Calculate edge density (complexity)                  │
│     edges = cv2.Canny(gray, 50, 150)                       │
│     edge_density = np.sum(edges > 0) / total_pixels        │
│                                                            │
│     # Estimate load                                        │
│     cognitive_load = (                                     │
│         (num_elements / 7) * 0.4 +                         │
│         (unique_colors / 5) * 0.3 +                        │
│         (density / 0.3) * 0.2 +                            │
│         (edge_density / 0.1) * 0.1                         │
│     )                                                      │
│                                                            │
│     if cognitive_load > 1.0:                               │
│         issues.append({                                    │
│             "type": "High Cognitive Load",                 │
│             "load_score": 1.35,                            │
│             "elements": num_elements,                      │
│             "colors": unique_colors,                       │
│             "severity": "medium"                           │
│         })                                                 │
│                                                            │
│  OUTPUT:                                                   │
│  {                                                         │
│    "score": 78.3,                                          │
│    "saliency_heatmap": "base64_encoded_image",             │
│    "critical_elements": [                                  │
│      {"type": "button", "attention": 0.18, ...}            │
│    ],                                                      │
│    "visual_hierarchy": {                                   │
│      "score": 7.5,                                         │
│      "flow": "Z-pattern",                                  │
│      "issues": [...]                                       │
│    },                                                      │
│    "cognitive_load": {                                     │
│      "score": 0.85,                                        │
│      "level": "moderate",                                  │
│      "elements": 6,                                        │
│      "colors": 4                                           │
│    },                                                      │
│    "issues": [5 issues]                                    │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
```

### Step 6: Report Generation
```
┌────────────────────────────────────────────────────────────┐
│  COMPREHENSIVE REPORT GENERATOR                            │
│                                                            │
│  INPUTS:                                                   │
│  - accessibility_results                                   │
│  - readability_results                                     │
│  - attention_results                                       │
│                                                            │
│  1. CALCULATE ARAI SCORE                                   │
│     accessibility_score = 67.5                             │
│     readability_score = 71.8                               │
│     attention_score = 78.3                                 │
│                                                            │
│     arai_score = (                                         │
│         accessibility_score * 0.40 +  # 27.0               │
│         readability_score * 0.30 +    # 21.54              │
│         attention_score * 0.30        # 23.49              │
│     )                                                      │
│     # = 72.03 (Grade: B - Good)                            │
│                                                            │
│  2. AGGREGATE ISSUES                                       │
│     all_issues = [                                         │
│         ...accessibility_issues (12),                      │
│         ...readability_issues (8),                         │
│         ...attention_issues (5)                            │
│     ]                                                      │
│     # Total: 25 issues                                     │
│                                                            │
│     issue_summary = {                                      │
│         "critical": 3,  # Red                              │
│         "high": 7,      # Orange                           │
│         "medium": 10,   # Yellow                           │
│         "low": 5        # Green                            │
│     }                                                      │
│                                                            │
│  3. CREATE ANNOTATED IMAGE                                 │
│     image = Image.open(original_path)                      │
│     draw = ImageDraw.Draw(image)                           │
│                                                            │
│     for issue in all_issues:                               │
│         if issue.location:                                 │
│             color = SEVERITY_COLORS[issue.severity]        │
│             draw.rectangle(                                │
│                 [issue.location.x, issue.location.y,       │
│                  issue.location.x + issue.location.width,  │
│                  issue.location.y + issue.location.height],│
│                 outline=color,                             │
│                 width=3                                    │
│             )                                              │
│             draw.text(                                     │
│                 (issue.location.x, issue.location.y - 20), │
│                 f"#{issue.id}",                            │
│                 fill=color                                 │
│             )                                              │
│                                                            │
│     image.save(f"/uploads/{id}/annotated.png")             │
│                                                            │
│  4. ADD EXPLAINABLE AI FEEDBACK                            │
│     for issue in all_issues:                               │
│         issue["explanation"] = {                           │
│             "what": "Low contrast ratio detected",         │
│             "why": "Users with low vision cannot read",    │
│             "how_to_fix": "Change text to #000000",        │
│             "wcag_reference": "1.4.3",                     │
│             "confidence": 0.95                             │
│         }                                                  │
│                                                            │
│  5. ADD EDUCATIONAL CONTENT                                │
│     education = []                                         │
│     for wcag_criterion in unique_criteria:                 │
│         education.append(WCAG_EDUCATION[criterion])        │
│                                                            │
│  6. GENERATE RECOMMENDATIONS                               │
│     priority_fixes = [                                     │
│         "1. Fix 3 critical contrast issues",               │
│         "2. Add alt text to 2 images",                     │
│         "3. Increase button size to 44×44px",              │
│         "4. Simplify language (3 jargon terms)",           │
│         "5. Increase attention on CTA button"              │
│     ]                                                      │
│                                                            │
│  OUTPUT:                                                   │
│  {                                                         │
│    "arai_score": {                                         │
│      "overall": 72.03,                                     │
│      "accessibility": 67.5,                                │
│      "readability": 71.8,                                  │
│      "attention": 78.3                                     │
│    },                                                      │
│    "grade": "B - Good",                                    │
│    "annotated_image": "path/to/annotated.png",             │
│    "issues": [25 enriched issues],                         │
│    "issue_summary": {...},                                 │
│    "education": [WCAG explanations],                       │
│    "recommendations": [priority fixes],                    │
│    "metadata": {                                           │
│      "generated_at": "2026-01-31T...",                     │
│      "total_issues": 25                                    │
│    }                                                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
```

### Step 7: Database Storage
```
┌────────────────────────────────────────────────────────────┐
│  SUPABASE DATABASE                                         │
│                                                            │
│  INSERT INTO analyses (                                    │
│    id = analysis_id,                                       │
│    user_id = current_user.id,                              │
│    design_name = "Mobile Login Screen",                    │
│    arai_score = 72.03,                                     │
│    accessibility_score = 67.5,                             │
│    readability_score = 71.8,                               │
│    attention_score = 78.3,                                 │
│    grade = "B",                                            │
│    total_issues = 25,                                      │
│    critical_issues = 3,                                    │
│    high_issues = 7,                                        │
│    medium_issues = 10,                                     │
│    low_issues = 5,                                         │
│    image_url = "storage/designs/...",                      │
│    annotated_image_url = "storage/annotated/...",          │
│    analysis_results = {complete_json},                     │
│    status = "completed",                                   │
│    created_at = NOW()                                      │
│  )                                                         │
└────────────────────────────────────────────────────────────┘
```

### Step 8: Response to Frontend
```
┌────────────────────────────────────────────────────────────┐
│  HTTP 200 OK                                               │
│  Content-Type: application/json                            │
│                                                            │
│  {                                                         │
│    "analysis_id": "a1b2c3d4-...",                          │
│    "design_name": "Mobile Login Screen",                   │
│    "arai_score": 72.03,                                    │
│    "overall_grade": "B",                                   │
│    "scores": {                                             │
│      "accessibility": 67.5,                                │
│      "readability": 71.8,                                  │
│      "attention": 78.3                                     │
│    },                                                      │
│    "issue_summary": {                                      │
│      "total": 25,                                          │
│      "critical": 3,                                        │
│      "high": 7,                                            │
│      "medium": 10,                                         │
│      "low": 5                                              │
│    },                                                      │
│    "priority_fixes": [                                     │
│      "Fix 3 critical contrast issues",                     │
│      "Add alt text to 2 images",                           │
│      ...                                                   │
│    ],                                                      │
│    "comprehensive_results": {                              │
│      "accessibility": {...},                               │
│      "readability": {...},                                 │
│      "attention": {...}                                    │
│    },                                                      │
│    "visualizations": {                                     │
│      "annotated_image": "url",                             │
│      "saliency_heatmap": "url",                            │
│      "protanopia_sim": "url",                              │
│      "deuteranopia_sim": "url",                            │
│      "tritanopia_sim": "url"                               │
│    },                                                      │
│    "created_at": "2026-01-31T22:30:45Z"                    │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
```

### Step 9: Frontend Display
```
┌────────────────────────────────────────────────────────────┐
│  REACT COMPONENT: AnalysisResults.jsx                      │
│                                                            │
│  1. Parse response                                         │
│  2. Display ARAI score with circular progress              │
│  3. Show 3 dimension scores (donut charts)                 │
│  4. Render issue cards:                                    │
│     - Accessibility issues (red/orange/yellow/green)       │
│     - Readability issues                                   │
│     - Attention issues                                     │
│  5. Display annotated image with overlays                  │
│  6. Show color blindness simulations                       │
│  7. Provide export buttons (PDF, CSV)                      │
│  8. Show educational tips                                  │
└────────────────────────────────────────────────────────────┘
```

---

## Performance Optimization

```
┌──────────────────────────────────────────────────────┐
│  PARALLEL PROCESSING                                 │
│                                                      │
│  Total Time: ~4.5 seconds                            │
│                                                      │
│  ┌─────────────────┐ ┌─────────────────┐           │
│  │ Accessibility   │ │  Readability    │           │
│  │   Analysis      │ │   Analysis      │           │
│  │   ~2.5s         │ │   ~2.0s         │           │
│  └─────────────────┘ └─────────────────┘           │
│                                                      │
│         ┌─────────────────┐                         │
│         │   Attention     │                         │
│         │   Analysis      │                         │
│         │   ~3.5s         │                         │
│         └─────────────────┘                         │
│                                                      │
│  Max(2.5s, 2.0s, 3.5s) = 3.5s (parallel)            │
│  + Report Generation: 0.5s                          │
│  + Database Save: 0.3s                              │
│  + Network: 0.2s                                    │
│  ────────────────────────────                       │
│  Total: ~4.5s                                       │
│                                                      │
│  (vs. 8.5s if sequential)                           │
└──────────────────────────────────────────────────────┘
```

---

## Data Storage Schema

```sql
-- Supabase PostgreSQL Tables

-- Users table (managed by Supabase Auth)
auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  encrypted_password VARCHAR,
  created_at TIMESTAMP,
  ...
)

-- Analyses table
public.analyses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  design_name VARCHAR,
  arai_score NUMERIC(5,2),
  accessibility_score NUMERIC(5,2),
  readability_score NUMERIC(5,2),
  attention_score NUMERIC(5,2),
  grade VARCHAR(2),
  total_issues INTEGER,
  critical_issues INTEGER,
  high_issues INTEGER,
  medium_issues INTEGER,
  low_issues INTEGER,
  image_url VARCHAR,
  annotated_image_url VARCHAR,
  analysis_results JSONB,  -- Full results stored as JSON
  status VARCHAR DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Indexes for performance
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_arai_score ON analyses(arai_score DESC);
```

---

This architecture ensures:
- ⚡ **Fast processing** (parallel analysis)
- 🔒 **Secure** (JWT authentication)
- 📈 **Scalable** (stateless API)
- 🎯 **Accurate** (AI-powered analysis)
- 📊 **Comprehensive** (3 dimensions + ARAI score)
