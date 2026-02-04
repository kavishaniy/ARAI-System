# 🚀 Quick Deployment Commands Reference

## Backend Deployment (Railway)

```bash
# Navigate to backend
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Link to Railway service
railway service

# View logs
railway logs

# Set environment variables
railway variables set VARIABLE_NAME='value'

# Deploy
railway up
```

## Frontend Deployment (Vercel)

```bash
# Navigate to frontend
cd /Users/kavishani/Documents/FYP/arai-system/frontend

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Add environment variable
echo "value" | vercel env add VARIABLE_NAME production

# View deployments
vercel ls
```

## Current URLs

- **Backend API:** https://arai-system-production.up.railway.app
- **Frontend:** https://frontend-seven-alpha-91.vercel.app

## One Command to Redeploy Both

```bash
# Redeploy Backend
cd /Users/kavishani/Documents/FYP/arai-system/backend && railway up

# Redeploy Frontend
cd /Users/kavishani/Documents/FYP/arai-system/frontend && vercel --prod
```
