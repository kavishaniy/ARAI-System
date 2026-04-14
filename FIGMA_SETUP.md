# 🚀 Figma Integration - Setup & Deployment Guide

## Quick Setup (5 minutes)

### 1. Get Figma API Token

```bash
# Go to: https://www.figma.com/settings/account
# Copy your personal access token

export FIGMA_API_TOKEN="figd_xxx..."
```

### 2. Add to Requirements

Already included in `backend/requirements.txt`:
```
requests==2.31.0
```

### 3. Register Routes

Already done in `backend/app/main.py`:
```python
from app.api import figma
app.include_router(figma.router, tags=["figma"])
```

### 4. Start Backend

```bash
cd backend
export FIGMA_API_TOKEN="your_token"
uvicorn app.main:app --reload
```

### 5. Test the API

```bash
# Test URL validation
curl -X POST http://localhost:8000/api/v1/figma/validate-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.figma.com/file/abc123/Design"}'

# Test connection
curl -X GET http://localhost:8000/api/v1/figma/test-connection
```

---

## Complete Integration Checklist

### Backend Setup
- [x] Create `app/core/figma_client.py` - Figma API client
- [x] Create `app/services/figma_service.py` - Analysis logic
- [x] Create `app/api/figma.py` - API endpoints
- [x] Update `app/models/figma_models.py` - Data schemas
- [x] Update `app/core/database.py` - Database functions
- [x] Update `app/main.py` - Register routes
- [ ] Create Supabase table `figma_analyses` (see below)

### Frontend Setup
- [x] Create `frontend/src/components/FigmaAnalyzer.jsx` - React component
- [ ] Add route in main app
- [ ] Style with Tailwind (already configured)

### Database Setup
- [ ] Create `figma_analyses` table in Supabase

### Testing
- [ ] Manual API testing
- [ ] End-to-end frontend testing
- [ ] Error handling verification

### Deployment
- [ ] Set `FIGMA_API_TOKEN` in Railway/production environment
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test on production

---

## Supabase Table Creation

### Option 1: Using SQL Editor

Go to Supabase Dashboard → SQL Editor → Create new query

```sql
-- Create figma_analyses table
CREATE TABLE figma_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT,
  figma_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Scores (0-100)
  accessibility_score FLOAT,
  readability_score FLOAT,
  attention_score FLOAT,
  overall_score FLOAT,
  
  -- Full analysis results as JSON
  analysis_data JSONB,
  
  -- Error tracking
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
);

-- Create index for user-specific queries
CREATE INDEX idx_figma_analyses_user_created 
ON figma_analyses(user_id, created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE figma_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own analyses
CREATE POLICY "Users can only view their own analyses"
  ON figma_analyses FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only insert their own analyses"
  ON figma_analyses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can only delete their own analyses"
  ON figma_analyses FOR DELETE
  USING (auth.uid()::text = user_id);
```

### Option 2: Using Supabase UI

1. Go to Supabase Dashboard
2. Click "Tables" in sidebar
3. Click "Create a new table"
4. Name: `figma_analyses`
5. Add columns as shown above
6. Enable RLS
7. Create policies as needed

---

## Frontend Integration

### Add Component to Your App

```jsx
// src/App.jsx or pages/analysis/FigmaAnalysis.jsx

import FigmaAnalyzer from './components/FigmaAnalyzer';

function App() {
  return (
    <div>
      <FigmaAnalyzer />
    </div>
  );
}

export default App;
```

### Configure API URL

Create `.env.local` in frontend:

```bash
# .env.local
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

For production:

```bash
# .env.production.local
REACT_APP_API_URL=https://your-api.com
REACT_APP_ENV=production
```

---

## Environment Variables

### Development

```bash
# Backend/.env.local
FIGMA_API_TOKEN=figd_xxx...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

### Production (Railway)

Set in Railway Dashboard → Environment Variables:

```
FIGMA_API_TOKEN=figd_xxx...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
ALLOWED_ORIGINS=https://your-frontend.com
```

---

## Running Locally

### Terminal 1: Backend

```bash
cd backend
export FIGMA_API_TOKEN="your_token"
python -m uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend

```bash
cd frontend
npm start
# Opens http://localhost:3000
```

### Testing the Full Flow

1. Open http://localhost:3000
2. Navigate to Figma Analyzer
3. Paste a Figma URL: `https://www.figma.com/file/xxx/MyDesign`
4. Click "Analyze Design"
5. Wait for analysis to complete
6. View results

