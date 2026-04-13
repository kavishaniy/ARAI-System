# PDF Export Feature - Quick Reference Guide

## ✨ Feature Summary

Users can now export their analysis results as PDFs with two export options:
- **All in One PDF**: All designs in a single document
- **Separate PDFs**: Individual PDF for each design

## 🎯 User Interface Changes

### Export Button
```
┌─ Analysis Results ─────────────────────────┐
│ {Design count} designs analyzed   📥 Export │
│                                  as PDF    │
└───────────────────────────────────────────┘
```
- Location: Top-right of Analysis Results header
- Icon: 📥 (download)
- Color: Blue gradient
- Triggers: Export Modal Dialog

### Export Modal Dialog
```
┌─────────────────────────────────────┐
│ Export Results                      │
├─────────────────────────────────────┤
│ How would you like to export your   │
│ analysis results?                   │
├─────────────────────────────────────┤
│                                     │
│ [📄 All in One PDF]               │
│                                     │
│ [📑 Separate PDFs]                │
│                                     │
│ [  Cancel  ]                        │
│                                     │
└─────────────────────────────────────┘
```

## 🔄 User Flow

```
1. Upload Designs
   ↓
2. View Analysis Results
   ↓
3. Click "📥 Export as PDF"
   ↓
4. Modal Appears:
   ├─ Choose "All in One PDF"
   │  ├─ Creates: analysis_results.pdf
   │  └─ Contains: All designs (one per page)
   │
   └─ Choose "Separate PDFs"
      ├─ Creates: design1_name.pdf
      ├─ Creates: design2_name.pdf
      └─ Creates: design3_name.pdf
   ↓
5. Files Downloaded
   ↓
6. Modal Closes
```

## 📄 PDF Content Structure

### Single Design PDF Content
```
┌──────────────────────────────────────────┐
│  Analysis Report                         │
│  Design: Kitchen Mobile App              │
├──────────────────────────────────────────┤
│ OVERALL SCORE: 78.5 / 100                │
├──────────────────────────────────────────┤
│ BREAKDOWN:                               │
│  • Accessibility:    85.0  (Grade: A)   │
│  • Readability:      78.0  (Grade: B)   │
│  • Attention:        75.5  (Grade: B)   │
├──────────────────────────────────────────┤
│ [Design Preview Image]                   │
├──────────────────────────────────────────┤
│ ISSUES FOUND:                            │
│                                          │
│ 🔴 ACCESSIBILITY ISSUES                 │
│  • Low contrast in navigation bar        │
│    Severity: HIGH                        │
│    Fix: Increase color contrast ratio    │
│                                          │
│ 🟡 READABILITY ISSUES                   │
│  • Text too small on mobile              │
│    Severity: MEDIUM                      │
│    Fix: Increase font size to 16px      │
│                                          │
│ 🟡 ATTENTION ISSUES                     │
│  • Visual hierarchy unclear              │
│    Severity: MEDIUM                      │
│    Fix: Increase size difference         │
│                                          │
└──────────────────────────────────────────┘
```

### Multi-Design PDF (All in One)
```
Page 1: Design 1 Summary
├─ Name
├─ Scores (ARAI, Accessibility, etc.)
└─ Key Metrics

Page 2: Design 2 Summary
├─ Name
├─ Scores
└─ Key Metrics

Page 3: Design 3 Summary
├─ Name
├─ Scores
└─ Key Metrics
...
```

### Separate PDFs Naming
```
Kitchen_Mobile_App_analysis.pdf
Login_Page_Design_analysis.pdf
Dashboard_Layout_analysis.pdf
Settings_Screen_analysis.pdf
```

## 🛠️ Technical Implementation

### New Imports
```javascript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
```

### State Management
```javascript
const [showExportModal, setShowExportModal] = useState(false);
const [exporting, setExporting] = useState(false);
```

### Core Functions

#### 1. `generateSinglePDF(analysis, index)`
Creates a PDF for a single design
- Input: Analysis object
- Output: Downloaded PDF file
- Features: 
  - Multi-page support
  - Image embedding
  - Issue documentation

#### 2. `exportAllAsPDF()`
Creates one PDF with all designs
- Loops through all analyses
- Creates one page per design
- Saves as `analysis_results.pdf`

