# Quick Start Guide: Multiple Design Analysis

## What's New?

The ARAI System now supports analyzing multiple designs:
1. **Multiple Image Upload** - Upload multiple UI designs at once and get individual analysis for each
2. **Figma Multi-Screen Analysis** - Analyze all screens in a Figma project file

## Using the Dashboard (Image Upload)

### Step 1: Access Dashboard
- Navigate to the Dashboard section
- You'll see the upload area

### Step 2: Upload Multiple Images
- Click on the upload area or drag-and-drop
- Select multiple PNG, JPG, JPEG, or WebP images
- Each image can be up to 10MB

### Step 3: Add Design Names (Optional)
- Edit the design names if you want custom labels
- Default names are based on file names

### Step 4: Analyze
- Click "Analyze All Designs" button
- System will analyze each design sequentially
- Progress shown for each design

### Step 5: View Results
- Once complete, results tab shows all analyses
- Each design gets its own analysis card
- Cards show:
  - Design name
  - ARAI Score (overall)
  - Individual metrics:
    - Accessibility (A11y)
    - Readability (Read)
    - Visual Attention (Vision)
  - Issue summary

### Step 6: Explore Details
- Click on any card to see detailed analysis
- View specific issues and recommendations
- Download PDF report (if enabled)

---

## Using Figma Analysis

### Step 1: Access Figma Analysis
- Navigate to "Figma Analysis" section
- You'll see the Figma URL input

### Step 2: Get Your Figma File URL
**Important:** The URL must be a full file URL, not a duplicate link

❌ **Don't use:** 
- `https://www.figma.com/proto/...` (prototype link)
- `https://www.figma.com/design/...` (design link)

✅ **Use:**
- `https://www.figma.com/file/abc123/ProjectName`

**How to get the correct URL:**
1. Open your Figma file in browser
2. Copy the URL from address bar
3. Must contain `/file/` in the URL

### Step 3: Paste URL
- Paste the Figma file URL into the input field
- The system will validate it

### Step 4: Select Analysis Types (Optional)
- By default, all analyses are selected:
  - ✓ Accessibility
  - ✓ Readability
  - ✓ Attention
- Uncheck if you want specific analyses only

### Step 5: Analyze
- Click "Analyze All Screens" button
- System will:
  1. Connect to Figma via API
  2. Extract all pages and screens
  3. Analyze each screen individually
  4. This may take 1-3 minutes for large projects

### Step 6: View Results
- Results show summary at top:
  - File name
  - Total pages
  - Total screens analyzed
  - Average ARAI score

### Step 7: Individual Screen Analysis
- Each screen gets its own card
- Cards display in a grid showing:
  - Screen name (Page - Frame)
  - ARAI score
  - Accessibility score
  - Readability score
  - Visual hierarchy score
  - Issue counts:
    - 🔴 Critical issues
    - 🟡 High priority
    - 🟢 Medium priority
    - ✅ Positive findings

---

## Understanding the Scores

### ARAI Score (Accessibility Readability Attention Index)
**Range:** 0-100
**Formula:** (Accessibility × 0.4) + (Readability × 0.3) + (Attention × 0.3)

### Individual Scores

**Accessibility Score (40% weight)**
- Color contrast ratios
- Font size appropriateness
- Element visibility
- WCAG 2.1 compliance

**Readability Score (30% weight)**
- Text density
- Font sizes and legibility
- Line spacing
- Visual hierarchy clarity

**Attention Score (30% weight)**
- Visual hierarchy strength
- Focal points clarity
- Element prominence
- Eye flow guidance

### Score Interpretation
- **90-100:** Excellent - Great design practices
- **70-89:** Good - Some improvements possible
- **50-69:** Fair - Multiple issues to address
- **Below 50:** Poor - Significant improvements needed

---

## Issues and Recommendations

### Issue Categories

**Accessibility Issues**
- Low color contrast
- Small fonts
- Missing alt text
- Touch targets too small

**Readability Issues**
- High text density
- Poor line spacing
- Inconsistent typography
- Unclear hierarchy

**Attention Issues**
- Weak visual hierarchy
- Multiple focal points (confusing)
- Poor element prominence
- Unclear information flow

### Severity Levels
- **Critical:** 🔴 Serious accessibility/usability issues
- **High:** 🟡 Significant problems affecting users
- **Medium:** 🟢 Minor issues to improve
- **Success:** ✅ Positive design patterns found

---

## Tips for Best Results

### For Image Uploads
1. **Clear images:** Use clear, high-resolution screenshots
2. **Consistent sizes:** Similar dimensions work best
3. **Full pages:** Include entire UI screens, not partial views
4. **Multiple variants:** Compare different design versions
5. **Batch testing:** Upload 2-5 designs at once for comparison

