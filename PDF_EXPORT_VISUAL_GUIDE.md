# PDF Export Feature - Visual Guide

## User Interface

### Export Button Location
```
┌─────────────────────────────────────────────────────────────┐
│                    ARAI SYSTEM INTERFACE                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Analysis Results                           [📥 Export as PDF]│
│  5 designs analyzed                                          │
│                                                               │
│  [Card] [Card] [Card]                                       │
│  [Card] [Card]                                              │
│                                                               │
│  Showing results for: design_1.png                          │
│  ... detailed analysis results ...                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Export Modal
```
┌─────────────────────────────────────────┐
│                                         │
│        Export Results                   │
│                                         │
│  How would you like to export your      │
│  analysis results?                      │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ 📄 All in One PDF                   ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ 📑 Separate PDFs                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Cancel                              ││
│  └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

## PDF Document Structure

### Single Design Report (1-4 pages)

```
┌──────────────────────────────────────────────────────────┐
│ PAGE 1                                                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Design Analysis Report                                   │
│ 📄 design_name.png                                       │
│ ────────────────────────────────────────────────────     │
│                                                           │
│ 📊 Overall Assessment                                    │
│ ┌────────┬────────┬────────┬────────┐                   │
│ │   82.5 │   85.0 │   80.0 │   81.0 │                   │
│ │  ARAI  │ Access │  Read  │  Attn  │                   │
│ └────────┴────────┴────────┴────────┘                   │
│                                                           │
│ 🖼️ Design Preview                                       │
│ ┌─────────────────────────────────────┐                 │
│ │     [Design Image]                  │                 │
│ └─────────────────────────────────────┘                 │
│                                                           │
│ 📋 Issue Summary                                         │
│ 🔴 2 Critical  🟠 3 High  🔵 1 Medium  🟢 5 Passing      │
│                                                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PAGE 2                                                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ ♿ Accessibility Analysis                                │
│ WCAG 2.1 Guidelines Compliance                          │
│                                                           │
│ ┌─ 🔴 CRITICAL Issue ─────────────────────────────────┐ │
│ │ Low Color Contrast                                  │ │
│ │ Some text has insufficient contrast ratio against    │ │
│ │ its background.                                      │ │
│ │                                                      │ │
│ │ 💡 How to Fix:                                      │ │
│ │  • Use contrast ratio of at least 4.5:1 for text   │ │
│ │  • Check small text (< 18pt) carefully              │ │
│ │  • Use online tools to measure contrast ratios       │ │
│ │  • Consider color-blind friendly palettes           │ │
│ │                                                      │ │
│ │ Severity: CRITICAL                                  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─ 🟠 HIGH Issue ──────────────────────────────────────┐ │
│ │ Small Text Size                                      │ │
│ │ Some text is smaller than recommended minimum size.  │ │
│ │                                                      │ │
│ │ 💡 How to Fix:                                      │ │
│ │  • Use minimum 12px font size for body text         │ │
│ │  • Headings should be at least 18px                 │ │
│ │  • Ensure text is resizable (avoid fixed sizing)    │ │
│ │  • Test readability on various devices               │ │
│ │                                                      │ │
│ │ Severity: HIGH                                       │ │
│ └────────────────────────────────────────────────────┘ │
│                                                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PAGE 3                                                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ 📖 Readability Analysis                                  │
│ Text Clarity & Content Structure                        │
│                                                           │
│ ✅ No issues found                                       │
│                                                           │
│                                                           │
│ 👁️ Visual Attention Analysis                            │
│ Visual Hierarchy & User Focus                           │
│                                                           │
│ ┌─ 🟠 HIGH Issue ──────────────────────────────────────┐ │
│ │ Visual Hierarchy Unclear                            │ │
│ │ Different sections appear to have similar visual     │ │
│ │ weight. Users may not know where to focus first.    │ │
│ │                                                      │ │
│ │ 💡 How to Fix:                                      │ │
│ │  • Use size to create hierarchy (60% primary, 30%   │ │
│ │    secondary, 10% supporting content)               │ │
│ │  • Use contrast: important content should stand out  │ │
│ │  • Use whitespace to separate important sections    │ │
│ │  • Apply color to draw attention (but not overuse)  │ │
│ │  • Make the CTA the most prominent element          │ │
│ │                                                      │ │
│ │ Severity: HIGH                                       │ │
│ └────────────────────────────────────────────────────┘ │
│                                                           │
│ Generated by ARAI System | 2026-04-14 at 10:30:45 AM   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Combined Report (Multiple Designs)

```
┌──────────────────────────────────────────────────────────┐
│ PAGE 1: Design 1                                         │
├──────────────────────────────────────────────────────────┤
│ [Design 1 Analysis - Abbreviated Format]                 │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PAGE 2: Design 2                                         │
├──────────────────────────────────────────────────────────┤
│ [Design 2 Analysis - Abbreviated Format]                 │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PAGE 3: Design 3                                         │
├──────────────────────────────────────────────────────────┤
│ [Design 3 Analysis - Abbreviated Format]                 │
└──────────────────────────────────────────────────────────┘
```

## Score Display Format

### Single Design PDF (Detailed)
```
┌────────────────────────────────────────────────┐
│ 📊 Overall Assessment                           │
├────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │  82.5  │ │  85.0  │ │  80.0  │ │  81.0  │   │
│ │ ARAI   │ │ ACCESS │ │ READ   │ │  ATTN  │   │
│ │ Score  │ │ Score  │ │ Score  │ │ Score  │   │
│ └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                │
│ Color indicators:                             │
│ 🟢 Green (≥80): Excellent                    │
│ 🔵 Blue (≥70): Good                          │
│ 🟠 Orange (≥60): Fair                        │
│ 🔴 Red (<60): Needs Improvement              │
└────────────────────────────────────────────────┘
```

### Combined PDF (Compact)
```
┌─────────────────────────────────────┐
│ ARAI  │ ACCESS │ READ  │ ATTN        │
│ 82.5  │  85.0  │ 80.0  │ 81.0        │
└─────────────────────────────────────┘
```

## Issue Severity Colors

```
Critical (Red)      : #dc2626 - Major problems, fix immediately
High (Orange)       : #f59e0b - Important issues to address
Medium (Blue)       : #3b82f6 - Should be improved
Info (Gray)         : #6b7280 - General information/tips
Success (Green)     : #059669 - Passing checks
```

## Export File Naming

### Single Design
- File: `{designName}_analysis.pdf`
- Example: `homepage_analysis.pdf`, `mobile_app_analysis.pdf`

### Multiple Designs - Combined
- File: `analysis_results.pdf`
- Contains all designs in one document

### Multiple Designs - Separate
- Files: 
  - `design1_analysis.pdf`
  - `design2_analysis.pdf`
  - `design3_analysis.pdf`
  - etc.

## How to Fix Section Examples

### Accessibility Issue
```
💡 How to Fix:
  • Use contrast ratio of at least 4.5:1 for normal text
  • Use 3:1 minimum for large text (18pt+)
  • Check text color combinations using tools like WebAIM
  • Test designs with accessibility checkers
  • Consider color-blind friendly palettes
