# 🚀 Google Colab Training - Quick Start Card

## ⚡ 5-Minute Setup

### Step 1: Open Colab Notebook
1. Upload `ARAI_Saliency_Training.ipynb` to [Google Colab](https://colab.research.google.com/)
   - OR create a new notebook and copy the code from the file
2. **Runtime → Change runtime type → GPU → Save**

### Step 2: Run Setup Cells
```python
# Cell 1: Check GPU
import torch
print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None'}")

# Cell 2: Mount Drive
from google.colab import drive
drive.mount('/content/drive')
```

### Step 3: Clone & Install
```python
# Cell 3: Clone repo
!git clone https://github.com/kavishaniy/ARAI-System.git /content/arai
%cd /content/arai/backend
!pip install -q pillow scipy tqdm matplotlib
```

### Step 4: Train (Choose One)

#### Quick Test (30 minutes):
```python
# Create synthetic data + train
!python /content/arai/backend/training/train_saliency.py \
    --image_dir /content/synthetic_data/images \
    --saliency_dir /content/synthetic_data/maps \
    --batch_size 16 --num_epochs 20 \
    --save_dir /content/drive/MyDrive/ARAI/models
```

#### Production (2-4 hours):
```python
# Download SALICON + train
!python /content/arai/backend/training/train_saliency.py \
    --image_dir /content/salicon/images \
    --saliency_dir /content/salicon/maps \
    --batch_size 16 --num_epochs 50 \
    --save_dir /content/drive/MyDrive/ARAI/models
```

### Step 5: Download Model
```python
from google.colab import files
files.download('/content/drive/MyDrive/ARAI/models/saliency_model.pth')
```

---

## 📁 File Locations

**In Colab:**
- Model: `/content/drive/MyDrive/ARAI/models/saliency_model.pth`
- Logs: `/content/drive/MyDrive/ARAI/training_logs/`
- Curves: `/content/drive/MyDrive/ARAI/models/training_curves.png`

**In Your Project:**
- Place model at: `/Users/kavishani/Documents/FYP/arai-system/backend/models/saliency_model.pth`

---

## 🔌 VS Code Connection (Optional)

### Method 1: Browser VS Code (Easiest)
1. In Colab toolbar, click **< >** icon
2. VS Code opens in new tab
3. Edit and run on GPU instantly!

### Method 2: Local VS Code
```python
# In Colab cell:
!pip install colab-ssh
from colab_ssh import launch_ssh_cloudflared
launch_ssh_cloudflared(password='your_password')
```

Then in your local VS Code:
1. Install **Remote - SSH** extension
2. `Cmd+Shift+P` → `Remote-SSH: Connect to Host`
3. Use the SSH command from Colab output

---

## 🛠️ Common Commands

```python
# Check GPU memory
!nvidia-smi

# Monitor training (in new cell while training runs)
!watch -n 5 tail /content/drive/MyDrive/ARAI/training_logs/training.log

# List saved models
!ls -lh /content/drive/MyDrive/ARAI/models/

# Resume training from checkpoint (if interrupted)
!python train_saliency.py --resume_from /content/drive/MyDrive/ARAI/models/checkpoint_epoch_10.pth
```

---

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| No GPU | Runtime → Change runtime type → GPU |
| Out of Memory | Use `--batch_size 8` instead of 16 |
| Disconnected | Models auto-save to Google Drive every 5 epochs |
| Slow download | Copy to `/content/` first: `!cp /content/drive/.../model.pth /content/` |

---

## 📊 Expected Results

**Synthetic Data (20 epochs):**
- Time: 30 minutes
- Final loss: ~0.05
- Good for testing

**SALICON (50 epochs):**
- Time: 2-4 hours
- Final loss: ~0.02
- Production quality

---

## ✅ Success Checklist

- [ ] GPU enabled (Tesla T4 or better)
- [ ] Google Drive mounted
- [ ] Repository cloned
- [ ] Training completed
- [ ] Model saved (~45MB)
- [ ] Model downloaded
- [ ] Placed in `backend/models/`
- [ ] Backend restarted
- [ ] Model detected in logs

---

## 📚 Full Guides

- **Complete Guide:** `GOOGLE_COLAB_TRAINING_GUIDE.md` (detailed)
- **Local Training:** `TRAINING_GUIDE.md` (if not using Colab)
- **Notebook:** `ARAI_Saliency_Training.ipynb` (interactive)

---

## 🆘 Help

**Training issues?** Check the [Troubleshooting section](GOOGLE_COLAB_TRAINING_GUIDE.md#troubleshooting) in the full guide.

**VS Code issues?** See the [VS Code Connection guide](GOOGLE_COLAB_TRAINING_GUIDE.md#connect-colab-to-vs-code).

---

**Time to train:** ~30 minutes (synthetic) or ~3 hours (SALICON)  
**GPU required:** Yes (free in Colab!)  
**Cost:** $0 with Colab free tier
