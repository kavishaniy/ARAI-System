# Command Reference & Quick Terminal Guide

## Pre-Deployment Verification

### Check Frontend Build
```bash
cd /Users/kavishani/Documents/FYP/arai-system/frontend

# Install dependencies
npm ci

# Build the project
npm run build

# Expected: "Compiled successfully" ✅
```

### Check Backend
```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Check Python version
python --version
# Expected: Python 3.11.x

# Verify requirements
pip freeze | grep fastapi
pip freeze | grep uvicorn
```

### Verify Configuration Files Exist
```bash
# Frontend
ls -la frontend/.env.production
ls -la frontend/.nvmrc
ls -la frontend/vercel.json

# Backend
ls -la backend/Procfile
ls -la backend/Dockerfile
ls -la backend/requirements.txt
ls -la backend/runtime.txt
```

---

## GitHub Commit & Push

```bash
# Navigate to project root
cd /Users/kavishani/Documents/FYP/arai-system

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "feat: deployment configuration complete"

# Push to main branch
git push origin main

# Verify
git log --oneline -5
```

---

## Testing Commands

### Test Frontend Build Locally
```bash
cd frontend

# Clean build
rm -rf node_modules package-lock.json
npm ci
npm run build

# Serve locally (optional)
npm install -g serve
serve -s build -l 3000
# Visit: http://localhost:3000
```

### Test Backend Locally
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Visit: http://localhost:8000/docs (Swagger UI)
# Health check: curl http://localhost:8000/api/v1/health
```

### Test API Connectivity
```bash
# Test Railway backend (after deployment)
curl -v https://arai-system-production.up.railway.app/api/v1/health

# With JSON parsing
curl -s https://arai-system-production.up.railway.app/api/v1/health | jq .

# Test with headers
curl -v \
  -H "Origin: https://arai-system.vercel.app" \
  https://arai-system-production.up.railway.app/api/v1/health
```

---

## Debugging Commands

### Check Environment Variables

**Frontend (Vercel)**
```bash
# In browser console (F12)
console.log(process.env.REACT_APP_API_URL)
```

**Backend (Railway)**
```bash
# SSH into Railway container (if available)
# Or check environment via Railway dashboard → Variables tab
```

### View Deployment Logs

**Vercel**
```bash
# Using Vercel CLI (if installed)
vercel logs --follow

# Or via dashboard: https://vercel.com → Deployments → Click → Logs
```

**Railway**
```bash
# View via dashboard: https://railway.app → Project → Logs

# Or using Railway CLI (if installed)
railway logs
```

### Clear Caches

**Vercel**
```
Dashboard → Settings → Git → "Clear Build Cache"
Then click "Redeploy" on latest deployment
```

**Browser Cache**
```javascript
// Clear browser cache for development
localStorage.clear()
sessionStorage.clear()
// Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

## Git Commands Reference

```bash
# View branch
git branch -v

# View recent commits
git log --oneline -10

# View changes
git diff

# Stage specific file
git add frontend/.env.production

# Stash changes (if needed)
git stash

# Revert last commit (if needed)
git reset --soft HEAD~1

# Force push (use with caution!)
git push -f origin main
```

---

## NPM Commands Reference

```bash
# Install dependencies
npm install

# Clean install (recommended for deployment)
npm ci

# Build project
npm run build

# Start development server
npm start

# Run tests
npm test

# Check for vulnerabilities
npm audit
npm audit fix

# Update packages
npm update

# List installed packages
npm list
```

---

## Python Commands Reference

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install specific package
pip install package-name==version

# Upgrade package
pip install --upgrade package-name

# Export installed packages
pip freeze > requirements.txt

# Check installed packages
pip list

# Deactivate virtual environment
deactivate
```

---

## Docker Commands (Optional - for local testing)

```bash
# Build Docker image
docker build -t arai-backend .

# Run Docker container
docker run -p 8000:8000 \
  -e SUPABASE_URL="your_url" \
  -e SUPABASE_KEY="your_key" \
  arai-backend

# View container logs
docker logs container-id

# Stop container
docker stop container-id

# Remove image
docker rmi arai-backend
```

---

## File Editing (if needed)

### Edit Environment File
```bash
# View content
cat frontend/.env.production

