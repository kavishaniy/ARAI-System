# Analysis Page Design Guide

## Before & After Comparison

### Before
- Basic white background with simple cards
- Tab-based navigation
- Lack of visual hierarchy
- No animated scoring system
- Generic styling

### After
- Elegant gradient background (matching auth pages)
- Integrated scoring system with animated rings
- Clear visual hierarchy with typography and spacing
- Point-based improvement guidance for each issue
- Premium, cohesive design language

---

## Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ANALYSIS REPORT HEADER                         │
│  Design Name | Analyzed on [Date]                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   ORIGINAL DESIGN PREVIEW CARD                       │
│                                                                      │
│                       [Uploaded Image]                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

                    DESIGN ANALYSIS RESULTS

┌─────────────────────────────────────────────────────────────────────┐
│                    MAIN SCORES SECTION                               │
│  ┌──────────────────────────┐  ┌─────────────────────────────────┐ │
│  │   Overall Information    │  │   Overall ARAI Score Ring       │ │
│  │                          │  │                                 │ │
│  │ • One score, three       │  │          ○ ═══════             │ │
│  │   dimensions             │  │         / \  85.5              │ │
│  │ • Accessibility,         │  │        /   \  Grade A          │ │
│  │   Readability,           │  │       \   /                    │ │
│  │   Attention              │  │        \ /                     │ │
│  │                          │  │         ○                      │ │
│  │ ┌────────────────────┐   │  └─────────────────────────────────┘ │
│  │ │ Sub-Scores Cards   │   │                                      │
│  │ ├────────────────────┤   │                                      │
│  │ │ 🎯 Accessibility  │   │                                      │
│  │ │     78.5%          │   │                                      │
│  │ └────────────────────┘   │                                      │
│  │ ┌────────────────────┐   │                                      │
│  │ │ 📈 Readability     │   │                                      │
│  │ │     91.2%          │   │                                      │
│  │ └────────────────────┘   │                                      │
│  │ ┌────────────────────┐   │                                      │
│  │ │ ⚡ Attention       │   │                                      │
│  │ │     76.8%          │   │                                      │
│  │ └────────────────────┘   │                                      │
│  └──────────────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   ACCESSIBILITY ANALYSIS                             │
│  🎯 Accessibility Analysis                Score: 78.5               │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │ ⚠️ Issue 1     │  │ ⚠️ Issue 2     │  │ ✓ Issue 3      │        │
│  │ Description    │  │ Description    │  │ Description    │        │
│  │                │  │                │  │                │        │
│  │ ┌────────────┐ │  │ ┌────────────┐ │  │ ┌────────────┐ │        │
│  │ │ POINTS TO  │ │  │ │ POINTS TO  │ │  │ │ POINTS TO  │ │        │
│  │ │ CHANGE     │ │  │ │ CHANGE     │ │  │ │ CHANGE     │ │        │
│  │ │ Specific   │ │  │ │ Specific   │ │  │ │ Specific   │ │        │
│  │ │ fixes...   │ │  │ │ fixes...   │ │  │ │ fixes...   │ │        │
│  │ └────────────┘ │  │ └────────────┘ │  │ └────────────┘ │        │
│  │                │  │                │  │                │        │
│  │ [View Solutions] │  │ [View Solutions] │  │ [View Solutions] │    │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                      │
│  When Expanded:                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ 💡 HOW TO FIX                                                  ││
│  │ → Step 1: ...                                                  ││
│  │ → Step 2: ...                                                  ││
│  │ → Step 3: ...                                                  ││
│  │                                                                ││
│  │ ⚡ BEST PRACTICE                                               ││
│  │ Description of best practices for accessibility...             ││
│  └────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    READABILITY ANALYSIS                              │
│  📈 Readability Analysis                 Score: 91.2                │
│                                                                      │
│  [Issue Point Cards with Same Structure]                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  VISUAL ATTENTION ANALYSIS                           │
│  ⚡ Visual Attention Analysis             Score: 76.8               │
│                                                                      │
│  [Issue Point Cards with Same Structure]                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Color System

