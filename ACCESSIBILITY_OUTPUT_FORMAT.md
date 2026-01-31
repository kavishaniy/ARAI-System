# Accessibility Analysis Output Format Guide

## Overview
This guide shows the **exact format** the backend should return for each accessibility issue type. The UI will automatically display them in a clear, easy-to-understand format.

---

## A. Color Contrast Issues

### Backend JSON Format:
```json
{
  "type": "Low Contrast",
  "severity": "high",
  "location": "Button 'Sign Up' (coordinates: 450px, 320px)",
  "description": "Text-to-background contrast ratio below minimum requirements",
  "current_value": "2.8:1",
  "required_value": "4.5:1 (normal text) or 3:1 (large text)",
  "current_color": "#777777",
  "suggested_color": "#595959",
  "before_value": "2.8:1",
  "after_value": "4.5:1",
  "fixes": [
    "Change text color from #777777 to #595959",
    "OR change background from #FFFFFF to #F0F0F0"
  ],
  "wcag_criterion": "1.4.3"
}
```

### User Will See:
```
❌ Low Contrast Detected
Location: Button 'Sign Up' (coordinates: 450px, 320px)
Severity: High

Current Ratio: 2.8:1
Required: 4.5:1 (normal text) or 3:1 (large text)

💡 Suggested Fix:
- Change text color from #777777 to #595959
- OR change background from #FFFFFF to #F0F0F0

Preview: [Before: 2.8:1] [After: 4.5:1]
```

---

## B. Text Size Issues

### Backend JSON Format:
```json
{
  "type": "Text Too Small",
  "severity": "medium",
  "location": "Footer navigation links",
  "description": "Font size below minimum requirement",
  "current_value": "12px",
  "required_value": "16px",
  "affected_count": "5",
  "recommendation": "Increase font size to 16px minimum. Consider using 14px only for labels/captions."
}
```

### User Will See:
```
⚠️ Text Too Small
Location: Footer navigation links
Affected Elements: 5 element(s)

Current Size: 12px
Minimum Required: 16px

💡 Action Required:
- Increase font size to 16px minimum
- Consider using 14px only for labels/captions
```

---

## C. Touch Target Size Issues

### Backend JSON Format:
```json
{
  "type": "Touch Target Too Small",
  "severity": "medium",
  "location": "Delete icon button",
  "description": "Interactive element too small for comfortable mobile interaction",
  "current_value": "32x32px",
  "required_value": "44x44px (WCAG 2.1 AA)",
  "recommendation": "Increase button size or add padding to meet minimum touch target requirements",
  "wcag_criterion": "2.5.5"
}
```

### User Will See:
```
❌ Touch Target Too Small
Element: Delete icon button
Severity: Medium

Current Size: 32x32px
Minimum Required: 44x44px (WCAG 2.1 AA)

💡 Fix Options:
1. Increase button padding
2. Add invisible touch area around icon
3. Increase icon size itself
```

---

## D. Color Vision Deficiency Issues

### Backend JSON Format:
```json
{
  "type": "Color Vision Deficiency Issue",
  "severity": "medium",
  "description": "Error states shown only in red color",
  "affected_percentage": "8% of males",
  "condition": "deuteranopia",
  "simulations": true,
  "recommendation": "Add icons and text labels in addition to color coding"
}
```

### User Will See:
```
⚠️ Color Dependency Issue
Problem: Error states shown only in red color
Affected Users: 8% of males (deuteranopia)

Simulation Views:
[Normal Vision] [Protanopia]
[Deuteranopia]  [Tritanopia]

💡 Recommendations:
✓ Add error icon (not just color)
✓ Add underline or border
✓ Include text label "Error" or "Invalid"
```

---

## E. Missing Alt Text

### Backend JSON Format:
```json
{
  "type": "Missing Alt Text",
  "severity": "high",
  "location": "Product image (image_001.png)",
  "image_type": "Informative image",
  "current_value": "None",
  "suggestions": [
    "Blue running shoes with white sole, size 10",
    "Nike Air Max 2024 in cobalt blue"
  ],
  "wcag_criterion": "1.1.1"
}
```

### User Will See:
```
❌ Missing Alternative Text
Element: Product image (image_001.png)
Type: Informative image

Current Alt Text: None

💡 Suggested Alt Text Examples:
- "Blue running shoes with white sole, size 10"
- "Nike Air Max 2024 in cobalt blue"

If decorative only: alt=""
```

---

## F. Form Accessibility Issues

### Backend JSON Format:
```json
{
  "type": "Form Accessibility Issues",
  "severity": "high",
  "description": "Multiple form accessibility issues detected",
  "sub_issues": [
    {
      "title": "Missing Label",
      "field": "Email input",
      "fix": "Associate <label> with input using 'for' attribute"
    },
    {
      "title": "Unclear Error Message",
      "field": "Email validation",
      "fix": "Change from 'Invalid input' to 'Please enter a valid email address (example@domain.com)'"
    },
    {
      "title": "No Visual Focus Indicator",
      "field": "All form fields",
      "fix": "Add visible outline/border on :focus state"
    }
  ]
}
```

### User Will See:
```
⚠️ Form Accessibility Issues Found: 3

Issue 1: Missing Label
Field: Email input
Fix: Associate <label> with input using 'for' attribute

Issue 2: Unclear Error Message
Field: Email validation
Fix: Change from 'Invalid input' to 'Please enter a valid email address (example@domain.com)'

Issue 3: No Visual Focus Indicator
Field: All form fields
Fix: Add visible outline/border on :focus state
```

