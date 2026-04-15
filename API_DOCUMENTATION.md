# ARAI API Documentation: Multiple Design Analysis

## Overview
This document describes the new API endpoints for analyzing multiple design images and Figma projects.

---

## Endpoint 1: Analyze Figma Screens

### URL
```
POST /api/v1/analysis/figma-screens
```

### Authentication
**Required:** Bearer token in Authorization header
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "figma_url": "https://www.figma.com/file/abc123/ProjectName",
  "figma_token": "optional_token"
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `figma_url` | string | ✓ | Full Figma file URL (must contain `/file/`) |
| `figma_token` | string | ✗ | Optional Figma API token (uses env var if not provided) |

### Response (Success)
**Status:** 200 OK

```json
{
  "analyses": [
    {
      "designName": "Page Name - Screen Name",
      "fileName": "Project File Name",
      "araiScore": 75.5,
      "accessibilityScore": 80.0,
      "readabilityScore": 72.0,
      "attentionScore": 74.0,
      "timestamp": "2026-04-15T10:30:00.000000",
      "analysisId": "550e8400-e29b-41d4-a716-446655440000",
      "issues": [
        {
          "severity": "high",
          "category": "Accessibility",
          "issue": "Text 'Label' has contrast ratio 3.5:1, minimum is 4.5:1",
          "recommendation": "Increase color contrast"
        },
        {
          "severity": "medium",
          "category": "Readability",
          "issue": "High text density (65.2%)",
          "recommendation": "Reduce text density"
        }
      ],
      "issueCounts": {
        "critical": 0,
        "high": 2,
        "medium": 5,
        "success": 10,
        "total": 17
      },
      "overallRecommendations": {
        "accessibility": [
          "Fix 2 contrast issues for WCAG AA compliance",
          "Excellent accessibility! Keep maintaining high contrast ratios."
        ],
        "readability": [
          "Reduce text density - consider breaking content across multiple screens",
          "Good readability! Keep up the clear typography."
        ],
        "attention": [
          "Strengthen visual hierarchy - make important elements more prominent",
          "Strong visual hierarchy! Users will easily identify key areas."
        ]
      },
      "pageId": "123:456",
      "frameId": "789:012",
      "figmaUrl": "https://www.figma.com/file/abc123/ProjectName",
      "source": "figma"
    },
    {
      "designName": "Page Name - Another Screen",
      "fileName": "Project File Name",
      "araiScore": 78.2,
      "accessibilityScore": 82.0,
      "readabilityScore": 75.0,
      "attentionScore": 77.0,
      "timestamp": "2026-04-15T10:30:00.000000",
      "analysisId": "550e8400-e29b-41d4-a716-446655440000",
      "issues": [],
      "issueCounts": {
        "critical": 0,
        "high": 0,
        "medium": 2,
        "success": 12,
        "total": 14
      },
      "overallRecommendations": {
        "accessibility": ["Excellent accessibility! Keep maintaining high contrast ratios."],
        "readability": ["Good readability! Keep up the clear typography."],
        "attention": ["Strong visual hierarchy! Users will easily identify key areas."]
      },
      "pageId": "123:789",
      "frameId": "456:789",
      "figmaUrl": "https://www.figma.com/file/abc123/ProjectName",
      "source": "figma"
    }
  ],
  "timestamp": "2026-04-15T10:30:00.000000",
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "totalScreens": 2,
  "totalPages": 1,
  "fileName": "Project File Name",
  "figmaUrl": "https://www.figma.com/file/abc123/ProjectName",
  "averageAraiScore": 76.85,
  "processingTime": 45.3
}
```

### Response Fields

#### Root Level
| Field | Type | Description |
|-------|------|-------------|
| `analyses` | array | Array of individual screen analysis results |
| `timestamp` | string | ISO 8601 timestamp of analysis |
| `analysisId` | string | Unique identifier for the analysis |
| `totalScreens` | integer | Total number of screens analyzed |
| `totalPages` | integer | Total number of pages in the file |
| `fileName` | string | Name of the Figma file |
| `figmaUrl` | string | The Figma file URL analyzed |
| `averageAraiScore` | number | Average ARAI score across all screens |
| `processingTime` | number | Time in seconds for analysis to complete |

#### Analysis Object (per screen)
| Field | Type | Description |
|-------|------|-------------|
| `designName` | string | Screen name (Page - Frame) |
| `fileName` | string | File name |
| `araiScore` | number | Overall ARAI score (0-100) |
| `accessibilityScore` | number | Accessibility score (0-100) |
| `readabilityScore` | number | Readability score (0-100) |
| `attentionScore` | number | Visual attention score (0-100) |
| `timestamp` | string | Analysis timestamp |
| `analysisId` | string | Unique analysis ID |
| `issues` | array | Array of identified issues |
| `issueCounts` | object | Count of issues by severity |
| `overallRecommendations` | object | Recommendations by category |
| `pageId` | string | Figma page ID |
| `frameId` | string | Figma frame ID |
| `figmaUrl` | string | Source Figma URL |
| `source` | string | Always "figma" for this endpoint |

