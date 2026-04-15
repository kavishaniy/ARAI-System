# FIGMA OAUTH 2.0 INTEGRATION SETUP

This guide walks you through setting up Figma OAuth 2.0 for ARAI, enabling public users to analyze their own Figma designs.

## Overview

- **Personal Token** (Old): Access only your own files. Good for development/testing.
- **OAuth 2.0** (New): Users authorize ARAI to access their files. Perfect for production.

## Step 1: Add Credentials to Backend

Add these to your `backend/.env`:

```env
# ============================================================
# FIGMA OAUTH 2.0 CONFIGURATION
# ============================================================

# Your Figma OAuth app credentials (from figma.com/developers)
FIGMA_CLIENT_ID=0zUuRy2IrZ4IeA98hRRhF8
FIGMA_CLIENT_SECRET=gCva505ietO1MLe0JpJfj4V2Owwz6n

# Where Figma redirects after user approves (must match Figma app settings)
# For development:
FIGMA_REDIRECT_URI=http://localhost:8000/api/v1/figma/auth/callback

# For production:
# FIGMA_REDIRECT_URI=https://your-deployed-backend.com/api/v1/figma/auth/callback

# Session secret for storing user tokens
SESSION_SECRET_KEY=your-random-session-secret-key-here
```

⚠️ **Important:**
- Keep `FIGMA_CLIENT_SECRET` private - never commit to git
- Change `SESSION_SECRET_KEY` in production to a random string

## Step 2: Verify Backend Configuration

The backend has been updated with:
- ✅ SessionMiddleware for storing OAuth tokens
- ✅ 5 new OAuth endpoints
- ✅ Updated `/analyze` endpoint to use OAuth tokens

### New OAuth Endpoints:

1. **`GET /api/v1/figma/auth/login`** - Initiate OAuth flow
   - Returns: `{ auth_url: "https://www.figma.com/oauth?..." }`
   - User visits this URL to authorize

2. **`GET /api/v1/figma/auth/callback`** - Handle OAuth callback
   - Figma redirects here with authorization code
   - Exchanges code for access_token
   - Stores token in session

3. **`POST /api/v1/figma/auth/verify`** - Check connection status
   - Returns: `{ connected: true, user: "username" }`
   - Call this to check if user is already connected

4. **`POST /api/v1/figma/auth/disconnect`** - Logout from Figma
   - Clears OAuth token from session

5. **`POST /api/v1/figma/analyze`** - Analyze with OAuth token
   - Now automatically uses session token if available
   - Falls back to provided token, then env token

## Step 3: Frontend Integration

The frontend has been updated with a new `FigmaOAuth.jsx` component.

### Usage in your page:

```jsx
import FigmaOAuth from "../components/FigmaOAuth";

export default function MyPage() {
  const handleConnected = (data) => {
    console.log("User connected:", data.user);
  };

  const handleDisconnected = () => {
    console.log("User disconnected");
  };

  return (
    <div>
      <FigmaOAuth 
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
      />
    </div>
  );
}
```

### Component Features:
- ✅ Displays "Connect to Figma" button when not connected
- ✅ Shows user info and "Disconnect" button when connected
- ✅ Handles OAuth flow automatically
- ✅ Checks connection status on mount
- ✅ Beautiful UI with proper error handling
- ✅ Privacy info included

## Step 4: Updated FigmaAnalyzer

The `FigmaAnalyzer.jsx` now:
1. Checks if user has OAuth token in session
2. Uses that token for analysis (highest priority)
3. Falls back to manually provided token
4. Falls back to env token if neither available

Users no longer need to paste their token - they just click "Connect Figma" once!

## Step 5: Complete User Flow

