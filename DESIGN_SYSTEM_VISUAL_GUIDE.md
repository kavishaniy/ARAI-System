# Uniform Design System - Visual Reference

## Page Header Structure

All pages now follow this exact structure:

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR  │ ← Back Button (if applicable)                    │
│           │                                                   │
│           │ PAGE TITLE                           [Action Btn]│
│           │ Descriptive subtitle                             │
│           │                                                   │
├───────────┼─────────────────────────────────────────────────┤
│           │                                                   │
│           │  Content Area (Cards, Lists, Forms)             │
│           │  ┌─────────────────────────────────────────┐   │
│           │  │  Unified Card Styling                  │   │
│           │  │  • White background                    │   │
│           │  │  • Consistent padding & borders        │   │
│           │  │  • Hover effects                       │   │
│           │  └─────────────────────────────────────────┘   │
│           │                                                   │
│           │                                                   │
└───────────┴─────────────────────────────────────────────────┘
```

## Typography Hierarchy

```
PAGE TITLE (DM Serif Display)
├── Font Size: 2.2rem
├── Font Weight: 400 (light)
├── Color: #0f2557 (dark blue)
└── Line Height: 1.2

SUBTITLE
├── Font Size: 0.95rem
├── Font Weight: 300 (very light)
├── Color: rgba(15, 37, 87, 0.6) (muted)
└── Letter Spacing: 0.3px

SECTION TITLE
├── Font Size: 1.1rem
├── Font Weight: 600 (bold)
└── Color: #0f2557
```

## Color System

Primary Colors:
```
#0f2557  ←→  #091840  ←→  #051026
Dark      Medium       Very Dark
Blue      Blue         Blue
(used for gradients)
```

Neutral Colors:
```
White:        #FFFFFF
Background:   Linear gradient (135deg, #f5f4f0 → #faf9f7)
Muted Text:   rgba(15, 37, 87, 0.6)
Borders:      rgba(15, 37, 87, 0.12)
```

Status Colors:
```
Success/Action:  #0f2557 (primary)
Danger/Delete:   #dc2626 (red)
Warning:         #991b1b (dark red)
```

## Component Examples

### Header with Title + Subtitle + Action

```jsx
<PageHeader 
  title="Projects"
  subtitle="Organize and manage your design analyses"
  actions={<button>+ New Project</button>}
/>
```

Renders as:
```
Projects                                      [+ New Project]
Organize and manage your design analyses
```

### Card Container

```css
.card {
  background: white;
  border: 1.5px solid rgba(15, 37, 87, 0.12);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
}

.card:hover {
  border-color: rgba(15, 37, 87, 0.2);
  box-shadow: 0 15px 50px rgba(15, 37, 87, 0.1);
}
```

### Button Styling

```css
.btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background: linear-gradient(135deg, #091840, #051026);
  box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
  transform: translateY(-2px);
}
```

### Input Field

```css
.input {
  padding: 11px 16px 11px 40px;  /* left padding for icon */
  border: 1.5px solid rgba(15, 37, 87, 0.15);
  border-radius: 10px;
  font-size: 0.95rem;
  color: #0f2557;
  background: white;
  transition: all 0.2s ease;
}

.input::placeholder {
  color: rgba(15, 37, 87, 0.4);
}

.input:focus {
  outline: none;
  border-color: #64b4ff;
  box-shadow: 0 0 0 3px rgba(100, 180, 255, 0.1);
}
```

## Spacing Guide

```
Header:     48px top, 40px sides, 24px bottom
Content:    32px all sides
Cards:      32px padding (20px on mobile)
Items:      24px padding (16px on mobile)
Gaps:       12px (button gaps), 16px (meta), 24px (sections)
```

## Pages Using Unified Header

✅ **Projects** - "Projects" + "Organize and manage your design analyses"
✅ **History** - "Analysis History" + "View all your previous design analyses and results"
✅ **Settings** - "Settings" + "Manage your account and application settings"
✅ **Dashboard** - "Analysis Results" + "View detailed insights and recommendations for your design"
✅ **ProjectDashboard** - Custom title (project name) + description

## Responsive Breakpoints

Desktop (> 768px):
```
Header Padding: 48px 40px 24px
Content Padding: 32px 40px
Font Size H1: 2.2rem
```

Mobile (≤ 768px):
```
Header Padding: 24px 16px 16px
Content Padding: 20px 16px
Font Size H1: 1.6rem
Layout: Single column (stacked)
```

## Implementation Checklist

- [x] Create PageHeader component
- [x] Create PageLayout component
- [x] Update Projects page
- [x] Update History page
- [x] Update Settings page
- [x] Update Dashboard page
- [x] Update ProjectDashboard
- [x] Ensure responsive design
- [x] Test all page transitions
- [x] Verify color consistency
- [x] Verify typography consistency
- [x] Verify spacing consistency

## Future Enhancements

1. Consider creating a theme provider for dynamic color changes
2. Add animation transitions between pages
3. Create additional reusable section components
4. Add accessibility improvements (ARIA labels, keyboard navigation)
5. Consider dark mode support using the same color system