### Primary Colors
- **Navy Dark** (#0f2557): Main text, headers, primary actions
- **Navy Darker** (#091840): Hover states, secondary backgrounds

### Secondary Colors
- **Teal** (#14b8a6): Accessibility category
- **Blue** (#3b82f6): Readability category  
- **Amber** (#f59e0b): Visual Attention category

### Neutral Colors
- **Light Beige** (#f5f4f0): Main background start
- **Off-White** (#faf9f7): Main background end
- **White** (#ffffff): Cards, overlays
- **Gray Transparent** (rgba(15,37,87,0.15)): Borders, dividers

---

## Typography Scale

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Page Title | DM Serif Display | 2.5rem | 400 | #0f2557 |
| Section Title | DM Serif Display | 1.8-2.2rem | 400 | #0f2557 |
| Card Header | DM Serif Display | 1.5rem | 400 | #0f2557 |
| Card Title | DM Sans | 1.05rem | 600 | #0f2557 |
| Body Text | DM Sans | 0.95rem | 300/400 | rgba(15,37,87,0.6) |
| Small Text | DM Sans | 0.85-0.9rem | 400 | rgba(15,37,87,0.5) |
| Label Text | DM Sans | 0.75rem | 600 | rgba(15,37,87,0.5) |

---

## Key Components

### 1. Score Rings

#### Main Ring (Overall ARAI Score)
- **Size**: 200px × 200px
- **Stroke Width**: 8px
- **Circumference**: ~565px (2π × 90 radius)
- **Animation**: 2 second cubic-bezier easing
- **Gradient**: Navy to Teal gradient

#### Sub-Rings (Category Scores)
- **Size**: 80px × 80px
- **Stroke Width**: 5px
- **Circumference**: ~251px (2π × 40 radius)
- **Animation**: Staggered (0ms, 200ms, 400ms delays)
- **Colors**: Category-specific (teal, blue, amber)

### 2. Issue Point Cards

**Expanded State Features:**
- Severity icon (checkmark, warning, info)
- Issue title and description
- **Points to Change box** (highlighted section)
- Expandable "How to Fix" section with bullet points
- Expandable "Best Practice" section
- Toggle indicators (chevron icons)

**Interactive States:**
- Default: Collapsed with "View Solutions" indicator
- Hover: Slight lift with shadow increase
- Expanded: Shows full content with "Close Details" indicator

### 3. Category Section Headers

**Layout:**
```
[Category Icon] | Category Name
                | Score: XX.X
```

**Icons:**
- Accessibility: Target icon, Teal gradient background
- Readability: TrendingUp icon, Blue gradient background
- Attention: Zap icon, Amber gradient background

---

## Spacing & Layout Rules

### Padding
- Page container: 3rem (outer), 2rem (responsive)
- Card sections: 3rem (desktop), 1.5rem (mobile)
- Card content: 1.5rem interior padding
- Issue point cards: 1.5rem (desktop), 1.25rem (mobile)

### Gaps
- Main sections: 3rem vertical spacing
- Sub-scores grid: 1.5rem
- Issue cards grid: 1.5rem
- Solution list items: 0.5rem

### Responsive Breakpoints
- **Desktop**: 1200px+ (3-column grids)
- **Tablet**: 768px - 1199px (1-column layout for some)
- **Mobile**: <768px (full single column, adjusted fonts)

---

## Animation Details

### Ring Animation
```css
stroke-dashoffset: 2s cubic-bezier(0.4, 0, 0.2, 1)
```

**Stroke-Dashoffset Calculation:**
```javascript
// For overall ring (circumference = 565px)
strokeDashoffset = 565 * (1 - (score / 100))

// For sub-rings (circumference = 251px)
strokeDashoffset = 251 * (1 - (score / 100))
```

### Card Hover Animation
```css
transition: all 0.3s
border-color: transitions to darker
box-shadow: increases
transform: translateY(-2px) /* subtle lift */
```

### Expand/Collapse Animation
- Smooth height transition
- Opacity fade for content
- Chevron icon rotation (if implemented)

---

## Responsive Design Examples

### Desktop (1200px+)
- Sub-scores: 3-column grid
- Issue cards: 2-column grid (repeat(auto-fit, minmax(500px, 1fr)))
- Main score section: 2-column (left: info, right: ring)

### Tablet (768px - 1199px)
- Sub-scores: 1-column stack
- Issue cards: 1-column stack
- Reduced padding and font sizes

### Mobile (<768px)
- Header text: Reduced from 2.5rem to 1.6rem
- All content: Single column
- Cards: Reduced padding (1.25rem)
- Touch-friendly spacing increased

---

## Data Integration Notes

### Expected Backend Response Format

```javascript
{
  // Overall Score
  arai_score: 85.5,                    // 0-100
  overall_grade: 'A',                  // A, B, C, D
  
  // Breakdown Scores
  arai_breakdown: {
    accessibility: 78.5,
    readability: 91.2,
    attention: 76.8
  },
  
  // Detailed Analysis by Category
  accessibility: {
    score: 78.5,
    issues: [
      {
        title: "Color Contrast Issue",
        description: "Text contrast ratio is below WCAG AA standard",
        severity: "critical",
        improvement_points: "Increase contrast between text and background from 3.5:1 to at least 4.5:1",
        how_to_fix: [
          "Use darker text color (#333 instead of current #666)",
          "Or use lighter background color",
          "Test with WCAG contrast checker"
        ],
        best_practice: "Maintain at least 4.5:1 contrast for normal text, 3:1 for large text"
      }
      // ... more issues
    ]
  },
  
  readability: { /* same structure */ },
  attention: { /* same structure */ }
}
```

### Key Fields for UI

| Field | Used For | Format |
|-------|----------|--------|
| `arai_score` | Main ring score | Number 0-100 |
| `overall_grade` | Grade letter below score | 'A', 'B', 'C', 'D' |
| `improvement_points` | **Points to Change box** | String or list |
| `how_to_fix` | Expandable solutions | String or array |
| `best_practice` | Best practice section | String |
| `severity` | Icon type | 'success', 'critical', 'high', 'medium' |

---

## Accessibility Considerations

- ✅ Semantic HTML structure
- ✅ Color contrast ratios meet WCAG AA
- ✅ Interactive elements have clear focus states
- ✅ Animations respect prefers-reduced-motion
- ✅ Icons paired with text labels
- ✅ Expandable sections have clear indicators
- ✅ Loading and error states clearly communicated

---

## Browser Testing Checklist

- [ ] Chrome/Edge (Windows)
- [ ] Firefox (Windows)
- [ ] Safari (macOS)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Tablet views (iPad, Android tablets)
- [ ] Print styles (if applicable)
- [ ] Dark mode (if applicable)

---

## Performance Metrics

- **Page Load**: <2 seconds
- **Animation FPS**: 60fps (hardware accelerated transforms)
- **Ring Animation**: 2 seconds (smooth easing)
- **Interactive Delay**: <100ms
- **Responsive Layout Shift**: Minimal (<0.05 CLS)

---

## Future Enhancement Ideas

1. **PDF Export**: Generate printable reports
2. **Comparison Mode**: Compare multiple designs side-by-side
3. **Historical Trends**: Show score improvements over time
4. **AI Suggestions**: Auto-generated fixes using backend ML
5. **Sharing**: Generate shareable links for client reviews
6. **Dark Mode**: Support for dark theme preference
7. **Video Tutorials**: Embedded guides for fixing issues
8. **Batch Analysis**: Upload multiple designs at once

---

**Last Updated**: April 13, 2026  
**Version**: 1.0.0
