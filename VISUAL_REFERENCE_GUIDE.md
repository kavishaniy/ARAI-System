# Visual Reference Guide - Analysis Page Redesign

## Color Palette Reference

### Primary Colors
```
Navy Dark
#0f2557
RGB: 15, 37, 87
Used for: Main text, headers, primary elements

Navy Darker
#091840
RGB: 9, 24, 64
Used for: Hover states, secondary backgrounds
```

### Category Accent Colors
```
Accessibility - Teal
#14b8a6
RGB: 20, 184, 166
Hex variants: #0d9488 (darker)

Readability - Blue
#3b82f6
RGB: 59, 130, 246
Hex variants: #2563eb (darker)

Attention - Amber
#f59e0b
RGB: 245, 158, 11
Hex variants: #d97706 (darker)
```

### Background Gradient
```
Start: #f5f4f0 (Light Beige)
End: #faf9f7 (Off-White)
Direction: 135deg (diagonal)

CSS:
background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
```

### Neutral Colors
```
White: #ffffff
Light Gray Border: rgba(15,37,87,0.15)
Medium Gray Border: rgba(15,37,87,0.1)
Dark Gray Text: rgba(15,37,87,0.6)
Light Gray Text: rgba(15,37,87,0.5)
Very Light Gray: rgba(15,37,87,0.02)
```

---

## Typography Reference

### Font Families
```
Display Font: DM Serif Display
- Weights: 400 (normal), italic
- Used for: Headings, large numbers
- Import: Google Fonts

Body Font: DM Sans
- Weights: 300 (light), 400 (normal), 600 (semibold)
- Used for: Body text, labels, buttons
- Import: Google Fonts

@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
```

### Typography Scale

| Element | Font | Size | Weight | Color | Usage |
|---------|------|------|--------|-------|-------|
| Page Heading | DM Serif | 2.5rem | 400 | #0f2557 | "Design Analysis Results" |
| Section Heading | DM Serif | 2.2rem | 400 | #0f2557 | "One score. Three dimensions..." |
| Card Heading | DM Serif | 1.8rem | 400 | #0f2557 | Category section headers |
| Sub-Heading | DM Serif | 1.6rem | 400 | #0f2557 | Issue titles |
| Large Body | DM Sans | 1.05rem | 600 | #0f2557 | Issue card titles |
| Normal Body | DM Sans | 0.95rem | 400 | #0f2557 | Body paragraphs |
| Small Body | DM Sans | 0.9rem | 400 | rgba(15,37,87,0.65) | Secondary text |
| Label | DM Sans | 0.75rem | 600 | rgba(15,37,87,0.5) | "POINTS TO CHANGE", "ACCESSIBILITY" |
| Tiny | DM Sans | 0.63rem | 600 | rgba(15,37,87,0.35) | Eyebrow text |

---

## Component Styles

### Score Ring Visual

```
Main Ring (Overall ARAI Score):

        ┌─────────────────┐
        │       85.5      │
        │                 │
     ○──┴─────────────────┴──○
    /                         \
   |    [Gradient Stroke]      |
   |    (Navy → Teal)          |
   |                           |
    \                         /
     ○───────────────────────○
        │                 │
        │     Grade A     │
        └─────────────────┘

Width: 200px
Height: 200px
Stroke Width: 8px
Circumference: 565px
Gradient: #0f2557 to #14b8a6
Animation Duration: 2 seconds
```

### Sub-Score Ring Visual

```
┌──────────────────────────┐
│  🎯 Accessibility        │
│                          │
│      ○─────────○         │
│     /     78     \       │
│    │      .5      │      │
│     \             /      │
│      ○───────────○       │
│           %              │
│                          │
└──────────────────────────┘

Width: 80px
Height: 80px
Stroke Width: 5px
Circumference: 251px
Color: #14b8a6 (Teal)
Animation Duration: 1.5s
Delay: 0ms
```

### Issue Point Card Visual

```
┌─────────────────────────────────────┐
│  ⚠️  Color Contrast Issue            │
│     Text contrast ratio is below     │
│     WCAG AA standard                 │
│                                     │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ POINTS TO CHANGE               ┃ │
│ ┃ • Increase contrast from 3.5:1 ┃ │
│ ┃   to at least 4.5:1            ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                     │
│ [View Solutions ↓]                  │
└─────────────────────────────────────┘

Expanded State:

┌─────────────────────────────────────┐
│  ⚠️  Color Contrast Issue            │
│     Text contrast ratio is below     │
│     WCAG AA standard                 │
│                                     │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ POINTS TO CHANGE               ┃ │
│ ┃ • Increase contrast from 3.5:1 ┃ │
│ ┃   to at least 4.5:1            ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                     │
│ 💡 HOW TO FIX                       │
│ → Use darker text color (#333)      │
│ → Or use lighter background         │
│ → Test with WCAG contrast checker   │
│                                     │
│ ⚡ BEST PRACTICE                    │
│ Maintain at least 4.5:1 contrast    │
│ for normal text, 3:1 for large text │
│                                     │
│ [Close Details ↑]                   │
└─────────────────────────────────────┘
```

