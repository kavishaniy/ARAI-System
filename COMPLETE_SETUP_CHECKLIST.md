# ✅ Complete Setup & Deployment Checklist

## Phase 1: Pre-Deployment Verification

### Repository Status
- [ ] All code committed to GitHub (`arai-system`)
- [ ] Main branch is up to date
- [ ] No uncommitted changes that need to be pushed

### Backend Verification
- [ ] `backend/requirements.txt` exists
- [ ] `backend/Procfile` exists
- [ ] `backend/runtime.txt` exists (contains Python version)
- [ ] `backend/.env` has Supabase credentials
- [ ] `backend/app/main.py` exists
- [ ] `backend/app/__init__.py` exists

### Frontend Verification
- [ ] `frontend/package.json` exists
- [ ] `frontend/.env` exists
- [ ] Frontend `.env` updated: `REACT_APP_API_URL=http://localhost:8000/api/v1` (local) or Railway domain (prod)
- [ ] `frontend/src/index.js` exists
- [ ] `frontend/src/App.js` exists

### Configuration Files Created
- [ ] `backend/railway.json` (created)
- [ ] `frontend/railway.json` (created)
- [ ] `start.sh` (created)

---

## Phase 2: Local Testing (Recommended Before Deployment)

### Setup Backend
- [ ] Navigated to backend directory
- [ ] Created virtual environment: `python3 -m venv venv`
- [ ] Activated venv: `source venv/bin/activate`
- [ ] Upgraded pip: `pip install --upgrade pip`
- [ ] Installed requirements: `pip install -r requirements.txt`
- [ ] Verified installation: `pip list | grep fastapi`

### Start Backend
- [ ] Running: `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- [ ] Seeing: `INFO: Uvicorn running on http://0.0.0.0:8000`
- [ ] Backend terminal shows no errors

### Setup Frontend
- [ ] Navigated to frontend directory
- [ ] Installed dependencies: `npm install`
- [ ] No installation errors

### Start Frontend
- [ ] Running: `npm start`
- [ ] Browser opened to http://localhost:3000
- [ ] App loaded without 404 errors
- [ ] No CORS errors in console

### Test Connectivity
- [ ] Opened browser DevTools (F12)
- [ ] Network tab is visible
- [ ] Performed an action that calls API
- [ ] Saw request to `http://localhost:8000/api/v1/...`
- [ ] Response status is 200 (success)
- [ ] No CORS error messages

### Test Authentication
- [ ] Can load signup/login page
- [ ] Can create a new account
- [ ] Supabase credentials work
- [ ] User appears in Supabase dashboard

### Test Core Features
- [ ] Can upload a design file
- [ ] Backend processes the upload
- [ ] Analysis results appear
- [ ] File storage working (check uploads folder)

---

## Phase 3: Railway Deployment

### Railway Project Setup
- [ ] Have Railway.app account
- [ ] Logged into Railway Dashboard
- [ ] GitHub account connected to Railway
- [ ] Created or opened existing project

### Delete Old Service (If Applicable)
- [ ] Identified failed service (if exists)
- [ ] Clicked into service settings
- [ ] Deleted old service
- [ ] Confirmed deletion

### Create Backend Service
- [ ] Clicked "+ New Service"
- [ ] Selected "GitHub Repo"
- [ ] Selected repository: `arai-system`
- [ ] Selected branch: `main`
- [ ] **Root Directory set to: `backend`** ✅ CRITICAL
- [ ] Framework auto-detected as Python (or manually selected)
- [ ] Start command visible/correct
- [ ] Clicked "Deploy"
- [ ] Build started successfully

### Monitor Backend Build
- [ ] Viewed Deployments tab
- [ ] Build logs showing progress
- [ ] No build errors
- [ ] Service shows "Running" status
- [ ] Noted backend domain (e.g., backend-prod.railway.app)