### For Figma Analysis
1. **Organized files:** Well-structured pages analyze better
2. **Named frames:** Use descriptive frame names for clarity
3. **Clean files:** Remove hidden/deleted items before analysis
4. **Reasonable size:** Projects with 10-30 screens analyze fastest
5. **Connected:** Ensure Figma API token is configured

### For Better Scores
1. **Color contrast:** Use high-contrast text/backgrounds (4.5:1 minimum)
2. **Typography:** Use 14px+ for body text, 12px+ for captions
3. **Spacing:** Maintain line-height of 1.5x font size
4. **Hierarchy:** Use distinct font sizes (at least 3 levels)
5. **Focus:** Single primary focal point per screen

---

## Common Issues & Solutions

### "Invalid Figma URL"
**Problem:** URL format is incorrect
**Solution:** Make sure URL contains `/file/` and is not a prototype/design link
```
Correct:   https://www.figma.com/file/abc123/ProjectName
Incorrect: https://www.figma.com/proto/...
Incorrect: https://www.figma.com/design/...
```

### "No Figma token provided"
**Problem:** Backend doesn't have Figma API token configured
**Solution:** Administrator needs to:
1. Get token from https://www.figma.com/developers/api#auth
2. Set `FIGMA_API_TOKEN` environment variable in backend
3. Restart backend service

### "Analysis timed out"
**Problem:** File is too large or backend is overloaded
**Solution:**
1. Try with smaller Figma file
2. Analyze individual pages instead of full project
3. Check backend server status
4. Try again after waiting a few minutes

### "File size too large"
**Problem:** Individual image exceeds 10MB limit
**Solution:**
1. Compress image before uploading
2. Reduce image dimensions
3. Use supported formats (PNG, JPG, WebP)

### "Upload failed"
**Problem:** Server returned error
**Solution:**
1. Check file format (PNG, JPG, JPEG, WebP only)
2. Verify file size (max 10MB)
3. Check internet connection
4. Try uploading fewer images at once

---

## Keyboard Shortcuts (if implemented)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + U` | Focus URL input (Figma) |
| `Ctrl/Cmd + Enter` | Start analysis |
| `Esc` | Clear results |

---

## Exporting Results

### Export Options (Available in Results)
- **PDF Report:** Download detailed analysis as PDF
- **CSV Export:** Export scores in spreadsheet format
- **Screenshot:** Take screenshot of results cards
- **Share Link:** Generate shareable analysis link

### Data Saved
All analysis results are saved to your account:
- Dashboard History shows all previous analyses
- Access anytime without re-analyzing
- Compare results over time

---

## Performance Guide

### Expected Analysis Times

**Image Upload:**
- 1 image: ~10-15 seconds
- 3 images: ~30-45 seconds
- 5 images: ~50-75 seconds

**Figma Analysis:**
- 1-5 screens: ~30-60 seconds
- 5-10 screens: ~60-90 seconds
- 10-20 screens: ~2-3 minutes
- 20+ screens: ~3-5+ minutes

### Factors Affecting Speed
- Image resolution (higher = slower)
- Number of elements in design
- Server load
- Network connection
- Browser performance

### Tips to Speed Up
1. Analyze fewer images at once
2. Use smaller Figma files
3. Close other browser tabs
4. Use wired internet connection
5. Analyze during off-peak hours

---

## Privacy & Data

### Data Handling
- All images are processed on the server
- Analysis results saved to database
- Not shared with third parties
- Available in History for future reference

### Data Retention
- Results kept indefinitely (with account)
- Can be deleted from History
- No automatic cleanup

### Security
- Authentication required (login needed)
- HTTPS encryption for data transfer
- Secure token management
- CORS protection enabled

---

## Getting Help

### Documentation
- Full implementation guide: `IMPLEMENTATION_GUIDE.md`
- API documentation: `/api/v1/openapi.json`
- Component details: Check component files

### Support
- Check browser console for errors (F12)
- Review backend logs for server errors
- Test with different files/URLs
- Try clearing browser cache

### Reporting Issues
- Document exact steps to reproduce
- Include screenshot/error message
- Provide file details (size, format, etc.)
- Note browser and OS version

---

## Advanced Usage

### API Direct Access
```bash
# Analyze Figma screens via API
curl -X POST http://localhost:8000/api/v1/analysis/figma-screens \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "figma_url": "https://www.figma.com/file/abc123/Project",
    "figma_token": "optional_token"
  }'

# Validate Figma URL
curl -X POST http://localhost:8000/api/v1/analysis/validate-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.figma.com/file/abc123/Project"
  }'
```

### Batch Processing
- Use API for automated batch analysis
- Integrate with CI/CD pipelines
- Schedule recurring analyses
- Build custom dashboards

---

## Feedback & Suggestions

We're always improving! Share your feedback:
- Use the feedback form in the app
- Report bugs with detailed steps
- Suggest features you'd like
- Share results (with permission)

---

**Last Updated:** April 15, 2026
**Version:** 1.0
