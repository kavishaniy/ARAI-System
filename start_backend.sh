#!/bin/bash
cd /Users/kavishani/Documents/FYP/arai-system/backend
export PYTHONUNBUFFERED=1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level info