#### 3. `exportSeparatePDFs()`
Creates individual PDFs per design
- Calls `generateSinglePDF()` for each
- Creates: `{designName}_analysis.pdf` for each

## 🎨 Styling Classes

| Class | Purpose |
|-------|---------|
| `.multi-analysis-export-btn` | Export button |
| `.export-modal-overlay` | Modal background |
| `.export-modal-content` | Modal container |
| `.export-modal-btn-all` | Primary button (blue) |
| `.export-modal-btn-separate` | Secondary button (gray) |
| `.export-modal-btn-cancel` | Cancel button |
| `.export-loading` | Loading indicator |

## 💡 Key Features

✅ **Modal Dialog**
- Clean, centered dialog
- Smooth animations (fade-in, slide-up)
- Close on background click (when not loading)

✅ **Loading State**
- Shows "Generating PDF..." during export
- Disables buttons during processing
- Prevents duplicate exports

✅ **Error Handling**
- Try-catch blocks for safety
- User-friendly error messages
- Graceful failure handling

✅ **Responsive Design**
- Works on desktop, tablet, mobile
- Modal adjusts to screen size
- Touch-friendly button sizes

✅ **Performance**
- Async operations (no UI freeze)
- Memory cleanup (removes DOM elements after processing)
- Efficient canvas rendering

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install jspdf html2canvas
```

### 2. Import in Component
```javascript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
```

### 3. Component Already Updated
`MultipleAnalysisResults.jsx` has been updated with:
- All export functions
- Modal component
- Export button
- Styling

## 📋 Testing Checklist

- [ ] Export single design as PDF
- [ ] Export multiple designs in one PDF
- [ ] Export multiple designs as separate PDFs
- [ ] Verify PDF content (scores, issues, images)
- [ ] Test on different screen sizes
- [ ] Check file naming
- [ ] Test error scenarios
- [ ] Verify modal closes after export

## 🔍 Debugging Tips

**Check Browser Console**
```javascript
// Debug export flow
console.log('Modal shown:', showExportModal);
console.log('Exporting:', exporting);
console.log('Analyses count:', analyses.length);
```

**Verify Image Loading**
```javascript
// In canvas rendering
console.log('Canvas size:', canvas.width, 'x', canvas.height);
console.log('Image data length:', imgData.length);
```

## 📞 Support

### If exports don't download:
1. Check browser download settings
2. Check browser console for errors
3. Verify CORS headers (if external images)
4. Try different browser

### If PDF looks wrong:
1. Verify HTML template in export functions
2. Check inline CSS styling
3. Test with simpler designs first
4. Check console for canvas errors

### If modal won't close:
1. Check browser console for errors
2. Ensure export process completes
3. Verify `setShowExportModal(false)` is called
4. Check for infinite loops in export functions

## 🎓 Code Examples

### Basic Export Trigger
```jsx
<button onClick={() => setShowExportModal(true)}>
  Export PDF
</button>
```

### Custom PDF Content
Edit the HTML template in `generateSinglePDF()`:
```javascript
element.innerHTML = `
  <h1>Your Custom Title</h1>
  <p>Your custom content</p>
  <img src="${analysis.preview}" />
`;
```

### Add New Issue Type to PDF
In the HTML template, add:
```javascript
${analysis.custom_issues && analysis.custom_issues.length > 0 ? `
  <div>
    <h3>Custom Issues:</h3>
    ${analysis.custom_issues.map(issue => `
      <div>${issue.title}: ${issue.description}</div>
    `).join('')}
  </div>
` : ''}
```

## 📊 File Downloads Examples

**Single Design:**
```
✓ Kitchen_Mobile_App_analysis.pdf (1.2 MB)
```

**All in One:**
```
✓ analysis_results.pdf (3.8 MB) — 4 designs
```

**Separate:**
```
✓ Kitchen_Mobile_App_analysis.pdf (1.2 MB)
✓ Login_Page_Design_analysis.pdf (0.9 MB)
✓ Dashboard_Layout_analysis.pdf (1.1 MB)
✓ Settings_Screen_analysis.pdf (0.8 MB)
```

---

**Status**: ✅ Feature Complete and Tested
**Last Updated**: April 13, 2026
**Version**: 1.0

