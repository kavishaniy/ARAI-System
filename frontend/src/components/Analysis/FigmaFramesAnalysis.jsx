import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, Filter, BarChart3 } from 'lucide-react';
import axios from 'axios';

const css = `
.figma-frames-container {
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

.loading-container {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border: 1.5px solid rgba(15, 37, 87, 0.15);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(15, 37, 87, 0.08);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 0.95rem;
  color: rgba(15, 37, 87, 0.7);
  margin-bottom: 0.5rem;
}

.loading-subtext {
  font-size: 0.85rem;
  color: rgba(15, 37, 87, 0.5);
}

.error-container {
  background: #fee2e2;
  border: 1.5px solid #fecaca;
  border-radius: 15px;
  padding: 2rem;
  color: #991b1b;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.error-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.error-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-content p {
  font-size: 0.9rem;
  line-height: 1.6;
}

.frames-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.frame-card {
  background: white;
  border: 1.5px solid rgba(15, 37, 87, 0.15);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.frame-card:hover {
  border-color: rgba(100, 180, 255, 0.4);
  box-shadow: 0 10px 30px rgba(15, 37, 87, 0.1);
  transform: translateY(-2px);
}

.frame-card.selected {
  border-color: rgba(100, 200, 255, 1);
  box-shadow: 0 0 0 2px rgba(100, 200, 255, 0.2), 0 10px 30px rgba(15, 37, 87, 0.1);
}

.frame-preview {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, #f5f4f0, #faf9f7);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.frame-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.frame-placeholder {
  color: rgba(15, 37, 87, 0.3);
  font-size: 3rem;
}

.frame-select-overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px;
}

.frame-card.selected .frame-select-overlay {
  background: linear-gradient(135deg, #0f2557, #091840);
}

.frame-select-overlay svg {
  color: white;
  stroke-width: 2.5;
}

.frame-info {
  padding: 1rem;
}

.frame-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.frame-dimensions {
  font-size: 0.85rem;
  color: rgba(15, 37, 87, 0.5);
}

.frames-footer {
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

.selected-count {
  font-size: 0.95rem;
  font-weight: 500;
  color: #0f2557;
}

.selected-count strong {
  color: rgba(100, 200, 255, 1);
  font-size: 1.1rem;
}

.frames-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  padding: 10px 20px;
  border: 1.5px solid rgba(15, 37, 87, 0.2);
  border-radius: 10px;
  background: transparent;
  color: #0f2557;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background: rgba(15, 37, 87, 0.05);
  border-color: rgba(15, 37, 87, 0.3);
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

.filter-section {
  background: white;
  border: 1.5px solid rgba(15, 37, 87, 0.15);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-button {
  padding: 10px 16px;
  background: transparent;
  border: 1.5px solid rgba(15, 37, 87, 0.2);
  border-radius: 10px;
  color: #0f2557;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-button:hover {
  background: rgba(15, 37, 87, 0.05);
  border-color: rgba(15, 37, 87, 0.3);
}

.filter-button.active {
  background: rgba(100, 200, 255, 0.1);
  border-color: rgba(100, 200, 255, 0.4);
  color: rgba(100, 200, 255, 1);
}

@media (max-width: 768px) {
  .frames-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .frames-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .frames-actions {
    width: 100%;
  }

  .analyze-button {
    width: 100%;
    justify-content: center;
  }
}
`;

