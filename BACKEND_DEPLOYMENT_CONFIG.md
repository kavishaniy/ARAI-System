# Backend Deployment Configuration Reference

## Backend Project Structure

```
backend/
├── Procfile              ✅ Configured for Railway/Heroku
├── Dockerfile            ✅ Docker container config
├── Aptfile              ✅ System dependencies (Tesseract OCR)
├── requirements.txt      ✅ Python dependencies
├── runtime.txt           ✅ Python 3.11.9
├── railway.json          ✅ Railway config
├── app/
│   ├── main.py          ✅ FastAPI app with CORS
│   ├── core/
│   │   └── config.py    ✅ Environment configuration
│   ├── api/
│   │   ├── auth.py      ✅ Authentication endpoints
│   │   └── analysis.py  ✅ Analysis endpoints
│   └── ...
└── .env                  ⚠️  LOCAL ONLY (not committed)
```

---

## Configuration Files Summary

### 1. Procfile
```plaintext
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
✅ **Status:** Correct for Railway deployment

### 2. runtime.txt
```plaintext
python-3.11.9
```
✅ **Status:** Correct Python version

### 3. Aptfile (System Dependencies)
```plaintext
tesseract-ocr
tesseract-ocr-eng
```
✅ **Status:** Required for OCR functionality

### 4. Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1-mesa-glx \
    libglib2.0-0
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
✅ **Status:** Correct for containerized deployment

### 5. requirements.txt
**Core Dependencies:**
- fastapi==0.104.1 - Web framework
- uvicorn==0.24.0 - ASGI server
- pydantic==2.5.0 - Data validation
- supabase==2.0.3 - Database & Auth

**Image Processing:**
- pillow==10.4.0 - Image manipulation
- opencv-python-headless==10.0.84 - Computer vision
- pytesseract>=0.3.10 - OCR

**Text Analysis:**
- reportlab>=4.0.7 - PDF generation
- textstat>=0.7.3 - Readability metrics

✅ **Status:** All production-ready

---

## app/main.py - CORS Configuration

**Already Configured for Vercel:**

```python
cors_origins = [
    "http://localhost:3000",              # Local React dev
    "http://localhost:5173",              # Vite dev
    "https://arai-system.vercel.app",     # Production Vercel
    "https://arai-system-git-main-kavishaniy.vercel.app",  # Vercel preview
    "https://arai-system-kavishaniy.vercel.app",           # Vercel deployment
]

# Dynamic CORS for all *.vercel.app domains
re.match(r"https://.*\.vercel\.app$", origin)
```

✅ **Status:** Ready for Vercel deployment

---

## Railway Environment Variables to Set

When deploying to Railway, set these variables:

| Variable | Value | Example |
|----------|-------|---------|
| PYTHONUNBUFFERED | 1 | 1 |
| ENVIRONMENT | production | production |
| DEBUG | False | False |
| PORT | 8000 | 8000 |
| SUPABASE_URL | Your Supabase URL | https://xxxx.supabase.co |
| SUPABASE_KEY | Your Supabase Key | eyJhbGc... |
| ALLOWED_ORIGINS | Comma-separated URLs | https://arai-system.vercel.app |

**How to find Supabase credentials:**
1. Go to https://supabase.com
2. Login with your account
3. Select your project
4. Go to Settings → API
5. Copy "Project URL" and "anon public" key

---

## app/core/config.py - Settings

```python
class Settings(BaseSettings):
    # Server Configuration
    HOST: str = "0.0.0.0"           # Listen on all interfaces
    PORT: int = 8000                # Default port
    DEBUG: bool = True              # Set to False in production
    ENVIRONMENT: str = "development" # Override with "production"
    
    # API Settings
    API_V1_STR: str = "/api/v1"     # API prefix
    PROJECT_NAME: str = "ARAI - ACCESSIBILITY READABILITY ATTENTION INDEX"
    
    # Database/Auth
    SUPABASE_URL: str = ""          # Set in environment
    SUPABASE_KEY: str = ""          # Set in environment
    
    # CORS
    ALLOWED_ORIGINS: str = ""       # Comma-separated, set in environment
```

✅ **Status:** Flexible and environment-aware

---

## API Endpoints (Backend Provides)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/signup` | POST | User registration |
| `/api/v1/auth/logout` | POST | User logout |
| `/api/v1/analysis/upload` | POST | Upload design |
| `/api/v1/analysis/{id}` | GET | Get analysis results |
| `/api/v1/analysis/` | GET | List analyses |

---

## Deployment Checklist - Backend

- [ ] All files present and committed to GitHub
- [ ] No `.env` file committed (only `.env.example` if needed)
- [ ] Python dependencies listed in requirements.txt
- [ ] System dependencies listed in Aptfile
- [ ] Procfile configured correctly
- [ ] Dockerfile ready for containerization
- [ ] CORS origins include your Vercel domain
- [ ] Supabase credentials ready (URL and Key)
- [ ] Railway project created and connected
- [ ] Environment variables set in Railway dashboard
- [ ] Deployment successful (watch logs)
- [ ] Health endpoint responds (curl test)

---

## Docker Build & Run (Local Testing)

If you want to test the Docker build locally:

```bash
# Build image
docker build -t arai-backend .

# Run container
docker run -p 8000:8000 \
  -e SUPABASE_URL="your_url" \
  -e SUPABASE_KEY="your_key" \
  arai-backend

# Visit: http://localhost:8000/docs (Swagger UI)
```

---

## Railway Deployment Process

1. **Create Railway Account** → https://railway.app
2. **Create New Project** → "Deploy from GitHub"
3. **Select Repository** → kavishaniy/ARAI-System
4. **Wait for Detection** → Recognizes Python project
5. **Add Variables** → Set environment variables
6. **Monitor Deployment** → Watch build logs
7. **Get Public URL** → Copy from Settings → Domains
8. **Test Endpoint** → `curl https://YOUR_RAILWAY_URL/api/v1/health`

---

## Production Best Practices

✅ **Already Implemented:**
- Proper CORS configuration
- Environment variable management
- Production-optimized dependencies
- Error handling with proper HTTP codes
- Request validation with Pydantic
- JWT token-based authentication
- Database abstraction with Supabase

⚠️ **Consider for Future:**
- API rate limiting
- Request logging
- Error tracking (Sentry, etc.)
- Database connection pooling
- Caching layer (Redis)
- Load balancing (if scaling)

---

## Monitoring & Logs

### Railway Logs
- Dashboard → Your Service → Logs tab
- Real-time log stream
- Filter by date/level
- Download full logs

### Vercel Logs
- Dashboard → Deployments → Click deployment → Logs
- Build logs and runtime logs separated
- Real-time monitoring

### Health Check
```bash
# Basic health check
curl https://YOUR_RAILWAY_URL/api/v1/health

# With verbose output
curl -v https://YOUR_RAILWAY_URL/api/v1/health

# JSON formatted
curl -s https://YOUR_RAILWAY_URL/api/v1/health | jq .
```

---

## Quick Commands

```bash
# Install dependencies locally
pip install -r requirements.txt

# Run backend locally
uvicorn app.main:app --reload

# Build Docker image
docker build -t arai-backend .

# Run Docker container
docker run -p 8000:8000 arai-backend
```

---

**Status:** ✅ Ready for Railway Deployment
