# Testing Guide: Multiple Design Analysis

## Overview
Complete testing guide for the multiple design analysis feature (images and Figma projects).

---

## Manual Testing Checklist

### 1. Image Upload Analysis

#### Test 1.1: Single Image Upload
- [ ] Navigate to Dashboard
- [ ] Upload 1 image
- [ ] Click "Analyze All Designs"
- [ ] Verify analysis completes
- [ ] Check results display in card format
- [ ] Verify all three scores shown (A11y, Read, Vision)
- [ ] Verify ARAI score calculated correctly

#### Test 1.2: Multiple Image Upload
- [ ] Navigate to Dashboard
- [ ] Upload 3-5 images
- [ ] Click "Analyze All Designs"
- [ ] Verify sequential analysis (should see progress)
- [ ] Verify all images analyzed
- [ ] Check card grid displays all results
- [ ] Verify individual issue counts

#### Test 1.3: Image Validation
- [ ] Try to upload non-image file → Should error
- [ ] Try to upload >10MB file → Should error
- [ ] Try to upload wrong format (BMP, PDF) → Should error
- [ ] Valid images upload successfully

#### Test 1.4: Design Name Customization
- [ ] Upload image
- [ ] Edit design name before analyzing
- [ ] Verify custom name shows in results
- [ ] Verify name persists in database

#### Test 1.5: Results Navigation
- [ ] Click "New Analysis" from results
- [ ] Should return to upload screen
- [ ] Upload area cleared
- [ ] Can start new analysis

### 2. Figma Analysis

#### Test 2.1: URL Validation
- [ ] Try invalid URL → Should show error
- [ ] Try design link instead of file → Should error
- [ ] Try prototype link → Should error
- [ ] Valid file URL validates correctly
- [ ] Validation message shows file key

#### Test 2.2: Single Page Analysis
- [ ] Enter URL for Figma file with 1 page
- [ ] Click "Analyze All Screens"
- [ ] Verify analysis completes
- [ ] Check summary shows total screens
- [ ] Verify individual screen cards display

#### Test 2.3: Multi-Page Analysis
- [ ] Enter URL for Figma file with 3+ pages
- [ ] Click "Analyze All Screens"
- [ ] Verify extraction of all pages
- [ ] Check screen count accurate
- [ ] Verify each screen gets individual card
- [ ] Check page-screen organization in display

#### Test 2.4: Large Project Analysis
- [ ] Enter URL for Figma with 20+ screens
- [ ] Monitor analysis progress
- [ ] Verify completes without timeout
- [ ] Check memory usage reasonable
- [ ] Verify all screens analyzed

#### Test 2.5: Score Calculations
- [ ] Verify ARAI score formula correct:
  ```
  ARAI = (A11y × 0.4) + (Read × 0.3) + (Vision × 0.3)
  ```
- [ ] Check average scores calculated
- [ ] Verify individual screen scores match calculation

#### Test 2.6: Issue Detection
- [ ] Verify accessibility issues detected
- [ ] Verify readability issues detected
- [ ] Verify attention issues detected
- [ ] Check issue counts accurate
- [ ] Verify issue severity levels correct

#### Test 2.7: Error Handling
- [ ] Try without Figma token → Error with helpful message
- [ ] Try with invalid token → Error message
- [ ] Try with unreachable URL → Error
- [ ] Try with deleted file → Error
- [ ] Error messages helpful and actionable

### 3. Result Display

#### Test 3.1: Card Layout
- [ ] Cards display in responsive grid
- [ ] Cards have consistent styling
- [ ] Hover effects work
- [ ] No overlapping elements
- [ ] Mobile responsive (< 768px)

#### Test 3.2: Score Display
- [ ] All four scores visible (ARAI, A11y, Read, Vision)
- [ ] Scores use correct color coding
- [ ] Progress bars animate smoothly
- [ ] Score values accurate

#### Test 3.3: Issue Counts
- [ ] Issue badges display correctly
- [ ] Counts accurate
- [ ] Color coding consistent
  - 🔴 Critical: Red
  - 🟠 High: Orange
  - 🟡 Medium: Yellow
  - ✅ Success: Green

