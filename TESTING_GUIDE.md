# Testing Guide: Upload Results Fix

## Pre-Test Checklist

Before testing, make sure:
- [ ] Frontend is running (`npm start`)
- [ ] Backend is running (Flask/FastAPI server)
- [ ] You are logged in to the app
- [ ] Browser DevTools console is open (F12)
- [ ] No errors in console before starting

---

## Test Case 1: First Upload (Should Work Before & After Fix)

### Steps:
1. Navigate to Dashboard
2. Click "Upload designs and view analysis" section
3. Select or drag a design image file
4. Click "Analyze Design" button
5. Wait for analysis to complete (1-3 minutes on first run)

### Expected Results:
✓ Loading spinner appears  
✓ Console shows: `✅ Analysis completed: {...}`  
✓ Automatically switches to "results" tab  
✓ See ARAI score displayed  
✓ See accessibility, readability, attention sections  

### Console Output:
```
🚀 Uploading design for analysis...
📁 File: [filename]
🔑 Token exists: true
📡 Attempt 1/3...
✅ Analysis completed: {...}
📤 Calling onAnalysisComplete callback with response data
```

---

## Test Case 2: New Analysis Click (Should Work Before & After Fix)

### Steps:
1. While on results tab, click "New Analysis" button
2. Observe form state

### Expected Results:
✓ Switches back to upload tab  
✓ File preview is cleared  
✓ Design name field is cleared  
✓ Upload area shows drag/drop interface again  
✓ Ready for new upload  

### Console Output:
```
(No new console messages - this is a local state operation)
```

---

## Test Case 3: Second Upload (THE KEY TEST - This Was Broken)

