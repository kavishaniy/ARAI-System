# DigitalOcean Deployment Checklist

## Pre-Deployment ✓

- [ ] GitHub repository is public or DigitalOcean has access
- [ ] All code is pushed to `main` branch
- [ ] `app.yaml` file exists at repository root
- [ ] `DEPLOYMENT_GUIDE.md` has been reviewed
- [ ] Supabase credentials are available

## Environment Variables Ready

### Backend Variables
- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_KEY` - Supabase anon public key
- [ ] `SECRET_KEY` - Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- [ ] `SENDGRID_API_KEY` - SendGrid API key (optional but recommended)
- [ ] `ALLOWED_ORIGINS` - Your domain or `https://arai-system.ondigitalocean.app`

### Frontend Variables
- [ ] `REACT_APP_API_URL` - Backend endpoint (e.g., `https://arai-system.ondigitalocean.app/api`)

## DigitalOcean Setup

- [ ] DigitalOcean account created
- [ ] $200 credit received (check account)
- [ ] Personal Access Token generated
- [ ] GitHub account connected to DigitalOcean

## Deployment Steps

1. [ ] Log in to [DigitalOcean Dashboard](https://cloud.digitalocean.com/apps)
2. [ ] Click **Create** → **Apps**
3. [ ] Select **GitHub** and authorize
4. [ ] Select repository: `ARAI-System`
5. [ ] Select branch: `main`
6. [ ] Check **Autodeploy on push** ✅
7. [ ] Click **Next**
8. [ ] Verify auto-detected components:
   - [ ] Backend (Python/FastAPI)
   - [ ] Frontend (Node.js/React)
9. [ ] Add all environment variables
10. [ ] Select **Basic** plan (~$25/month)
11. [ ] Review settings
12. [ ] Click **Create Resources**
13. [ ] Wait 5-15 minutes for deployment
14. [ ] Click live URL to test application

## Post-Deployment Verification

- [ ] Frontend loads without errors
- [ ] Backend health check passes (`/health` endpoint)
- [ ] Frontend can communicate with backend
- [ ] No CORS errors in browser console
- [ ] Login functionality works
- [ ] File upload works (if applicable)
- [ ] Database queries return correct data

## Production Setup

- [ ] Custom domain configured (optional)
- [ ] SSL/TLS certificate enabled (automatic)
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] Monitoring alerts set up
- [ ] Rate limiting configured
- [ ] CORS origins updated with custom domain

## Maintenance Reminders

- [ ] Monitor app metrics weekly
- [ ] Check logs for errors
- [ ] Update dependencies monthly
- [ ] Review security logs
- [ ] Test deployment regularly
- [ ] Backup database periodically

## Quick Commands

### Generate a secure SECRET_KEY
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Test backend locally before deploying
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### Test frontend locally
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8080/api npm start
```

### Push to GitHub
```bash
git add .
git commit -m "Update deployment configuration"
git push origin main
```

---

## Support Links

- **DigitalOcean Docs**: https://docs.digitalocean.com/products/app-platform/
- **App Platform Getting Started**: https://docs.digitalocean.com/products/app-platform/getting-started/
- **App Spec Reference**: https://docs.digitalocean.com/products/app-platform/references/app-spec/

---

## Important Notes

⚠️ **Security Warning**: 
- Never commit `.env` files to GitHub
- Keep API keys and passwords secure
- Use DigitalOcean's built-in secret management

✅ **Best Practices**:
- Test locally before pushing to GitHub
- Use environment variables for all sensitive data
- Enable automatic backups for databases
- Monitor resource usage and scale as needed

📞 **Need Help?**
- Check DigitalOcean dashboard logs
- Review `DEPLOYMENT_GUIDE.md` troubleshooting section
- Contact DigitalOcean support

---

**Last Updated**: April 21, 2026