#### Test 3.4: Information Density
- [ ] Not too much info (readable)
- [ ] Not too little (informative)
- [ ] Hover reveals additional details
- [ ] Click expands for full details

### 4. Data Persistence

#### Test 4.1: Database Storage
- [ ] Analysis saved to database
- [ ] Can view in History
- [ ] Results retrievable later
- [ ] Metadata accurate (timestamp, user)

#### Test 4.2: History Display
- [ ] Previous analyses listed in History
- [ ] Can filter by date/type
- [ ] Can re-view past results
- [ ] No duplicate entries

#### Test 4.3: Data Integrity
- [ ] Scores consistent on reload
- [ ] Issues persist correctly
- [ ] Recommendations match analysis

### 5. Authentication & Security

#### Test 5.1: Authentication Required
- [ ] Logout then try analysis → Redirect to login
- [ ] Try API call without token → 401 error
- [ ] Invalid token → 401 error
- [ ] Expired token → Redirect to login

#### Test 5.2: CORS
- [ ] Frontend can call backend API
- [ ] No CORS errors in console
- [ ] Cross-origin requests work

#### Test 5.3: Input Validation
- [ ] SQL injection attempt → No injection
- [ ] XSS attempt → Sanitized
- [ ] Large input → Handled gracefully

### 6. Performance

#### Test 6.1: Load Times
- [ ] Dashboard loads < 2 seconds
- [ ] Results display < 1 second
- [ ] Cards render smoothly
- [ ] No lag on interaction

#### Test 6.2: Analysis Time
- [ ] 1 image: 10-15 seconds
- [ ] 3 images: 30-45 seconds
- [ ] 10 Figma screens: 60-90 seconds
- [ ] Times consistent

#### Test 6.3: Memory Usage
- [ ] Monitor browser memory
- [ ] No memory leaks
- [ ] Garbage collection working
- [ ] Smooth scrolling through results

#### Test 6.4: Network
- [ ] Network requests reasonable size
- [ ] Compression enabled
- [ ] No redundant requests
- [ ] Caching working (if implemented)

### 7. Browser Compatibility

#### Test 7.1: Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct
- [ ] Performance good

#### Test 7.2: Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct
- [ ] Performance good

#### Test 7.3: Safari
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct
- [ ] Performance good

#### Test 7.4: Edge
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct
- [ ] Performance good

### 8. Mobile Testing

#### Test 8.1: Responsive Design
- [ ] Works on 375px width (mobile)
- [ ] Works on 768px width (tablet)
- [ ] Works on 1920px width (desktop)
- [ ] No horizontal scroll needed

#### Test 8.2: Touch Interaction
- [ ] Buttons easily tappable
- [ ] Forms usable on mobile
- [ ] Cards scrollable smoothly
- [ ] No double-tap zoom needed

#### Test 8.3: Mobile Performance
- [ ] Loads reasonably fast (4G)
- [ ] No layout shifts during load
- [ ] Battery usage reasonable
- [ ] No excessive data usage

### 9. Accessibility

#### Test 9.1: Keyboard Navigation
- [ ] Tab through all controls
- [ ] Enter submits forms
- [ ] Escape closes dialogs
- [ ] All buttons keyboard accessible

#### Test 9.2: Screen Readers
- [ ] Use screen reader to navigate
- [ ] All text readable
- [ ] Labels associated with inputs
- [ ] Error messages announced

#### Test 9.3: Color Contrast
- [ ] Text passes WCAG AA (4.5:1 minimum)
- [ ] Not color-blind only (multiple indicators)
- [ ] Links clearly marked

---

## Automated Testing

### Unit Tests (Backend)