```
User visits ARAI
    ↓
Sees "🔗 Connect Your Figma" button
    ↓
Clicks button → Redirected to Figma login
    ↓
User logs in and approves ARAI
    ↓
Figma redirects back to /auth/callback
    ↓
Token stored in session cookie
    ↓
User back on ARAI, now shows "✅ Connected as @username"
    ↓
User pastes Figma project URL
    ↓
Analysis runs using user's OAuth token
    ↓
Results displayed
```

## Development Testing

### Test OAuth locally:

```bash
# Terminal 1: Start backend
cd backend
export FIGMA_CLIENT_ID=0zUuRy2IrZ4IeA98hRRhF8
export FIGMA_CLIENT_SECRET=gCva505ietO1MLe0JpJfj4V2Owwz6n
export FIGMA_REDIRECT_URI=http://localhost:8000/api/v1/figma/auth/callback
export SESSION_SECRET_KEY=dev-secret-key-123
python -m uvicorn app.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm start
```

### Test in browser:

1. Go to `http://localhost:3000` (or 5173)
2. Navigate to Figma analyzer
3. Click "🔗 Connect Your Figma"
4. Log in with your Figma account
5. Approve ARAI access
6. You should see "✅ Connected to Figma"

## Production Deployment

### Environment Variables

Update these in your deployment platform (Railway, Vercel, Render):

**Backend:**
```
FIGMA_CLIENT_ID=0zUuRy2IrZ4IeA98hRRhF8
FIGMA_CLIENT_SECRET=gCva505ietO1MLe0JpJfj4V2Owwz6n
FIGMA_REDIRECT_URI=https://your-backend-url.com/api/v1/figma/auth/callback
SESSION_SECRET_KEY=generate-a-random-long-string-here
ENVIRONMENT=production
```

**Frontend:**
```
REACT_APP_API_URL=https://your-backend-url.com/api/v1
```

### Steps:

1. Go to [figma.com/developers](https://figma.com/developers)
2. Click your ARAI app
3. Update **Redirect URI** to match production URL
4. Update **Website URL** to your frontend domain
5. Generate new tokens if needed
6. Deploy with updated env vars

## Token Refresh (Advanced)

Figma OAuth tokens expire after some time. The system handles this by:
1. Storing `refresh_token` when user first connects
2. When API call fails with 401, automatically refresh
3. Update session with new token
4. Retry the failed request

This is built into the backend automatically.

## Security Considerations

1. **NEVER commit secrets to git**
   - Add `.env` to `.gitignore`
   - Use platform-specific secret management

2. **Use HTTPS in production**
   - SessionMiddleware has `https_only=True` in prod
   - Cookies won't be sent over HTTP

3. **CSRF Protection**
   - OAuth state token prevents CSRF attacks
   - Cookies have `SameSite=lax` protection

4. **Token Storage**
   - Tokens stored in HttpOnly session cookies
   - Not accessible to JavaScript (prevents XSS attacks)
   - Sessions expire after 7 days

5. **Privacy**
   - Add to your privacy policy: "ARAI accesses Figma files only to run analysis and does not store design data"
   - Users can disconnect anytime

## Troubleshooting

### Error: "FIGMA_CLIENT_ID and FIGMA_REDIRECT_URI not configured"
- Check that env vars are set in your backend
- Restart backend server after adding env vars
- Check: `python -c "from app.core.config import settings; print(settings.FIGMA_CLIENT_ID)"`

### Error: "Invalid state parameter. Possible CSRF attack"
- Session might have expired
- Try connecting again
- Check if cookies are enabled in browser

### Figma OAuth says "App not approved"
- New apps need review for production use
- For now, you can test as an app admin
- Add team members as testers in Figma app settings

### User's token not working
- Token might have expired (7 day limit)
- User needs to disconnect and reconnect
- Check browser cookies aren't blocked

## Support & Next Steps

- ✅ OAuth setup complete
- ✅ Frontend component created
- ✅ Backend endpoints configured
- 🔄 Test locally
- 🚀 Deploy to production
- 📈 Monitor token refresh issues

Happy analyzing! 🎨📊