### Category Header Visual

```
┌─────────────────────────────┐
│ 🎯  Accessibility Analysis   │
│      Score: 78.5             │
│                              │
│ [Issue Cards Below]          │
│ [Issue Cards Below]          │
│ [Issue Cards Below]          │
└─────────────────────────────┘

Icon Options:
- Accessibility: Target (🎯) - Teal
- Readability: TrendingUp (📈) - Blue
- Attention: Zap (⚡) - Amber
```

---

## Layout Proportions

### Main Scores Section (2-Column)

```
Left Column (40%):
├── Heading (200px)
├── Description (60px)
└── Sub-Scores Grid (400px)
    ├─ Card 1 (height: auto)
    ├─ Card 2 (height: auto)
    └─ Card 3 (height: auto)

Right Column (40%):
└── Main Ring (300px × 300px centered)

Gap: 3rem
```

### Sub-Scores Grid (3-Column)

```
┌────────────┬────────────┬────────────┐
│   Card 1   │   Card 2   │   Card 3   │
│  (Icon)    │  (Icon)    │  (Icon)    │
│  (Ring)    │  (Ring)    │  (Ring)    │
│  (Score)   │  (Score)   │  (Score)   │
└────────────┴────────────┴────────────┘

Gap: 1.5rem
Card Height: auto (content-driven)
Card Padding: 1.5rem
```

### Issue Points Grid

```
┌──────────────────┬──────────────────┐
│   Issue Card 1   │   Issue Card 2   │
│   (expandable)   │   (expandable)   │
│                  │                  │
└──────────────────┴──────────────────┘

┌──────────────────┬──────────────────┐
│   Issue Card 3   │   Issue Card 4   │
│   (expandable)   │   (expandable)   │
│                  │                  │
└──────────────────┴──────────────────┘

On Tablet/Mobile: Single column

Gap: 1.5rem
Card Min-Width: 500px (responsive)
Card Padding: 1.5rem
```

---

## Spacing & Measurements

### Margins & Padding

```
Section Gaps:      3rem (48px)
Card Padding:      1.5rem - 3rem (24-48px)
Internal Padding:  0.75rem - 1.5rem (12-24px)
Element Gaps:      0.5rem - 1.5rem (8-24px)

Border Radius:     16-20px (cards), 12px (smaller), 10px (inputs)
Border Width:      1.5px (main), 1px (secondary)

Max Width:         1400px
Responsive:        1200px (tablet), 768px (mobile)
```

### Icon Sizes

```
Category Header Icon:  50px × 50px
Sub-Score Header Icon: 40px × 40px
Solution List Icon:    16-20px

Ring Sizes:
Main Ring:  200px × 200px, stroke 8px
Sub-Ring:   80px × 80px, stroke 5px
```

---

## Animation Specifications

### Ring Animation

```
SVG Stroke-Dashoffset Animation:

Before Animation:
stroke-dasharray: 565px (or 251px)
stroke-dashoffset: 565px (or 251px)
  ↓ Invisible (offset equals array)

After Animation (starts):
stroke-dashoffset: calculated value
  ↓ Visible (offset < array)

Duration: 2 seconds (main), 1.5 seconds (sub)
Easing: cubic-bezier(0.4, 0, 0.2, 1)
  ↓ Fast start, slow end (natural deceleration)

Delay (staggered):
Accessibility: 0ms
Readability:   200ms
Attention:     400ms
```

### Card Hover Animation

```
From State:
border: 1.5px solid rgba(15,37,87,0.1)
box-shadow: 0 10px 40px rgba(15,37,87,0.08)
transform: translateY(0)

To State (on hover):
border: 1.5px solid rgba(15,37,87,0.2)
box-shadow: 0 6px 16px rgba(15,37,87,0.1)
transform: translateY(-2px)

Duration: 0.3 seconds
Easing: ease-in-out
Properties: all (smooth transition)
```

### Expand/Collapse Animation

```
Collapsed State:
max-height: 0
opacity: 0

Expanded State:
max-height: auto (calculated)
opacity: 1

Duration: 0.3 seconds
Easing: ease-in-out
```

