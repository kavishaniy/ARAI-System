# Dashboard & Sidebar Design Guide

## Visual Design System

### Color Palette
```
Primary Navy:     #0f2557  (Main text, borders, and accents)
Dark Navy:        #091840  (Hover states and gradient endpoint)
Light Navy:       #4a6090  (Secondary text)
Muted Navy:       rgba(15,37,87,0.5) (Muted text)
Warm Beige:       #f5f4f0 - #faf9f7 (Background gradient)
White:            #ffffff (Cards and surfaces)
```

### Typography
```
Font Family:      DM Sans (regular), DM Serif Display (headings)
Letter Spacing:   DM Sans uses natural spacing, -0.5px for logo

Sizes:
- Dashboard Title:    2.2rem, 400 weight, DM Serif Display
- Subtitle:          0.95rem, 300 weight, light
- Nav Labels:        0.9rem, 600 weight, bold
- Body Text:         0.95rem, 400 weight
- Small Text:        0.85rem, 500 weight
```

### Spacing Scale
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 20px
2xl: 24px
3xl: 32px
4xl: 40px
5xl: 48px
```

## Component Specifications

### Sidebar (Expanded: 200px, Collapsed: 72px)
```
Logo Section:
- Expanded: "ARAI" (serif, 1.8rem)
- Collapsed: "A" (serif, 1.4rem)
- Bottom margin: 32px (expanded) / 24px (collapsed)

Navigation Items:
- Size: 48x48px (icon only) or full width with label
- Icon size: 20x20px
- Gap between icon and label: 14px
- Padding: 0px 14px when expanded
- Border radius: 12px
- Hover: background 8% opacity, translateX(2px)
- Active: background 12% opacity, inset border, box-shadow

Sections:
- Main Nav: flex 1 with gap 6px
- Actions: separated by border-top (1px, 8% opacity)
- Bottom border-top padding: 16px top and bottom

Colors:
- Text: rgba(255,255,255,0.7) default
- Hover: rgba(255,255,255,0.95)
- Active: white
```

### Dashboard Header
```
Background: rgba(255,255,255,0.5) with backdrop blur(8px)
Padding: 48px 40px 24px (desktop) / 24px 16px 16px (mobile)
Border-bottom: 1px solid rgba(15,37,87,0.08)

Title Section:
- Max-width: 1200px
- Display: flex, space-between
- Gap: 24px

Title:
- Font: DM Serif Display, 2.2rem, 400 weight
- Color: #0f2557
- Line-height: 1.2
- Margin-bottom: 8px

Subtitle:
- Font: DM Sans, 0.95rem, 300 weight
- Color: rgba(15,37,87,0.6)
- Letter-spacing: 0.3px
```

### Dashboard Card (Main Content)
```
Background: white
Border: 1.5px solid rgba(15,37,87,0.12)
Border-radius: 16px
Padding: 32px (desktop) / 20px (mobile)
Box-shadow: 0 10px 40px rgba(15,37,87,0.06)
Max-width: 1200px
Transition: all 0.3s ease

Hover State:
- Border-color: rgba(15,37,87,0.2)
- Box-shadow: 0 15px 50px rgba(15,37,87,0.1)
```

### Buttons
```
Primary Button (New Analysis):
- Padding: 12px 24px
- Background: linear-gradient(135deg, #0f2557, #091840)
- Border: 1.5px solid #0f2557
- Border-radius: 10px
- Font: DM Sans, 0.95rem, 600 weight
- Cursor: pointer
- Transition: all 0.2s

Hover State:
- Background: linear-gradient(135deg, #091840, #051026)
- Box-shadow: 0 8px 24px rgba(15,37,87,0.15)
- Transform: translateY(-2px)
```

### Mobile Drawer
```
Position: fixed, inset 0
Width: 240px
Background: linear-gradient(180deg, #0f2557, #091840)
Animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)
Overlay: rgba(0,0,0,0.4) with 2px blur

Header:
- Padding: 16px 16px
- Border-bottom: 1px solid rgba(255,255,255,0.08)
- Display: flex, space-between

Content:
- Padding: 16px 12px
- Flex: 1
```

## Animations & Transitions

### Easing Functions
```
Default Easing: cubic-bezier(0.4, 0, 0.2, 1) [Smooth cubic]
Fast Easing: 0.2s [Button hovers]
Medium Easing: 0.25s [Nav items]
Slow Easing: 0.3s [Drawer animation]
```

### Hover Effects
1. **Nav Items**: 
   - Color fade: 0.25s
   - Translate X: +2px
   - Background: subtle highlight

2. **Buttons**:
   - All properties: 0.2s
   - Elevation: Y-axis -2px
   - Shadow increase

3. **Cards**:
   - Border color: 0.3s
   - Shadow expansion: 0.3s

## Responsive Breakpoints

### Mobile (< 768px)
- Sidebar: Hidden (drawer modal)
- Header: Sticky top bar with menu button
- Padding: Reduced to 16px-20px
- Font sizes: Reduced for smaller screens
- Card padding: 20px instead of 32px

### Tablet (768px - 1024px)
- Sidebar: Hidden
- Drawer navigation available
- Adjusted padding: 20px-24px

### Desktop (≥ 1025px)
- Sidebar: Always visible
- Collapsible with persist state
- Full padding: 40px+
- All animations active

## Accessibility Features

- ✓ Semantic HTML structure
- ✓ ARIA labels on buttons
- ✓ Sufficient color contrast
- ✓ Focus states on interactive elements
- ✓ Keyboard navigation support
- ✓ Touch targets ≥ 44px on mobile
- ✓ Screen reader friendly

## Performance Optimization

- Hardware-accelerated CSS animations
- Minimal JavaScript DOM manipulation
- Local storage for state persistence
- Backdrop-filter with fallbacks
- Efficient color system using CSS variables

## Browser Compatibility

- ✓ Chrome 90+
- ✓ Firefox 88+
- ✓ Safari 14+
- ✓ Edge 90+
- ✓ Mobile browsers (iOS Safari 14+, Chrome Android)

---

This design guide ensures consistency and provides developers with precise specifications for maintaining and extending the dashboard UI.
