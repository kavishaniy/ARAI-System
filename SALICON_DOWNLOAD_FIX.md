# 🔧 SALICON Download Error - Quick Fix Guide

## The Problem
You're getting this error:
```
FileURLRetrievalError: Cannot retrieve the public link of the file.
```

This happens because the Google Drive file IDs in the guide are either:
- Not publicly shared
- Invalid/deleted
- Rate-limited

---

## ✅ Quick Solutions (Pick One)

### Option 1: Use Synthetic Data Instead (FASTEST - 5 minutes)
**Recommended for getting started quickly!**

Just skip the SALICON download entirely and use the synthetic data generator that's already in the guide:

```python
# In your Colab notebook, run this cell:

import os
import numpy as np
import cv2
from PIL import Image
from tqdm import tqdm

os.makedirs('/content/synthetic_data/images', exist_ok=True)
os.makedirs('/content/synthetic_data/maps', exist_ok=True)

print("Creating 500 synthetic training samples...")
for i in tqdm(range(500)):
    # Create UI-like image
    img = np.random.randint(200, 255, (256, 256, 3), dtype=np.uint8)
    
    # Add UI elements
    cv2.rectangle(img, (20, 20), (236, 60), (66, 133, 244), -1)  # Header
    cv2.putText(img, 'Title', (80, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
    cv2.rectangle(img, (20, 80), (236, 180), (52, 168, 83), 3)  # CTA Button
    cv2.putText(img, 'Click Me', (70, 135), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,0), 2)
    
    # Generate saliency map
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    
    y, x = np.ogrid[:256, :256]
    center = np.exp(-((x-128)**2 + (y-128)**2) / (2*80**2))
    saliency = (edges/255 * 0.6 + center * 0.4) * 255
    
    Image.fromarray(img).save(f'/content/synthetic_data/images/img_{i:04d}.jpg')
    Image.fromarray(saliency.astype(np.uint8)).save(f'/content/synthetic_data/maps/map_{i:04d}.png')

print("✅ Dataset ready! Now train with these paths:")
print("  --image_dir /content/synthetic_data/images")
print("  --saliency_dir /content/synthetic_data/maps")
```

Then train:
```python
!python train_saliency.py \
    --image_dir /content/synthetic_data/images \
    --saliency_dir /content/synthetic_data/maps \
    --batch_size 16 \
    --num_epochs 20 \
    --save_dir /content/drive/MyDrive/ARAI/models
```

**Benefits:** ✅ No download issues, ✅ Works immediately, ✅ Good for testing

---

### Option 2: Upload SALICON to Your Own Google Drive (Best Quality)

**Step 1:** Download SALICON manually
1. Go to: http://salicon.net/download/
2. Click "Register" (free account)
3. Download:
   - `SALICON Training Images` (train2014.zip - 2GB)
   - `SALICON Training Fixation Maps` (train2014_fixations.zip - 500MB)