```

### Readability Issue
```
💡 How to Fix:
  • Keep sentences to 15-20 words maximum
  • Use simple, common vocabulary
  • Break content into short paragraphs
  • Use active voice when possible
  • Add visual breaks between sections
```

### Attention Issue
```
💡 How to Fix:
  • Allocate visual space: 60% primary, 30% secondary, 10% supporting
  • Use size differences for hierarchy
  • Apply color strategically to highlight important elements
  • Follow natural reading patterns (Z or F shape)
  • Place CTAs in high-attention areas
```

## Browser Print Options

### Recommended Print Settings
- **Paper Size**: A4
- **Margins**: 0.5 inches
- **Scale**: 100%
- **Background Graphics**: On (if printing)
- **Save as PDF**: Instead of printing to paper

### Print Quality
- Resolution: 300 DPI (recommended for professional use)
- Format: Full-color PDF
- Font Embedding: Enabled

## Accessibility of PDFs

The generated PDFs include:
- ✅ Proper text formatting (readable by screen readers)
- ✅ Color-coded severity indicators (with text labels)
- ✅ Clear hierarchy with headings
- ✅ Sufficient contrast ratios
- ✅ Large enough font sizes
- ✅ Alt text for design images (where available)

## Download Location
- PDFs are saved to browser's default download folder
- User can change save location during download
- Multiple downloads may trigger browser's security warning (normal behavior)
