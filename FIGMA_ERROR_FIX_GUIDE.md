# Figma Analysis Error Fix Guide

## Errors You're Seeing

### Error 1: "Figma API Error 429: Rate limit exceeded"
### Error 2: "No Frames Found - This Figma project doesn't contain any frames"

---

## What We Fixed

### ✅ Backend Improvements

1. **Rate Limiting with Auto-Retry**
   - Added automatic retry logic when Figma API returns 429 (rate limit)
   - System waits 2 seconds between retries
   - Retries up to 3 times automatically
   - Enforces minimum 1-second delay between all API requests

2. **Better Frame Detection**
   - Now detects FRAMES, COMPONENTS, COMPONENT_SETs, and BOARDS
   - Logs each component type found
   - Provides detailed error messages when no frames exist

3. **Improved Error Messages**
   - Clear indication of why frames weren't found
   - Helpful suggestions on what to check

### ✅ Frontend Improvements

1. **Better Error Handling**
   - Detects and displays rate limit errors separately
   - Shows helpful troubleshooting steps
   - Differentiates between "no frames" and API errors

2. **User-Friendly Guidance**
   - Added inline help text for each error type
   - Step-by-step instructions to fix issues
   - Clear suggestions on how to structure Figma files

---

## How to Fix Each Error

### Fix #1: "No Frames Found" Error

**What it means:** Your Figma file doesn't have analyzable design elements

**How to fix:**
1. Open your Figma project
2. Make sure you have at least ONE of these:
   - ✅ A **FRAME** (the most common)
   - ✅ A **COMPONENT**
   - ✅ A **COMPONENT_SET**
   - ✅ A **BOARD**

3. **❌ What WON'T work:**
   - Individual shapes without a parent frame
   - Text layers without a frame
   - Nested elements not inside a frame

**Example of correct structure:**
```
My Page
  ├─ Frame: "Hero Section"
  │   ├─ Rectangle (button)
  │   ├─ Text (heading)
  │   └─ Image
  ├─ Frame: "Navigation"
  │   ├─ Rectangle (nav background)
  │   └─ Text items
  └─ Component: "Button"
```

**Quick test:**
1. Create a new file or page in Figma
2. Add ONE frame with a simple rectangle inside
3. Copy the file URL and try analyzing again
4. If this works, your token is fine - just add more frames to your main file

---

### Fix #2: "Rate Limit Exceeded" Error (429)

**What it means:** You're making too many requests to Figma API too quickly

**How to fix:**
1. **Wait 1-2 minutes** before trying again
2. Try analyzing **fewer frames** in one request
3. If it happens repeatedly:
   - Create a new Figma API token at https://figma.com/settings
   - Paste the new token in the app
   - Try again

**Prevention tips:**
- Don't analyze more than 20 frames at once
- Wait at least 30 seconds between analysis runs
- If you have a large project, break it into multiple files

---

## Verification Steps

### Step 1: Check Your Figma Token
1. Go to https://www.figma.com/settings
2. Find "Personal access tokens" section
3. Verify token exists and is NOT expired
4. Token should start with `figd_`

### Step 2: Verify Your File Has Frames
1. Open the Figma file in your browser
2. In the left panel, expand the page
3. Look for items labeled:
   - **Frame** (icon looks like square)
   - **Component** (icon looks like component symbol)
   - **Board** (large canvas area)

### Step 3: Test with Simple File
1. Create a new Figma file
2. Add one frame with a simple rectangle
3. Copy file URL
4. Try analyzing in the app
5. If this works, your setup is correct!

---

## Common Mistakes

### ❌ Mistake 1: Token Expired
**Symptom:** Error after it was working before
**Fix:** Create a new token at figma.com/settings

### ❌ Mistake 2: Wrong URL Format
**Symptom:** "Could not extract file ID from Figma URL"
**Fix:** Use full URL from browser address bar, like:
- ✅ `https://www.figma.com/design/FILE_ID/Project-Name`
- ✅ `https://www.figma.com/file/FILE_ID/Project-Name`
- ❌ `https://www.figma.com/projects/recent`

### ❌ Mistake 3: File is Private
**Symptom:** Figma API Error 404 or 403
**Fix:** 
- Make sure file is not in a private team
- Share it with the account that created the token
- Create new token with full access

### ❌ Mistake 4: Analyzing Individual Shapes
**Symptom:** "No Frames Found"
**Fix:** Put all elements inside a FRAME first
- Select all elements
- Right-click → Wrap in frame
- Try again

---

## Technical Details

### What Changed in the Backend

**File:** `/backend/app/api/figma.py`

1. **Added rate limit handling:**
   ```python
   - Retries on HTTP 429 status
   - Automatic backoff with delays
   - Enforces per-request rate limiting
   ```

2. **Improved frame extraction:**
   ```python
   - Detects FRAME, COMPONENT, COMPONENT_SET, BOARD
   - Logs each component found
   - Better error messages
   ```

3. **Better error responses:**
   ```python
   - Returns status "error" when no frames found
   - Includes helpful message in response
   - Specific error codes for debugging
   ```

### What Changed in the Frontend

**File:** `/frontend/src/components/Analysis/FigmaFramesAnalysis.jsx`

1. **Enhanced error detection:**
   ```javascript
   - Checks response status for errors
   - Handles 429 rate limit specifically
   - Extracts message from multiple sources
   ```

2. **User-friendly error display:**
   ```javascript
   - Shows different help text for each error
   - Provides inline troubleshooting steps
   - Clear action items
   ```

---

## Still Having Issues?

### Try These Steps:

1. **Clear browser cache**
   - Open DevTools (F12)
   - Right-click reload button → "Empty cache and hard refresh"

2. **Use a fresh token**
   - Go to https://figma.com/settings
   - Create NEW token (don't reuse old one)
   - Paste in app

3. **Test with minimal project**
   - Create new Figma file
   - Add one simple frame
   - Paste URL and token in app
   - This confirms system works

4. **Check browser console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for messages like "Extracted Figma File ID: xxx"
   - These show what's being sent to backend

5. **Contact support**
   - Take a screenshot of error
   - Note your file ID
   - Mention if it happens on all files or specific ones
   - Report whether it's 429 rate limit or "no frames"

---

## What the System Can Now Analyze

✅ **CAN analyze:**
- Frames (primary design containers)
- Components (reusable design elements)
- Component Sets (component variants)
- Boards (large canvas areas)
- All nested content within these

❌ **CANNOT analyze:**
- Standalone shapes without a frame
- Text layers not in a frame
- Groups without a frame
- Raw file without any frames

---

## Summary

The app now has:
- ✅ Automatic retry on rate limits
- ✅ Better detection of all frame types
- ✅ Clearer error messages
- ✅ Inline troubleshooting help
- ✅ Prevention of future rate limit errors

**Next time you see these errors, just follow the inline suggestions!**
