# Figma OAuth 2.0 Flow Diagram

## 1. Initial Connection Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│  ┌──────────────────┐                                               │
│  │ Visit ARAI App   │                                               │
│  │ (localhost:3000) │                                               │
│  └────────┬─────────┘                                               │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────┐                                       │
│  │ FigmaOAuth Component     │                                       │
│  │ "🔗 Connect Figma" btn   │                                       │
│  └────────┬─────────────────┘                                       │
│           │                                                          │
│           │ Click button                                            │
│           ▼                                                          │
│  ┌──────────────────────────────────┐                               │
│  │ Frontend calls:                  │                               │
│  │ GET /auth/login                  │                               │
│  └────────┬─────────────────────────┘                               │
│           │                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            │ HTTP Request
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ARAI BACKEND                                    │
│  ┌──────────────────────────────────┐                               │
│  │ GET /api/v1/figma/auth/login     │                               │
│  │                                  │                               │
│  │ • Generate random state token    │                               │
│  │ • Build Figma auth URL           │                               │
│  │ • Return auth_url                │                               │
│  └────────┬─────────────────────────┘                               │
│           │                                                          │
│           │ {auth_url: "https://...", state: "abc123"}              │
│           ▼                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            │ JSON Response
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│  ┌──────────────────────────────────┐                               │
│  │ Frontend stores state cookie     │                               │
│  │ Redirects to auth_url            │                               │
│  └────────┬─────────────────────────┘                               │
│           │                                                          │
│           │ window.location.href = auth_url                         │
│           ▼                                                          │
│   🌐 Browser navigates to:                                          │
│   https://www.figma.com/oauth?                                      │
│   client_id=0zUuRy2IrZ4IeA98hRRhF8&                                 │
│   redirect_uri=http://localhost:8000/auth/callback&                 │
│   scope=file_content:read&                                          │
│   state=abc123                                                      │
│           │                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            ▼
    ┌───────────────────────┐
    │   FIGMA.COM LOGIN     │
    │  ┌─────────────────┐  │
    │  │ Email/Password  │  │
    │  │ (User enters)   │  │
    │  └─────────────────┘  │
    │           │            │
    │           ▼            │
    │  ┌─────────────────┐  │
    │  │ 2FA/Security    │  │
    │  │ (if enabled)    │  │
    │  └─────────────────┘  │
    │           │            │
    │           ▼            │
    │  ┌─────────────────┐  │
    │  │ Permission      │  │
    │  │ "Allow ARAI to: │  │
    │  │ • Read files"   │  │
    │  │ [Approve]       │  │
    │  └─────────────────┘  │
    └───────────┬───────────┘
                │
                │ User clicks "Approve"
                │
                │ Figma generates: code = "xyz789"
                │
                │ Figma redirects browser to:
                │ http://localhost:8000/auth/callback?
                │ code=xyz789&
                │ state=abc123
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│  ┌──────────────────────────────────┐                               │
│  │ Redirected back to ARAI          │                               │
│  │ /auth/callback?code=xyz789...    │                               │
│  └────────┬─────────────────────────┘                               │
│           │                                                          │
│           │ Backend automatically intercepts                         │
│           │ (this is the OAuth callback handler)                    │
│           ▼                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            │ HTTP Request with code & state
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ARAI BACKEND                                    │
│  ┌──────────────────────────────────────┐                           │
│  │ GET /api/v1/figma/auth/callback      │                           │
│  │ ?code=xyz789&state=abc123            │                           │
│  │                                      │                           │
│  │ • Verify state token (CSRF check)    │                           │
│  │ • Exchange code for access_token     │                           │
│  │ • Store in session cookie            │                           │
│  │ • Return success response            │                           │
│  └────────┬─────────────────────────────┘                           │
│           │                                                          │
│           │ To Figma API:                                           │
│           │ POST /api/oauth/token                                   │
│           │ {code, client_id, client_secret, ...}                   │
│           ▼                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            ▼
    ┌───────────────────────┐
    │     FIGMA API         │
    │  ┌─────────────────┐  │
    │  │ Verify code     │  │
    │  │ Generate tokens │  │
    │  │ Return:         │  │
    │  │ {               │  │
    │  │  access_token:  │  │
    │  │    "fgpt_...",  │  │
    │  │  expires_in:    │  │
    │  │    3600         │  │
    │  │ }               │  │
    │  └─────────────────┘  │
    └───────────┬───────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ARAI BACKEND                                    │
