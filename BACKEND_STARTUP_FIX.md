# Backend Startup Issues - Troubleshooting Guide

## Issue: Backend fails to start with Exit Code 1

### Common Causes & Fixes:

---

## 1. **Missing Dependencies**

### Error:
```
ModuleNotFoundError: No module named 'fastapi'
Exit Code: 1
```

### Fix:
```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Activate venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify FastAPI installed
pip list | grep fastapi
```

---

## 2. **Virtual Environment Not Activated**

### Error:
```
python: command not found
Exit Code: 127
```

### Fix:
```bash
# Make sure you're in backend directory
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Activate virtual environment
source venv/bin/activate

# Should see (venv) prefix in terminal
```

---

## 3. **Port Already in Use**

### Error:
```
Address already in use
Exit Code: 1
```

### Fix - Option A (Change port):
```bash
# Use a different port
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Then update frontend .env:
# REACT_APP_API_URL=http://localhost:8001/api/v1
```

### Fix - Option B (Kill existing process):
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process (replace PID with the number from above)
kill -9 <PID>

# Then start backend normally
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 4. **Missing Environment Variables**

### Error:
```
KeyError: 'SUPABASE_URL'
Exit Code: 1
```

### Fix:
```bash
# Verify .env file exists
ls -la /Users/kavishani/Documents/FYP/arai-system/backend/.env

# If missing, check what variables are needed in app/main.py
# Restore .env from the template provided
```

---

## 5. **AI Models Not Found**

### Error:
```
FileNotFoundError: ./ai_models/salicon_model not found
Exit Code: 1
```

### Fix:
```bash
# Create ai_models directory if it doesn't exist
cd /Users/kavishani/Documents/FYP/arai-system/backend
mkdir -p ai_models
mkdir -p ai_models/salicon_model
mkdir -p ai_models/rico_model

# If you have actual models, place them there
# Or update app/main.py to handle missing models gracefully
```

---

## 6. **Python Version Incompatibility**

### Error:
```
SyntaxError: Invalid syntax (Python 3.8 or older)
Exit Code: 1
```

### Fix:
```bash
# Check Python version
python --version
python3 --version

# Should be Python 3.11+
# If not, specify python3:

python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 7. **Import Errors**

### Error:
```
ModuleNotFoundError: No module named 'app'
Exit Code: 1
```

### Fix:
```bash
# Make sure you're in the backend directory
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Check that app/ directory exists
ls -la app/

# Verify __init__.py exists
ls -la app/__init__.py

# Try running from backend directory with:
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Step-by-Step Startup (Guaranteed to Work)

```bash
# Step 1: Navigate to backend
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Step 2: List what's there
ls -la

# Step 3: Check if venv exists
ls -la venv/

# Step 4: If venv doesn't exist, create it
python3 -m venv venv

# Step 5: Activate venv
source venv/bin/activate

# You should see (venv) prefix now

# Step 6: Upgrade pip
pip install --upgrade pip

# Step 7: Install requirements
pip install -r requirements.txt

# Step 8: Check installation
pip list | grep fastapi

# Step 9: Start server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

---

## Verify Backend is Running

In a new terminal (keep backend running):

```bash
# Test health endpoint
curl http://localhost:8000/api/v1/health

# Should return something like: {"status":"ok"}

# View API docs
# Open in browser: http://localhost:8000/docs
```

---

## If Still Having Issues

### 1. Check the exact error message
```bash
# Run with verbose output
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

### 2. Check app/main.py structure
```bash
cat app/main.py | head -50
```

### 3. Check for circular imports
Look in app/ directory for import issues

### 4. Verify all dependencies
```bash
pip install -r requirements.txt --verbose
```

---

## Quick Debugging Commands

```bash
# What Python are we using?
which python
which python3

# What version?
python --version

# Where's the venv?
which python  # should show venv path

# What's installed?
pip list

# Are we in venv?
echo $VIRTUAL_ENV  # should show path to venv

# Check if fastapi works
python -c "import fastapi; print(fastapi.__version__)"

# Check if app can be imported
python -c "from app import main"

# List files in app directory
ls -la app/
```

---

## Final Checklist Before Asking for Help

- [ ] Using `python3` (not `python` if Python 2.x is default)
- [ ] Virtual environment activated (see `(venv)` in terminal)
- [ ] Requirements installed: `pip list | grep fastapi`
- [ ] In correct directory: `pwd` shows `.../backend`
- [ ] Backend `.env` exists: `ls -la .env`
- [ ] app/ directory exists: `ls -la app/`
- [ ] app/main.py exists: `ls -la app/main.py`
- [ ] app/__init__.py exists: `ls -la app/__init__.py`
- [ ] No other process on port 8000: `lsof -i :8000`

---

If you still get errors, share:
1. The exact error message
2. Output of `python --version`
3. Output of `pip list`
4. Current directory from `pwd`

Good luck! 🎯