# Edit with nano
nano frontend/.env.production
# Exit: Ctrl+X, Y, Enter

# Edit with vim
vim frontend/.env.production
# Exit: ESC, :q!, Enter
```

### Edit Configuration
```bash
# View vercel.json
cat frontend/vercel.json

# Edit
nano frontend/vercel.json
```

---

## Health Check Commands

After deployment, run these to verify:

```bash
# 1. Check Railway backend is running
curl -s https://arai-system-production.up.railway.app/api/v1/health | jq .

# 2. Check Vercel frontend is accessible
curl -s https://arai-system.vercel.app | head -20

# 3. Test CORS
curl -v \
  -H "Origin: https://arai-system.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  https://arai-system-production.up.railway.app/api/v1/health

# 4. DNS resolution
nslookup arai-system-production.up.railway.app
nslookup arai-system.vercel.app
```

---

## Troubleshooting Commands

### Check Port Usage (macOS)
```bash
# Find process using port 8000
lsof -i :8000

# Find process using port 3000
lsof -i :3000

# Kill process (if needed)
kill -9 process-id
```

### Check Disk Space
```bash
# Check available space
df -h

# Check project size
du -sh /Users/kavishani/Documents/FYP/arai-system

# Check node_modules size
du -sh frontend/node_modules
```

### Clean Up
```bash
# Remove node_modules
rm -rf frontend/node_modules

# Remove build folder
rm -rf frontend/build

# Clear npm cache
npm cache clean --force

# Remove venv
rm -rf backend/venv
```

---

## Quick One-Liners

```bash
# Deploy everything (commit and push)
git add . && git commit -m "deployment" && git push origin main

# Build and serve frontend locally
cd frontend && npm ci && npm run build && npx serve -s build

# Verify all deployments
echo "Railway:" && curl -s https://arai-system-production.up.railway.app/api/v1/health && echo "" && echo "Vercel:" && curl -s -o /dev/null -w "%{http_code}" https://arai-system.vercel.app

# Clean install and build everything
cd frontend && rm -rf node_modules && npm ci && npm run build
```

---

## Useful Aliases (Optional - add to ~/.zshrc)

```bash
# Add to ~/.zshrc
alias arai-front="cd /Users/kavishani/Documents/FYP/arai-system/frontend"
alias arai-back="cd /Users/kavishani/Documents/FYP/arai-system/backend"
alias arai-build-front="cd /Users/kavishani/Documents/FYP/arai-system/frontend && npm run build"
alias arai-health="curl -s https://arai-system-production.up.railway.app/api/v1/health | jq ."

# Then reload shell
source ~/.zshrc

# Usage:
arai-front  # Jump to frontend folder
arai-build-front  # Build frontend
arai-health  # Check backend health
```

---

## Vercel CLI (Optional)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy using CLI
vercel

# Deploy to production
vercel --prod

# Check logs
vercel logs

# Check deployments
vercel ls

# Preview a deployment
vercel inspect [deployment-url]
```

---

## Railway CLI (Optional)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Deploy
railway deploy

# Check status
railway status
```

---

## Status Summary

```bash
#!/bin/bash
# Save as check-deployment.sh

echo "📊 ARAI System Deployment Status"
echo "=================================="
echo ""

echo "🔵 Frontend (Vercel):"
curl -s -o /dev/null -w "  Status: %{http_code}\n" https://arai-system.vercel.app

echo ""
echo "🔵 Backend (Railway):"
curl -s https://arai-system-production.up.railway.app/api/v1/health | jq '.status' || echo "  Status: Not responding"

echo ""
echo "✅ Local Environment:"
cd frontend && npm list react react-dom react-router-dom --depth=0
```

---

## Important Notes

⚠️ **Do NOT commit:**
- `.env` files (only `.env.production` if safe)
- `node_modules/`
- `venv/`
- `.DS_Store`

✅ **Always commit:**
- `package.json` and `package-lock.json`
- `.nvmrc`
- `requirements.txt`
- Configuration files (`vercel.json`, `Procfile`, etc.)

---

**Last Updated:** April 12, 2026  
**Ready to Deploy:** ✅ Yes