---

## Responsive Breakpoints

### Desktop (1200px and up)
```
├── 3-column sub-scores
├── 2-column issue cards
├── 2-column main scores
├── Full padding (3rem)
└── Full font sizes
```

### Tablet (768px - 1199px)
```
├── 1-column sub-scores
├── 1-column issue cards
├── 1-column main scores
├── Medium padding (1.5rem)
└── Reduced font sizes
```

### Mobile (below 768px)
```
├── 1-column everything
├── 1-column issue cards
├── 1-column main scores
├── Small padding (1rem - 1.5rem)
└── Small font sizes
```

---

## Severity Indicators

### Icons & Colors

```
✓ Success (Green/Teal)
  Icon: CheckCircle
  Color: #14b8a6
  Message: "All clear"

⚠️ Critical (Red)
  Icon: AlertTriangle
  Color: #ef4444
  Message: "Needs immediate attention"

ℹ️ Info (Amber)
  Icon: AlertTriangle
  Color: #f59e0b
  Message: "Minor improvement needed"

ℹ️ Medium (Info icon)
  Icon: Info
  Color: #0ea5e9
  Message: "Consider improving"
```

---

## Interactive Elements

### Issue Card States

```
Default (Collapsed):
┌─────────────────────────────┐
│ ⚠️  Issue Title              │
│    Description...           │
│                             │
│ POINTS TO CHANGE            │
│ • Point 1                   │
│ • Point 2                   │
│                             │
│ [View Solutions ↓]          │
└─────────────────────────────┘

Hover:
└─ Border brightens
└─ Shadow increases
└─ Card lifts slightly (-2px)

Focused:
└─ Outline visible
└─ Colors enhanced

Expanded:
├─ Content height increases
├─ "View Solutions" becomes "Close"
├─ How to Fix section visible
├─ Best Practice section visible
└─ Content fades in smoothly
```

---

## Color Combinations

### Category-Specific Schemes

```
Accessibility:
├─ Icon Background: #14b8a6 (teal)
├─ Icon Dark: #0d9488 (darker teal)
├─ Ring Stroke: #14b8a6
├─ Primary: #0f2557 (navy)
└─ Text: rgba(15,37,87,0.6)

Readability:
├─ Icon Background: #3b82f6 (blue)
├─ Icon Dark: #2563eb (darker blue)
├─ Ring Stroke: #3b82f6
├─ Primary: #0f2557 (navy)
└─ Text: rgba(15,37,87,0.6)

Attention:
├─ Icon Background: #f59e0b (amber)
├─ Icon Dark: #d97706 (darker amber)
├─ Ring Stroke: #f59e0b
├─ Primary: #0f2557 (navy)
└─ Text: rgba(15,37,87,0.6)
```

---

## CSS Utility Reference

### Common CSS Classes

```css
/* Main containers */
.analysis-container
.main-scores-section
.category-container
.issue-point-card

/* Rings */
.overall-score-ring
.sub-score-ring
.ring-fill
.sub-ring-fill

/* Cards */
.sub-score-card
.issue-point-card

/* Content sections */
.points-box
.solution-section

/* Responsive */
@media (max-width: 1200px)
@media (max-width: 768px)
```

---

## Accessibility Checklist

```
Visual Elements:
✓ Contrast ratio 4.5:1 for text
✓ Icons paired with text labels
✓ Color not sole method of conveying info
✓ Focus states visible and clear

Interactive:
✓ Keyboard navigation supported
✓ Tab order logical
✓ Click targets at least 44×44px
✓ Touch targets adequately spaced

Motion:
✓ Animations can be disabled
✓ No flashing content (>3/sec)
✓ Auto-play disabled
✓ respects prefers-reduced-motion
```

---

## Print-Friendly Considerations

(If print functionality added):

```css
/* Hide interactive elements */
@media print {
  .expand-toggle { display: none; }
  .solution-section { display: block !important; }
}

/* Optimize colors for print */
@media print {
  background: white;
  color: black;
  box-shadow: none;
}
```

---

## Performance Tips

```
Optimization Areas:
✓ SVG rings - rendered client-side
✓ CSS animations - hardware accelerated
✓ No heavy JavaScript libraries
✓ Lazy load images if needed
✓ Fonts pre-load in HTML head

Measurement:
✓ First Paint: <1 second
✓ Largest Contentful Paint: <2.5 seconds
✓ Cumulative Layout Shift: <0.1
✓ Animation FPS: 60fps
```

---

**This visual reference guide serves as a single-source-of-truth for all design specifications, colors, typography, and component behaviors.**

Last Updated: April 13, 2026
