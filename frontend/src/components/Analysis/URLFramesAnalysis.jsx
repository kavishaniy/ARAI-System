import React, { useState } from 'react';
import { AlertCircle, Plus, Trash2, BarChart3, Loader } from 'lucide-react';
import axios from 'axios';

const css = `
.url-frames-container {
  max-width: 1200px;
  margin: 0 auto;
}

.frames-header {
  text-align: center;
  margin-bottom: 2rem;
}

.frames-header h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  color: #0f2557;
  margin-bottom: 0.5rem;
  font-weight: 400;
}

.frames-header p {
  font-size: 0.95rem;
  color: rgba(15, 37, 87, 0.6);
}

.image-preview-section {
  background: white;
  border: 1.5px solid rgba(15, 37, 87, 0.15);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(15, 37, 87, 0.08);
}

.preview-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 1rem;
}

.image-preview {
  width: 100%;
  max-height: 400px;
  background: linear-gradient(135deg, #f5f4f0, #faf9f7);
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-loading {
  color: rgba(15, 37, 87, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.image-error {
  background: #fee2e2;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  padding: 1rem;
  color: #991b1b;
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
}

.frames-list {
  background: white;
  border: 1.5px solid rgba(15, 37, 87, 0.15);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.list-header {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 1.5rem;
}

.frame-item {
  background: rgba(15, 37, 87, 0.02);
  border: 1.5px solid rgba(15, 37, 87, 0.1);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
}

.frame-item:hover {
  background: rgba(15, 37, 87, 0.05);
  border-color: rgba(15, 37, 87, 0.15);
}

.frame-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #0f2557;
}

.frame-status {
  font-size: 0.85rem;
  color: rgba(15, 37, 87, 0.5);
  margin-top: 0.25rem;
}

.frame-actions {
  display: flex;
  gap: 0.5rem;
}

.remove-button {
  padding: 6px 12px;
  background: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.remove-button:hover {
  background: #fecaca;
}

.add-frame-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(100, 200, 255, 0.1);
  color: rgba(100, 200, 255, 1);
  border: 1.5px solid rgba(100, 200, 255, 0.3);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.add-frame-button:hover {
  background: rgba(100, 200, 255, 0.15);
  border-color: rgba(100, 200, 255, 0.5);
}

.add-frame-form {
  background: rgba(15, 37, 87, 0.02);
  border: 1.5px solid rgba(100, 200, 255, 0.2);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group input {
  flex: 1;
  padding: 10px 12px;
  border: 1.5px solid rgba(15, 37, 87, 0.15);
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
}

.form-group input:focus {
  outline: none;
  border-color: rgba(15, 37, 87, 0.4);
  box-shadow: 0 0 0 3px rgba(15, 37, 87, 0.08);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
}

.add-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(15, 37, 87, 0.2);
}

.cancel-button-small {
  padding: 10px 20px;
  background: transparent;
  color: #0f2557;
  border: 1.5px solid rgba(15, 37, 87, 0.2);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.cancel-button-small:hover {
  background: rgba(15, 37, 87, 0.05);
  border-color: rgba(15, 37, 87, 0.3);
}

.action-footer {
  background: white;
  border: 1.5px solid rgba(15, 37, 87, 0.15);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.frame-count {
  font-size: 0.95rem;
  font-weight: 500;
  color: #0f2557;
}

.frame-count strong {
  color: rgba(100, 200, 255, 1);
  font-size: 1.1rem;
}

.analyze-button {
  padding: 12px 28px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analyze-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(15, 37, 87, 0.25);
}

.analyze-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fee2e2;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  padding: 1rem;
  color: #991b1b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-message svg {
  flex-shrink: 0;
  margin-top: 2px;
}

@media (max-width: 768px) {
  .form-group {
    flex-direction: column;
  }

  .action-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .analyze-button {
    width: 100%;
    justify-content: center;
  }
}
`;

const URLFramesAnalysis = ({ projectData, onAnalyzeFrames, isLoading, setIsLoading }) => {
  const [frames, setFrames] = useState([{ id: 1, name: projectData.frameName, url: projectData.imageUrl }]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFrameData, setNewFrameData] = useState({ name: '', url: '' });
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const addFrame = () => {
    if (!newFrameData.name.trim() || !newFrameData.url.trim()) {
      setError('Please fill in both name and URL');
      return;
    }

    try {
      new URL(newFrameData.url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setFrames([...frames, { id: frames.length + 1, name: newFrameData.name, url: newFrameData.url }]);
    setNewFrameData({ name: '', url: '' });
    setShowAddForm(false);
    setError('');
  };

  const removeFrame = (id) => {
    if (frames.length === 1) {
      setError('You must have at least one frame');
      return;
    }
    setFrames(frames.filter((f) => f.id !== id));
  };

  const handleAnalyzeFrames = async () => {
    if (frames.length === 0) {
      setError('Please add at least one frame');
      return;
    }

    setAnalyzing(true);
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://arai-system.onrender.com/api/v1';

      console.log('📤 Analyzing design images:', frames.length);

      const response = await axios.post(
        `${API_BASE_URL}/design/analyze`,
        {
          frames: frames.map((f) => ({
            id: f.id.toString(),
            name: f.name,
            image_url: f.url,
          })),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          timeout: 300000, // 5 minutes
        }
      );

      console.log('✅ Analysis complete:', response.data);

      if (response.data && response.data.status === 'success') {
        onAnalyzeFrames(response.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error analyzing frames:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to analyze designs';
      setError(errorMsg);
    } finally {
      setAnalyzing(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="url-frames-container">
        <div className="frames-header">
          <h2>Review & Analyze Designs</h2>
          <p>Add more design images or modify the current one, then analyze them all</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}

        <div className="image-preview-section">
          <div className="preview-label">Preview of First Design</div>
          <div className="image-preview">
            {imageLoadError ? (
              <div className="image-error">
                <AlertCircle size={20} />
                <div>Could not load image from URL. Please check if the URL is correct and accessible.</div>
              </div>
            ) : (
              <img
                src={projectData.imageUrl}
                alt="Design preview"
                onError={() => setImageLoadError(true)}
              />
            )}
          </div>
        </div>

        <div className="frames-list">
          <div className="list-header">Design Images to Analyze</div>

          {frames.map((frame) => (
            <div key={frame.id} className="frame-item">
              <div>
                <div className="frame-name">{frame.name}</div>
                <div className="frame-status">{frame.url}</div>
              </div>
              <div className="frame-actions">
                <button className="remove-button" onClick={() => removeFrame(frame.id)}>
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          ))}

          {!showAddForm && (
            <button className="add-frame-button" onClick={() => setShowAddForm(true)}>
              <Plus size={16} />
              Add Another Design
            </button>
          )}

          {showAddForm && (
            <div className="add-frame-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Frame name (e.g., Login Page)"
                  value={newFrameData.name}
                  onChange={(e) => setNewFrameData({ ...newFrameData, name: e.target.value })}
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={newFrameData.url}
                  onChange={(e) => setNewFrameData({ ...newFrameData, url: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button className="add-button" onClick={addFrame}>
                  Add Design
                </button>
                <button className="cancel-button-small" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="action-footer">
          <div className="frame-count">
            <strong>{frames.length}</strong> design{frames.length !== 1 ? 's' : ''} ready to analyze
          </div>
          <button className="analyze-button" onClick={handleAnalyzeFrames} disabled={analyzing || frames.length === 0}>
            {analyzing ? (
              <>
                <Loader size={18} className="loading-spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 size={18} />
                Analyze All Designs
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default URLFramesAnalysis;
