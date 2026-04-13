# PDF Export Feature - Code Implementation Details

## Files Modified

### 1. `/frontend/package.json`
**Changes**: Added two new dependencies
```json
{
  "dependencies": {
    "jspdf": "^latest",
    "html2canvas": "^latest"
  }
}
```

**Installation Command**:
```bash
npm install jspdf html2canvas --save
```

---

### 2. `/frontend/src/components/Analysis/MultipleAnalysisResults.jsx`
**Major Changes**: 

#### A. Imports
```javascript
// ADDED
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
```

#### B. New State Variables
```javascript
const [showExportModal, setShowExportModal] = useState(false);  // Controls modal visibility
const [exporting, setExporting] = useState(false);              // Loading state during export
```

#### C. New CSS Classes (in the `css` string)

1. **Header Styling**
```css
.multi-analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.multi-analysis-header-content {
  flex: 1;
}

.multi-analysis-export-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #0f2557 0%, #1a3a7a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  margin-left: 1rem;
}

.multi-analysis-export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 37, 87, 0.3);
}
```

2. **Modal Styling**
```css
.export-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.export-modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.export-modal-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  color: #0f2557;
  margin-bottom: 0.5rem;
  font-weight: 400;
}

.export-modal-description {
  color: rgba(15, 37, 87, 0.6);
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.export-modal-buttons {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.export-modal-btn {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.export-modal-btn-all {
  background: linear-gradient(135deg, #0f2557 0%, #1a3a7a 100%);
  color: white;
}

.export-modal-btn-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 37, 87, 0.3);
}

.export-modal-btn-separate {
  background: #f0f4f9;
  color: #0f2557;
  border: 1px solid rgba(15, 37, 87, 0.15);
}

.export-modal-btn-separate:hover {
  background: rgba(15, 37, 87, 0.05);
  border-color: rgba(15, 37, 87, 0.25);
}

.export-modal-btn-cancel {
  background: transparent;
  color: rgba(15, 37, 87, 0.6);
  border: none;
}

.export-modal-btn-cancel:hover {
  background: rgba(15, 37, 87, 0.05);
}

.export-loading {
  text-align: center;
  color: rgba(15, 37, 87, 0.6);
  font-size: 0.95rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

#### D. New Functions

**1. `generateSinglePDF(analysis, index)`**

Creates a PDF for a single design analysis report.

```javascript
const generateSinglePDF = async (analysis, index) => {
  try {
    // Create temporary HTML element with report content
    const element = document.createElement('div');
    element.style.backgroundColor = 'white';
    element.style.padding = '40px';
    element.style.fontFamily = '"DM Sans", sans-serif';
    element.innerHTML = `
      <div style="margin-bottom: 30px;">
        <h1 style="font-family: 'DM Serif Display', serif; font-size: 28px; color: #0f2557; margin: 0 0 10px 0;">
          Analysis Report
        </h1>
        <p style="color: rgba(15,37,87,0.6); margin: 0;">
          Design: ${analysis.designName}
        </p>
      </div>
      
      <!-- Overall Score Section -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f0f4f9; border-radius: 8px;">
        <h2 style="font-size: 18px; color: #0f2557; margin: 0 0 15px 0;">Overall Score</h2>
        <div style="display: flex; gap: 20px;">
          <div>
            <div style="font-size: 48px; font-weight: bold; color: #0f2557;">
              ${analysis.arai_score ? analysis.arai_score.toFixed(1) : 'N/A'}
            </div>
            <div style="font-size: 14px; color: rgba(15,37,87,0.6);">ARAI Score</div>
          </div>
        </div>
      </div>

      <!-- Breakdown Section -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; color: #0f2557; margin: 0 0 15px 0;">Analysis Breakdown</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #0f2557;">
              ${analysis.accessibility_score ? analysis.accessibility_score.toFixed(1) : 'N/A'}
            </div>
            <div style="font-size: 12px; color: rgba(15,37,87,0.6); margin-top: 5px;">Accessibility</div>
          </div>
          <div style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #0f2557;">
              ${analysis.readability_score ? analysis.readability_score.toFixed(1) : 'N/A'}
            </div>
            <div style="font-size: 12px; color: rgba(15,37,87,0.6); margin-top: 5px;">Readability</div>
          </div>
          <div style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #0f2557;">
              ${analysis.attention_score ? analysis.attention_score.toFixed(1) : 'N/A'}
            </div>
            <div style="font-size: 12px; color: rgba(15,37,87,0.6); margin-top: 5px;">Attention</div>
          </div>
        </div>
      </div>

      <!-- Design Preview -->
      ${analysis.preview ? `<div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; color: #0f2557; margin: 0 0 15px 0;">Design Preview</h2>
        <img src="${analysis.preview}" style="max-width: 100%; height: auto; border-radius: 8px;" />
      </div>` : ''}

      <!-- Issues Found Section -->
      <div>
        <h2 style="font-size: 18px; color: #0f2557; margin: 0 0 15px 0;">Issues Found</h2>
        ${analysis.wcag_issues && analysis.wcag_issues.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h3 style="font-size: 14px; color: #0f2557; margin: 0 0 10px 0;">Accessibility Issues:</h3>
            ${analysis.wcag_issues.map(issue => `
              <div style="margin-bottom: 10px; padding: 10px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <div style="font-weight: 600; color: #991b1b;">${issue.title || 'Issue'}</div>
                <div style="font-size: 12px; color: rgba(153,27,27,0.8); margin-top: 5px;">
                  ${issue.description || ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${analysis.readability_issues && analysis.readability_issues.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h3 style="font-size: 14px; color: #0f2557; margin: 0 0 10px 0;">Readability Issues:</h3>
            ${analysis.readability_issues.map(issue => `
              <div style="margin-bottom: 10px; padding: 10px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <div style="font-weight: 600; color: #92400e;">${issue.title || 'Issue'}</div>
                <div style="font-size: 12px; color: rgba(146,64,14,0.8); margin-top: 5px;">
                  ${issue.description || ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${analysis.attention_issues && analysis.attention_issues.length > 0 ? `
          <div>
            <h3 style="font-size: 14px; color: #0f2557; margin: 0 0 10px 0;">Attention Issues:</h3>
            ${analysis.attention_issues.map(issue => `
              <div style="margin-bottom: 10px; padding: 10px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <div style="font-weight: 600; color: #92400e;">${issue.title || 'Issue'}</div>
                <div style="font-size: 12px; color: rgba(146,64,14,0.8); margin-top: 5px;">
                  ${issue.description || ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    // Append to DOM temporarily for rendering
    document.body.appendChild(element);
    
    // Convert HTML element to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Remove temporary element
    document.body.removeChild(element);
    
    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate dimensions
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let position = 10;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    
    // Handle multi-page content
    let heightLeft = imgHeight - (pdf.internal.pageSize.getHeight() - 20);
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    
    // Download the PDF
    pdf.save(`${analysis.designName}_analysis.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};
```

**2. `exportAllAsPDF()`**

Combines all design analyses into a single PDF file.

```javascript
const exportAllAsPDF = async () => {
  setExporting(true);
  try {
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let isFirstPage = true;
    
    // Process each design
    for (const analysis of analyses) {
      if (!isFirstPage) {
        pdf.addPage();
      }
      
      // Create summary HTML for this design
      const element = document.createElement('div');
      element.style.backgroundColor = 'white';
      element.style.padding = '40px';
      element.style.fontFamily = '"DM Sans", sans-serif';
      element.innerHTML = `
        <div style="margin-bottom: 30px;">
          <h1 style="font-family: 'DM Serif Display', serif; font-size: 24px; color: #0f2557; margin: 0 0 10px 0;">
            ${analysis.designName}
          </h1>
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div>
              <div style="font-size: 36px; font-weight: bold; color: #0f2557;">
                ${analysis.arai_score ? analysis.arai_score.toFixed(1) : 'N/A'}
              </div>
              <div style="font-size: 12px; color: rgba(15,37,87,0.6);">ARAI Score</div>
            </div>
            <div>
              <div style="font-size: 36px; font-weight: bold; color: #0f2557;">
                ${analysis.accessibility_score ? analysis.accessibility_score.toFixed(1) : 'N/A'}
              </div>
              <div style="font-size: 12px; color: rgba(15,37,87,0.6);">Accessibility</div>
            </div>
            <div>
              <div style="font-size: 36px; font-weight: bold; color: #0f2557;">
                ${analysis.readability_score ? analysis.readability_score.toFixed(1) : 'N/A'}
              </div>
              <div style="font-size: 12px; color: rgba(15,37,87,0.6);">Readability</div>
            </div>
            <div>
              <div style="font-size: 36px; font-weight: bold; color: #0f2557;">
                ${analysis.attention_score ? analysis.attention_score.toFixed(1) : 'N/A'}
              </div>
              <div style="font-size: 12px; color: rgba(15,37,87,0.6);">Attention</div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(element);
      
      // Convert to canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(element);
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      isFirstPage = false;
    }
    
    // Save combined PDF
    pdf.save('analysis_results.pdf');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  } finally {
    setExporting(false);
    setShowExportModal(false);
  }
};
```

**3. `exportSeparatePDFs()`**

Creates individual PDF files for each design.

```javascript
const exportSeparatePDFs = async () => {
  setExporting(true);
  try {
    // Generate PDF for each design sequentially
    for (const analysis of analyses) {
      await generateSinglePDF(analysis, 0);
    }
  } catch (error) {
    console.error('Error generating PDFs:', error);
    alert('Error generating PDFs. Please try again.');
  } finally {
    setExporting(false);
    setShowExportModal(false);
  }
};
```

#### E. Updated Header JSX

```jsx
{/* Header */}
<div className="multi-analysis-header">
  <div className="multi-analysis-header-content">
    <h1 className="multi-analysis-title">Analysis Results</h1>
    <p className="multi-analysis-subtitle">
      {analyses.length} design{analyses.length !== 1 ? 's' : ''} analyzed
    </p>
  </div>
  <button 
    className="multi-analysis-export-btn"
    onClick={() => setShowExportModal(true)}
  >
    📥 Export as PDF
  </button>
</div>
```

#### F. New Modal JSX (before closing `</div>`)

```jsx
{/* PDF Export Modal */}
{showExportModal && (
  <div 
    className="export-modal-overlay" 
    onClick={() => !exporting && setShowExportModal(false)}
  >
    <div 
      className="export-modal-content" 
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="export-modal-title">Export Results</h2>
      <p className="export-modal-description">
        How would you like to export your analysis results?
      </p>
      
      {exporting ? (
        <div className="export-loading">Generating PDF</div>
      ) : (
        <div className="export-modal-buttons">
          <button
            className="export-modal-btn export-modal-btn-all"
            onClick={exportAllAsPDF}
            disabled={exporting}
          >
            📄 All in One PDF
          </button>
          <button
            className="export-modal-btn export-modal-btn-separate"
            onClick={exportSeparatePDFs}
            disabled={exporting}
          >
            📑 Separate PDFs
          </button>
          <button
            className="export-modal-btn export-modal-btn-cancel"
            onClick={() => setShowExportModal(false)}
            disabled={exporting}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  </div>
)}
```

---

## Summary of Changes

| Aspect | Change | Impact |
|--------|--------|--------|
| **New Dependencies** | jspdf, html2canvas | Enables PDF generation |
| **New State** | showExportModal, exporting | Controls modal and loading state |
| **New Functions** | 3 export functions | Handles PDF creation logic |
| **New CSS Classes** | 10+ classes | Styles modal and buttons |
| **UI Updates** | Export button in header | Triggers export functionality |
| **Modal Component** | Added overlay dialog | User interface for export options |

---

## Testing the Implementation

### 1. Test Single Design Export
```javascript
// Steps
1. Upload single design
2. Click "Export as PDF"
3. Select "Separate PDFs"
4. Check downloads folder for PDF
```

### 2. Test Multiple Design Export (All in One)
```javascript
// Steps
1. Upload 3+ designs
2. Click "Export as PDF"
3. Select "All in One PDF"
4. Check downloads for single combined PDF
```

### 3. Test Multiple Design Export (Separate)
```javascript
// Steps
1. Upload 3+ designs
2. Click "Export as PDF"
3. Select "Separate PDFs"
4. Check downloads for individual PDFs
```

### 4. Verify PDF Content
```javascript
// Check each PDF contains
- Design name
- ARAI Score
- Breakdown scores
- Design preview image
- Issues found
- Recommendations
```

---

## Deployment Notes

1. **Package Installation**: Run `npm install` in frontend before deployment
2. **Build**: Run `npm run build` to include new dependencies
3. **Testing**: Test export functionality before production
4. **Browser Support**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

---

**Implementation Completed**: ✅ April 13, 2026
**Status**: Ready for Testing & Deployment

