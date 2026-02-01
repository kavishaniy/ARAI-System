# 🚀 Quick Access Guide - ARAI System

## 📌 Correct URLs to Use

### Backend API (Port 8000)
```
✅ http://localhost:8000              → Main API endpoint
✅ http://localhost:8000/docs         → Interactive API documentation (Swagger)
✅ http://localhost:8000/health       → Health check
✅ http://localhost:8000/api/v1/      → API v1 endpoints

❌ http://0.0.0.0:8000                → Will NOT work (blank page)
```

### Frontend App (Port 3000)
```
✅ http://localhost:3000              → React frontend
✅ http://192.168.1.92:3000          → Access from other devices

❌ http://0.0.0.0:3000                → Will NOT work
```

---

## 🎯 What Each URL Does

### Backend URLs

| URL | Purpose | What You See |
|-----|---------|--------------|
| `http://localhost:8000/` | API root | JSON: `{"message": "ARAI API is running"}` |
| `http://localhost:8000/docs` | API Docs | Interactive Swagger UI |
| `http://localhost:8000/health` | Health Check | JSON: `{"status": "healthy"}` |
| `http://localhost:8000/api/v1/auth/` | Auth endpoints | Authentication APIs |
| `http://localhost:8000/api/v1/analysis/` | Analysis endpoints | Design analysis APIs |

### Frontend URLs

| URL | Purpose | What You See |
|-----|---------|--------------|
| `http://localhost:3000/` | Main app | Login/Signup page |
| `http://localhost:3000/dashboard` | Dashboard | User dashboard (after login) |

---

## 🔧 Starting the Servers

### Backend
```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
✅ Loaded saliency model from .../models/saliency_model.pth
INFO:     Application startup complete.
```

**Then access via:** http://localhost:8000

### Frontend
```bash
cd /Users/kavishani/Documents/FYP/arai-system/frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
Local:            http://localhost:3000
On Your Network:  http://192.168.1.92:3000
```

**Then access via:** http://localhost:3000

---

## 🌐 Why 0.0.0.0 vs localhost?

### Server Configuration (0.0.0.0)
- `--host 0.0.0.0` tells the server to listen on **all network interfaces**
- Allows access from:
  - Your computer (via localhost)
  - Other devices on your network (via 192.168.x.x)
  - Docker containers
  - Virtual machines

### Browser Access (localhost)
- Browsers need a **resolvable hostname** or IP
- `0.0.0.0` is a special "bind to all" address, not accessible directly
- Use `localhost` or `127.0.0.1` to connect to your local server

### Analogy
```
0.0.0.0:8000 → "Listen on all doors" (server-side)
localhost:8000 → "Knock on the front door" (client-side)
```

---

## 🧪 Testing Your Endpoints

### Using cURL (Terminal)
```bash
# Health check
curl http://localhost:8000/health

# Main API
curl http://localhost:8000/

# API docs (HTML)
curl http://localhost:8000/docs
```

### Using Browser
1. **API Documentation:** http://localhost:8000/docs
2. **Frontend App:** http://localhost:3000
3. **Health Check:** http://localhost:8000/health

### Using Python
```python
import requests

# Test backend
response = requests.get('http://localhost:8000/')
print(response.json())
# Output: {'message': 'ARAI API is running', 'version': '1.0.0', 'status': 'healthy'}
```

---

## 📱 Accessing from Other Devices

### Find Your Network IP
```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# Output example:
# inet 192.168.1.92 netmask 0xffffff00 broadcast 192.168.1.255
```

### Access from Phone/Tablet
1. Make sure device is on same Wi-Fi network
2. Use your computer's IP address:
   - Backend: `http://192.168.1.92:8000`
   - Frontend: `http://192.168.1.92:3000`

---

## ⚠️ Common Mistakes

| ❌ Wrong | ✅ Correct | Why |
|----------|-----------|-----|
| `http://0.0.0.0:8000` | `http://localhost:8000` | 0.0.0.0 is not a valid browser address |
| `http://127.0.0.1:3000` | `http://localhost:3000` | Both work, localhost is more readable |
| `http://localhost:8000` (no backend running) | Start backend first | Connection refused error |
| `https://localhost:8000` | `http://localhost:8000` | No SSL in dev mode |

---

## 🚨 Troubleshooting

### "This site can't be reached"
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not running, start it:
cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### "Blank Page" on 0.0.0.0:8000
```
Problem: Using 0.0.0.0 in browser
Solution: Change URL to http://localhost:8000
```

### "Connection Refused"
```bash
# Check if port is in use
lsof -i :8000

# Kill existing process
lsof -ti:8000 | xargs kill -9

# Restart server
```

### "Cannot GET /"
```
Problem: Wrong endpoint or server not fully started
Solution: Wait for "Application startup complete" message
          Then try http://localhost:8000/docs
```

---

## 🎯 Quick Reference

### Backend is Running When You See:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
✅ Loaded saliency model from models/saliency_model.pth
INFO:     Application startup complete.
```

### Access It Via:
- **API Docs:** http://localhost:8000/docs ← **Start here!**
- **API Root:** http://localhost:8000/
- **Health:** http://localhost:8000/health

### Frontend is Running When You See:
```
Compiled successfully!
Local:            http://localhost:3000
```

### Access It Via:
- **Main App:** http://localhost:3000

---

## 📚 Related Documentation

- **Using the Trained Model:** See `USING_TRAINED_MODEL.md`
- **Model Ready Guide:** See `MODEL_READY.md`
- **Training Guide:** See `GOOGLE_COLAB_TRAINING_GUIDE.md`
- **System Architecture:** See `ARCHITECTURE.md`

---

## ✅ Checklist for Quick Start

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:8000/docs
- [ ] Can access http://localhost:3000
- [ ] Saliency model loaded (check backend logs)
- [ ] Supabase connected (no errors in backend logs)

---

**Remember:** Always use `localhost` or `127.0.0.1` in your browser, not `0.0.0.0`! 🎯