### Create Frontend Service
- [ ] Clicked "+ New Service" in same project
- [ ] Selected "GitHub Repo"
- [ ] Selected repository: `arai-system`
- [ ] Selected branch: `main`
- [ ] **Root Directory set to: `frontend`** ✅ CRITICAL
- [ ] Framework auto-detected as Node.js (or manually selected)
- [ ] Build command visible: `npm install && npm run build`
- [ ] Start command visible
- [ ] Clicked "Deploy"
- [ ] Build started successfully

### Monitor Frontend Build
- [ ] Viewed Deployments tab
- [ ] Build logs showing progress
- [ ] No build errors
- [ ] Service shows "Running" status
- [ ] Noted frontend domain (e.g., frontend-prod.railway.app)

---

## Phase 4: Environment Configuration

### Backend Environment Variables
- [ ] Navigated to Backend Service
- [ ] Opened Variables section
- [ ] Added/Updated all variables:
  - [ ] `HOST=0.0.0.0`
  - [ ] `DEBUG=False` (production)
  - [ ] `ENVIRONMENT=production`
  - [ ] `ALLOWED_ORIGINS=https://<frontend-domain>` ✅
  - [ ] `SUPABASE_URL=https://omguovoobfiuaooupzsw.supabase.co`
  - [ ] `SUPABASE_KEY=eyJhbGci...`
  - [ ] `SUPABASE_SERVICE_KEY=eyJhbGci...`
  - [ ] `SECRET_KEY=sb_secret_...`
  - [ ] `SALICON_MODEL_PATH=./ai_models/salicon_model`
  - [ ] `RICO_MODEL_PATH=./ai_models/rico_model`
- [ ] All variables saved

### Frontend Environment Variables
- [ ] Navigated to Frontend Service
- [ ] Opened Variables section
- [ ] Added/Updated variables:
  - [ ] `REACT_APP_API_URL=https://<backend-domain>/api/v1` ✅
  - [ ] `CI=false`
- [ ] All variables saved

### Update CORS After Domains Assigned
- [ ] Backend Service → Variables
- [ ] Updated `ALLOWED_ORIGINS` with actual frontend domain
- [ ] **Redeploy backend service**
- [ ] Wait for backend to finish deployment

---

## Phase 5: Post-Deployment Testing

### Frontend Accessibility
- [ ] Opened frontend domain in browser
- [ ] Page loaded with no 404 errors
- [ ] CSS styling appears correct
- [ ] No console errors (F12)

### Backend API Accessibility
- [ ] Opened backend domain + `/docs` in browser
- [ ] Swagger UI loaded
- [ ] All endpoints visible
- [ ] No errors in documentation

### Health Check
- [ ] Opened: `https://<backend-domain>/api/v1/health`
- [ ] Got response (200 status)
- [ ] Response shows health status

### Network Connectivity
- [ ] Opened frontend in browser
- [ ] Opened DevTools → Network tab
- [ ] Performed action that calls API
- [ ] Request went to correct backend domain
- [ ] Response status is 200
- [ ] **No CORS error in console** ✅

### Authentication Test
- [ ] Frontend loads auth page
- [ ] Clicked signup/login
- [ ] Form submission works
- [ ] Supabase auth functions
- [ ] User created successfully

### Core Feature Test
- [ ] Logged in
- [ ] Uploaded a design file
- [ ] Backend processed upload
- [ ] Analysis completed
- [ ] Results displayed
- [ ] No timeouts or errors

---

## Phase 6: Verification & Monitoring

### Check Service Status
- [ ] Backend Service → Status: Running ✅
- [ ] Frontend Service → Status: Running ✅
- [ ] No service errors in logs

### Monitor Logs
- [ ] Backend Service → Deployments → View Logs
  - [ ] No error messages
  - [ ] App started successfully
- [ ] Frontend Service → Deployments → View Logs
  - [ ] Build completed
  - [ ] No errors