│  ┌──────────────────────────────────────┐                           │
│  │ SessionMiddleware stores token       │                           │
│  │                                      │                           │
│  │ session["figma_access_token"] =      │                           │
│  │   "fgpt_..."                         │                           │
│  │                                      │                           │
│  │ session["figma_token_expires"] =     │                           │
│  │   1713185400  (unix timestamp)       │                           │
│  │                                      │                           │
│  │ session["figma_refresh_token"] =     │                           │
│  │   "fgpt_refresh_..."  (if provided)  │                           │
│  │                                      │                           │
│  │ Set response cookie:                 │                           │
│  │ Set-Cookie: arai_session=...         │                           │
│  │             HttpOnly; Secure; ...    │                           │
│  └────────┬─────────────────────────────┘                           │
│           │                                                          │
│           │ HTTP Response (with Set-Cookie header)                  │
│           │ { success: true, message: "..." }                       │
│           ▼                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│  ┌──────────────────────────────────────┐                           │
│  │ Browser receives response            │                           │
│  │ Stores session cookie                │                           │
│  │ (automatically, HttpOnly)            │                           │
│  │                                      │                           │
│  │ FigmaOAuth component re-renders:     │                           │
│  │ ✅ Connected as @john_doe            │                           │
│  │ [🔓 Disconnect]                      │                           │
│  └──────────────────────────────────────┘                           │
│                                                                      │
│  ✨ User is now authorized! ✨                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Analysis Flow (After Connected)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│  ┌──────────────────────────────────────┐                           │
│  │ User connected to Figma              │                           │
│  │ ✅ Connected as @john_doe            │                           │
│  │                                      │                           │
│  │ Pastes Figma project URL:            │                           │
│  │ https://www.figma.com/file/           │                           │
│  │ abc123/MyDesign                      │                           │
│  │                                      │                           │
│  │ Clicks "Analyse Screens"             │                           │
│  └────────┬─────────────────────────────┘                           │
│           │                                                          │
│           │ Frontend calls POST /analyze                            │
│           │ body: { figma_url: "...", analysis_scope: [...] }       │
│           │ + sends cookies (session included)                      │
│           ▼                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ARAI BACKEND                                    │
│  ┌──────────────────────────────────────┐                           │
│  │ POST /api/v1/figma/analyze           │                           │
│  │                                      │                           │
│  │ • Extract OAuth token from session   │                           │
│  │ • Start background analysis task     │                           │
│  │ • Return analysis_id (UUID)          │                           │
│  └────────┬─────────────────────────────┘                           │
│           │                                                          │
│           │ Immediately returns:                                    │
│           │ { analysis_id: "550e8400-...", status: "pending" }      │
│           ▼                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│  ┌──────────────────────────────────────┐                           │
│  │ Receives analysis_id                 │                           │
│  │ Shows progress bar: 0%               │                           │
│  │                                      │                           │
│  │ Starts polling:                      │                           │
│  │ GET /analyze/{analysis_id}/status    │                           │
│  │ every 2 seconds                      │                           │
│  └────────┬─────────────────────────────┘                           │
│           │                                                          │
│           │ Updates UI as responses come in                         │
│           │ progress: 10%, 25%, 45%, 90%, 100%                     │
│           ▼                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ARAI BACKEND (Background)                        │
│                                                                      │
│  Analysis Task Running:                                             │
│                                                                      │
│  1️⃣ Extract Figma Data (10%)                                        │
│     ┌──────────────────────────────┐                                │
│     │ Use OAuth token to call:      │                                │
│     │ GET /api/v1/files/{file_key}  │                                │
│     │ (Using user's token!)         │                                │
│     └──────┬───────────────────────┘                                │
│            │                                                         │
│            ▼                                                         │
│     Extract all frames/screens                                      │
│     from design file                                                │
│                                                                      │
│  2️⃣ Export Frame Images (25%)                                       │
│     ┌──────────────────────────────┐                                │
│     │ GET /api/v1/images/{file_key}│                                │
│     │ Export as PNG @2x resolution │                                │
│     └──────┬───────────────────────┘                                │
│            │                                                         │
│            ▼                                                         │
│     Download all screen images                                      │
│                                                                      │
│  3️⃣ Run ARAI Analysis (50%)                                         │
│     ┌──────────────────────────────┐                                │
│     │ For each screen:              │                                │
│     │ • WCAG Accessibility check    │                                │
│     │ • Flesch-Kincaid Readability  │                                │
│     │ • Saliency Heatmap (Attention)│                                │
│     └──────┬───────────────────────┘                                │
│            │                                                         │
│            ▼                                                         │
│     Generate metrics & heatmaps                                     │
│                                                                      │
│  4️⃣ Save Results (90%)                                              │
│     ┌──────────────────────────────┐                                │
│     │ Save to database:             │                                │
│     │ • Analysis ID                 │                                │
│     │ • User ID                     │                                │
│     │ • Figma URL                   │                                │
│     │ • Results JSON                │                                │
│     └──────┬───────────────────────┘                                │
│            │                                                         │
│            ▼                                                         │
│     Mark as completed (100%)                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Token Refresh Flow (When Expired)

```
During Analysis:

Analysis needs API access
    ↓
Check session token expiry
    ↓
Is expired? (with 5 min buffer)
    │
    ├─ NO → Use token directly
    │
    └─ YES → Refresh flow:
        ↓
        POST /api/oauth/token
        {
          refresh_token: "fgpt_refresh_...",
          grant_type: "refresh_token",
          client_id: "...",
          client_secret: "..."
        }
        ↓
        Figma API returns new access_token
        ↓
        Update session:
        session["figma_access_token"] = new_token
        session["figma_token_expires"] = new_expiry
        ↓
        Retry original API call with new token
        ↓
        Success! Analysis continues
```

---

## 4. Complete User Journey

```
Day 1 - First Time User:
┌────────────────────────────┐
│ Visit ARAI                 │
│ See "Connect Figma" button │
└────────────┬───────────────┘
             │ (30 seconds total)
             ▼
┌────────────────────────────┐
│ Click button               │
│ Log in to Figma            │
│ Approve access             │
│ Redirected back to ARAI    │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ See "Connected as @john"   │
│ Paste design URL           │
│ Click "Analyse"            │
│ View results!              │
└────────────────────────────┘

Day 2+ - Returning User:
┌────────────────────────────┐
│ Visit ARAI                 │
│ See "Connected as @john"   │
│ (Already connected!)       │
│ Paste design URL           │
│ Click "Analyse"            │
│ View results!              │
│ (No re-auth needed!)       │
└────────────────────────────┘
```

---

## 5. Token Storage Security

```
Session Cookie Storage:

┌─────────────────────────────────────┐
│ Browser Cookie Storage              │
├─────────────────────────────────────┤
│ Name: arai_session                  │
│ Value: encrypted_session_data       │
│ HttpOnly: ✓ (JS can't access)       │
│ Secure: ✓ (HTTPS only in prod)      │
│ SameSite: Lax (CSRF protection)     │
│ Max-Age: 604800 (7 days)            │
├─────────────────────────────────────┤
│ Inside Session (Server):            │
│ ├─ figma_access_token: "fgpt_..."   │
│ ├─ figma_refresh_token: "fgpt_ref"  │
│ └─ figma_token_expires: 1713185400  │
└─────────────────────────────────────┘

                    ↕️
            
┌─────────────────────────────────────┐
│ Every Request Includes:             │
├─────────────────────────────────────┤
│ Cookie: arai_session=encrypted...   │
│                                     │
│ Backend decrypts and validates      │
│ Access token automatically used     │
│ No need to send token in headers    │
└─────────────────────────────────────┘
```

---

## Key Points

1. **State Token** prevents CSRF attacks
2. **OAuth token never exposed** to client JavaScript
3. **HttpOnly cookies** prevent XSS attacks
4. **Automatic refresh** when token expires
5. **Session expires** after 7 days for security
6. **User can disconnect** anytime to revoke access

---

**For detailed implementation, see FIGMA_OAUTH_API_REFERENCE.md**