#### Issue Object
| Field | Type | Description |
|-------|------|-------------|
| `severity` | string | `critical`, `high`, `medium`, or `success` |
| `category` | string | `Accessibility`, `Readability`, or `Attention` |
| `issue` | string | Description of the issue |
| `recommendation` | string | How to fix the issue |

#### IssueCounts Object
| Field | Type | Description |
|-------|------|-------------|
| `critical` | integer | Number of critical issues |
| `high` | integer | Number of high priority issues |
| `medium` | integer | Number of medium priority issues |
| `success` | integer | Number of positive findings |
| `total` | integer | Total issue count |

### Error Responses

#### 400 Bad Request
```json
{
  "detail": "Invalid Figma URL. Must be a full file URL like https://www.figma.com/file/abc123/ProjectName"
}
```

#### 401 Unauthorized
```json
{
  "detail": "No Figma token provided. Set FIGMA_API_TOKEN or provide figma_token parameter."
}
```
or
```json
{
  "detail": "Authorization header missing"
}
```

#### 500 Internal Server Error
```json
{
  "detail": "Figma analysis failed: Error message here"
}
```

### Example Usage

#### cURL
```bash
curl -X POST http://localhost:8000/api/v1/analysis/figma-screens \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "figma_url": "https://www.figma.com/file/abc123/MyProject",
    "figma_token": null
  }'
```

#### JavaScript/Fetch
```javascript
const response = await fetch('/api/v1/analysis/figma-screens', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    figma_url: 'https://www.figma.com/file/abc123/MyProject',
    figma_token: null
  })
});

const data = await response.json();
console.log('Total screens analyzed:', data.totalScreens);
console.log('Average score:', data.averageAraiScore);
```

#### Python/Requests
```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

data = {
    'figma_url': 'https://www.figma.com/file/abc123/MyProject',
    'figma_token': None
}

response = requests.post(
    'http://localhost:8000/api/v1/analysis/figma-screens',
    headers=headers,
    json=data
)

result = response.json()
print(f"Analyzed {result['totalScreens']} screens")
print(f"Average score: {result['averageAraiScore']}")
```

---

## Endpoint 2: Validate Figma URL

### URL
```
POST /api/v1/analysis/validate-url
```

### Authentication
**Not required** (public endpoint)

