#!/bin/bash
# Quick Start Script for ARAI Saliency Model Training

echo "🎓 ARAI Saliency Model Training - Quick Start"
echo "=============================================="
echo ""

# Step 1: Check Python
echo "📍 Step 1: Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "   ✅ Found: $PYTHON_VERSION"
else
    echo "   ❌ Python 3 not found! Please install Python 3.8+"
    exit 1
fi

# Step 2: Install dependencies
echo ""
echo "📍 Step 2: Installing PyTorch and dependencies..."
echo "   This may take several minutes..."
echo ""

cd /Users/kavishani/Documents/FYP/arai-system/backend

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   Detected macOS"
    pip3 install torch torchvision torchaudio
else
    echo "   Detected Linux/Other"
    read -p "   Do you have NVIDIA GPU? (y/n): " has_gpu
    if [ "$has_gpu" = "y" ]; then
        pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    else
        pip3 install torch torchvision torchaudio
    fi
fi

pip3 install opencv-python pillow numpy scipy scikit-image tqdm matplotlib

# Step 3: Check for dataset
echo ""
echo "📍 Step 3: Checking for dataset..."
if [ -d "../data/salicon/images" ] && [ -d "../data/salicon/maps" ]; then
    IMAGE_COUNT=$(ls -1 ../data/salicon/images | wc -l)
    MAP_COUNT=$(ls -1 ../data/salicon/maps | wc -l)
    echo "   ✅ Found SALICON dataset:"
    echo "      Images: $IMAGE_COUNT"
    echo "      Maps: $MAP_COUNT"
else
    echo "   ⚠️  SALICON dataset not found!"
    echo ""
    echo "   Options:"
    echo "   1. Download SALICON from: http://salicon.net/"
    echo "   2. Create synthetic dataset (for testing)"
    echo ""
    read -p "   Create synthetic dataset from uploads? (y/n): " create_synthetic
    
    if [ "$create_synthetic" = "y" ]; then
        echo "   Creating synthetic dataset..."
        mkdir -p ../data/sample_saliency/{images,maps}
        
        # Copy sample images
        find ../uploads -name "original.*" -type f | head -20 | while read file; do
            cp "$file" ../data/sample_saliency/images/
        done
        
        # Create synthetic maps
        python3 -c "from training.dataset import create_synthetic_saliency_maps; create_synthetic_saliency_maps('../data/sample_saliency/images', '../data/sample_saliency/maps')"
        
        echo "   ✅ Created synthetic dataset"
        
        # Update config in train script
        echo "   Updating config to use synthetic dataset..."
        sed -i.bak "s|'image_dir': '../data/salicon/images'|'image_dir': '../data/sample_saliency/images'|g" training/train_saliency.py
        sed -i.bak "s|'saliency_dir': '../data/salicon/maps'|'saliency_dir': '../data/sample_saliency/maps'|g" training/train_saliency.py
        sed -i.bak "s|'num_epochs': 50|'num_epochs': 10|g" training/train_saliency.py
    else
        echo "   ⚠️  Please download SALICON dataset and rerun this script"
        exit 1
    fi
fi

# Step 4: Start training
echo ""
echo "📍 Step 4: Ready to start training!"
echo ""
echo "   Configuration:"
echo "   - Image size: 256x256"
echo "   - Batch size: 8 (reduce if out of memory)"
echo "   - Learning rate: 0.0001"
echo "   - Epochs: 50 (or 10 for synthetic data)"
echo ""
read -p "   Start training now? (y/n): " start_training

if [ "$start_training" = "y" ]; then
    echo ""
    echo "🚀 Starting training..."
    echo "   Press Ctrl+C to stop training"
    echo ""
    cd training
    python3 train_saliency.py
else
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "To start training manually, run:"
    echo "   cd /Users/kavishani/Documents/FYP/arai-system/backend/training"
    echo "   python3 train_saliency.py"
fi
