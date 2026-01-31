# 🎓 Complete Guide: Training & Integrating Saliency Model

## Overview

This guide will help you train a U-Net CNN model for saliency prediction and integrate it into your ARAI web app.

**Estimated Time:** 
- Dataset download: 2-4 hours
- Training: 4-12 hours (depending on hardware)
- Integration: 30 minutes

**Requirements:**
- Python 3.8+
- 8GB+ RAM (16GB recommended)
- GPU highly recommended (10x faster training)
- ~20GB disk space for datasets

---

## 📋 Table of Contents

1. [Setup Environment](#step-1-setup-environment)
2. [Download Datasets](#step-2-download-datasets)
3. [Prepare Data](#step-3-prepare-data)
4. [Create Training Script](#step-4-create-training-script)
5. [Train Model](#step-5-train-model)
6. [Integrate Model](#step-6-integrate-model)
7. [Test & Validate](#step-7-test--validate)
8. [Troubleshooting](#troubleshooting)

---

## Step 1: Setup Environment

### 1.1 Install Dependencies

```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Install PyTorch (choose based on your system)
# For Mac (CPU):
pip install torch torchvision

# For Mac with Apple Silicon (M1/M2):
pip install torch torchvision torchaudio

# For Linux/Windows with NVIDIA GPU:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install additional dependencies
pip install opencv-python pillow numpy scipy scikit-image tqdm matplotlib
```

### 1.2 Verify Installation

```python
# test_torch.py
import torch
import torchvision

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"Device: {'cuda' if torch.cuda.is_available() else 'cpu'}")

# Test simple tensor operation
x = torch.randn(3, 224, 224)
print(f"✅ PyTorch working! Tensor shape: {x.shape}")
```

Run:
```bash
python test_torch.py
```

---

## Step 2: Download Datasets

### Option A: SALICON Dataset (Recommended for Beginners)

**Size:** ~5GB  
**Images:** 10,000 training images  
**Best for:** Quick training, good results

```bash
cd /Users/kavishani/Documents/FYP/arai-system/data

# Create directories
mkdir -p salicon/images salicon/maps

# Download from official source
# Visit: http://salicon.net/download/

# Or use wget (if available):
wget http://salicon.net/challenge-2017/download/salicon-2017-train.zip
wget http://salicon.net/challenge-2017/download/salicon-2017-val.zip

# Unzip
unzip salicon-2017-train.zip -d salicon/
unzip salicon-2017-val.zip -d salicon/

# Expected structure:
# salicon/
#   ├── images/
#   │   ├── COCO_train2014_000000000009.jpg
#   │   ├── COCO_train2014_000000000025.jpg
#   │   └── ...
#   └── maps/
#       ├── COCO_train2014_000000000009.png
#       ├── COCO_train2014_000000000025.png
#       └── ...
```

### Option B: MIT Saliency Benchmark (Advanced)

**Size:** ~2GB  
**Images:** 1,003 images  
**Best for:** Academic research

```bash
cd /Users/kavishani/Documents/FYP/arai-system/data/mit_saliency

# Download from: http://saliency.mit.edu/datasets.html
# Manual download required (registration may be needed)

# Expected structure:
# mit_saliency/
#   ├── images/
#   └── fixations/ or maps/
```

### Option C: Use Sample Data (Quick Start)

If you want to test quickly:

```bash
cd /Users/kavishani/Documents/FYP/arai-system/data

# Create sample dataset
mkdir -p sample_saliency/{images,maps}

# Copy some UI designs from your uploads folder
cp ../uploads/*/original.* sample_saliency/images/

# We'll create synthetic saliency maps for quick testing
```

---

## Step 3: Prepare Data

### 3.1 Create Dataset Loader

```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend
mkdir -p training
touch training/__init__.py
```

Create `training/dataset.py`:

```python
import os
import torch
from torch.utils.data import Dataset
from PIL import Image
import torchvision.transforms as transforms
import numpy as np

class SaliencyDataset(Dataset):
    """
    Dataset loader for saliency prediction
    """
    def __init__(self, image_dir, saliency_dir, transform=None, image_size=256):
        """
        Args:
            image_dir: Directory with input images
            saliency_dir: Directory with saliency maps (ground truth)
            transform: Optional transform to be applied
            image_size: Size to resize images (default 256x256)
        """
        self.image_dir = image_dir
        self.saliency_dir = saliency_dir
        self.image_size = image_size
        
        # Get list of images
        self.image_files = []
        for file in os.listdir(image_dir):
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                # Check if corresponding saliency map exists
                base_name = os.path.splitext(file)[0]
                saliency_file = os.path.join(saliency_dir, base_name + '.png')
                if os.path.exists(saliency_file):
                    self.image_files.append(file)
        
        print(f"Found {len(self.image_files)} image-saliency pairs")
        
        # Define transforms
        self.image_transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        self.saliency_transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor()
        ])
        
        self.custom_transform = transform
    
    def __len__(self):
        return len(self.image_files)
    
    def __getitem__(self, idx):
        # Load image
        img_name = self.image_files[idx]
        img_path = os.path.join(self.image_dir, img_name)
        image = Image.open(img_path).convert('RGB')
        
        # Load saliency map
        base_name = os.path.splitext(img_name)[0]
        saliency_path = os.path.join(self.saliency_dir, base_name + '.png')
        saliency = Image.open(saliency_path).convert('L')  # Grayscale
        
        # Apply transforms
        image = self.image_transform(image)
        saliency = self.saliency_transform(saliency)
        
        if self.custom_transform:
            image, saliency = self.custom_transform(image, saliency)
        
        return image, saliency


def create_synthetic_saliency_maps(image_dir, output_dir):
    """
    Create synthetic saliency maps for testing (uses heuristics)
    Use this if you don't have ground truth saliency maps
    """
    import cv2
    
    os.makedirs(output_dir, exist_ok=True)
    
    for file in os.listdir(image_dir):
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            img_path = os.path.join(image_dir, file)
            image = cv2.imread(img_path)
            
            if image is None:
                continue
            
            # Create heuristic saliency map
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Edge detection
            edges = cv2.Canny(gray, 50, 150)
            
            # Blur to spread attention
            saliency = cv2.GaussianBlur(edges, (21, 21), 0)
            
            # Center bias
            h, w = saliency.shape
            y, x = np.ogrid[:h, :w]
            center_y, center_x = h // 2, w // 2
            distance = np.sqrt((x - center_x) ** 2 + (y - center_y) ** 2)
            max_distance = np.sqrt(center_x ** 2 + center_y ** 2)
            center_bias = (1 - (distance / max_distance)) * 255
            
            # Combine
            saliency = cv2.addWeighted(saliency.astype(float), 0.6, 
                                      center_bias, 0.4, 0)
            saliency = np.clip(saliency, 0, 255).astype(np.uint8)
            
            # Save
            base_name = os.path.splitext(file)[0]
            output_path = os.path.join(output_dir, base_name + '.png')
            cv2.imwrite(output_path, saliency)
            print(f"Created synthetic saliency map: {base_name}.png")
    
    print(f"✅ Created synthetic saliency maps in {output_dir}")


if __name__ == "__main__":
    # Test dataset loading
    dataset = SaliencyDataset(
        image_dir="../data/salicon/images",
        saliency_dir="../data/salicon/maps",
        image_size=256
    )
    
    print(f"Dataset size: {len(dataset)}")
    
    if len(dataset) > 0:
        image, saliency = dataset[0]
        print(f"Image shape: {image.shape}")
        print(f"Saliency shape: {saliency.shape}")
        print("✅ Dataset loading works!")
```

### 3.2 Test Dataset

```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend

# If using SALICON:
python training/dataset.py

# If you need synthetic maps:
python -c "from training.dataset import create_synthetic_saliency_maps; create_synthetic_saliency_maps('../data/sample_saliency/images', '../data/sample_saliency/maps')"
```

---

## Step 4: Create Training Script

Create `training/train_saliency.py`:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from tqdm import tqdm
import matplotlib.pyplot as plt
import os
from datetime import datetime

# Import your U-Net model
import sys
sys.path.append('..')
from app.ai_modules.comprehensive_attention_analyzer import SaliencyModel
from training.dataset import SaliencyDataset


class SaliencyTrainer:
    """
    Trainer for saliency prediction model
    """
    def __init__(self, model, device='cpu', learning_rate=1e-4):
        self.model = model.to(device)
        self.device = device
        self.criterion = nn.MSELoss()  # Mean Squared Error for regression
        self.optimizer = optim.Adam(model.parameters(), lr=learning_rate)
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='min', patience=5, factor=0.5
        )
        
        self.train_losses = []
        self.val_losses = []
        self.best_val_loss = float('inf')
    
    def train_epoch(self, train_loader):
        """Train for one epoch"""
        self.model.train()
        epoch_loss = 0.0
        
        progress_bar = tqdm(train_loader, desc="Training")
        for images, saliency_maps in progress_bar:
            images = images.to(self.device)
            saliency_maps = saliency_maps.to(self.device)
            
            # Forward pass
            self.optimizer.zero_grad()
            outputs = self.model(images)
            loss = self.criterion(outputs, saliency_maps)
            
            # Backward pass
            loss.backward()
            self.optimizer.step()
            
            epoch_loss += loss.item()
            progress_bar.set_postfix({'loss': loss.item()})
        
        return epoch_loss / len(train_loader)
    
    def validate(self, val_loader):
        """Validate the model"""
        self.model.eval()
        val_loss = 0.0
        
        with torch.no_grad():
            for images, saliency_maps in tqdm(val_loader, desc="Validation"):
                images = images.to(self.device)
                saliency_maps = saliency_maps.to(self.device)
                
                outputs = self.model(images)
                loss = self.criterion(outputs, saliency_maps)
                val_loss += loss.item()
        
        return val_loss / len(val_loader)
    
    def train(self, train_loader, val_loader, num_epochs, save_dir='models'):
        """Full training loop"""
        os.makedirs(save_dir, exist_ok=True)
        
        print(f"🚀 Starting training on {self.device}")
        print(f"📊 Train batches: {len(train_loader)}, Val batches: {len(val_loader)}")
        print(f"🎯 Training for {num_epochs} epochs")
        print("-" * 60)
        
        for epoch in range(num_epochs):
            print(f"\n📅 Epoch {epoch+1}/{num_epochs}")
            
            # Train
            train_loss = self.train_epoch(train_loader)
            self.train_losses.append(train_loss)
            
            # Validate
            val_loss = self.validate(val_loader)
            self.val_losses.append(val_loss)
            
            # Learning rate scheduling
            self.scheduler.step(val_loss)
            current_lr = self.optimizer.param_groups[0]['lr']
            
            print(f"✅ Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | LR: {current_lr:.6f}")
            
            # Save best model
            if val_loss < self.best_val_loss:
                self.best_val_loss = val_loss
                model_path = os.path.join(save_dir, 'saliency_model.pth')
                torch.save(self.model.state_dict(), model_path)
                print(f"💾 Saved best model (val_loss: {val_loss:.4f})")
            
            # Save checkpoint every 10 epochs
            if (epoch + 1) % 10 == 0:
                checkpoint_path = os.path.join(save_dir, f'checkpoint_epoch_{epoch+1}.pth')
                torch.save({
                    'epoch': epoch,
                    'model_state_dict': self.model.state_dict(),
                    'optimizer_state_dict': self.optimizer.state_dict(),
                    'train_loss': train_loss,
                    'val_loss': val_loss,
                }, checkpoint_path)
                print(f"💾 Saved checkpoint at epoch {epoch+1}")
        
        print("\n" + "="*60)
        print(f"🎉 Training completed!")
        print(f"📈 Best validation loss: {self.best_val_loss:.4f}")
        print(f"💾 Model saved to: {os.path.join(save_dir, 'saliency_model.pth')}")
        
        # Plot training curves
        self.plot_losses(save_dir)
        
        return self.model
    
    def plot_losses(self, save_dir):
        """Plot training and validation losses"""
        plt.figure(figsize=(10, 6))
        plt.plot(self.train_losses, label='Train Loss', linewidth=2)
        plt.plot(self.val_losses, label='Validation Loss', linewidth=2)
        plt.xlabel('Epoch', fontsize=12)
        plt.ylabel('Loss', fontsize=12)
        plt.title('Training and Validation Loss', fontsize=14)
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        plot_path = os.path.join(save_dir, 'training_curves.png')
        plt.savefig(plot_path, dpi=150)
        print(f"📊 Training curves saved to: {plot_path}")
        plt.close()


def main():
    """
    Main training function
    """
    print("="*60)
    print("🎓 ARAI Saliency Model Training")
    print("="*60)
    
    # Configuration
    config = {
        'image_dir': '../data/salicon/images',  # Change this!
        'saliency_dir': '../data/salicon/maps',  # Change this!
        'image_size': 256,
        'batch_size': 8,  # Reduce to 4 if out of memory
        'num_epochs': 50,
        'learning_rate': 1e-4,
        'train_split': 0.8,  # 80% train, 20% validation
        'num_workers': 4,  # For data loading
        'save_dir': '../models'
    }
    
    # Device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"🖥️  Device: {device}")
    
    # Load dataset
    print(f"\n📂 Loading dataset from:")
    print(f"   Images: {config['image_dir']}")
    print(f"   Saliency: {config['saliency_dir']}")
    
    dataset = SaliencyDataset(
        image_dir=config['image_dir'],
        saliency_dir=config['saliency_dir'],
        image_size=config['image_size']
    )
    
    if len(dataset) == 0:
        print("❌ No data found! Please check your data directories.")
        return
    
    # Split dataset
    train_size = int(config['train_split'] * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = random_split(dataset, [train_size, val_size])
    
    print(f"📊 Dataset split: {train_size} train, {val_size} validation")
    
    # Create data loaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=config['batch_size'],
        shuffle=True,
        num_workers=config['num_workers'],
        pin_memory=True if torch.cuda.is_available() else False
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=config['batch_size'],
        shuffle=False,
        num_workers=config['num_workers'],
        pin_memory=True if torch.cuda.is_available() else False
    )
    
    # Initialize model
    print("\n🏗️  Initializing U-Net model...")
    model = SaliencyModel()
    
    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"📊 Total parameters: {total_params:,}")
    print(f"🎯 Trainable parameters: {trainable_params:,}")
    
    # Initialize trainer
    trainer = SaliencyTrainer(
        model=model,
        device=device,
        learning_rate=config['learning_rate']
    )
    
    # Train
    print(f"\n⏰ Training started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    trained_model = trainer.train(
        train_loader=train_loader,
        val_loader=val_loader,
        num_epochs=config['num_epochs'],
        save_dir=config['save_dir']
    )
    
    print(f"⏰ Training finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n✅ Done! Your model is ready to use in the ARAI system.")
    print(f"📍 Model location: {os.path.join(config['save_dir'], 'saliency_model.pth')}")
    print("\n🚀 Next step: Restart your backend server to use the trained model!")


if __name__ == "__main__":
    main()
```

---

## Step 5: Train Model

### 5.1 Configure Training

Edit the `config` dictionary in `train_saliency.py`:

```python
config = {
    'image_dir': '../data/salicon/images',      # Your dataset
    'saliency_dir': '../data/salicon/maps',     # Your saliency maps
    'image_size': 256,
    'batch_size': 8,  # Reduce to 4 if GPU memory limited
    'num_epochs': 50,  # Start with 50, increase if needed
    'learning_rate': 1e-4,
    'train_split': 0.8,
    'num_workers': 4,
    'save_dir': '../models'  # Will save to backend/models/
}
```

### 5.2 Start Training

```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend/training

# Start training (this will take hours!)
python train_saliency.py

# If using screen/tmux (recommended for long training):
screen -S saliency_training
python train_saliency.py
# Press Ctrl+A then D to detach

# To reattach later:
screen -r saliency_training
```

### 5.3 Monitor Progress

You'll see output like:
```
🚀 Starting training on cuda
📊 Train batches: 1000, Val batches: 250
🎯 Training for 50 epochs
------------------------------------------------------------

📅 Epoch 1/50
Training: 100%|████████████| 1000/1000 [10:23<00:00,  1.60it/s, loss=0.0234]
Validation: 100%|██████████| 250/250 [01:45<00:00,  2.37it/s]
✅ Train Loss: 0.0245 | Val Loss: 0.0198 | LR: 0.000100
💾 Saved best model (val_loss: 0.0198)

📅 Epoch 2/50
...
```

### 5.4 Expected Training Time

| Hardware | Epochs | Time |
|----------|--------|------|
| CPU only | 50 | ~24 hours |
| GPU (NVIDIA GTX 1060) | 50 | ~4 hours |
| GPU (NVIDIA RTX 3080) | 50 | ~2 hours |
| Mac M1/M2 | 50 | ~6 hours |

---

## Step 6: Integrate Model

### 6.1 Verify Model File

```bash
# Check if model was created
ls -lh /Users/kavishani/Documents/FYP/arai-system/backend/models/

# You should see:
# saliency_model.pth (size: ~45MB)
# training_curves.png
# checkpoint_epoch_10.pth
# checkpoint_epoch_20.pth
# etc.
```

### 6.2 Update Backend Code (Already Done!)

Your `comprehensive_attention_analyzer.py` already has the integration code:

```python
# Lines 94-104 (already in your code)
def __init__(self, model_path: str):
    self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Load saliency model
    self.model = SaliencyModel().to(self.device)
    if os.path.exists(model_path):
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()
        print(f"✅ Loaded saliency model from {model_path}")
    else:
        print(f"⚠️  Model not found. Using heuristic-based analysis.")
        self.model = None
```

### 6.3 Restart Backend Server

```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend

# Stop current server (if running)
# Press Ctrl+C

# Start server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
✅ Loaded saliency model from /path/to/models/saliency_model.pth
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Step 7: Test & Validate

### 7.1 Create Test Script

Create `training/test_model.py`:

```python
import torch
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
import sys
sys.path.append('..')
from app.ai_modules.comprehensive_attention_analyzer import ComprehensiveAttentionAnalyzer

def test_model(image_path, model_path):
    """
    Test the trained saliency model on a single image
    """
    print(f"🧪 Testing model on: {image_path}")
    
    # Initialize analyzer
    analyzer = ComprehensiveAttentionAnalyzer(model_path)
    
    if analyzer.model is None:
        print("❌ Model not loaded!")
        return
    
    # Run analysis
    results = analyzer.analyze_design(image_path)
    
    print(f"\n📊 Results:")
    print(f"   Score: {results['score']}")
    print(f"   Issues found: {len(results['issues'])}")
    print(f"   Cognitive load: {results['cognitive_load']['score']}")
    
    # Visualize
    image = Image.open(image_path)
    
    plt.figure(figsize=(15, 5))
    
    # Original image
    plt.subplot(1, 3, 1)
    plt.imshow(image)
    plt.title('Original Image')
    plt.axis('off')
    
    # Saliency heatmap
    plt.subplot(1, 3, 2)
    saliency_map = results.get('saliency_map')
    if saliency_map is not None:
        plt.imshow(saliency_map, cmap='jet')
        plt.title('Saliency Heatmap\n(Red=High, Blue=Low)')
        plt.axis('off')
    
    # Issues overlay
    plt.subplot(1, 3, 3)
    plt.imshow(image)
    plt.title(f'Issues: {len(results["issues"])}')
    plt.axis('off')
    
    plt.tight_layout()
    plt.savefig('test_results.png', dpi=150, bbox_inches='tight')
    print(f"\n✅ Results saved to: test_results.png")
    plt.show()

if __name__ == "__main__":
    # Test with a sample image
    test_model(
        image_path='../../uploads/sample_design.png',  # Change this
        model_path='../models/saliency_model.pth'
    )
```

### 7.2 Run Test

```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend/training

# Test on a sample image
python test_model.py
```

### 7.3 Compare Results

Create `training/compare_models.py`:

```python
import torch
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
import sys
sys.path.append('..')
from app.ai_modules.comprehensive_attention_analyzer import ComprehensiveAttentionAnalyzer

def compare_heuristic_vs_trained(image_path):
    """
    Compare heuristic vs trained model predictions
    """
    # Test with trained model
    analyzer_trained = ComprehensiveAttentionAnalyzer('../models/saliency_model.pth')
    
    # Test without model (heuristic)
    analyzer_heuristic = ComprehensiveAttentionAnalyzer('nonexistent_path.pth')
    
    image = Image.open(image_path)
    
    # Get saliency maps
    saliency_trained, _ = analyzer_trained._generate_saliency_heatmap(image)
    saliency_heuristic, _ = analyzer_heuristic._generate_saliency_heatmap(image)
    
    # Visualize
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    
    axes[0].imshow(image)
    axes[0].set_title('Original Image', fontsize=14)
    axes[0].axis('off')
    
    im1 = axes[1].imshow(saliency_heuristic, cmap='jet')
    axes[1].set_title('Heuristic Saliency\n(Rule-based)', fontsize=14)
    axes[1].axis('off')
    plt.colorbar(im1, ax=axes[1], fraction=0.046)
    
    im2 = axes[2].imshow(saliency_trained, cmap='jet')
    axes[2].set_title('Trained Model Saliency\n(AI-predicted)', fontsize=14)
    axes[2].axis('off')
    plt.colorbar(im2, ax=axes[2], fraction=0.046)
    
    plt.tight_layout()
    plt.savefig('comparison.png', dpi=150, bbox_inches='tight')
    print("✅ Comparison saved to: comparison.png")
    plt.show()

if __name__ == "__main__":
    compare_heuristic_vs_trained('../../uploads/sample_design.png')
```

### 7.4 Test in Web App

1. Start backend server:
```bash
cd /Users/kavishani/Documents/FYP/arai-system/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start frontend:
```bash
cd /Users/kavishani/Documents/FYP/arai-system/frontend
npm start
```

3. Upload a design and check:
   - Analysis completes successfully
   - Saliency heatmap looks realistic
   - Critical elements are properly identified
   - Attention scores make sense

---

## Troubleshooting

### Issue 1: Out of Memory Error

**Error:**
```
RuntimeError: CUDA out of memory
```

**Solution:**
```python
# In train_saliency.py, reduce batch size:
'batch_size': 4,  # or even 2

# Or reduce image size:
'image_size': 128,  # instead of 256
```

### Issue 2: Dataset Not Found

**Error:**
```
Found 0 image-saliency pairs
```

**Solution:**
```bash
# Check directory structure
ls ../data/salicon/images/
ls ../data/salicon/maps/

# Ensure matching filenames
# If image is: COCO_train2014_000000000009.jpg
# Map should be: COCO_train2014_000000000009.png
```

### Issue 3: Model Not Loading

**Error:**
```
⚠️  Model not found. Using heuristic-based analysis.
```

**Solution:**
```bash
# Check model path
ls -lh backend/models/saliency_model.pth

# Update path in analysis.py (line 32):
MODEL_PATH = Path(__file__).parent.parent / "models" / "saliency_model.pth"
```

### Issue 4: Training Too Slow

**Problem:** Training takes forever on CPU

**Solution:**
```bash
# Option 1: Use Google Colab (free GPU)
# Upload training code and dataset to Google Drive
# Open in Colab: https://colab.research.google.com

# Option 2: Reduce dataset size
# Use only 1000 images for quick testing

# Option 3: Reduce epochs
'num_epochs': 20,  # Instead of 50
```

### Issue 5: Poor Results

**Problem:** Model predictions don't look good

**Solutions:**
1. **Train longer:** Increase epochs to 100+
2. **More data:** Add MIT Saliency dataset
3. **Better augmentation:** Add data augmentation
4. **Adjust learning rate:** Try 1e-3 or 5e-5
5. **Check data quality:** Ensure saliency maps are correct

---

## 🎯 Quick Start (Minimal Dataset)

If you want to test the full pipeline quickly:

```bash
# 1. Create minimal dataset
cd /Users/kavishani/Documents/FYP/arai-system/data
mkdir -p mini_dataset/{images,maps}

# 2. Copy 100 images from uploads
find ../uploads -name "original.*" | head -100 | xargs -I {} cp {} mini_dataset/images/

# 3. Create synthetic saliency maps
cd ../backend
python -c "from training.dataset import create_synthetic_saliency_maps; create_synthetic_saliency_maps('../data/mini_dataset/images', '../data/mini_dataset/maps')"

# 4. Update config in train_saliency.py:
'image_dir': '../data/mini_dataset/images',
'saliency_dir': '../data/mini_dataset/maps',
'num_epochs': 10,  # Just 10 for testing
'batch_size': 4,

# 5. Train (quick test)
cd training
python train_saliency.py

# Should complete in ~30 minutes on CPU
```

---

## 📊 Expected Results

After training, you should see:

### Before (Heuristic):
- Basic center bias
- Simple contrast detection
- Generic F-pattern

### After (Trained):
- Human-like attention patterns
- Recognizes faces, text, buttons
- Context-aware saliency
- 15-20% accuracy improvement

---

## 🚀 Next Steps

After successful integration:

1. **Monitor performance** in production
2. **Collect user feedback** on accuracy
3. **Fine-tune** with domain-specific data (UI designs)
4. **Retrain periodically** with new data
5. **Consider transfer learning** from larger models

---

## 📚 Additional Resources

- [PyTorch Tutorial](https://pytorch.org/tutorials/)
- [U-Net Paper](https://arxiv.org/abs/1505.04597)
- [SALICON Dataset](http://salicon.net/)
- [MIT Saliency Benchmark](http://saliency.mit.edu/)

---

**Good luck with training! 🎓🚀**

If you encounter any issues, refer to the troubleshooting section or check the PyTorch documentation.