### Steps:
1. From fresh upload form, select a DIFFERENT design image
2. (Optional: Use a different filename to be sure it's different)
3. Click "Analyze Design" button
4. Wait for analysis to complete

### Expected Results (AFTER FIX):
✓ Loading spinner appears  
✓ Console shows same logs as Test Case 1  
✓ **MOST IMPORTANT:** Automatically switches to "results" tab  
✓ **NEW ANALYSIS DATA displayed** (not old results from Test Case 1)  
✓ ARAI score differs from first upload  
✓ Issues/recommendations are for the NEW design  

### Console Output:
```
🚀 Uploading design for analysis...
📡 Attempt 1/3...
✅ Analysis completed: {...} [DIFFERENT DATA]
📤 Calling onAnalysisComplete callback with response data
```

### How to Verify It's NEW Data:
- Check ARAI score is different
- Compare issue count
- Look at specific issues (should be about different elements)
- Check attention heatmap image is different

---

## Test Case 4: Multiple Successive Uploads

### Steps:
1. Complete Test Case 1
2. Click "New Analysis"
3. Complete Test Case 3
4. Click "New Analysis"
5. Upload a 3rd design
6. Click "New Analysis"
7. Upload a 4th design

### Expected Results:
✓ Every upload (1st, 2nd, 3rd, 4th) shows results  
✓ Each result is for the correct design  
✓ No data mixing between uploads  
✓ No stale results lingering  

### Success Metric:
All 4 uploads show their respective analysis results without manual intervention.

---

## Test Case 5: Error Recovery

### Steps:
1. Start upload
2. While analyzing, close browser tab (simulates interruption)
3. Reopen tab/navigate back to app
4. Try uploading again

### Expected Results:
✓ New upload completes normally  
✓ Previous incomplete state doesn't interfere  
✓ Results display correctly  

---

## Troubleshooting Guide

### Issue: "Results not showing after 2nd upload"

**Diagnosis Steps:**
1. Open DevTools Console (F12)
2. Look for error messages in red
3. Check if `📤 Calling onAnalysisComplete` log appears
4. Check Network tab for API response status

**Common Causes:**
| Issue | Check | Fix |
|-------|-------|-----|
| Token expired | Console shows 401 error | Log out and log back in |
| API failed | Network tab shows 500 | Check backend logs |
| Callback not called | Missing `📤` log | Check UploadAnalysis.jsx changes applied |
| Wrong data showing | Results from different design | Check browser cache (Ctrl+Shift+Delete) |

---

### Issue: "Form not clearing after analysis"

**Diagnosis:**
1. After analysis, check if file preview still shows
2. Check if design name field has text
3. Check console for errors in form reset

**Fix:**
Verify these lines in UploadAnalysis.jsx around line 145:
```jsx
setFile(null);
setPreview(null);
setDesignName('');
setError(null);
setIsAnalyzing(false);
setRetryMessage('');
```

---

### Issue: "AnalysisResults component not re-rendering"

**Diagnosis:**
1. Check Dashboard.jsx line 71 has `key={analysisKey}`
2. Check browser console for React errors
3. Check Network tab for API response

**Fix:**
Make sure line 71 looks like:
```jsx
<AnalysisResults key={analysisKey} results={currentAnalysis} />
```

---

## Performance Baseline

First upload:
- Time: 1-3 minutes (models loading)
- Network requests: 1 POST to /api/v1/analysis/upload
- Response size: ~1-2 MB

Subsequent uploads:
- Time: 30-60 seconds (faster, models cached)
- Network requests: 1 POST to /api/v1/analysis/upload
- Response size: ~1-2 MB

If 2nd upload takes longer than 1st, something is wrong.

---

## Browser Console Reference

### Debug Mode: Add This to Console
```javascript
// Monitor state updates
console.log('Current Tab:', 'results');
console.log('Analysis Data:', window.localStorage.getItem('current_analysis'));

// Force clear state (if stuck)
localStorage.clear();
window.location.reload();
```

### Useful Console Commands
```javascript
// Check if token exists
localStorage.getItem('access_token')

// Check recent API calls
fetch('/api/v1/analysis').then(r => r.json()).then(console.log)

// Clear cache and reload
navigator.serviceWorker.getRegistrations().then(
  regs => regs.forEach(reg => reg.unregister())
);
location.reload();
```

---

## Video Recording Checklist

To create a test video:
1. Open DevTools (F12) on right side
2. Set DevTools to take up 30% of screen
3. Record browser window
4. Follow Test Case 3 or 4
5. Narrate what you expect vs what happens
6. Save recording for documentation

---

## Automated Test Script (For React Testing Library)

```javascript
// pseudo-code example
describe('Upload Results Flow', () => {
  test('First upload shows results', async () => {
    const file = new File(['test'], 'design1.png', { type: 'image/png' });
    const input = screen.getByRole('input', { type: 'file' });
    await user.upload(input, file);
    await user.click(screen.getByText('Analyze Design'));
    await waitFor(() => expect(screen.getByText('ARAI Score')).toBeInTheDocument());
  });

  test('Second upload shows different results', async () => {
    // Complete first upload
    
    // Click New Analysis
    await user.click(screen.getByText('New Analysis'));
    
    // Upload different file
    const file2 = new File(['test2'], 'design2.png', { type: 'image/png' });
    const input = screen.getByRole('input', { type: 'file' });
    await user.upload(input, file2);
    await user.click(screen.getByText('Analyze Design'));
    
    // Should show results tab with NEW data
    await waitFor(() => expect(screen.getByText(/ARAI Score/)).toBeInTheDocument());
    
    // Verify data is different
    const score1 = /* extract from first analysis */;
    const score2 = /* extract from second analysis */;
    expect(score2).not.toBe(score1);
  });
});
```

---

## Quick Test Timeline

| Time | Action | Expected |
|------|--------|----------|
| 0:00 | Start test, begin recording | Browser ready |
| 0:05 | Upload 1st design | File selected |
| 0:10 | Click "Analyze Design" | Spinner appears |
| 3:15 | Analysis completes | Results tab, ARAI score |
| 3:20 | Click "New Analysis" | Back on upload tab |
| 3:25 | Upload 2nd design | File selected |
| 3:30 | Click "Analyze Design" | Spinner appears |
| 4:30 | Analysis completes | **Results tab** (was stuck here) |
| 4:35 | Verify new data | Different score, different issues |
| 4:40 | Test complete | SUCCESS ✓ |

**Total Time:** ~4-5 minutes

---

## Success Criteria

✅ **FIX IS WORKING IF:**
- [x] First upload shows results
- [x] Second upload ALSO shows results (key test)
- [x] Each result displays correct analysis
- [x] No console errors
- [x] Tab switches automatically
- [x] Can repeat 3+ times without issues

❌ **FIX IS NOT WORKING IF:**
- [ ] Second upload still doesn't show results
- [ ] Console shows React errors
- [ ] Results look the same between uploads
- [ ] Manual page refresh needed to see results
- [ ] Tab doesn't switch automatically

---

## Support Tickets

If test fails, provide:
1. Browser type and version
2. Console error messages (screenshot)
3. Network tab response (screenshot)
4. Expected vs actual behavior
5. Steps to reproduce
6. Design files used (can be any images)
