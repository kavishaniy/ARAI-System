# 📖 History Feature - Quick Start Guide

## 🎯 What is the History Page?

The History page is where all your design analyses are saved automatically with date and time stamps. Every time you analyze a design (image upload or Figma file), it's stored in your history for future reference.

---

## 🚀 How to Access History

### Method 1: From Sidebar
```
1. Look at left sidebar
2. Click "History" menu item
3. See all your analyses
```

### Method 2: From Dashboard
```
1. Go to Dashboard
2. Click "History" tab
3. See 5 recent analyses
4. Click "View All History" button
```

### Method 3: Direct URL
```
Navigate to: /history
(e.g., http://localhost:3000/history)
```

---

## 📊 What You'll See

### Each Analysis Shows:

```
┌─────────────────────────────────────────────────────────┐
│ Design Name                                             │
│ Date & Time          │ Score Badge │ Grade │ [Buttons] │
│ Jan 16, 2:45 PM      │     85      │   B   │ V  X      │
│                      │           /100      │           │
└─────────────────────────────────────────────────────────┘

Legend:
• Design Name: The name of your design file
• Date & Time: When the analysis was completed
• Score: ARAI score from 0-100
• Grade: Letter grade (A, B, C, D, F)
• [V] View: See detailed analysis report
• [X] Delete: Remove from history
```

---

## 🎨 Understanding the Scores

### ARAI Score (0-100)
```
90-100    Grade A    ✅ Excellent
80-89     Grade B    ✅ Good
70-79     Grade C    ⚠️ Fair
60-69     Grade D    ⚠️ Poor
Below 60  Grade F    ❌ Needs Work
```

### Color Coding
```
A = Green    (#10b981)  - Excellent design
B = Blue     (#3b82f6)  - Good design
C = Amber    (#f59e0b)  - Fair design
D = Red      (#ef4444)  - Poor design
F = Red      (#ef4444)  - Failing design
```

### What Do the Metrics Mean?

**ARAI Score** = Average of:
- 🎯 **Accessibility** (33%): WCAG compliance, contrast, text size
- 📖 **Readability** (33%): Text clarity, font legibility, spacing
- 👁️ **Attention** (33%): Visual hierarchy, focal points, focus areas

---

## 🔄 Workflow: From Analysis to History

### When You Upload a Design:

```
Step 1: Upload Design
├─ Click "Upload Design" on Dashboard
├─ Select PNG/JPG image (max 10MB)
├─ Add optional design name
└─ Click "Analyze Design"

Step 2: Analysis Runs
├─ Backend processes (1-3 minutes)
├─ Scans for accessibility issues
├─ Checks readability metrics
├─ Analyzes visual attention
└─ Calculates final score

Step 3: Results Saved
├─ ARAI score calculated
├─ Grade assigned
├─ Timestamp recorded (UTC)
├─ Data saved to database
└─ Metadata stored

Step 4: Auto-appears in History
├─ History widget refreshes
├─ New analysis appears at top
├─ Date/time shows when added
├─ You can immediately view or share
└─ Stays there permanently (unless deleted)
```

### When You Analyze a Figma File:

```
Same process as image upload:
1. Enter Figma URL
2. Backend extracts all frames
3. Analyzes each frame
4. Averages scores across frames
5. Saves to history automatically
6. Appears in history immediately
```

---

## 🔍 Features of the History Page

### ✅ View All Analyses
- See complete list of all your designs
- Sorted by newest first (most recent at top)
- Scrollable list with all metadata

### ✅ View Detailed Report
```
Click [View] button → Opens full analysis report
├─ Accessibility issues found
├─ Readability metrics
├─ Attention heatmap
├─ Frame-by-frame breakdown (for Figma)
├─ Detailed recommendations
└─ Export/share options
```

### ✅ Delete Analyses
```
Click [Delete] button
    ↓
Confirmation dialog appears
"Are you sure you want to delete this analysis?"
    ↓
[Cancel] or [Confirm Delete]
    ↓
Analysis removed from history
Database record deleted
```

### ✅ Smart Date Formatting
```
Same day:      "2:45 PM"
Previous day:  "Yesterday"
Past week:     "Monday" or "Jan 14"
Full format:   "Jan 16, 2026 2:45 PM"
```

---

## 📱 Mobile & Tablet Experience

