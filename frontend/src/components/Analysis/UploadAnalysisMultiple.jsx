import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';
import { authService } from '../../services/auth';
import { projectService } from '../../services/projects';

// Upload and Analysis Component - Multiple Images Support
const UploadAnalysisMultiple = ({ projectId, onAnalysisComplete }) => {
  const [files, setFiles] = useState([]); // Array to hold multiple files with metadata
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');
  const [analyzingIndex, setAnalyzingIndex] = useState(null); // Track which file is being analyzed

  const handleFileChange = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    // Process each selected file
    Array.from(selectedFiles).forEach((selectedFile) => {
      // Validate file type
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload valid image files (PNG, JPG, JPEG, or WebP)');
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB per image');
        return;
      }

      // Create file object with metadata
      const fileObj = {
        id: Date.now() + Math.random(),
        file: selectedFile,
        preview: null,
        designName: selectedFile.name.replace(/\.[^/.]+$/, ''),
        analyzed: false,
        results: null,
      };

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        fileObj.preview = reader.result;
        setFiles((prev) => [...prev, fileObj]);
        setError(null);
      };
      reader.readAsDataURL(selectedFile);
    });
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const analyzeFile = async (fileObj) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please login to upload and analyze designs');
      return null;
    }

    if (authService.isTokenExpired()) {
      setError('Your session has expired. Please login again.');
      authService.clearSession();
      localStorage.setItem('redirect_after_login', window.location.pathname);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return null;
    }

    setAnalyzingIndex(fileObj.id);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileObj.file);
      if (fileObj.designName) {
        formData.append('design_name', fileObj.designName);
      }
      if (projectId) {
        formData.append('project_id', projectId);
        console.log(`📁 Linking analysis to project: ${projectId}`);
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'https://arai-system.onrender.com/api/v1';

      console.log(`🚀 Analyzing ${fileObj.designName}...`);

      // Retry logic for 502 errors
      let retries = 3;
      let lastError = null;
      let analysisResult = null;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          if (attempt > 1) {
            setRetryMessage(`Retrying ${fileObj.designName}... (Attempt ${attempt}/${retries})`);
          }

          const response = await axios.post(
            `${apiUrl}/analysis/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
              },
              timeout: 40000,
            }
          );

          console.log(`✅ ${fileObj.designName} analysis completed`);
          analysisResult = response.data;

          // Update file state with results
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileObj.id
                ? { ...f, analyzed: true, results: response.data }
                : f
            )
          );

          lastError = null;
          break;

        } catch (retryErr) {
          lastError = retryErr;
          const shouldRetry = (
            retryErr.code === 'ERR_NETWORK' ||
            retryErr.code === 'ECONNABORTED' ||
            retryErr.response?.status === 502 ||
            retryErr.response?.status === 503 ||
            retryErr.response?.status === 504
          );

          if (shouldRetry && attempt < retries) {
            const waitTime = attempt * 2000;
            setRetryMessage(`Server is waking up... Waiting ${waitTime / 1000}s`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue;
          } else {
            throw retryErr;
          }
        }
      }

      if (lastError) {
        throw lastError;
      }

      return analysisResult;

    } catch (err) {
      console.error(`❌ Error analyzing ${fileObj.designName}:`, err);

      let errorMsg = 'Analysis failed. Please try again.';
      if (err.response?.status === 401) {
        errorMsg = 'Authentication failed. Please login again.';
      } else if (err.response?.status === 400) {
        errorMsg = err.response?.data?.detail || 'Invalid file or parameters';
      } else if (err.response?.status === 413) {
        errorMsg = 'File size too large. Please upload a smaller image.';
      } else if (err.response?.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'Analysis timeout. Please try again.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Network error. Server may be starting up. Please try again.';
      }

      setError(`Error analyzing ${fileObj.designName}: ${errorMsg}`);
      return null;
    } finally {
      setAnalyzingIndex(null);
      setRetryMessage('');
    }
  };

  const analyzeAllFiles = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setIsAnalyzing(true);

    // Collect results locally to avoid stale closure issues with state
    const localResults = [];

    for (const fileObj of files) {
      if (!fileObj.analyzed) {
        const result = await analyzeFile(fileObj);
        if (result) {
          localResults.push({ fileObj, result });
        }
      } else if (fileObj.results) {
        localResults.push({ fileObj, result: fileObj.results });
      }
    }

    setIsAnalyzing(false);

    if (localResults.length === 0) return;

    // Link each analysis to the project if projectId is provided
    if (projectId) {
      for (const { result } of localResults) {
        if (result.analysis_id) {
          try {
            console.log(`🔗 Linking analysis ${result.analysis_id} to project ${projectId}...`);
            await projectService.linkAnalysisToProject(projectId, result.analysis_id);
            console.log(`✅ Analysis linked to project successfully`);
          } catch (linkErr) {
            console.error(`⚠️ Failed to link analysis to project:`, linkErr);
          }
        }
      }
    }

    // Prepare combined results for callback
    const combinedResults = {
      analyses: localResults.map(({ fileObj, result }) => ({
        designName: fileObj.designName,
        preview: fileObj.preview,
        ...result,
      })),
      timestamp: new Date().toISOString(),
    };

    if (onAnalysisComplete) {
      setTimeout(() => {
        onAnalysisComplete(combinedResults);
      }, 500);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setError(null);
  };

  const analyzedCount = files.filter((f) => f.analyzed).length;

  const css = `
    .upload-multiple-wrapper {
      width: 100%;
    }

    .upload-multiple-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section-multiple {
      padding: 28px;
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.03) 0%, rgba(100, 180, 255, 0.05) 100%);
      border: 1.5px solid rgba(15, 37, 87, 0.1);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .form-section-multiple:hover {
      border-color: rgba(15, 37, 87, 0.15);
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.05) 0%, rgba(100, 180, 255, 0.08) 100%);
    }

    .form-label-multiple {
      display: block;
      font-weight: 600;
      font-size: 0.95rem;
      color: #0f2557;
      margin-bottom: 12px;
      letter-spacing: 0.3px;
    }

    .upload-area-multiple {
      border: 2px dashed rgba(15, 37, 87, 0.2);
      border-radius: 12px;
      padding: 40px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }

    .upload-area-multiple:hover {
      border-color: rgba(100, 180, 255, 0.4);
      background: rgba(100, 180, 255, 0.02);
    }

    .upload-area-multiple.active {
      border-color: #64b4ff;
      background: rgba(100, 180, 255, 0.05);
    }

    .upload-icon-multiple {
      width: 48px;
      height: 48px;
      margin: 0 auto 12px;
      color: rgba(15, 37, 87, 0.4);
    }

    .upload-text-multiple {
      color: #0f2557;
      font-size: 0.95rem;
      margin: 0 0 8px 0;
    }

    .upload-browse-link-multiple {
      color: #0f2557;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .upload-browse-link-multiple:hover {
      color: #64b4ff;
    }

    .upload-hint-multiple {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.5);
      margin-top: 8px;
    }

    .file-list-multiple {
      border: 1.5px solid rgba(15, 37, 87, 0.1);
      border-radius: 12px;
      max-height: 400px;
      overflow-y: auto;
    }

    .file-item-multiple {
      padding: 16px;
      border-bottom: 1px solid rgba(15, 37, 87, 0.08);
      display: flex;
      gap: 16px;
      transition: all 0.2s ease;
    }

    .file-item-multiple:last-child {
      border-bottom: none;
    }

    .file-item-multiple:hover {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.03) 100%);
    }

    .file-preview-multiple {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      border: 1.5px solid rgba(15, 37, 87, 0.1);
      flex-shrink: 0;
    }

    .file-content-multiple {
      flex: 1;
      min-width: 0;
    }

    .file-name-multiple {
      font-weight: 600;
      color: #0f2557;
      margin-bottom: 4px;
      font-size: 0.95rem;
      word-break: break-word;
    }

    .file-meta-multiple {
      display: flex;
      gap: 12px;
      align-items: center;
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      margin-bottom: 8px;
    }

    .file-status-multiple {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
    }

    .status-complete {
      color: #16a34a;
    }

    .status-analyzing {
      color: #0066ff;
    }

    .status-pending {
      color: rgba(15, 37, 87, 0.6);
    }

    .file-actions-multiple {
      display: flex;
      gap: 8px;
    }

    .file-remove-btn-multiple {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(15, 37, 87, 0.6);
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .file-remove-btn-multiple:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }

    .file-remove-btn-multiple:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .add-more-btn-multiple {
      width: 100%;
      padding: 16px;
      border: 2px dashed rgba(15, 37, 87, 0.2);
      background: white;
      border-radius: 12px;
      color: #0f2557;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .add-more-btn-multiple:hover {
      border-color: rgba(100, 180, 255, 0.4);
      background: rgba(100, 180, 255, 0.02);
    }

    .add-more-btn-multiple:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-message-multiple {
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%);
      border: 1.5px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      color: #991b1b;
      font-size: 0.95rem;
    }

    .retry-message-multiple {
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

    .info-section-multiple {
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(100, 180, 255, 0.08) 0%, rgba(100, 180, 255, 0.03) 100%);
      border: 1.5px solid rgba(100, 180, 255, 0.2);
      border-radius: 8px;
    }

    .info-title-multiple {
      font-weight: 600;
      font-size: 0.95rem;
      color: #0f2557;
      margin: 0 0 12px 0;
    }

    .info-list-multiple {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.9rem;
      color: rgba(15, 37, 87, 0.7);
    }

    .info-list-multiple li {
      padding: 4px 0;
    }

    .info-list-multiple strong {
      color: #0f2557;
    }

    .info-hint-multiple {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      margin-top: 12px;
      font-style: italic;
    }

    .button-group-multiple {
      display: flex;
      gap: 12px;
    }

    .submit-button-multiple {
      flex: 1;
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

    .submit-button-multiple:hover:not(:disabled) {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
    }

    .submit-button-multiple:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .clear-button-multiple {
      padding: 14px 24px;
      background: white;
      color: #0f2557;
      border: 1.5px solid rgba(15, 37, 87, 0.15);
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .clear-button-multiple:hover {
      background: rgba(15, 37, 87, 0.02);
      border-color: rgba(15, 37, 87, 0.3);
    }

    .hidden-input {
      display: none;
    }

    @media (max-width: 768px) {
      .form-section-multiple {
        padding: 20px;
      }

      .upload-area-multiple {
        padding: 28px 16px;
      }

      .file-item-multiple {
        flex-direction: column;
      }

      .file-preview-multiple {
        width: 100%;
        height: 200px;
      }

      .button-group-multiple {
        flex-direction: column;
      }
    }
  `;

  return (
    <div className="upload-multiple-wrapper">
      <style>{css}</style>

      <form className="upload-multiple-form" onSubmit={(e) => { e.preventDefault(); analyzeAllFiles(); }}>
        {/* File Upload Section */}
        <div className="form-section-multiple">
          <label className="form-label-multiple">Design Files (Multiple supported)</label>

          {files.length === 0 ? (
            <div
              className={`upload-area-multiple ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="upload-icon-multiple" />
              <p className="upload-text-multiple">
                Drag and drop your design files here, or{' '}
                <label className="upload-browse-link-multiple">
                  browse files
                  <input
                    type="file"
                    className="hidden-input"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleFileChange(e.target.files)}
                    multiple
                  />
                </label>
              </p>
              <p className="upload-hint-multiple">Supports: PNG, JPG, JPEG, WebP (Max 10MB each)</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* File List */}
              <div className="file-list-multiple">
                {files.map((fileObj) => (
                  <div key={fileObj.id} className="file-item-multiple">
                    <img
                      src={fileObj.preview}
                      alt={fileObj.designName}
                      className="file-preview-multiple"
                    />

                    <div className="file-content-multiple">
                      <div className="file-name-multiple">{fileObj.designName}</div>
                      <div className="file-meta-multiple">
                        <span>{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>

                      {/* Status */}
                      <div className="file-status-multiple">
                        {fileObj.analyzed ? (
                          <span className="status-complete">Analysis complete</span>
                        ) : analyzingIndex === fileObj.id ? (
                          <span className="status-analyzing">Analyzing...</span>
                        ) : (
                          <span className="status-pending">Pending</span>
                        )}
                      </div>
                    </div>

                    <div className="file-actions-multiple">
                      <button
                        type="button"
                        onClick={() => removeFile(fileObj.id)}
                        disabled={isAnalyzing}
                        className="file-remove-btn-multiple"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add more files button */}
              <label className="add-more-btn-multiple" style={{ cursor: isAnalyzing ? 'not-allowed' : 'pointer', opacity: isAnalyzing ? 0.5 : 1 }}>
                ＋ Add more files
                <input
                  type="file"
                  className="hidden-input"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => handleFileChange(e.target.files)}
                  multiple
                  disabled={isAnalyzing}
                />
              </label>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="error-message-multiple">{error}</div>}

        {/* Analysis Info */}
        <div className="info-section-multiple">
          <h3 className="info-title-multiple">What We'll Analyze:</h3>
          <ul className="info-list-multiple">
            <li><strong>Accessibility:</strong> WCAG 2.1 compliance (contrast, text size, touch targets)</li>
            <li><strong>Readability:</strong> Text clarity, reading level, content density</li>
            <li><strong>Attention:</strong> Visual hierarchy, predicted user focus, cognitive load</li>
          </ul>
          <p className="info-hint-multiple">⏱️ Analysis typically takes 1-3 minutes per image. Multiple images analyzed sequentially.</p>
        </div>

        {/* Retry Message */}
        {retryMessage && (
          <div className="retry-message-multiple">
            <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span>
            {retryMessage}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="button-group-multiple">
          <button
            type="submit"
            disabled={files.length === 0 || isAnalyzing}
            className="submit-button-multiple"
          >
            {isAnalyzing ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span>
                Analyzing {analyzedCount}/{files.length}...
              </>
            ) : (
              <>
                Analyze {files.length} Design{files.length !== 1 ? 's' : ''}
              </>
            )}
          </button>

          {files.length > 0 && !isAnalyzing && (
            <button
              type="button"
              onClick={resetForm}
              className="clear-button-multiple"
            >
              Clear All
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UploadAnalysisMultiple;
