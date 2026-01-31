# Accessibility Tab - Test Data & Troubleshooting

## Test Data That Works

Use this exact format to test the accessibility tab:

```json
{
  "accessibility": {
    "score": 45,
    "conformance_level": "AA",
    "issue_count": {
      "critical": 0,
      "high": 3,
      "medium": 2,
      "low": 1
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
          "Change background from #FFFFFF to #F0F0F0"
        ]
      },
      {
        "type": "Text Too Small",
        "severity": "medium",
        "location": "Footer navigation links",
        "description": "Font size below minimum requirement",
        "current_value": "12px",
        "required_value": "16px",
        "affected_count": "5"
      },
      {
        "type": "Touch Target Too Small",
        "severity": "medium",
        "location": "Delete icon button",
        "description": "Interactive element too small",
        "current_value": "32x32px",
        "required_value": "44x44px (WCAG 2.1 AA)"
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
        "type": "Missing Alt Text",
        "severity": "high",
        "location": "Product image (image_001.png)",
        "image_type": "Informative image",
        "current_value": "None",
        "suggestions": [
          "Blue running shoes with white sole, size 10",
          "Nike Air Max 2024 in cobalt blue"
        ]
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
          },
          {
            "title": "No Visual Focus Indicator",
            "field": "All form fields",
            "fix": "Add visible outline/border on :focus state"
          }
        ]
      }
    ]
  }
}
```

## Common Errors & Fixes

### Error 1: "Cannot read property 'toLowerCase' of undefined"
**Cause:** `issue.severity` is undefined or null  
**Fixed:** Added safety checks with `?.` operator and default values

### Error 2: Component not rendering
**Cause:** `issue` object is null or empty  
**Fixed:** Added `if (!issue) return null;` at the start of component

### Error 3: "Cannot read property 'map' of undefined"
**Cause:** `accessibility.issues` is undefined  
**Fixed:** Using optional chaining `accessibility?.issues`

## Required Fields (Minimum)

Each accessibility issue **must** have:
```json
{
  "type": "Low Contrast",
  "severity": "high",
  "description": "Brief description"
}
```

Optional fields enhance the display but aren't required.

## Issue Type Detection

The component detects issue types by checking if `type` contains these keywords:

| Keyword | Display Type |
|---------|--------------|
| `contrast` | Color Contrast Card |
| `text` + `small` or `size` | Text Size Card |
| `touch` or `target` or `button` | Touch Target Card |
| `alt` or `image` | Missing Alt Text Card |
| `form` or `label` or `input` | Form Accessibility Card |
| `color` + `vision` or `deficiency` or `blind` | CVD Card |
| (none match) | Generic Issue Card |

## Testing Steps

### 1. Test with Empty Issues
```json
{
  "accessibility": {
    "score": 100,
    "issues": []
  }
}
```
**Expected:** Shows "Great Job! No accessibility issues found"

### 2. Test with One Issue
```json
{
  "accessibility": {
    "score": 80,
    "issues": [
      {
        "type": "Low Contrast",
        "severity": "high",
        "location": "Submit Button",
        "current_value": "2.8:1",
        "required_value": "4.5:1"
      }
    ]
  }
}
```
**Expected:** Shows color contrast card

### 3. Test with All Issue Types
Use the complete test data above  
**Expected:** Shows 6 different issue cards

### 4. Test with Missing Fields
```json
{
  "accessibility": {
    "issues": [
      {
        "type": "Generic Issue",
        "description": "Something is wrong"
      }
    ]
  }
}
```
**Expected:** Shows generic issue card with defaults

## Debugging Checklist

- [ ] Check browser console for errors
- [ ] Verify `accessibility.issues` is an array
- [ ] Verify each issue has `type` field
- [ ] Check `severity` is one of: "critical", "high", "medium", "low"
- [ ] Ensure strings are properly escaped in JSON
- [ ] Check network tab for API response format
- [ ] Verify component is receiving props correctly

## Safety Features Added

1. ✅ **Null checks** - Component returns null if no issue
2. ✅ **Optional chaining** - `issue.severity?.toLowerCase()`
3. ✅ **Default values** - Shows "Medium" if severity missing
4. ✅ **Fallback display** - Generic card for unknown types
5. ✅ **Empty state** - "No issues found" message
6. ✅ **Capitalization safety** - Handles any case for severity

## Frontend Code Changes

Added these safety checks:

```javascript
// At the start of component
if (!issue) {
  return null;
}

// In severity display
{issue.severity ? 
  issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1).toLowerCase() 
  : 'Medium'}

// In switch statements
switch (issue.severity?.toLowerCase()) {
  // ...
}
```

## Still Getting Errors?

If you're still seeing errors, please provide:

1. **Exact error message** from browser console
2. **Sample data** you're sending to the component
3. **Which tab** causes the error (Accessibility tab specifically)
4. **Browser** and version you're using

The component is now **bulletproof** with proper error handling! 🛡️
