# Uniform Design System - Quick Reference

## Summary
All pages and sections now have **identical title styling, positioning, and theme**.

## Key Changes Made

| Page | Title | Subtitle | Actions |
|------|-------|----------|---------|
| **Projects** | "Projects" | "Organize and manage your design analyses" | Search + New Project |
| **History** | "Analysis History" | "View all your previous design analyses" | Search |
| **Settings** | "Settings" | "Manage your account and application settings" | None |
| **Dashboard** | "Analysis Results" | "View detailed insights and recommendations" | New Analysis |
| **ProjectDashboard** | Project Name | Project Description | Back + Edit/Delete |

## Unified Elements

### 1. **Title Styling**
```
Font Family:  'DM Serif Display', serif
Font Size:    2.2rem
Font Weight:  400 (light)
Color:        #0f2557
Line Height:  1.2
Margin:       0 0 8px 0
```

### 2. **Subtitle Styling**
```
Font Size:     0.95rem
Font Weight:   300 (very light)
Color:         rgba(15, 37, 87, 0.6)
Letter Space:  0.3px
Margin:        0
```

### 3. **Header Layout**
```
Padding:       48px 40px 24px
Background:    rgba(255, 255, 255, 0.5) + blur(8px)
Border Bottom: 1px solid rgba(15, 37, 87, 0.08)
Max Width:     1200px (centered)
```

### 4. **Content Area**
```
Background:    Linear gradient(135deg, #f5f4f0, #faf9f7)
Padding:       32px 40px
Max Width:     1200px (centered)
```

### 5. **Card Styling**
```
Background:    white
Border:        1.5px solid rgba(15, 37, 87, 0.12)
Border Radius: 16px
Padding:       32px
Shadow:        0 10px 40px rgba(15, 37, 87, 0.06)
Hover Shadow:  0 15px 50px rgba(15, 37, 87, 0.1)
```

## Components Used

### PageHeader (NEW)
```jsx
import PageHeader from '../Common/PageHeader';

<PageHeader 
  title="Page Title"
  subtitle="Optional descriptive text"
  actions={<button>Action Button</button>}
/>
```

**Features:**
- Consistent title positioning and styling
- Optional subtitle support
- Right-aligned action area
- Responsive design
- Backdrop blur effect

### PageLayout (NEW)
```jsx
import PageLayout from '../Common/PageLayout';

<PageLayout>
  <Sidebar />
  <main>...</main>
</PageLayout>
```

**Features:**
- Unified background gradient
- Consistent card styling
- Responsive padding
- Center content alignment

## Responsive Design

| Breakpoint | Changes |
|------------|---------|
| Desktop | 48px header padding, 32px content padding, 2.2rem titles |
| Mobile | 24px header padding, 20px content padding, 1.6rem titles |

## Color Palette

| Color | Usage | Code |
|-------|-------|------|
| Dark Blue | Primary text & buttons | `#0f2557` |
| Darker Blue | Button hover | `#091840` |
| Very Dark Blue | Button active | `#051026` |
| Muted Text | Subtitles & meta | `rgba(15, 37, 87, 0.6)` |
| Border | Card & input borders | `rgba(15, 37, 87, 0.12)` |
| Light Gray | Background | `#f5f4f0` to `#faf9f7` |

## File Locations

**Components:**
- `/frontend/src/components/Common/PageHeader.jsx` ← Use for all page titles
- `/frontend/src/components/Common/PageLayout.jsx` ← Use for consistent layout

**Pages Updated:**
- `/frontend/src/components/Pages/Projects.jsx`
- `/frontend/src/components/Pages/HistoryPage.jsx`
- `/frontend/src/components/Pages/Settings.jsx`
- `/frontend/src/components/Dashboard/Dashboard.jsx`
- `/frontend/src/components/Pages/ProjectDashboard.jsx`

## How to Use for New Pages

```jsx
import PageHeader from '../Common/PageHeader';

const NewPage = () => {
  return (
    <div className="page-shell">
      <Sidebar />
      <main className="page-container">
        <PageHeader 
          title="Your Page Title"
          subtitle="Optional subtitle"
          actions={<button>Action</button>}
        />
        
        <div className="page-main">
          <div className="page-content">
            {/* Your content in cards */}
            <div className="page-card">
              {/* Content */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
```

## Common Issues & Solutions

**Issue:** Title doesn't look consistent
- **Solution:** Use the PageHeader component instead of custom headers

**Issue:** Card styling looks different
- **Solution:** Use the `.page-card` class or import `PageLayout`

**Issue:** Spacing looks off on mobile
- **Solution:** The responsive breakpoint at 768px adjusts all spacing automatically

**Issue:** Colors don't match
- **Solution:** Always use the color values from the palette above

## Testing Checklist

- [ ] All pages show consistent title styling
- [ ] All subtitles are positioned correctly
- [ ] All cards have the same shadow and border
- [ ] Hover effects work on all buttons
- [ ] Mobile responsive behavior works
- [ ] Colors match the palette
- [ ] Spacing is consistent across pages
- [ ] Transitions between pages are smooth

## Version History

- **v1.0** (2024) - Initial unified design system implementation
  - Created PageHeader component
  - Created PageLayout component
  - Updated 5 main pages
  - Established color and typography standards