**Step 2:** Upload to Google Drive
1. Open [Google Drive](https://drive.google.com/)
2. Create folder: `SALICON`
3. Upload both .zip files (this takes 15-30 minutes)

**Step 3:** Use in Colab
```python
# In your Colab notebook:
from google.colab import drive
drive.mount('/content/drive')

# Copy from your Drive
print("Copying from Google Drive...")
!cp /content/drive/MyDrive/SALICON/train2014.zip /content/salicon_images.zip
!cp /content/drive/MyDrive/SALICON/train2014_fixations.zip /content/salicon_maps.zip

# Extract
print("Extracting...")
!unzip -q /content/salicon_images.zip -d /content/salicon/images/
!unzip -q /content/salicon_maps.zip -d /content/salicon/maps/

print("✅ SALICON ready!")
```

**Benefits:** ✅ Full dataset, ✅ Best quality, ✅ Reusable

---

### Option 3: Fix gdown with Your Own File IDs

If you have files in Google Drive and want to use `gdown`:

**Step 1:** Make file publicly shareable
1. Right-click file in Google Drive
2. Click "Share"
3. Change to "Anyone with the link"
4. Copy the link

**Step 2:** Extract file ID from link
```
Link format: https://drive.google.com/file/d/1g8j-hTT2exMGdiN84XDHPJJgDXq8YCDH/view
File ID is: 1g8j-hTT2exMGdiN84XDHPJJgDXq8YCDH
                                        ^^^^^^^^ This part
```

**Step 3:** Use in Colab
```python
import gdown

# Your file IDs (replace these!)
IMAGES_ID = "YOUR_FILE_ID_HERE"
MAPS_ID = "YOUR_MAPS_FILE_ID_HERE"

# Download
gdown.download(id=IMAGES_ID, output='/content/salicon_images.zip', quiet=False)
gdown.download(id=MAPS_ID, output='/content/salicon_maps.zip', quiet=False)

# Extract
!unzip -q /content/salicon_images.zip -d /content/salicon/images/
!unzip -q /content/salicon_maps.zip -d /content/salicon/maps/
```

---

### Option 4: Use MIT Saliency Benchmark (Alternative Dataset)

If SALICON is too difficult to get:

```python
# Download MIT Saliency Benchmark (1003 images)
!wget -O /content/mit_saliency.zip http://saliency.mit.edu/datasets/1003images.zip

# Extract
!unzip -q /content/mit_saliency.zip -d /content/mit_saliency/

# The dataset structure is different, you'll need to organize it:
!mkdir -p /content/dataset/images
!mkdir -p /content/dataset/maps

# Copy images and maps
!find /content/mit_saliency -name "*.jpg" -exec cp {} /content/dataset/images/ \;
!find /content/mit_saliency -name "*_fixMap.jpg" -exec cp {} /content/dataset/maps/ \;

print("✅ MIT Saliency dataset ready!")
```

---

## 🎯 Recommended Approach

**For immediate testing:** Use **Option 1** (Synthetic Data)
- ✅ Works in 5 minutes
- ✅ No download issues
- ✅ Good enough for pipeline testing

**For production model:** Use **Option 2** (Upload to Drive)
- ✅ Best quality results
- ✅ Full 10,000 image dataset
- ✅ One-time setup, reusable forever

---

## 📋 Complete Working Code (Copy-Paste Ready)

Replace the problematic SALICON download section with this:

```python
# ========================================
# DATASET SETUP - SYNTHETIC DATA (FAST)
# ========================================

import os
import numpy as np
import cv2
from PIL import Image
from tqdm import tqdm

# Create directories
os.makedirs('/content/dataset/images', exist_ok=True)
os.makedirs('/content/dataset/maps', exist_ok=True)

print("🎨 Creating synthetic UI training data...")
print("This generates realistic UI-like images with saliency maps")

for i in tqdm(range(1000), desc="Generating samples"):
    # Create white canvas (UI background)
    img = np.ones((256, 256, 3), dtype=np.uint8) * 250
    
    # Add header bar (high saliency)
    cv2.rectangle(img, (0, 0), (256, 50), (66, 133, 244), -1)
    cv2.putText(img, 'Navigation', (70, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)
    
    # Add primary CTA button (highest saliency)
    btn_color = (52, 168, 83) if i % 2 == 0 else (234, 67, 53)
    cv2.rectangle(img, (50, 100), (206, 140), btn_color, -1)
    cv2.putText(img, 'Click Here', (75, 125), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)
    
    # Add text content (medium saliency)
    cv2.putText(img, 'Lorem ipsum text', (40, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (100,100,100), 1)
    
    # Add footer (low saliency)
    cv2.rectangle(img, (0, 230), (256, 256), (200, 200, 200), -1)
    
    # Generate ground truth saliency map
    saliency_map = np.zeros((256, 256), dtype=np.float32)
    
    # Header region (medium saliency)
    saliency_map[0:50, :] = 0.6
    
    # Button region (high saliency)
    saliency_map[100:140, 50:206] = 1.0
    
    # Text region (medium saliency)
    saliency_map[160:180, 40:200] = 0.4
    
    # Add Gaussian blur for smooth transitions
    saliency_map = cv2.GaussianBlur(saliency_map, (21, 21), 10)
    
    # Add center bias (humans look at center more)
    y, x = np.ogrid[:256, :256]
    center_bias = np.exp(-((x-128)**2 + (y-128)**2) / (2*90**2))
    saliency_map = 0.7 * saliency_map + 0.3 * center_bias
    
    # Normalize to 0-255
    saliency_map = (saliency_map * 255).astype(np.uint8)
    
    # Save
    Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)).save(
        f'/content/dataset/images/ui_{i:04d}.jpg'
    )
    Image.fromarray(saliency_map).save(
        f'/content/dataset/maps/ui_{i:04d}.png'
    )

print(f"\n✅ Generated 1000 training samples!")
print(f"📁 Images: /content/dataset/images/")
print(f"📁 Maps: /content/dataset/maps/")

# Verify
image_count = len(os.listdir('/content/dataset/images'))
map_count = len(os.listdir('/content/dataset/maps'))
print(f"\n📊 Verification:")
print(f"   Images: {image_count}")
print(f"   Maps: {map_count}")
print(f"   {'✅ Ready to train!' if image_count == map_count == 1000 else '❌ Count mismatch!'}")
```

Then train with:
```python
!python train_saliency.py \
    --image_dir /content/dataset/images \
    --saliency_dir /content/dataset/maps \
    --batch_size 16 \
    --num_epochs 30 \
    --save_dir /content/drive/MyDrive/ARAI/models
```

---

## ✅ Verification

After running the synthetic data generator, verify it worked:

```python
import matplotlib.pyplot as plt
from PIL import Image

# Load sample
img = Image.open('/content/dataset/images/ui_0000.jpg')
smap = Image.open('/content/dataset/maps/ui_0000.png')

# Display
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].imshow(img)
axes[0].set_title('Training Image')
axes[0].axis('off')

axes[1].imshow(smap, cmap='hot')
axes[1].set_title('Saliency Map')
axes[1].axis('off')

plt.tight_layout()
plt.show()
```

You should see a UI-like image with corresponding saliency map!

---

## 🚀 Next Steps

1. ✅ Use synthetic data to test your pipeline
2. ✅ Train a model (takes 30-60 minutes)
3. ✅ Download the trained model
4. ✅ Integrate into your app
5. ⚡ Later: Train on full SALICON if you need better accuracy

**The synthetic data approach gets you up and running in minutes instead of hours!**
