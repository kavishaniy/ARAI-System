# 🧪 Quick Test Guide - Score Calculation Fix

## What Was Fixed

Your analysis system is now **correctly penalizing designs with issues**.

**Before:** Score showed 100 even with 5 major problems ❌  
**After:** Score now drops based on severity of issues found ✅

---

## How Scoring Works Now

### The Penalty System
- **Critical Issue** = -25 points
- **High Severity** = -15 points  
- **Medium Severity** = -8 points
- **Info/Suggestions** = -2 points

**Starting score:** 100  
**Final score:** 100 - (sum of penalties), minimum 0

### Example
```
Issue 1: Missing alt text (High) → -15 → Score = 85
Issue 2: Low contrast (High) → -15 → Score = 70  
Issue 3: Tiny touch targets (Medium) → -8 → Score = 62
Issue 4: Complex layout (High) → -15 → Score = 47
```

---

## Quick Testing Checklist

### ✅ Test 1: Upload a "Good" Design
**File:** Clean design with no issues
**Expected Result:**
- Accessibility: ~95-100
- Readability: ~85-100
- Attention: ~95-100
- ARAI: ~92-100

### ✅ Test 2: Upload a "Bad" Design
**File:** Design with multiple issues
**Expected Result:**
- Accessibility: ~60-75 (multiple high-severity issues)
- Readability: ~60-75 (hard to read text)
- Attention: ~50-70 (poor visual hierarchy)
- ARAI: ~60-75

### ✅ Test 3: Check No Success Messages
**Expected Result:**
- Issue list shows ONLY actual problems
- Each issue has clear "How to fix" guidance
- No "Great job!" or "Perfect!" messages in the list

### ✅ Test 4: Verify ARAI Calculation
**Verify formula:** `(Acc × 0.4) + (Read × 0.3) + (Attn × 0.3)`

Example:
- Accessibility: 80 → 80 × 0.4 = 32
- Readability: 70 → 70 × 0.3 = 21
- Attention: 75 → 75 × 0.3 = 22.5
- **ARAI = 32 + 21 + 22.5 = 75.5**

---

## Live Testing Steps

### 1. Start Backend (if not running)
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 5000
```

### 2. Start Frontend
```bash
cd frontend
npm start  # or npm run dev
```

### 3. Navigate to http://localhost:3000

### 4. Login and Upload Design

### 5. Check Results
- [ ] Scores are reasonable (not 100 if issues exist)
- [ ] Multiple issues = lower score
- [ ] ARAI is between the 3 category scores
- [ ] Issue descriptions are clear
- [ ] "How to fix" guidance is actionable

---

## Score Reference Table

| Design Quality | Accessibility | Readability | Attention | ARAI |
|---|---|---|---|---|
| Excellent | 95-100 | 90-100 | 95-100 | 95-100 |
| Good | 80-94 | 80-89 | 80-94 | 80-94 |
| Fair | 60-79 | 60-79 | 60-79 | 60-79 |
| Poor | 40-59 | 40-59 | 40-59 | 40-59 |
| Critical | <40 | <40 | <40 | <40 |

---

## Common Issues & Solutions

### Issue: Scores still too high
- **Check:** Are there high-severity issues shown?
- **Action:** Try uploading design with obvious contrast problems
- **Verify:** Backend restarted and changes applied

### Issue: Scores too low for clean design
- **Check:** Is it showing false positives?
- **Action:** Upload a simple, clean design with clear hierarchy
- **Verify:** Should score 85+

### Issue: Score not between category scores
- **Check:** ARAI formula may be calculating wrong
- **Action:** Manually calculate using formula: `(Acc × 0.4) + (Read × 0.3) + (Attn × 0.3)`
- **Verify:** ARAI should be between min and max of 3 categories

---

## Debug Commands

### Check Backend Health
```bash
curl http://localhost:5000/health
```

### Check Backend Logs
```bash
# Terminal running backend - watch for errors
```

### Verify Analyzer Loaded
```python
# In backend terminal, watch for successful startup
# Should see: "Application startup complete."
```

---

## Expected Behavior Summary

### ✅ Scores SHOULD be:
- **Lower when issues found** (not 100)
- **Higher for clean designs** (85+)
- **Cumulative** (multiple issues = more points deducted)
- **Severity-based** (critical > high > medium > info)
- **Reflected in ARAI** (lower category scores = lower ARAI)

### ❌ Scores SHOULD NOT be:
- **Always 100** (that was the bug!)
- **Not showing penalties** for issues
- **Same for different designs** (should vary)
- **Showing success items** in the issue list
- **Ignoring issue severity**

---

## Success Criteria

You'll know the fix is working when:

1. ✅ A clean design scores 90+
2. ✅ A flawed design scores 60-75
3. ✅ Adding more issues lowers the score
4. ✅ ARAI score falls between category scores
5. ✅ Issue list shows only problems (no "perfect!" messages)
6. ✅ Each issue has clear solutions
7. ✅ Scores match the formulas shown here

---

## Need Help?

### Backend won't start?
```bash
pkill -f "uvicorn"
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 5000
```

### Scores still wrong?
- Check `/SCORE_CALCULATION_FIX_COMPLETE.md` for technical details
- Review backend logs for errors
- Verify all 3 analyzer files were updated

### Want to see the fixes?
- Check `backend/app/ai_modules/simplified_wcag_analyzer.py`
- Check `backend/app/ai_modules/simplified_readability_analyzer.py`
- Check `backend/app/ai_modules/simplified_attention_analyzer.py`

---

**Status:** ✅ Fix Applied and Tested  
**Last Updated:** $(date)  
**Backend Version:** 1.2.0 (with score calculation fixes)
