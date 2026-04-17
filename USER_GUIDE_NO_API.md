# User Guide: Analyze Figma Projects WITHOUT API Token

## 🎉 What's New?

You can now analyze your Figma projects **without needing an API token**!

### Before:
- ❌ Need to create API token
- ❌ Copy-paste token
- ❌ Risk of rate limit errors
- ❌ 10+ minutes setup

### After:
- ✅ Just paste Figma URL
- ✅ No token needed
- ✅ No rate limit errors
- ✅ 1 minute setup

---

## 📋 How to Use

### Quick Start (3 Steps)

#### Step 1️⃣: Get Your Figma URL

1. Open your Figma project in browser
2. Look at the URL in address bar:
   ```
   https://www.figma.com/design/abc123xyz789/Your-Project-Name
   ```
3. Copy this URL (Cmd+C or Ctrl+C)

**That's it! You have everything you need!**

---

#### Step 2️⃣: Paste URL in ARAI

1. Go to ARAI app (your design analysis tool)
2. Click **"Analyze Figma Design"**
3. Paste your Figma URL:
   ```
   https://www.figma.com/design/abc123xyz789/Your-Project-Name
   ```
4. Click **"Load Figma Project"**

**No API token needed!** ✅

---

#### Step 3️⃣: Export Frames

Now you need to get the design images to analyze:

1. Go back to your **Figma project**
2. Find a **frame** you want to analyze
3. **Right-click** the frame in the left panel
4. Select **"Export"**
5. Choose **PNG** format
6. Save the image
7. Repeat for other frames

**Or, quick method:**
```
Select frame → Cmd/Ctrl + Shift + C → Paste in image editor → Save as PNG
```

---

### Complete Step-by-Step Guide

#### 📍 Part 1: Getting the Figma Project URL

**On your computer:**
1. Open your browser
2. Go to Figma (figma.com)
3. Open any design project
4. In the address bar, you'll see something like:
   ```
   https://www.figma.com/design/YOUR_FILE_ID/Your-Project-Name
   ```
5. **Copy the entire URL**

**Examples:**
```
✅ https://www.figma.com/design/abc123xyz789/Dashboard
✅ https://www.figma.com/design/xyz789abc123/Mobile-App?node-id=123
✅ https://www.figma.com/file/abc123xyz789/Marketing-Site
```

---

#### 📍 Part 2: Using ARAI (Analysis App)

**In ARAI app:**

1. **Click "Figma Analysis"** from the menu
2. **See this form:**
   ```
   ┌─────────────────────────────────┐
   │ Analyze Figma Design            │
   ├─────────────────────────────────┤
   │                                 │
   │ Figma Project URL *             │
   │ [____________________________]   │
   │ Paste the full URL of your       │
   │ Figma project                   │
   │                                 │
   │ [Load Figma Project]            │
   └─────────────────────────────────┘
   ```

3. **Paste your URL** in the field
4. **Click "Load Figma Project"**
5. **Wait** for the app to load your project

---

#### 📍 Part 3: Exporting Your Frames

**In Figma:**

1. **Open your design file** (the same one you pasted the URL for)

2. **Find a frame:**
   - Look in the left panel (layers panel)
   - Find a **frame** (📐 icon)
   - Click to select it

3. **Export the frame:**
   - **Right-click** on the frame name
   - Select **"Export"**
   - Choose **PNG** format
   - Click **"Download"**
   
4. **Remember the frame name** - you'll need it in the app

5. **Repeat** for each frame you want to analyze

**Example frames to export:**
- "Hero Section"
- "Features Section"
- "Footer"
- "Contact Form"
- "Navigation"

---

#### 📍 Part 4: Uploading Images

**Back in ARAI app:**

1. **App shows your frames list**
   ```
   Frame 1
   Frame 2
   Frame 3
   Frame 4
   Frame 5
   ```

2. **For each frame you want to analyze:**
   - Select it in the app
   - Upload the PNG you just exported
   - Make sure the names match

3. **Click "Analyze Selected Frames"**

4. **Wait** for analysis to complete (usually 30 seconds)

---

#### 📍 Part 5: View Results

**See your analysis:**

```
Overall Score: 78.5 / 100

┌──────────────────────────┐
│ Accessibility: 82.3/100  │
│ ✓ Good WCAG compliance   │
│ ✓ Proper contrast ratios  │
│ ✓ Readable text          │
└──────────────────────────┘

┌──────────────────────────┐
│ Readability: 79.1/100    │
│ ✓ Clear typography       │
│ ✓ Good line spacing      │
│ ✓ Legible fonts          │
└──────────────────────────┘

┌──────────────────────────┐
│ Attention: 74.2/100      │
│ ✓ Clear visual hierarchy │
│ ✓ Good focal points      │
│ ✓ Balanced layout        │
└──────────────────────────┘
```

---

## ❓ FAQ

### Q: Do I need an API token?
**A:** No! That's the whole point. Just paste your Figma URL.

### Q: How do I get the Figma URL?
**A:** It's in your browser address bar when you open Figma. Just copy it.