```python
# test_analysis_api.py

def test_validate_figma_url_valid():
    """Test URL validation with valid URL"""
    response = client.post("/api/v1/analysis/validate-url", 
        json={"url": "https://www.figma.com/file/abc123/Project"})
    assert response.status_code == 200
    assert response.json()["valid"] == True
    assert "file_key" in response.json()

def test_validate_figma_url_invalid():
    """Test URL validation with invalid URL"""
    response = client.post("/api/v1/analysis/validate-url",
        json={"url": "https://www.figma.com/proto/abc123"})
    assert response.status_code == 200
    assert response.json()["valid"] == False

def test_analyze_figma_screens_unauthorized():
    """Test analysis without auth"""
    response = client.post("/api/v1/analysis/figma-screens",
        json={"figma_url": "https://www.figma.com/file/abc123/Project"})
    assert response.status_code == 401

def test_analyze_figma_screens_authorized():
    """Test analysis with valid token"""
    response = client.post("/api/v1/analysis/figma-screens",
        headers={"Authorization": f"Bearer {valid_token}"},
        json={"figma_url": "https://www.figma.com/file/abc123/Project"})
    assert response.status_code == 200
    assert "analyses" in response.json()
    assert "totalScreens" in response.json()

def test_analyze_result_format():
    """Test result format compliance"""
    response = client.post("/api/v1/analysis/figma-screens",
        headers={"Authorization": f"Bearer {valid_token}"},
        json={"figma_url": "https://www.figma.com/file/abc123/Project"})
    data = response.json()
    
    # Check root fields
    assert "analyses" in data
    assert "totalScreens" in data
    assert "averageAraiScore" in data
    
    # Check analysis fields
    for analysis in data["analyses"]:
        assert "designName" in analysis
        assert "araiScore" in analysis
        assert "accessibilityScore" in analysis
        assert "readabilityScore" in analysis
        assert "attentionScore" in analysis
        assert "issues" in analysis
        assert "issueCounts" in analysis
```

### Frontend Tests (Jest)

```javascript
// FigmaAnalyzer.test.jsx

describe('FigmaAnalyzer', () => {
  test('renders input field', () => {
    const { getByPlaceholderText } = render(<FigmaAnalyzer />);
    const input = getByPlaceholderText(/figma/i);
    expect(input).toBeInTheDocument();
  });

  test('updates URL input', () => {
    const { getByPlaceholderText } = render(<FigmaAnalyzer />);
    const input = getByPlaceholderText(/figma/i);
    fireEvent.change(input, { 
      target: { value: 'https://www.figma.com/file/abc' } 
    });
    expect(input.value).toBe('https://www.figma.com/file/abc');
  });

  test('disables button with empty URL', () => {
    const { getByRole } = render(<FigmaAnalyzer />);
    const button = getByRole('button', { name: /analyze/i });
    expect(button).toBeDisabled();
  });

  test('enables button with valid URL', () => {
    const { getByPlaceholderText, getByRole } = render(<FigmaAnalyzer />);
    const input = getByPlaceholderText(/figma/i);
    fireEvent.change(input, { 
      target: { value: 'https://www.figma.com/file/abc/Project' } 
    });
    const button = getByRole('button', { name: /analyze/i });
    expect(button).not.toBeDisabled();
  });

  test('displays results after analysis', async () => {
    // Mock API response
    mockFetch.mockResolvedValueOnce({
      json: () => ({
        analyses: [
          { designName: 'Screen 1', araiScore: 75 }
        ],
        totalScreens: 1,
        averageAraiScore: 75
      })
    });

    const { getByPlaceholderText, getByRole, findByText } = 
      render(<FigmaAnalyzer />);
    
    // Input URL and analyze
    fireEvent.change(getByPlaceholderText(/figma/i), {
      target: { value: 'https://www.figma.com/file/abc/Project' }
    });
    fireEvent.click(getByRole('button', { name: /analyze/i }));

    // Check results
    const screenName = await findByText('Screen 1');
    expect(screenName).toBeInTheDocument();
  });
});
```

### Integration Tests