---

## Deployment to Railway

### Option 1: Automatic (Recommended)

```bash
# Push to main branch
git add .
git commit -m "Add Figma integration"
git push origin main

# Railway auto-deploys on push
```

### Option 2: Manual Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway deploy

# Link to project
railway link
```

### Set Environment Variables in Railway

1. Go to Railway Dashboard
2. Select your project
3. Go to Variables
4. Add:
   - `FIGMA_API_TOKEN=your_token`
   - Other variables as needed

---

## Troubleshooting

### Issue: "FIGMA_API_TOKEN not found"

**Solution:**
```bash
# Check if env var is set
echo $FIGMA_API_TOKEN

# Set it
export FIGMA_API_TOKEN="your_token"

# Verify
echo $FIGMA_API_TOKEN
```

### Issue: "Invalid Figma URL"

**Solution:**
- Use format: `https://www.figma.com/file/FILE_KEY/filename`
- Don't use: `https://www.figma.com/design/...` (should still work)
- Copy URL directly from Figma browser address bar

### Issue: "403 Forbidden - Invalid token"

**Solution:**
- Generate new token at https://www.figma.com/settings/account
- Token might have expired (regenerate)
- Check token format: should start with `figd_`

### Issue: "CORS error in frontend"

**Solution:**
1. Check `ALLOWED_ORIGINS` in backend config
2. Ensure frontend URL is in whitelist
3. For development, use `http://localhost:3000`
4. For production, add your domain

### Issue: "Database connection error"

**Solution:**
```python
# Check Supabase credentials
from app.core.database import supabase
print(supabase.auth.get_session())

# Verify table exists
SELECT * FROM figma_analyses LIMIT 1;
```

### Issue: "Analysis timeout"

**Solution:**
- Large Figma files (>1000 frames) may timeout
- Increase timeout in backend:
```python
# app/api/figma.py
requests.Session().timeout = 60  # seconds
```

---

## Performance Optimization

### Caching

```python
# app/services/figma_service.py
from functools import lru_cache

@lru_cache(maxsize=32)
def get_file_cache(file_key: str):
    """Cache file data for 1 hour"""
    return self.extractor.extract_from_url(figma_url)
```

### Async Processing

Already implemented with:
- `async def` functions
- `BackgroundTasks` for analysis
- Non-blocking I/O with `requests`

### Database Indexes

Queries optimized with:
- Index on `user_id` for quick user lookups
- Index on `created_at` for sorting
- Index on `status` for filtering

---

## Monitoring & Logging

### View Logs (Local)

```bash
# Backend logs
# Check console output from uvicorn

# Frontend logs
# Check browser console (F12 → Console)
```

### View Logs (Railway)

1. Go to Railway Dashboard
2. Select project
3. Click "Deployments"
4. Select latest deployment
5. Click "Logs"

### Key Metrics to Monitor

- Analysis completion time
- API response times
- Error rates
- Token quota usage (Figma API)

---

## Next Steps

1. **Test locally** ✓
2. **Deploy to staging** (optional)
3. **Deploy to production**
4. **Monitor performance**
5. **Gather user feedback**
6. **Implement enhancements**

### Enhancement Ideas

- [ ] OAuth 2.0 for user's own Figma accounts
- [ ] Batch analysis for multiple files
- [ ] Design screenshots/thumbnails storage
- [ ] Historical comparison tracking
- [ ] AI-powered improvement suggestions
- [ ] Real-time WebSocket updates
- [ ] Export results (PDF, JSON)
- [ ] Team sharing & collaboration

---

## Support & Resources

- **Figma API Docs**: https://www.figma.com/developers/api
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev/

---

## Checklist for Production

- [ ] All environment variables set
- [ ] HTTPS enabled (Vercel/Railway handles this)
- [ ] CORS configured properly
- [ ] Database backups enabled
- [ ] Error monitoring (Sentry, etc.)
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Security headers configured
- [ ] Logging and monitoring active
- [ ] Documentation up to date
- [ ] Team members trained
- [ ] Rollback plan ready

---

**Last Updated:** April 2026
