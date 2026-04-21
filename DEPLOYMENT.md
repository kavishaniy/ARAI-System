# 🚀 Render Deployment Guide - Clean Setup

This project is deployed on **Render.com** for the backend and **Vercel** for the frontend.

## Architecture

```
Frontend (Vercel)
├─ https://arai-system.vercel.app
└─ React application

Backend (Render)
├─ https://arai-backend.onrender.com
└─ FastAPI application

Database (Supabase)
└─ PostgreSQL database
```

## Frontend Deployment (.env files)

### Development
- **File:** `frontend/.env.development`
- **API URL:** `http://localhost:8000/api/v1`
- **Use:** Local development with local backend

### Production
- **File:** `frontend/.env.production`
- **API URL:** `https://arai-backend.onrender.com/api/v1`
- **Use:** Auto-deployed by Vercel on git push

## Backend Deployment (Render)

### Configuration
- **Service Name:** arai-backend
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment:** Production
- **Plan:** Starter ($7/month - always-on)

### Environment Variables Required
See `backend/.env.render` for complete list:
- SUPABASE_URL
- SUPABASE_KEY
- SUPABASE_SERVICE_KEY
- SECRET_KEY
- SESSION_SECRET_KEY
- FIGMA_API_TOKEN
- FIGMA_CLIENT_ID
- FIGMA_CLIENT_SECRET
- ALLOWED_ORIGINS
- FRONTEND_URL
- PYTHONUNBUFFERED=1

### Auto-Deploy
- Render automatically deploys on every push to `main` branch
- No manual deployment needed
- Build logs visible in Render dashboard

## Local Development

### Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm start
# Runs on http://localhost:3000 or http://localhost:5173
```

### Testing Connection
```bash
# Check backend health
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

## Deployment Checklist

Before production deployment, ensure:

- [ ] All environment variables are set in Render dashboard
- [ ] `ALLOWED_ORIGINS` includes your Vercel URL
- [ ] Database (Supabase) is accessible
- [ ] Frontend `REACT_APP_API_URL` points to Render URL
- [ ] CORS is properly configured in `app/main.py`
- [ ] All dependencies in `requirements.txt` are pinned to versions

## Monitoring

### Render Dashboard
- View logs: https://render.com/dashboard
- Check deployment status
- Monitor memory and CPU usage
- View error logs in real-time

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Python version (3.11+) and dependencies |
| App crashes | Check environment variables are set |
| CORS errors | Verify ALLOWED_ORIGINS in config |
| Slow response | Render free tier sleeps; use Starter plan |

## Code Changes for Production

No special code changes are needed! The application automatically adapts:
- Reads `ENVIRONMENT` variable
- Sets `DEBUG=False` in production
- Configures CORS based on `ALLOWED_ORIGINS`

## Database

- **Provider:** Supabase (PostgreSQL)
- **Credentials:** Stored as environment variables in Render
- **Backups:** Handled by Supabase
- **Same for all environments:** Development, staging, and production use the same database

## Rolling Back

If something goes wrong:

1. Check Render logs for error details
2. Fix the issue in code
3. Push to `main` branch
4. Render automatically redeploys (2-5 minutes)

No manual rollback needed - just fix and push!

## Documentation

For detailed setup instructions, see:
- `START_HERE.md` - Getting started
- `RENDER_QUICK_START.md` - Fast deployment guide
- `RENDER_DEPLOYMENT.md` - Full walkthrough
- `RENDER_CONFIG_DETAILS.md` - Technical reference