### Request Body
```json
{
  "url": "https://www.figma.com/file/abc123/ProjectName"
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✓ | Figma URL to validate |

### Response (Success)
**Status:** 200 OK

```json
{
  "valid": true,
  "file_key": "abc123",
  "message": "Valid Figma URL"
}
```

### Response (Invalid)
**Status:** 200 OK

```json
{
  "valid": false,
  "message": "Invalid Figma URL. Must be a full file URL like https://www.figma.com/file/abc123/ProjectName"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether URL is valid |
| `file_key` | string | Extracted file key (only if valid) |
| `message` | string | Human-readable validation result |

### Example Usage

#### cURL
```bash
curl -X POST http://localhost:8000/api/v1/analysis/validate-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.figma.com/file/abc123/MyProject"}'
```

#### JavaScript/Fetch
```javascript
const response = await fetch('/api/v1/analysis/validate-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://www.figma.com/file/abc123/MyProject'
  })
});

const data = await response.json();
if (data.valid) {
  console.log('File key:', data.file_key);
} else {
  console.error('Invalid URL:', data.message);
}
```

---

## Existing Endpoint: Image Upload Analysis

### URL
```
POST /api/v1/analysis/upload
```

### Authentication
**Required:** Bearer token

### Request Body
**Form Data** (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | ✓ | Image file (PNG, JPG, JPEG, WebP) |
| `design_name` | string | ✗ | Optional name for the design |

### Response (Success)
**Status:** 200 OK

```json
{
  "designName": "Design Name",
  "fileName": "design.png",
  "araiScore": 75.5,
  "accessibilityScore": 80.0,
  "readabilityScore": 72.0,
  "attentionScore": 74.0,
  "timestamp": "2026-04-15T10:30:00.000000",
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "issues": [...],
  "issueCounts": {...},
  "storageUrl": "https://storage.example.com/..."
}
```

---

## Score Interpretation Guide

### ARAI Score Ranges

| Range | Status | Interpretation |
|-------|--------|-----------------|
| 90-100 | ✅ Excellent | Outstanding design practices |
| 70-89 | ✅ Good | Well-designed with minor issues |
| 50-69 | ⚠️ Fair | Several improvements needed |
| 30-49 | ❌ Poor | Significant issues to address |
| 0-29 | ❌ Critical | Major accessibility/usability concerns |

### Weighting Formula
```
ARAI Score = (Accessibility × 0.4) + (Readability × 0.3) + (Attention × 0.3)
```

**Weights:**
- Accessibility (40%): Most important for user accessibility
- Readability (30%): Important for content clarity
- Attention (30%): Important for visual design quality

---

## Issue Severity Guide

### Severity Levels

| Severity | Icon | Impact | Action |
|----------|------|--------|--------|
| Critical | 🔴 | Breaks functionality | Fix immediately |
| High | 🟠 | Significant issues | Fix ASAP |
| Medium | 🟡 | Notable problems | Should fix |
| Success | ✅ | Positive patterns | Maintain |

---

## Limits & Quotas

| Parameter | Limit | Notes |
|-----------|-------|-------|
| File size (image) | 10 MB | Per image |
| Figma screens | 100 | Per project |
| Figma pages | 50 | Per project |
| Request timeout | 5 minutes | Hard timeout |
| Concurrent requests | 5 | Per user |
| Daily quota | Unlimited* | *With valid token |

*Quotas may be enforced in production

---

## Rate Limiting

**Current:** No rate limiting (available in future updates)

**Planned Limits:**
- 100 requests per hour per user
- 1000 requests per day per user
- 10 concurrent requests maximum

---

## Response Codes Reference

| Code | Meaning | Possible Cause |
|------|---------|----------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid parameters, malformed URL |
| 401 | Unauthorized | Missing or invalid authentication token |
| 413 | Payload Too Large | File exceeds size limit |
| 500 | Server Error | Internal server error |
| 502 | Bad Gateway | Server temporarily unavailable |
| 503 | Service Unavailable | Server under maintenance |
| 504 | Gateway Timeout | Request took too long |

---

## Data Model Reference

### Analysis Object Structure
```python
class Analysis:
    analysisId: str              # UUID
    timestamp: str               # ISO 8601
    designName: str              # User-friendly name
    fileName: str                # Original filename
    araiScore: float             # 0-100
    accessibilityScore: float    # 0-100
    readabilityScore: float      # 0-100
    attentionScore: float        # 0-100
    issues: List[Issue]          # List of issues
    issueCounts: IssueCounts     # Count summary
    overallRecommendations: Dict # By category
    source: str                  # "image" or "figma"
```

### Issue Object Structure
```python
class Issue:
    severity: str       # critical, high, medium, success
    category: str       # Accessibility, Readability, Attention
    issue: str          # Description
    recommendation: str # How to fix
```

---

## Common Errors & Solutions

### Error: "Invalid Figma URL"
**Cause:** URL doesn't contain `/file/`
**Solution:** Use full file URL, not prototype or design link
```
❌ https://www.figma.com/proto/abc123
✅ https://www.figma.com/file/abc123/Project
```

### Error: "Token verification failed"
**Cause:** Invalid or expired JWT token
**Solution:** Get new token by logging in again

### Error: "No Figma token provided"
**Cause:** Backend not configured with Figma API token
**Solution:** Set FIGMA_API_TOKEN environment variable

### Error: "Analysis timed out"
**Cause:** Large file or server overload
**Solution:** Try smaller file or try again later

---

## Pagination & Filtering

**Not implemented** for current endpoints

**Future feature:** Support for:
- Pagination (limit, offset)
- Filtering (by date, score, category)
- Sorting (by score, date, name)

---

## Versioning

**Current Version:** 1.0
**API Version:** v1 (in URL: `/api/v1/`)

**Future Versions:**
- v2: Planned for Q3 2026
- v3: Planned for Q4 2026

**Deprecation Policy:**
- Current version: Production stable
- Previous versions: Supported for 6 months after release
- Deprecation notice: 3 months advance warning

---

## Best Practices

### 1. Authentication
```javascript
// Always include token
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 2. Error Handling
```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.detail);
  }
} catch (err) {
  console.error('Network error:', err);
}
```

### 3. Retry Logic
```javascript
async function retryFetch(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### 4. Timeout Handling
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min

try {
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
} finally {
  clearTimeout(timeoutId);
}
```

---

## Support & Issues

### Getting Help
1. Check this documentation
2. Review error messages carefully
3. Check browser console for client-side errors
4. Review server logs for backend errors

### Reporting Bugs
Include:
- Exact endpoint and parameters
- Full error message
- Request/response examples
- Steps to reproduce
- Browser and OS version

---

## Changelog

### Version 1.0 (April 15, 2026)
- ✨ Initial release
- ✨ `/analysis/figma-screens` endpoint
- ✨ `/analysis/validate-url` endpoint
- ✨ Multi-screen Figma analysis
- ✨ Standardized result format

---

**Last Updated:** April 15, 2026
**Version:** 1.0
**Status:** Production Ready
