# Vercel Frontend Deployment Guide

## Prerequisites
- ✅ Backend already hosted on Railway at `https://arai-system-production.up.railway.app/api/v1`
- Vercel account (free tier available)
- GitHub account with your repository pushed

## Step-by-Step Deployment Instructions

### 1. **Prepare Your Frontend for Deployment**

Your frontend is already configured with:
- React 18.2.0
- React Router DOM
- Axios for API calls
- Tailwind CSS
- Environment variables set up

The `.env.production` file is already configured with:
```
REACT_APP_API_URL=https://arai-system-production.up.railway.app/api/v1
```

### 2. **Push Code to GitHub**

Make sure your code is pushed to GitHub:
```bash
cd /Users/kavishani/Documents/FYP/arai-system
git add .
git commit -m "Prepare frontend for Vercel deployment"
git push origin main
```

### 3. **Connect to Vercel**

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with your GitHub account
3. Click **"New Project"**
4. Select your GitHub repository: `kavishaniy/ARAI-System`
5. Choose the frontend folder as the root directory
6. Configure settings:
   - **Framework Preset**: React (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### 4. **Set Environment Variables in Vercel**

In the Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variable:
   ```
   Name: REACT_APP_API_URL
   Value: https://arai-system-production.up.railway.app/api/v1
   ```
3. Make sure it's set for all environments (Production, Preview, Development)

### 5. **Deploy**

After setting environment variables:
1. Click **"Deploy"**
2. Vercel will automatically build your project
3. Once deployment is complete, you'll get a URL like: `https://your-project-name.vercel.app`

### 6. **Configure Custom Domain (Optional)**

If you want a custom domain:
1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### 7. **Verify API Connection**

After deployment:
1. Visit your Vercel URL
2. Open browser DevTools (F12)
3. Go to Network tab
4. Test API calls to verify backend connection
5. Check Console for any CORS or API errors

## Troubleshooting

### Issue: API calls not working
**Solution**: 
- Verify Railway backend is running
- Check that `REACT_APP_API_URL` environment variable is set in Vercel
- Ensure backend CORS is configured to allow requests from your Vercel domain
- Check the backend logs on Railway for any errors

### Issue: Build fails
**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try running `npm install && npm run build` locally first

### Issue: Environment variables not loaded
**Solution**:
- Environment variables must start with `REACT_APP_` prefix in React
- Redeploy after setting environment variables
- Variables set in Vercel don't automatically apply to old deployments

## Backend CORS Configuration

If you get CORS errors, update your backend `app.py`:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://your-vercel-url.vercel.app",
            "http://localhost:3000"  # for local development
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

Update with your actual Vercel URL after deployment.

## Quick Commands Reference

```bash
# Build locally to test
npm run build

# Start development server
npm start

# Check for errors
npm run test
```

## Support & Docs
- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment Guide](https://create-react-app.dev/deployment/vercel/)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

## Next Steps

1. ✅ Ensure GitHub repo is up to date
2. ✅ Create Vercel project connected to your repository
3. ✅ Set `REACT_APP_API_URL` environment variable
4. ✅ Deploy and verify backend connectivity
5. ✅ Update CORS settings on backend if needed
