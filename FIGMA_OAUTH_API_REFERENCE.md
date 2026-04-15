# FIGMA OAUTH 2.0 API ENDPOINTS

Complete reference for all Figma OAuth endpoints in ARAI.

---

## OAuth Endpoints

### 1. Initiate Login

**Endpoint:** `GET /api/v1/figma/auth/login`

**Purpose:** Get the Figma OAuth authorization URL

**Authentication:** Not required

**Response:**
```json
{
  "auth_url": "https://www.figma.com/oauth?client_id=...&redirect_uri=...&scope=file_content:read&response_type=code&state=...",
  "message": "Redirect user to this URL to authorize ARAI access to their Figma account"
}
```

**Example:**
```javascript
const response = await fetch('/api/v1/figma/auth/login');
const { auth_url } = await response.json();
window.location.href = auth_url; // Redirect user to Figma
```

---

### 2. OAuth Callback Handler

**Endpoint:** `GET /api/v1/figma/auth/callback?code=...&state=...`

**Purpose:** Handle redirect from Figma after user authorizes

**Parameters:**
- `code` (query): Authorization code from Figma
- `state` (query): CSRF protection token (must match what was sent)

**Authentication:** Not required (called by Figma)

**Response on Success:**
```json
{
  "success": true,
  "message": "Successfully connected to Figma",
  "access_token": "fgpt_...",
  "expires_in": 3600
}
```

**Response on Error:**
```json
{
  "detail": "Invalid state parameter. Possible CSRF attack."
}
```

**How it works:**
1. User approves on Figma → Figma redirects here with code
2. Backend exchanges code for access_token
3. Token stored in session cookie (HttpOnly)
4. Redirects user back to app

---

### 3. Verify Connection Status

**Endpoint:** `POST /api/v1/figma/auth/verify`

**Purpose:** Check if user has an active Figma OAuth connection

**Authentication:** Required (session cookie with token)

**Request Body:** Empty
```json
{}
```

**Response when Connected:**
```json
{
  "connected": true,
  "user": "john_doe",
  "message": "Successfully connected to Figma"
}
```

**Response when Not Connected:**
```json
{
  "connected": false,
  "message": "No Figma connection found. Call /auth/login to connect."
}
```

**Example:**
```javascript
const response = await fetch('/api/v1/figma/auth/verify', {
  method: 'POST',
  credentials: 'include' // Important: send cookies
});
const { connected, user } = await response.json();

if (connected) {
  console.log(`Connected as ${user}`);
} else {
  // Show "Connect to Figma" button
}
```

---

### 4. Disconnect / Logout

**Endpoint:** `POST /api/v1/figma/auth/disconnect`

**Purpose:** Remove Figma OAuth token from session

**Authentication:** Optional (clears cookies if present)

**Request Body:** Empty
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Disconnected from Figma"
}
```

**Example:**
```javascript
await fetch('/api/v1/figma/auth/disconnect', {
  method: 'POST',
  credentials: 'include'
});
// User is now disconnected
```

---

## Analysis Endpoints (Using OAuth)

### 5. Analyze Figma Design

**Endpoint:** `POST /api/v1/figma/analyze`

**Purpose:** Analyze a Figma file for accessibility, readability, and attention

**Authentication:** Either OAuth token in session OR provided token

**Request Body:**
```json
{
  "figma_url": "https://www.figma.com/file/abc123/MyDesign",
  "figma_api_token": "optional_token_override",
  "analysis_scope": ["accessibility", "readability", "attention"]
}
```

**Response (Async - returns immediately):**
```json
{
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Analysis started. Check status using the analysis_id."
}
```

**Token Priority:**
1. Uses provided `figma_api_token` if given
2. Falls back to OAuth token in session if available
3. Falls back to env var `FIGMA_API_TOKEN` if set
4. Returns 401 if none available

**Example:**
```javascript
// Using OAuth token from session (no token needed!)
const response = await fetch('/api/v1/figma/analyze', {
  method: 'POST',
  credentials: 'include', // Send session cookie
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    figma_url: "https://www.figma.com/file/abc123/MyDesign",
    analysis_scope: ["accessibility", "readability", "attention"]
  })
});

