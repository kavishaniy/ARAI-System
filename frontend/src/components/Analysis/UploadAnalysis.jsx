import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';
import { authService } from '../../services/auth';

// Upload and Analysis Component - Production Ready - Legacy Single File Version
const UploadAnalysis = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [designName, setDesignName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    // Auto-fill design name if empty
    if (!designName) {
      setDesignName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please login to upload and analyze designs');
      return;
    }

    // Check if token might be expired
    if (authService.isTokenExpired()) {
      setError('Your session has expired. Please login again.');
      authService.clearSession();
      // Store current path for redirect after login
      localStorage.setItem('redirect_after_login', window.location.pathname);
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (designName) {
        formData.append('design_name', designName);
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'https://arai-system.onrender.com/api/v1';
      
      console.log('🚀 Uploading design for analysis...');
      console.log('📁 File:', file.name);
      console.log('🔑 Token exists:', !!token);
      console.log('🌐 API URL:', apiUrl);
      
      // Retry logic for 502 errors (Render free tier wake-up)
      let retries = 3;
      let lastError = null;
      
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`📡 Attempt ${attempt}/${retries}...`);
          
          if (attempt > 1) {
            setRetryMessage(`Retrying... (Attempt ${attempt}/${retries})`);
          } else {
            setRetryMessage('');
          }
          
          const response = await axios.post(
            `${apiUrl}/analysis/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              },
              timeout: 40000, // 40 seconds timeout - optimized backend should respond faster
            }
          );

          console.log('✅ Analysis completed:', response.data);
          
          // Success! Break out of retry loop
          lastError = null;
          
          // Reset form FIRST (clear any lingering state)
          setFile(null);
          setPreview(null);
          setDesignName('');
          setError(null);
          setIsAnalyzing(false);
          setRetryMessage('');
          
          // Notify parent component with a slight delay to ensure state is cleared
          setTimeout(() => {
            if (onAnalysisComplete) {
              console.log('📤 Calling onAnalysisComplete callback with response data');
              onAnalysisComplete(response.data);
            }
          }, 100);
          
          break; // Exit retry loop on success
          
        } catch (retryErr) {
          lastError = retryErr;
          console.warn(`⚠️ Attempt ${attempt} failed:`, retryErr.message);
          
          // Check if it's a timeout error
          const isTimeout = retryErr.code === 'ECONNABORTED' || retryErr.message?.includes('timeout');
          
          // Check if it's a 502 or network error that we should retry
          const shouldRetry = (
            retryErr.code === 'ERR_NETWORK' ||
            retryErr.code === 'ECONNABORTED' ||
            retryErr.response?.status === 502 ||
            retryErr.response?.status === 503 ||
            retryErr.response?.status === 504
          );
          
          if (shouldRetry && attempt < retries) {
            // Adjust message based on error type
            if (isTimeout) {
              setRetryMessage(`Analysis is taking longer than expected. Retrying... (Attempt ${attempt + 1}/${retries})`);
            } else {
              const waitTime = attempt * 2000; // 2s, 4s, 6s
              setRetryMessage(`Server is waking up... Waiting ${waitTime/1000}s before next attempt`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            continue;
          } else {
            // Don't retry for other errors (401, 400, etc.)
            throw retryErr;
          }
        }
      }
      
      // If we exhausted all retries, throw the last error
      if (lastError) {
        throw lastError;
      }
      
    } catch (err) {
      console.error('❌ Analysis error:', err);
      console.error('❌ Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        const errorDetail = err.response?.data?.detail || '';
        
        // Check if it's a token expiration issue
        if (errorDetail.includes('expired') || errorDetail.includes('invalid JWT')) {
          setError('Your session has expired. Please login again.');
          authService.clearSession();
          // Redirect to login after showing error
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setError('Authentication failed. Please login again.');
        }
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.detail || 'Invalid file or parameters');
      } else if (err.response?.status === 413) {
        setError('File size too large. Please upload a smaller image.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later or contact support.');
      } else if (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504) {
        setError('Server is temporarily unavailable. This usually happens when the server is waking up. Please try again in a few seconds.');
      } else if (err.code === 'ECONNABORTED' && err.message?.includes('timeout')) {
        setError('Analysis is taking longer than expected. This may happen on the first request when AI models are loading. Please try again - subsequent attempts will be faster.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to connect to server. The server may be starting up (this can take 30-60 seconds on first request). Please wait a moment and try again.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Analysis failed. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
      setRetryMessage('');
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setDesignName('');
    setError(null);
  };

  const css = `
    .upload-analysis-wrapper {
      width: 100%;
    }

    .upload-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      padding: 28px;
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.03) 0%, rgba(100, 180, 255, 0.05) 100%);
      border: 1.5px solid rgba(15, 37, 87, 0.1);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .form-section:hover {
      border-color: rgba(15, 37, 87, 0.15);
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.05) 0%, rgba(100, 180, 255, 0.08) 100%);
    }

    .form-label {
      display: block;
      font-weight: 600;
      font-size: 0.95rem;
      color: #0f2557;
      margin-bottom: 12px;
      letter-spacing: 0.3px;
    }

    .upload-area {
      border: 2px dashed rgba(15, 37, 87, 0.2);
      border-radius: 12px;
      padding: 40px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }

    .upload-area:hover {
      border-color: rgba(100, 180, 255, 0.4);
      background: rgba(100, 180, 255, 0.02);
    }

    .upload-area.active {
      border-color: #64b4ff;
      background: rgba(100, 180, 255, 0.05);
    }

    .upload-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 12px;
      color: rgba(15, 37, 87, 0.4);
    }

    .upload-text {
      color: #0f2557;
      font-size: 0.95rem;
      margin: 0 0 8px 0;
    }

    .upload-browse-link {
      color: #0f2557;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .upload-browse-link:hover {
      color: #64b4ff;
    }

    .upload-hint {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.5);
      margin-top: 8px;
    }

    .upload-preview {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      border: 1.5px solid rgba(15, 37, 87, 0.1);
    }

    .upload-preview-img {
      width: 100%;
      max-height: 300px;
      object-fit: contain;
      background: white;
    }

    .upload-preview-remove {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(239, 68, 68, 0.9);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .upload-preview-remove:hover {
      background: rgba(239, 68, 68, 1);
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid rgba(15, 37, 87, 0.15);
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: 'DM Sans', sans-serif;
      background: white;
      color: #0f2557;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #64b4ff;
      box-shadow: 0 0 0 3px rgba(100, 180, 255, 0.1);
    }

    .form-input::placeholder {
      color: rgba(15, 37, 87, 0.4);
    }

    .info-section {
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(100, 180, 255, 0.08) 0%, rgba(100, 180, 255, 0.03) 100%);
      border: 1.5px solid rgba(100, 180, 255, 0.2);
      border-radius: 8px;
    }

    .info-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: #0f2557;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.9rem;
      color: rgba(15, 37, 87, 0.7);
    }

    .info-list li {
      padding: 4px 0;
    }

    .info-list strong {
      color: #0f2557;
    }

    .info-hint {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      margin-top: 12px;
      font-style: italic;
    }

    .error-message {
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%);
      border: 1.5px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      color: #991b1b;
      font-size: 0.95rem;
    }

    .retry-message {
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%);
      border: 1.5px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      color: #1e40af;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .submit-button {
      padding: 14px 24px;
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .submit-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
    }

    .submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .hidden-input {
      display: none;
    }

    @media (max-width: 768px) {
      .upload-area {
        padding: 28px 16px;
      }

      .form-section {
        padding: 20px;
      }
    }
  `;

  return (
    <div className="upload-analysis-wrapper">
      <style>{css}</style>

      <form className="upload-form" onSubmit={handleSubmit}>
        {/* File Upload Section */}
        <div className="form-section">
          <label className="form-label">Design File</label>
          
          {!preview ? (
            <div
              className={`upload-area ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="upload-icon" />
              <p className="upload-text">
                Drag and drop your design file here, or{' '}
                <label className="upload-browse-link">
                  browse files
                  <input
                    type="file"
                    className="hidden-input"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                </label>
              </p>
              <p className="upload-hint">Supports: PNG, JPG, JPEG, WebP (Max 10MB)</p>
            </div>
          ) : (
            <div className="upload-preview">
              <img
                src={preview}
                alt="Preview"
                className="upload-preview-img"
              />
              <button
                type="button"
                onClick={resetForm}
                className="upload-preview-remove"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Design Name Input */}
        <div className="form-section">
          <label className="form-label">Design Name (Optional)</label>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder="e.g., Homepage Design V2"
            className="form-input"
          />
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Analysis Info */}
        <div className="info-section">
          <h3 className="info-title">✓ What We'll Analyze:</h3>
          <ul className="info-list">
            <li><strong>Accessibility:</strong> WCAG 2.1 compliance (contrast, text size, touch targets)</li>
            <li><strong>Readability:</strong> Text clarity, reading level, content density</li>
            <li><strong>Attention:</strong> Visual hierarchy, predicted user focus, cognitive load</li>
          </ul>
          <p className="info-hint">⏱️ Analysis typically takes 1-3 minutes on the first request while AI models load. Subsequent analyses are much faster!</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || isAnalyzing}
          className="submit-button"
        >
          {isAnalyzing ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span>
              Analyzing Design... (This may take 1-3 minutes)
            </>
          ) : (
            <>
              📁 Analyze Design
            </>
          )}
        </button>

        {/* Retry Message */}
        {retryMessage && (
          <div className="retry-message">
            <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span>
            {retryMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default UploadAnalysis;
