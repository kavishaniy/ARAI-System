import torch
import torch.nn as nn
from PIL import Image
import torchvision.transforms as transforms
import numpy as np
from typing import Dict, List
import os


class SaliencyModel(nn.Module):
    """U-Net style architecture for saliency prediction"""
    
    def __init__(self):
        super(SaliencyModel, self).__init__()
        
        # Encoder
        self.enc1 = self._conv_block(3, 64)
        self.pool1 = nn.MaxPool2d(2, 2)
        
        self.enc2 = self._conv_block(64, 128)
        self.pool2 = nn.MaxPool2d(2, 2)
        
        self.enc3 = self._conv_block(128, 256)
        self.pool3 = nn.MaxPool2d(2, 2)
        
        # Bottleneck
        self.bottleneck = self._conv_block(256, 512)
        
        # Decoder
        self.upconv3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = self._conv_block(512, 256)
        
        self.upconv2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = self._conv_block(256, 128)
        
        self.upconv1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = self._conv_block(128, 64)
        
        # Output
        self.out = nn.Conv2d(64, 1, 1)
        self.sigmoid = nn.Sigmoid()
    
    def _conv_block(self, in_channels, out_channels):
        return nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1),
            nn.ReLU(inplace=True)
        )
    
    def forward(self, x):
        # Encoder
        enc1 = self.enc1(x)
        enc2 = self.enc2(self.pool1(enc1))
        enc3 = self.enc3(self.pool2(enc2))
        
        # Bottleneck
        bottleneck = self.bottleneck(self.pool3(enc3))
        
        # Decoder with skip connections
        dec3 = self.upconv3(bottleneck)
        dec3 = torch.cat([dec3, enc3], dim=1)
        dec3 = self.dec3(dec3)
        
        dec2 = self.upconv2(dec3)
        dec2 = torch.cat([dec2, enc2], dim=1)
        dec2 = self.dec2(dec2)
        
        dec1 = self.upconv1(dec2)
        dec1 = torch.cat([dec1, enc1], dim=1)
        dec1 = self.dec1(dec1)
        
        return self.sigmoid(self.out(dec1))


class AttentionAnalyzer:
    """
    Predicts visual attention using trained saliency model
    Generates heatmaps and analyzes attention distribution
    """
    
    def __init__(self, model_path: str):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load model
        self.model = SaliencyModel().to(self.device)
        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.eval()
            print(f"Loaded saliency model from {model_path}")
        else:
            print(f"Warning: Model not found at {model_path}. Using random predictions.")
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
        ])
    
    def analyze_design(self, image_path: str) -> Dict:
        """Main analysis function"""
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Generate saliency map
        with torch.no_grad():
            saliency_map = self.model(image_tensor)
        
        # Convert to numpy
        saliency_np = saliency_map.squeeze().cpu().numpy()
        
        # Analyze attention distribution
        attention_areas = self._analyze_attention_areas(saliency_np)
        score = self._calculate_attention_score(saliency_np, attention_areas)
        
        # Save heatmap
        heatmap_path = self._save_heatmap(image, saliency_np, image_path)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(attention_areas)
        
        return {
            "score": score,
            "heatmap_url": heatmap_path,
            "attention_areas": attention_areas,
            "recommendations": recommendations
        }
    
    def _analyze_attention_areas(self, saliency_map: np.ndarray) -> List[Dict]:
        """Identify key attention areas"""
        # Threshold to find high attention regions
        threshold = np.percentile(saliency_map, 90)
        high_attention = saliency_map > threshold
        
        # Divide image into quadrants
        h, w = saliency_map.shape
        quadrants = {
            "top_left": saliency_map[0:h//2, 0:w//2],
            "top_right": saliency_map[0:h//2, w//2:w],
            "bottom_left": saliency_map[h//2:h, 0:w//2],
            "bottom_right": saliency_map[h//2:h, w//2:w]
        }
        
        attention_areas = []
        for name, quadrant in quadrants.items():
            avg_attention = np.mean(quadrant)
            attention_areas.append({
                "region": name,
                "attention_level": float(avg_attention),
                "percentage": float(avg_attention * 100)
            })
        
        # Sort by attention level
        attention_areas.sort(key=lambda x: x["attention_level"], reverse=True)
        
        return attention_areas
    
    def _calculate_attention_score(self, saliency_map: np.ndarray,
                                   attention_areas: List[Dict]) -> float:
        """Calculate attention distribution score"""
        # Good attention distribution:
        # - Focus on top areas (F-pattern)
        # - Not too uniform (boring)
        # - Not too concentrated (overwhelming)
        
        # Calculate attention variance
        variance = np.var(saliency_map)
        
        # Check if attention is in optimal areas (top and center)
        h, w = saliency_map.shape
        top_third = np.mean(saliency_map[0:h//3, :])
        center = np.mean(saliency_map[h//3:2*h//3, w//4:3*w//4])
        
        # Score based on:
        # 1. Variance (not too uniform, not too concentrated)
        # 2. Top-heavy distribution (users scan top first)
        # 3. Center focus (important content)
        variance_score = min(100, variance * 1000)  # Normalize
        distribution_score = (top_third + center) * 100
        
        final_score = (variance_score * 0.4 + distribution_score * 0.6)
        return min(100, max(0, final_score))
    
    def _save_heatmap(self, original_image: Image.Image,
                     saliency_map: np.ndarray,
                     original_path: str) -> str:
        """Save attention heatmap overlay"""
        # Resize saliency map to original image size
        saliency_resized = Image.fromarray(
            (saliency_map * 255).astype(np.uint8)
        ).resize(original_image.size, Image.BILINEAR)
        
        # Convert to numpy
        saliency_array = np.array(saliency_resized)
        
        # Create heatmap (red = high attention)
        from matplotlib import cm
        colormap = cm.get_cmap('jet')
        heatmap = colormap(saliency_array / 255.0)[:, :, :3]
        heatmap = (heatmap * 255).astype(np.uint8)
        
        # Blend with original
        heatmap_img = Image.fromarray(heatmap)
        blended = Image.blend(original_image, heatmap_img, alpha=0.5)
        
        # Save
        base_name = os.path.splitext(os.path.basename(original_path))[0]
        heatmap_path = f"heatmaps/{base_name}_heatmap.png"
        os.makedirs("heatmaps", exist_ok=True)
        blended.save(heatmap_path)
        
        return heatmap_path
    
    def _generate_recommendations(self, attention_areas: List[Dict]) -> List[str]:
        """Generate recommendations based on attention distribution"""
        recommendations = []
        
        # Check top area attention
        top_areas = [a for a in attention_areas if 'top' in a['region']]
        top_attention = sum(a['attention_level'] for a in top_areas)
        
        if top_attention < 0.4:
            recommendations.append(
                "Consider placing key content higher - users scan top areas first"
            )
        
        # Check attention balance
        max_attention = attention_areas[0]['attention_level']
        min_attention = attention_areas[-1]['attention_level']
        
        if max_attention / (min_attention + 0.01) > 5:
            recommendations.append(
                "Attention is too concentrated in one area - distribute important elements"
            )
        
        # Check left side (F-pattern)
        left_areas = [a for a in attention_areas if 'left' in a['region']]
        left_attention = sum(a['attention_level'] for a in left_areas)
        
        if left_attention > 0.6:
            recommendations.append(
                "Good use of F-pattern - left alignment captures attention"
            )
        
        if not recommendations:
            recommendations.append(
                "Attention distribution looks good!"
            )
        
        return recommendations