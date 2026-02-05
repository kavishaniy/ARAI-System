# ARAI System - Local Development Setup

## Network Error Fix

The network error was caused by the frontend trying to connect to the production API URL instead of your local backend.

## Changes Made

1. **Created `.env.local`** - Points to local backend API
   - `REACT_APP_API_URL=http://localhost:8000/api/v1`
   
2. **Fixed Token Storage Inconsistency**
   - Updated `api.js` to use `'access_token'` (consistent with auth.js)
   - Updated `ComprehensiveAnalysisResults.jsx` to use `'access_token'`

3. **Updated `.gitignore`** - Prevents committing local environment files

## How to Run Locally

### Backend (Port 8000)
```bash
cd backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Port 3000)
```bash
cd frontend
npm start
```

## Environment Files

- `.env` - Production configuration (committed to repo)
- `.env.local` - Local development (ignored by git, overrides .env)

## Testing the Fix

1. Make sure backend is running on http://localhost:8000
2. Restart the frontend with `npm start`
3. Clear browser cache/localStorage if needed
4. Try uploading and analyzing an image

The frontend will now connect to your local backend instead of the production server.

## Verification

You can verify the backend is running:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

You can check which API URL the frontend is using by opening browser console and checking the network tab when making requests.
