import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from tqdm import tqdm
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import os
import argparse
from datetime import datetime

# Import your U-Net model
import sys
sys.path.append('..')
from app.ai_modules.comprehensive_attention_analyzer import SaliencyModel
from dataset import SaliencyDataset


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


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Train U-Net saliency prediction model')
    
    # Data arguments
    parser.add_argument('--image_dir', type=str, default='../data/salicon/images',
                        help='Directory containing training images')
    parser.add_argument('--saliency_dir', type=str, default='../data/salicon/maps',
                        help='Directory containing saliency maps')
    parser.add_argument('--image_size', type=int, default=256,
                        help='Input image size (default: 256)')
    
    # Training arguments
    parser.add_argument('--batch_size', type=int, default=8,
                        help='Batch size (default: 8, use 16-32 for GPU)')
    parser.add_argument('--num_epochs', type=int, default=50,
                        help='Number of training epochs (default: 50)')
    parser.add_argument('--learning_rate', type=float, default=1e-4,
                        help='Learning rate (default: 0.0001)')
    parser.add_argument('--train_split', type=float, default=0.8,
                        help='Training split ratio (default: 0.8)')
    parser.add_argument('--num_workers', type=int, default=2,
                        help='Number of data loading workers (default: 2)')
    
    # Output arguments
    parser.add_argument('--save_dir', type=str, default='../models',
                        help='Directory to save trained model')
    parser.add_argument('--device', type=str, default='auto',
                        help='Device to use: cpu, cuda, or auto (default: auto)')
    
    return parser.parse_args()


def main():
    """
    Main training function
    """
    print("="*60)
    print("🎓 ARAI Saliency Model Training")
    print("="*60)
    
    # Parse command line arguments
    args = parse_args()
    
    # Configuration from arguments
    config = {
        'image_dir': args.image_dir,
        'saliency_dir': args.saliency_dir,
        'image_size': args.image_size,
        'batch_size': args.batch_size,
        'num_epochs': args.num_epochs,
        'learning_rate': args.learning_rate,
        'train_split': args.train_split,
        'num_workers': args.num_workers,
        'save_dir': args.save_dir
    }
    
    print("\n📝 Configuration:")
    for key, value in config.items():
        print(f"   {key}: {value}")
    
    # Device setup
    if args.device == 'auto':
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    else:
        device = torch.device(args.device)
    
    print(f"\n🖥️  Using device: {device}")
    if device.type == 'cuda':
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
        print(f"   Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
    
    # Load dataset
    print(f"\n📂 Loading dataset from:")
    print(f"   Images: {config['image_dir']}")
    print(f"   Saliency: {config['saliency_dir']}")
    
    try:
        dataset = SaliencyDataset(
            image_dir=config['image_dir'],
            saliency_dir=config['saliency_dir'],
            image_size=config['image_size']
        )
    except FileNotFoundError as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Quick fix:")
        print("   1. Update 'image_dir' and 'saliency_dir' in the config above")
        print("   2. Or download SALICON dataset from: http://salicon.net/")
        print("   3. Or create synthetic data with:")
        print("      python dataset.py ../data/sample/images ../data/sample/maps")
        return
    
    if len(dataset) == 0:
        print("\n❌ No data found! Please check your data directories.")
        print("\n💡 To create synthetic saliency maps:")
        print("   from dataset import create_synthetic_saliency_maps")
        print("   create_synthetic_saliency_maps('path/to/images', 'path/to/output')")
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
    print(f"💾 Model size: ~{total_params * 4 / 1e6:.1f} MB")
    
    # Initialize trainer
    trainer = SaliencyTrainer(
        model=model,
        device=device,
        learning_rate=config['learning_rate']
    )
    
    # Train
    print(f"\n⏰ Training started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n" + "="*60)
    
    try:
        trained_model = trainer.train(
            train_loader=train_loader,
            val_loader=val_loader,
            num_epochs=config['num_epochs'],
            save_dir=config['save_dir']
        )
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user!")
        print(f"💾 Best model so far saved with val_loss: {trainer.best_val_loss:.4f}")
    
    print(f"\n⏰ Training finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n" + "="*60)
    print("✅ Done! Your model is ready to use in the ARAI system.")
    print(f"📍 Model location: {os.path.abspath(os.path.join(config['save_dir'], 'saliency_model.pth'))}")
    print("\n🚀 Next steps:")
    print("   1. Restart your backend server")
    print("   2. Upload a design to test the model")
    print("   3. Compare results with heuristic-based analysis")


if __name__ == "__main__":
    main()