---

## Complete Example Response

```json
{
  "arai_score": 62,
  "overall_grade": "C",
  "conformance_level": "AA",
  "accessibility": {
    "score": 45,
    "conformance_level": "A",
    "issue_count": {
      "critical": 2,
      "high": 5,
      "medium": 8,
      "low": 3
    },
    "issues": [
      {
        "type": "Low Contrast",
        "severity": "high",
        "location": "Button 'Sign Up' (coordinates: 450px, 320px)",
        "description": "Text-to-background contrast ratio below minimum requirements",
        "current_value": "2.8:1",
        "required_value": "4.5:1 (normal text) or 3:1 (large text)",
        "current_color": "#777777",
        "suggested_color": "#595959",
        "before_value": "2.8:1",
        "after_value": "4.5:1",
        "fixes": [
          "Change text color from #777777 to #595959",
          "OR change background from #FFFFFF to #F0F0F0"
        ],
        "wcag_criterion": "1.4.3"
      },
      {
        "type": "Text Too Small",
        "severity": "medium",
        "location": "Footer navigation links",
        "description": "Font size below minimum requirement",
        "current_value": "12px",
        "required_value": "16px",
        "affected_count": "5",
        "recommendation": "Increase font size to 16px minimum"
      },
      {
        "type": "Touch Target Too Small",
        "severity": "medium",
        "location": "Delete icon button",
        "description": "Interactive element too small",
        "current_value": "32x32px",
        "required_value": "44x44px (WCAG 2.1 AA)",
        "wcag_criterion": "2.5.5"
      },
      {
        "type": "Missing Alt Text",
        "severity": "high",
        "location": "Product image (image_001.png)",
        "image_type": "Informative image",
        "current_value": "None",
        "suggestions": [
          "Blue running shoes with white sole, size 10",
          "Nike Air Max 2024 in cobalt blue"
        ],
        "wcag_criterion": "1.1.1"
      },
      {
        "type": "Color Vision Deficiency Issue",
        "severity": "medium",
        "description": "Error states shown only in red color",
        "affected_percentage": "8% of males",
        "condition": "deuteranopia",
        "simulations": true
      },
      {
        "type": "Form Accessibility Issues",
        "severity": "high",
        "description": "Multiple form accessibility issues detected",
        "sub_issues": [
          {
            "title": "Missing Label",
            "field": "Email input",
            "fix": "Associate <label> with input using 'for' attribute"
          },
          {
            "title": "Unclear Error Message",
            "field": "Email validation",
            "fix": "Change 'Invalid input' to 'Please enter a valid email address (example@domain.com)'"
          }
        ]
      }
    ]
  }
}
```

---

## Key Points for Backend Developers

### Required Fields (All Issue Types):
- `type` - Issue type (matches the check categories)
- `severity` - "critical", "high", "medium", or "low"
- `description` - Brief explanation of the issue
- `location` - Where the issue occurs (optional but recommended)

### Optional Fields (Enhance User Experience):
- `current_value` - Current measurement/value
- `required_value` - What it should be
- `recommendation` - Specific fix instructions
- `wcag_criterion` - WCAG reference (e.g., "1.4.3")
- `before_value` / `after_value` - For visual comparisons
- `fixes` - Array of fix options
- `suggestions` - Array of suggestions (for alt text)
- `sub_issues` - Array of related issues (for forms)

### Issue Type Detection:
The frontend automatically detects issue types by checking if the `type` field contains these keywords:

- **Contrast** → Color Contrast display
- **Text + (Size OR Small)** → Text Size display
- **Touch OR Target OR Button** → Touch Target display
- **Alt OR Image** → Missing Alt Text display
- **Form OR Label OR Input** → Form Accessibility display
- **Color + (Vision OR Deficiency OR Blind)** → CVD display
- **Default** → Generic issue display

### Severity Levels:
- **critical/high** → Red (❌) - Fix immediately
- **medium** → Yellow (⚠️) - Fix soon
- **low** → Blue (ℹ️) - Consider fixing

---

## Testing Your Backend Output

### Test Payload:
Send this to your frontend to test all issue types:

```json
{
  "accessibility": {
    "score": 45,
    "issues": [
      {"type": "Low Contrast", "severity": "high", "location": "Submit Button", "current_value": "2.8:1", "required_value": "4.5:1"},
      {"type": "Text Too Small", "severity": "medium", "location": "Footer", "current_value": "12px", "required_value": "16px"},
      {"type": "Touch Target Too Small", "severity": "medium", "location": "Icon Button", "current_value": "32x32px", "required_value": "44x44px"},
      {"type": "Missing Alt Text", "severity": "high", "location": "Hero Image", "current_value": "None"},
      {"type": "Color Vision Deficiency Issue", "severity": "medium", "description": "Error shown only in red"},
      {"type": "Form Accessibility Issues", "severity": "high", "sub_issues": [{"title": "Missing Label", "field": "Email", "fix": "Add label"}]}
    ]
  }
}
```

---

## Benefits of This Format

1. ✅ **Clear & Scannable** - Visual hierarchy with icons and colors
2. ✅ **Actionable** - Every issue has specific fix instructions
3. ✅ **Professional** - Clean, organized presentation
4. ✅ **Expandable** - Users can drill down for more details
5. ✅ **WCAG Compliant** - References included where applicable
6. ✅ **Easy to Understand** - No technical jargon, plain language

---

This format makes accessibility issues **immediately understandable** for designers of all skill levels!
