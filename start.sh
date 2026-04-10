#!/bin/bash

# ARAI System - Monorepo Build & Deploy Script for Railway

set -e  # Exit on error

echo "🚀 Starting ARAI System build..."

# Determine if we're building backend or frontend
if [ -z "$BUILD_ENV" ]; then
  BUILD_ENV="backend"
fi

echo "📦 Building: $BUILD_ENV"

if [ "$BUILD_ENV" = "backend" ]; then
  echo "🔧 Setting up Python backend..."
  cd backend
  
  # Install Python dependencies
  pip install --no-cache-dir -r requirements.txt
  
  echo "✅ Backend build complete"
  
elif [ "$BUILD_ENV" = "frontend" ]; then
  echo "🔧 Setting up Node.js frontend..."
  cd frontend
  
  # Install Node dependencies
  npm install
  
  # Build React app
  npm run build
  
  echo "✅ Frontend build complete"
  
else
  echo "❌ Unknown BUILD_ENV: $BUILD_ENV"
  echo "Set BUILD_ENV to either 'backend' or 'frontend'"
  exit 1
fi