### Q: Can I analyze multiple frames?
**A:** Yes! Export all your frames and upload them together.

### Q: What if I don't have Figma?
**A:** You can use any design tool (Sketch, Adobe XD, Figma, Webflow, etc). Just export your designs as PNG images.

### Q: Why do I need to export frames manually?
**A:** This keeps things simple and secure. No API access needed, so nothing can go wrong with authentication.

### Q: What happens to my images?
**A:** They're analyzed by our system and then discarded. We don't store them permanently.

### Q: Can I analyze different types of designs?
**A:** Yes! Any design image (PNG, JPG, WebP) works. It doesn't have to be from Figma.

### Q: Is there a file size limit?
**A:** Keep images under 10MB for best performance. Most screenshots are much smaller.

---

## 🎯 Common Scenarios

### Scenario 1: Analyzing a Mobile App Design
```
1. Open Figma project with mobile screens
2. Copy Figma URL
3. Paste in ARAI
4. Export each mobile frame as PNG
5. Upload the images
6. View accessibility and readability scores
```

### Scenario 2: Analyzing a Website Design
```
1. Open Figma project with website mockups
2. Copy Figma URL
3. Paste in ARAI
4. Export hero, features, footer, contact sections
5. Upload all as PNG images
6. Analyze all at once
7. Get scores for each section
```

### Scenario 3: Analyzing Non-Figma Designs
```
1. You have a design from Sketch or Adobe XD
2. Export the design as PNG
3. Take a screenshot or save the image
4. Upload to ARAI directly
5. Analyze without needing the Figma URL
```

---

## 🚀 Pro Tips

### Tip 1: Name Your Frames Clearly
Good names:
- ✅ "Hero Section"
- ✅ "Features Grid"
- ✅ "Pricing Table"
- ✅ "Contact Form"

Bad names:
- ❌ "Frame 1"
- ❌ "Copy of Desktop"
- ❌ "Design v4"

**Why?** Helps you understand which section has issues.

---

### Tip 2: Export at High Quality
When exporting from Figma:
1. Right-click frame
2. Click "Export"
3. Set scale to **2x** for better analysis
4. Choose **PNG** (not JPG)

This gives more accurate accessibility analysis.

---

### Tip 3: Analyze Related Sections Together
Group similar frames:
- All "Light Mode" designs together
- All "Desktop" sizes together
- All "Mobile" sizes together

This helps identify consistent problems.

---

### Tip 4: Fix Issues by Priority
Look at the scores:
1. **Accessibility < 70?** Fix contrast and text sizes first
2. **Readability < 70?** Improve typography and spacing
3. **Attention < 70?** Adjust visual hierarchy

---

## 🎓 Understanding Results

### What is Accessibility Score?
- **Measures WCAG Compliance**
- Color contrast (can people with color blindness see it?)
- Text size (is it readable?)
- Component spacing
- Navigation clarity

**Aim for:** 80+

---

### What is Readability Score?
- **Measures Text Legibility**
- Font choice (readable fonts?)
- Font size (big enough?)
- Line spacing (not crowded?)
- Letter spacing (appropriate?)

**Aim for:** 75+

---

### What is Attention Score?
- **Measures Visual Hierarchy**
- Is there a clear focal point?
- Are important elements prominent?
- Is the layout balanced?
- Do colors guide the eye?

**Aim for:** 75+

---

## 📞 Need Help?

### Issue: "Can't find the URL"
**Solution:**
1. Open Figma in your browser
2. You'll see this in address bar:
   ```
   https://www.figma.com/design/YOUR_FILE_ID/ProjectName
   ```
3. Highlight and copy the entire URL
4. Paste in ARAI

---

### Issue: "Export button not showing"
**Solution:**
1. Make sure you **selected a frame** (not a group)
2. Right-click directly on the **frame name**
3. Look for "Export" option
4. If not there, try right-clicking in the canvas

---

### Issue: "Image won't upload"
**Solution:**
1. Make sure it's a valid PNG or JPG
2. Keep it under 10MB
3. Make sure filename matches frame name
4. Try uploading one at a time

---

## ✅ Quick Checklist

Before analyzing:
- [ ] You have a Figma design (or any design image)
- [ ] You have the Figma URL (or the design exported as PNG)
- [ ] You're in ARAI app
- [ ] You have 2 minutes free

Ready? Go analyze! 🚀

---

## Summary

| Step | Time | Effort |
|------|------|--------|
| 1. Get Figma URL | 30 sec | Copy URL |
| 2. Paste in ARAI | 30 sec | Paste URL |
| 3. Load Project | 1 min | Click button |
| 4. Export Frames | 2 min | Right-click export |
| 5. Upload Images | 1 min | Upload files |
| 6. Analyze | 1 min | Click analyze |
| 7. View Results | 30 sec | Review scores |

**Total Time: 6-7 minutes**

**Result: Complete design analysis! ✅**

---

**Questions?** Check the FAQ above or contact support.

**Ready to analyze?** Let's go! 🎨