const { analysis_id } = await response.json();
// Now poll for results...
```

---

### 6. Get Analysis Status

**Endpoint:** `GET /api/v1/figma/analyze/{analysis_id}`

**Purpose:** Get current status and results of an analysis

**Parameters:**
- `analysis_id` (path): The ID returned from `/analyze`

**Authentication:** Not required

**Response (Still Processing):**
```json
{
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "analyzing",
  "progress": 45,
  "current_step": "Analyzing design...",
  "message": null
}
```

**Response (Completed):**
```json
{
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "progress": 100,
  "current_step": "Complete",
  "result": {
    "screens": [
      {
        "screen": "Homepage",
        "wcag": { "score": 92, "level": "AA" },
        "readability": { "score": 8.5, "level": "High" },
        "heatmap": "data:image/png;base64,..."
      }
    ]
  }
}
```

**Response (Failed):**
```json
{
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "error": "Invalid Figma URL",
  "message": "Analysis failed: Invalid Figma URL"
}
```

**Example - Polling for Results:**
```javascript
async function waitForAnalysis(analysisId, maxWaitMs = 300000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    const response = await fetch(`/api/v1/figma/analyze/${analysisId}`);
    const result = await response.json();
    
    console.log(`Status: ${result.status}, Progress: ${result.progress}%`);
    
    if (result.status === 'completed') {
      return result.result;
    } else if (result.status === 'failed') {
      throw new Error(result.error);
    }
    
    // Wait before next poll
    await new Promise(r => setTimeout(r, 2000));
  }
  
  throw new Error('Analysis timeout');
}
```

---

### 7. Get Analysis Status Only

**Endpoint:** `GET /api/v1/figma/analyze/{analysis_id}/status`

**Purpose:** Get status without full results (useful for progress bars)

**Parameters:**
- `analysis_id` (path): The ID returned from `/analyze`

**Response:**
```json
{
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "analyzing",
  "progress": 45,
  "current_step": "Analyzing design...",
  "created_at": "2024-04-15T10:30:00",
  "message": null
}
```

---

## Supporting Endpoints

### 8. Validate Figma URL

**Endpoint:** `POST /api/v1/figma/validate-url`

**Purpose:** Validate if a URL is a valid Figma file link

**Authentication:** Not required

**Request Body:**
```json
{
  "url": "https://www.figma.com/file/abc123/MyDesign"
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "file_key": "abc123",
  "message": "Valid Figma URL"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "Invalid Figma URL format"
}
```

---

### 9. Test Figma Connection

**Endpoint:** `GET /api/v1/figma/test-connection`

**Purpose:** Test if Figma API is accessible

**Authentication:** Optional (can use X-Figma-Token header)

**Headers:**
```
X-Figma-Token: fgpt_... (optional, uses env token if not provided)
```

**Response (Success):**
```json
{
  "connected": true,
  "message": "Successfully connected to Figma API"
}
```

**Response (Failure):**
```json
{
  "detail": "Figma API error: Invalid token"
}
```

---

## Error Responses

All endpoints may return these errors:

### 400 Bad Request
```json
{
  "detail": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "detail": "No Figma token available. Please connect your Figma account or provide a token."
}
```

### 404 Not Found
```json
{
  "detail": "Analysis not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Status Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Token verified, analysis results returned |
| 400 | Bad Request | Invalid URL, missing required fields |
| 401 | Unauthorized | No OAuth token, needs to connect |
| 404 | Not Found | Analysis ID doesn't exist |
| 500 | Server Error | Figma API unreachable |

---

## Complete Flow Example

```javascript
// 1. Check if already connected
const verifyRes = await fetch('/api/v1/figma/auth/verify', {
  method: 'POST',
  credentials: 'include'
});
const { connected } = await verifyRes.json();

if (!connected) {
  // 2. Get login URL
  const loginRes = await fetch('/api/v1/figma/auth/login');
  const { auth_url } = await loginRes.json();
  
  // 3. Redirect to Figma
  window.location.href = auth_url;
  
  // (User logs in, approves access, gets redirected back)
}

// 4. Now user is connected! Analyze a design
const analyzeRes = await fetch('/api/v1/figma/analyze', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    figma_url: "https://www.figma.com/file/abc/MyDesign",
    analysis_scope: ["accessibility", "readability", "attention"]
  })
});
const { analysis_id } = await analyzeRes.json();

// 5. Poll for results
let results;
while (!results) {
  const statusRes = await fetch(`/api/v1/figma/analyze/${analysis_id}`);
  const status = await statusRes.json();
  
  if (status.status === 'completed') {
    results = status.result;
  } else if (status.status === 'failed') {
    console.error('Analysis failed:', status.error);
    break;
  }
  
  await new Promise(r => setTimeout(r, 2000));
}

// 6. Display results!
console.log('Analysis complete:', results);

// 7. Later, if user wants to disconnect
await fetch('/api/v1/figma/auth/disconnect', {
  method: 'POST',
  credentials: 'include'
});
```

---

## Rate Limits

- **Figma API:** 100 requests per minute per token
- **Analysis Queue:** Configurable (default: 5 concurrent)
- **Token Refresh:** Automatic when expired

---

## Implementation Notes

- Always use `credentials: 'include'` with fetch when OAuth token needed
- Analysis is **asynchronous** - must poll for results
- Tokens stored in HttpOnly cookies - safe from XSS
- CSRF protection via state token
- Tokens refresh automatically when expired

---

For more details, see `FIGMA_OAUTH_SETUP.md`