### Domain Configuration
- [ ] Backend domain assigned and working
- [ ] Frontend domain assigned and working
- [ ] ALLOWED_ORIGINS includes frontend domain
- [ ] No mixed content warnings

### Database Connectivity
- [ ] Backend can connect to Supabase
- [ ] Authentication works
- [ ] Data queries work
- [ ] File uploads work

---

## Phase 7: Final Checklist

### Success Indicators
- [ ] Frontend loads at custom domain ✅
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] API calls return 200
- [ ] Authentication works
- [ ] File uploads work
- [ ] Analysis features work
- [ ] Database operations work

### Production Ready
- [ ] All environment variables set correctly
- [ ] Debug mode disabled on backend
- [ ] CORS configured for production domain
- [ ] Error logging enabled
- [ ] Database backups configured (Supabase)
- [ ] SSL certificates active (Railway handles)

### Documentation
- [ ] README updated with live URLs
- [ ] Team notified of deployment
- [ ] Access credentials shared securely
- [ ] Monitoring set up (if applicable)

---

## Troubleshooting During Deployment

### If Backend Build Fails
- [ ] Check build logs for specific error
- [ ] Verify `requirements.txt` exists in backend/
- [ ] Verify Python version in `runtime.txt`
- [ ] Check for syntax errors in app code
- [ ] Reference: `RAILWAY_BUILD_FIX.md`

### If Frontend Build Fails
- [ ] Check build logs
- [ ] Verify `package.json` exists in frontend/
- [ ] Check for Node version issues
- [ ] Verify build command is correct
- [ ] Check for JavaScript syntax errors

### If Services Won't Start
- [ ] View logs in Railway dashboard
- [ ] Check environment variables are complete
- [ ] Verify start commands are correct
- [ ] Check port configuration
- [ ] Reference: `BACKEND_STARTUP_FIX.md`

### If CORS Errors Appear
- [ ] Verify backend `ALLOWED_ORIGINS` has frontend domain
- [ ] Verify domain format (https://...)
- [ ] Redeploy backend after changing ALLOWED_ORIGINS
- [ ] Clear browser cache
- [ ] Reference: `RAILWAY_DEPLOYMENT_COMPLETE.md`

### If Frontend Can't Reach Backend
- [ ] Verify `REACT_APP_API_URL` in frontend env vars
- [ ] Verify backend domain is correct
- [ ] Verify backend is running
- [ ] Check browser console for exact error
- [ ] Verify CORS headers in backend response

---

## Post-Deployment Maintenance

### Weekly
- [ ] Check service logs for errors
- [ ] Monitor response times
- [ ] Check database query performance
- [ ] Review error tracking (if set up)

### Monthly
- [ ] Update dependencies (if needed)
- [ ] Test all features manually
- [ ] Check storage usage
- [ ] Review costs/usage

### As Needed
- [ ] Deploy updates (git push → auto-deploy)
- [ ] Update environment variables
- [ ] Scale resources if needed
- [ ] Monitor for security updates

---

## Quick Reference Links

| Task | Guide |
|------|-------|
| Stuck at start | `README_START_HERE.md` |
| Master index | `DOCUMENTATION_INDEX_COMPLETE.md` |
| Local setup | `LOCAL_SETUP_GUIDE.md` |
| Railway quick fix | `RAILWAY_QUICK_FIX.md` |
| Railway visual | `RAILWAY_VISUAL_GUIDE.md` |
| Complete Railway | `RAILWAY_DEPLOYMENT_COMPLETE.md` |
| Backend errors | `BACKEND_STARTUP_FIX.md` |
| Build errors | `RAILWAY_BUILD_FIX.md` |

---

## Success! 🎉

Once all items are checked:
- ✅ Your app is running locally OR on Railway
- ✅ All features are working
- ✅ You can access it from the internet
- ✅ Users can use your application

**Celebrate and move forward!** 🚀

---

*Use this checklist as your deployment guide. Check off items as you complete them.*
*Save this file for future reference.*