```python
# test_integration.py

def test_figma_analysis_flow():
    """Test complete Figma analysis flow"""
    # 1. Validate URL
    validate_resp = client.post("/api/v1/analysis/validate-url",
        json={"url": test_figma_url})
    assert validate_resp.status_code == 200
    assert validate_resp.json()["valid"] == True
    
    # 2. Analyze screens
    analyze_resp = client.post("/api/v1/analysis/figma-screens",
        headers={"Authorization": f"Bearer {token}"},
        json={"figma_url": test_figma_url})
    assert analyze_resp.status_code == 200
    
    # 3. Check results structure
    data = analyze_resp.json()
    assert len(data["analyses"]) > 0
    assert data["totalScreens"] > 0
    assert data["averageAraiScore"] > 0
    
    # 4. Verify data consistency
    for analysis in data["analyses"]:
        assert 0 <= analysis["araiScore"] <= 100
        assert 0 <= analysis["accessibilityScore"] <= 100
        assert analysis["araiScore"] == (
            analysis["accessibilityScore"] * 0.4 +
            analysis["readabilityScore"] * 0.3 +
            analysis["attentionScore"] * 0.3
        )

def test_image_upload_flow():
    """Test complete image upload flow"""
    # 1. Upload image
    with open("test_image.png", "rb") as f:
        files = {"file": f}
        data = {"design_name": "Test Design"}
        upload_resp = client.post(
            "/api/v1/analysis/upload",
            headers={"Authorization": f"Bearer {token}"},
            files=files,
            data=data
        )
    
    assert upload_resp.status_code == 200
    result = upload_resp.json()
    
    # 2. Verify analysis results
    assert "araiScore" in result
    assert "issues" in result
    assert 0 <= result["araiScore"] <= 100
```

---

## Test Data

### Sample Figma URLs (for testing)
```
✓ https://www.figma.com/file/abc123/Sample-Design
✓ https://www.figma.com/file/def456/Mobile-App
✓ https://www.figma.com/file/ghi789/Web-Dashboard

✗ https://www.figma.com/proto/abc123/prototype (prototype)
✗ https://www.figma.com/design/abc123/design (design)
✗ https://www.figma.com/file/abc123 (missing name)
```

### Sample Images (for testing)
- `test_design_1.png` - 512×512, accessible design
- `test_design_2.jpg` - 1024×768, with contrast issues
- `test_design_3.webp` - 800×600, good readability
- `test_image_large.png` - 5000×5000, performance test

---

## Performance Benchmarks

### Target Performance
| Operation | Target | Acceptable |
|-----------|--------|------------|
| Page load | < 1s | < 2s |
| Single image | 10-15s | < 20s |
| 3 images | 30-45s | < 60s |
| 10 Figma screens | 60-90s | < 120s |
| Results display | < 500ms | < 1s |

### Memory Benchmarks
| Operation | Target | Acceptable |
|-----------|--------|------------|
| Dashboard load | < 50MB | < 100MB |
| Single analysis | < 200MB | < 300MB |
| Multiple images | < 400MB | < 500MB |
| Large Figma file | < 500MB | < 800MB |

---

## Regression Test Checklist

Run these before each release:

- [ ] Image upload still works
- [ ] Dashboard history loads
- [ ] Previous analyses accessible
- [ ] Export features work
- [ ] No new console errors
- [ ] No performance degradation
- [ ] All score calculations correct
- [ ] Database queries fast
- [ ] Login/auth working
- [ ] CORS not broken

---

## Test Environment Setup

### Backend Testing
```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_analysis_api.py

# Run with verbose output
pytest -v
```

### Frontend Testing
```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- FigmaAnalyzer.test.jsx

# Watch mode
npm test -- --watch
```

---

## Continuous Integration (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: pip install -r requirements.txt
      - run: pytest

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- --coverage
```

---

## Known Issues & Workarounds

### Issue: Analysis Timeout on Large Files
**Workaround:** Analyze in smaller batches, increase timeout in config

### Issue: Memory Usage High
**Workaround:** Restart backend, analyze fewer screens at once

### Issue: Figma Token Expired
**Workaround:** Re-generate token, update environment variable

---

## Success Criteria

✅ **All manual tests pass**
✅ **All unit tests pass**
✅ **No console errors**
✅ **Performance targets met**
✅ **Mobile responsive verified**
✅ **Accessibility requirements met**
✅ **Browser compatibility verified**
✅ **Security audit passed**

---

**Testing Completed By:** _________________
**Date:** _________________
**Browser/OS:** _________________
**Notes:** ________________________________________________________________

---

**Last Updated:** April 15, 2026
**Version:** 1.0