const FigmaFramesAnalysis = ({
  projectData,
  onAnalyzeFrames,
  isLoading,
  setIsLoading,
}) => {
  const [frames, setFrames] = useState([]);
  const [selectedFrames, setSelectedFrames] = useState(new Set());
  const [error, setError] = useState('');
  const [loadingFrames, setLoadingFrames] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    // AbortController prevents the duplicate request React StrictMode fires in
    // development (mount → cleanup → remount), which would hit Figma's rate limit.
    const controller = new AbortController();

    const fetchFrames = async () => {
      setLoadingFrames(true);
      setError('');

      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Authentication required');

        const API_BASE_URL =
          process.env.REACT_APP_API_URL ||
          'https://arai-system.onrender.com/api/v1';

        const response = await axios.post(
          `${API_BASE_URL}/figma/frames`,
          {
            file_id:     projectData.fileId,
            project_url: projectData.projectUrl,
            figma_token: projectData.figmaToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.data.status === 'error') {
          throw new Error(response.data.message || 'No frames found in the project');
        }

        if (response.data.frames && Array.isArray(response.data.frames)) {
          if (response.data.frames.length === 0) {
            setError(response.data.message || 'No frames found in the project');
            setFrames([]);
          } else {
            setFrames(response.data.frames);
            const framesToSelect = response.data.frames.slice(0, 5);
            setSelectedFrames(new Set(framesToSelect.map((f) => f.id || f.name)));
          }
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        if (axios.isCancel(err) || err.name === 'CanceledError') return;

        if (err.response?.status === 429) {
          setError('Figma API rate limit exceeded. Please wait a moment and try again.');
        } else {
          setError(
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            'Failed to fetch Figma frames'
          );
        }
        setFrames([]);
      } finally {
        setLoadingFrames(false);
      }
    };

    fetchFrames();

    return () => controller.abort();
  }, [projectData]);

  const toggleFrameSelection = (frameId) => {
    const newSelection = new Set(selectedFrames);
    if (newSelection.has(frameId)) {
      newSelection.delete(frameId);
    } else {
      newSelection.add(frameId);
    }
    setSelectedFrames(newSelection);
  };

  const selectAllFrames = () => {
    setSelectedFrames(
      new Set(frames.map((f) => f.id || f.name))
    );
  };

  const clearSelection = () => {
    setSelectedFrames(new Set());
  };

  const handleAnalyzeFrames = async () => {
    if (selectedFrames.size === 0) {
      setError('Please select at least one frame to analyze');
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

      const selectedFrameObjects = frames.filter(
        (f) => selectedFrames.has(f.id) || selectedFrames.has(f.name)
      );

      const API_BASE_URL =
        process.env.REACT_APP_API_URL ||
        'https://arai-system.onrender.com/api/v1';

      const response = await axios.post(
        `${API_BASE_URL}/figma/analyze`,
        {
          file_id: projectData.fileId,
          frames: selectedFrameObjects,
          figma_token: projectData.figmaToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          timeout: 300000, // 5 minutes timeout
        }
      );

      if (response.data && response.data.analyses) {
        onAnalyzeFrames(response.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error analyzing frames:', err);
      
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to analyze Figma frames. Please export frames manually and try again.';
      setError(errorMsg);
    } finally {
      setAnalyzing(false);
      setIsLoading(false);
    }
  };

  if (loadingFrames) {
    return (
      <>
        <style>{css}</style>
        <div className="figma-frames-container">
          <div className="loading-container">
            <div className="loading-spinner">
              <Loader size={50} />
            </div>
            <p className="loading-text">Fetching your Figma frames...</p>
            <p className="loading-subtext">
              This may take a moment depending on project size
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="figma-frames-container">
        <div className="frames-header">
          <h2>Select Frames to Analyze</h2>
          <p>Choose which frames you'd like to analyze</p>
        </div>

        {error && (
          <div className="error-container">
            <div className="error-icon">
              <AlertCircle size={24} />
            </div>
            <div className="error-content">
              <h3>Error Loading Frames</h3>
              <p>{error}</p>
              {error.toLowerCase().includes('no frame') && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
                  <strong>How to fix this:</strong>
                  <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                    <li>Make sure your Figma file has at least one <strong>FRAME</strong></li>
                    <li>Components and Component Sets are also supported</li>
                    <li>Individual shapes without a frame cannot be analyzed</li>
                    <li>Try creating a simple frame with a rectangle inside to test</li>
                  </ul>
                </div>
              )}
              {error.toLowerCase().includes('rate limit') && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
                  <strong>What to do:</strong>
                  <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                    <li>Wait 1-2 minutes before trying again</li>
                    <li>Analyze fewer frames in one request</li>
                    <li>If problem persists, create a new Figma API token</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {frames.length === 0 ? (
          <div className="error-container">
            <div className="error-icon">
              <AlertCircle size={24} />
            </div>
            <div className="error-content">
              <h3>No Frames Found</h3>
              <p>
                This Figma project doesn't contain any frames. Please ensure
                your project has at least one frame and try again.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="filter-section">
              <Filter size={18} />
              <span style={{ color: 'rgba(15, 37, 87, 0.6)', fontSize: '0.9rem' }}>
                {frames.length} frames available
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
                <button
                  className="filter-button"
                  onClick={selectAllFrames}
                >
                  Select All
                </button>
                <button
                  className="filter-button"
                  onClick={clearSelection}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="frames-grid">
              {frames.map((frame) => {
                const frameId = frame.id || frame.name;
                const isSelected = selectedFrames.has(frameId);

                return (
                  <div
                    key={frameId}
                    className={`frame-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleFrameSelection(frameId)}
                  >
                    <div className="frame-preview">
                      {frame.thumbnailUrl ? (
                        <img src={frame.thumbnailUrl} alt={frame.name} />
                      ) : (
                        <div className="frame-placeholder">📐</div>
                      )}
                      <div className="frame-select-overlay">
                        {isSelected && <CheckCircle size={20} />}
                      </div>
                    </div>
                    <div className="frame-info">
                      <div className="frame-name">{frame.name}</div>
                      <div className="frame-dimensions">
                        {frame.width && frame.height
                          ? `${frame.width} × ${frame.height}px`
                          : 'Size unknown'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="frames-footer">
              <div className="selected-count">
                <strong>{selectedFrames.size}</strong> frame
                {selectedFrames.size !== 1 ? 's' : ''} selected
              </div>
              <div className="frames-actions">
                <button
                  className="analyze-button"
                  onClick={handleAnalyzeFrames}
                  disabled={analyzing || selectedFrames.size === 0}
                >
                  {analyzing ? (
                    <>
                      <Loader size={18} className="loading-spinner" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={18} />
                      Analyze Selected Frames
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FigmaFramesAnalysis;