### On Mobile (Portrait):
```
┌──────────────────────────────┐
│ ≡ Sidebar (collapsed)        │
├──────────────────────────────┤
│ Analysis History             │
├──────────────────────────────┤
│ Design 1                     │
│ Jan 16 2:45 PM  85/100 B    │
│ ┌──────────────────────────┐ │
│ │ [View]      [Delete]     │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Design 2                     │
│ Jan 15 11:20 AM  92/100 A   │
│ ┌──────────────────────────┐ │
│ │ [View]      [Delete]     │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### On Tablet (Landscape):
```
Full layout with more columns:
Design Name | Date | Score | Grade | Actions
Design 1    | Jan16| 85    | B     | [V] [X]
Design 2    | Jan15| 92    | A     | [V] [X]
```

---

## 🛠️ Common Actions

### View All My Analyses
```
1. Navigate to /history
2. All analyses load automatically
3. Scroll through list
4. Click any [View] button to see details
```

### Find My Latest Analysis
```
1. Go to Dashboard
2. Click "History" tab
3. See your 5 most recent analyses
4. Latest appears at top
```

### Check a Specific Design's Score
```
1. Find design in history
2. Look at score badge
3. See grade letter and color
4. Click [View] for detailed breakdown
```

### Remove a Design
```
1. Locate design in history
2. Click [Delete] button
3. Confirm in dialog
4. Analysis removed (⚠️ cannot undo)
```

### Share an Analysis
```
1. Click [View] on any analysis
2. Go to detailed report page
3. Look for [Export PDF] or [Share] button
4. Share with team/stakeholders
```

---

## 📊 Dashboard History Widget

When you're on the Dashboard, you'll see a "Recent Analyses" widget:

```
┌─────────────────────────────────────┐
│ Recent Analyses                     │
├─────────────────────────────────────┤
│ Homepage Design    2:45 PM  85/100 B│
│ Mobile App        11:20 AM  92/100 A│
│ Dashboard UI      Yesterday  78/100 C│
│ Landing Page         Jan 14  88/100 B│
│ Settings Page        Jan 13  81/100 B│
├─────────────────────────────────────┤
│    [View All History]               │
└─────────────────────────────────────┘
```

Click **"View All History"** to see your complete list.

---

## ⏱️ Timestamps & Time Zones

### When is the Timestamp Created?
- Recorded when analysis **completes** and is saved
- Shows when your design was analyzed
- Not when you uploaded it (can be different due to processing time)

### Time Zone
- All timestamps are in **UTC** (Coordinated Universal Time)
- Displayed in your **local time zone** (browser converts automatically)
- Example: Backend saves `2026-04-16T14:30:45Z` → Shows as `2:30 PM` locally

---

## 🔐 Privacy & Security

✅ **Your data is private**
- Only you can see your analyses
- Each user has isolated history
- Backend verifies your identity

✅ **You control your data**
- You can delete any analysis anytime
- Deletion is permanent
- No one else can access your data

✅ **Your analyses are stored securely**
- Encrypted in transit (HTTPS)
- Encrypted at rest (Supabase)
- Backed up automatically

---

## ❓ FAQ

### Q: Will my analyses stay forever?
**A:** Yes, until you delete them. They're stored in your account permanently.

### Q: Can I recover a deleted analysis?
**A:** No, deletion is permanent. Be careful when deleting! Consider exporting as PDF first if needed.

### Q: Why can other users see my analyses?
**A:** They can't! Each user sees only their own analyses. This is enforced by the backend.

### Q: What if I delete an analysis by mistake?
**A:** Unfortunately, it cannot be recovered. We show a confirmation dialog to prevent accidents, but once deleted, it's gone.

### Q: Can I export my history?
**A:** From the detailed analysis page, you can export individual analyses as PDF. Exporting the full history list is coming soon.

### Q: How far back does history go?
**A:** All the way back! History stores every analysis you've ever created (limit 50 shown at once for performance).

### Q: Is the date/time accurate?
**A:** Yes, the timestamp is recorded by the backend when analysis completes. It reflects when your design was analyzed, not when you uploaded it.

### Q: What's the difference between the Dashboard widget and History page?
**A:** 
- **Dashboard widget**: Shows 5 most recent, quick overview
- **History page**: Shows all analyses, full details, better for searching/managing

---

## 🚀 Tips & Tricks

### ⚡ Quick Access
```
Bookmark /history for fast access
Or pin "History" in your favorites
```

### 📌 Keep Good Records
```
• Name your designs descriptively ("Homepage V2", not just "design")
• Use history to track design improvements over time
• Compare scores across different design versions
```

### 🔄 Batch Actions
```
You can:
✓ View multiple analyses by clicking View multiple times (new tabs)
✓ Delete multiple analyses one by one
✓ Export individual analyses as PDFs
Coming soon:
• Bulk delete
• Export entire history
• Search & filter
```

### 📊 Tracking Progress
```
Monitor your improvements:
1. Analyze initial design → Score: 65 (Grade D)
2. Make improvements
3. Re-analyze → Score: 78 (Grade C)
4. Keep improving
5. Track history to see progress

Your history shows the journey! 📈
```

---

## 🎓 Learning from History

Use your history to:

1. **See Patterns**: What types of issues keep appearing?
2. **Track Improvements**: Are your scores improving over time?
3. **Share Progress**: Show stakeholders the journey
4. **Reference Previous Work**: Find similar designs you've analyzed
5. **Learn Best Practices**: See which designs scored highest and why

---

## 🆘 Need Help?

### If history isn't loading:
```
1. Check your internet connection
2. Refresh the page (Ctrl+R or Cmd+R)
3. Clear browser cache and try again
4. Check browser console for errors (F12)
5. Logout and login again
```

### If a new analysis doesn't appear:
```
1. Wait for analysis to complete (shows "Analysis Complete")
2. Refresh the history page
3. Check if you're logged in as the correct user
4. Look at browser console for API errors
```

### If delete isn't working:
```
1. Check your internet connection
2. Refresh the page
3. Try deleting a different analysis
4. Check browser permissions
5. Contact support if still not working
```

---

## 📞 Contact & Support

If you need help:
- 📧 Email: support@arai-system.com
- 💬 Chat: In-app support (coming soon)
- 📖 Docs: Full documentation at /docs
- 🐛 Bug Report: Report issues on GitHub

---

## ✨ Summary

Your **History Page** is your analysis dashboard where you can:
- 📊 See all your previous design analyses
- ⏰ Know when each analysis was completed
- 🎯 Track your ARAI scores and improvement over time
- 👀 View detailed reports for any analysis
- 🗑️ Clean up old analyses
- 📤 Export analyses to share with team

**All data is automatically saved** - you don't need to do anything special. Just analyze designs as usual, and watch your history grow!
