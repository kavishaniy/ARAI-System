import os
import torch
from torch.utils.data import Dataset
from PIL import Image
import torchvision.transforms as transforms
import numpy as np
import cv2


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
        
        print(f"✅ Found {len(self.image_files)} image-saliency pairs")
        
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
    os.makedirs(output_dir, exist_ok=True)
    
    count = 0
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
            saliency = cv2.GaussianBlur(edges.astype(float), (21, 21), 0)
            
            # Center bias
            h, w = gray.shape
            y, x = np.ogrid[:h, :w]
            center_y, center_x = h // 2, w // 2
            distance = np.sqrt((x - center_x) ** 2 + (y - center_y) ** 2)
            max_distance = np.sqrt(center_x ** 2 + center_y ** 2)
            center_bias = (1 - (distance / max_distance)) * 255
            
            # Combine
            saliency = cv2.addWeighted(saliency, 0.6, center_bias, 0.4, 0)
            saliency = np.clip(saliency, 0, 255).astype(np.uint8)
            
            # Save
            base_name = os.path.splitext(file)[0]
            output_path = os.path.join(output_dir, base_name + '.png')
            cv2.imwrite(output_path, saliency)
            count += 1
    
    print(f"✅ Created {count} synthetic saliency maps in {output_dir}")


if __name__ == "__main__":
    # Test dataset loading
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python dataset.py <image_dir> <saliency_dir>")
        print("Example: python dataset.py ../data/salicon/images ../data/salicon/maps")
        sys.exit(1)
    
    image_dir = sys.argv[1]
    saliency_dir = sys.argv[2]
    
    print(f"Testing dataset loading...")
    print(f"Image dir: {image_dir}")
    print(f"Saliency dir: {saliency_dir}")
    
    dataset = SaliencyDataset(
        image_dir=image_dir,
        saliency_dir=saliency_dir,
        image_size=256
    )
    
    print(f"\n📊 Dataset size: {len(dataset)}")
    
    if len(dataset) > 0:
        image, saliency = dataset[0]
        print(f"✅ Image shape: {image.shape}")
        print(f"✅ Saliency shape: {saliency.shape}")
        print("\n✅ Dataset loading works!")
    else:
        print("\n❌ No data found! Check your directories.")
