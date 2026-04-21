# Environment Variables Configuration

## Overview
This file documents all environment variables needed for deployment.
**DO NOT commit this file to GitHub if it contains real values.**

---

## Backend Environment Variables

### Database Configuration
```env
# Supabase PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:[password]@[project].supabase.co:5432/postgres

# Supabase API Configuration
SUPABASE_URL=https://[project].supabase.co
SUPABASE_KEY=[your_anon_public_key]
```

### Application Settings
```env
# Security - Generate with: python3 -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your_random_secret_key_here

# Environment flag
ENVIRONMENT=production

# CORS - Allowed origins for API requests
ALLOWED_ORIGINS=https://arai-system.ondigitalocean.app,https://yourdomain.com
```

### Email Configuration (SendGrid)
```env
# SendGrid API Key - Get from https://sendgrid.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

### Optional Advanced Settings
```env
# API Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60

# File Upload Settings
MAX_FILE_SIZE=52428800  # 50MB in bytes
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,docx,xlsx

# Logging
LOG_LEVEL=INFO
```

---

## Frontend Environment Variables

### API Configuration
```env
# Backend API URL
REACT_APP_API_URL=https://arai-system.ondigitalocean.app/api

# Environment flag
REACT_APP_ENVIRONMENT=production
```

### Optional Frontend Settings
```env
# Feature flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_DEBUG=false

# Analytics
REACT_APP_ANALYTICS_ID=your_analytics_id
```

---

## How to Get These Values

### 1. Supabase Credentials

Navigate to your Supabase project:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**

**For DATABASE_URL:**
- Copy the connection string under "Connection pooler"
- Format: `postgresql://postgres:[password]@[host]:5432/postgres`
- Replace `[password]` with your database password

**For SUPABASE_URL:**
- Go to **Settings** → **API**
- Copy the "Project URL"

**For SUPABASE_KEY:**
- Go to **Settings** → **API**
- Under "Project API keys", copy "anon public"

### 2. SendGrid API Key

1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Give it a name (e.g., "ARAI System")
5. Select "Restricted Access" 
6. Enable Mail Send permission
7. Copy the key (shown only once!)

### 3. Secret Key Generation

Generate a secure random key:

```bash
# Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Example output: `9dF_Kc2xL9mN4pQ5rS6tU7vW8xY9zA0bCdE1fGhI2jK`

### 4. ALLOWED_ORIGINS

After you have your DigitalOcean domain:

- DigitalOcean auto-domain: `https://arai-system-xxxxx.ondigitalocean.app`
- Custom domain: `https://yourdomain.com`
- Include both HTTP and HTTPS if needed (separated by commas)

---

## Setting Variables in DigitalOcean

### Via Dashboard

1. Log in to DigitalOcean
2. Go to **Apps** → Your App → **Settings**
3. Under "Components", click your service (backend or frontend)
4. Scroll to "Envs" section
5. Click **Edit** for each variable
6. Enter the key-value pairs
7. Click **Save**

### Via app.yaml

Add to your service configuration:

```yaml
services:
  - name: backend
    envs:
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        value: postgresql://...
      - key: SECRET_KEY
        scope: RUN_AND_BUILD_TIME
        value: your_secret_here
```

---

## Security Best Practices

### ⚠️ DO NOT

```
❌ Commit .env files to GitHub
❌ Share API keys via email or chat
❌ Use the same secret key for multiple apps
❌ Hardcode secrets in source code
❌ Use weak passwords or keys
❌ Leave default database passwords
```

### ✅ DO

```
✅ Use DigitalOcean's environment variable system
✅ Generate strong, random secret keys
✅ Rotate API keys periodically
✅ Limit API key permissions (use scopes)
✅ Store credentials in a password manager
✅ Use different values for dev/staging/production
✅ Enable 2FA on SendGrid and Supabase accounts
```

---

## Testing Environment Variables

### Backend Test

After setting variables, test your backend:

```bash
# Test via API
curl https://your-app.ondigitalocean.app/api/health

# Check logs in DigitalOcean dashboard
# Apps → Your App → Runtime logs
```

### Frontend Test

```bash
# Check browser console for API errors
# Frontend should load without 404s
# Network tab should show API responses
```

---

## Troubleshooting

### Error: "Connection refused"
**Problem**: DATABASE_URL is incorrect
**Solution**: Double-check Supabase connection string, ensure password is correct

### Error: "CORS policy"
**Problem**: ALLOWED_ORIGINS doesn't match your domain
**Solution**: Add your domain to ALLOWED_ORIGINS, redeploy

### Error: "Invalid API key"
**Problem**: SUPABASE_KEY is wrong or expired
**Solution**: Generate a new key in Supabase dashboard

### Error: "Mail send failed"
**Problem**: SENDGRID_API_KEY is incorrect or has wrong permissions
**Solution**: Create a new API key with Mail Send permission

---

## Variable Reference Table

| Variable | Service | Required | Source | Format |
|----------|---------|----------|--------|--------|
| DATABASE_URL | Backend | ✅ Yes | Supabase Settings | postgres://user:pass@host:5432/db |
| SUPABASE_URL | Backend | ✅ Yes | Supabase Settings | https://xxx.supabase.co |
| SUPABASE_KEY | Backend | ✅ Yes | Supabase Settings | Long alphanumeric string |
| SECRET_KEY | Backend | ✅ Yes | Generate new | Random 32+ chars |
| SENDGRID_API_KEY | Backend | ⚠️ Optional | SendGrid | SG.xxxxxxxx... |
| ALLOWED_ORIGINS | Backend | ✅ Yes | Your domain | https://domain.com,https://www.domain.com |
| ENVIRONMENT | Backend | Optional | Yours | production, staging, development |
| REACT_APP_API_URL | Frontend | ✅ Yes | DigitalOcean | https://your-api-endpoint |
| REACT_APP_ENVIRONMENT | Frontend | Optional | Yours | production, staging, development |

---

## Updates & Rotation

### When to Update Variables

- 📅 Every 90 days: Rotate API keys
- 🔄 After GitHub security alert: Rotate SECRET_KEY
- 🚨 If key is exposed: Regenerate immediately
- 🆕 When deploying to new environment: Create new keys
- 📈 When scaling: Review and increase rate limits if needed

### How to Update

1. Generate new value
2. Go to DigitalOcean dashboard
3. Edit the variable
4. DigitalOcean will auto-restart affected services
5. Verify in logs that service started correctly

---

## Example: Complete Backend Configuration

```env
# Database
DATABASE_URL=postgresql://postgres:MySecurePassword123@abc123.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://abc123.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security
SECRET_KEY=9dF_Kc2xL9mN4pQ5rS6tU7vW8xY9zA0bCdE1fGhI2jK
ENVIRONMENT=production

# CORS
ALLOWED_ORIGINS=https://arai-system-abc123.ondigitalocean.app,https://arai.yourdomain.com

# Email
SENDGRID_API_KEY=SG.h1TH6Kn2K9n9N7p8R2q5S6t7U8v9W0x1Y2z3A4b5C

# Limits
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
MAX_FILE_SIZE=52428800
```

---

**Last Updated**: April 21, 2026
**Version**: 1.0
