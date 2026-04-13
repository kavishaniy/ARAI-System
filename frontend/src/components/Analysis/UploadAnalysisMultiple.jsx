import React, { useState } from 'react';
import { Upload, FileImage, AlertCircle, CheckCircle, Loader2, X, Plus } from 'lucide-react';
import axios from 'axios';
import { authService } from '../../services/auth';

// Upload and Analysis Component - Multiple Images Support
const UploadAnalysisMultiple = ({ onAnalysisComplete }) => {
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

  const updateDesignName = (fileId, newName) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, designName: newName } : f
      )
    );
  };

  const analyzeFile = async (fileObj) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please login to upload and analyze designs');
      return;
    }

    if (authService.isTokenExpired()) {
      setError('Your session has expired. Please login again.');
      authService.clearSession();
      localStorage.setItem('redirect_after_login', window.location.pathname);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    setAnalyzingIndex(fileObj.id);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileObj.file);
      if (fileObj.designName) {
        formData.append('design_name', fileObj.designName);
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'https://arai-system.onrender.com/api/v1';

      console.log(`🚀 Analyzing ${fileObj.designName}...`);

      // Retry logic for 502 errors
      let retries = 3;
      let lastError = null;

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

          // Update file with results
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

    // Analyze files sequentially
    for (const fileObj of files) {
      if (!fileObj.analyzed) {
        await analyzeFile(fileObj);
      }
    }

    setIsAnalyzing(false);

    // Check if all files are analyzed
    const allAnalyzed = files.every((f) => f.analyzed);
    if (allAnalyzed) {
      // Prepare combined results for callback
      const combinedResults = {
        analyses: files.map((f) => ({
          designName: f.designName,
          preview: f.preview,
          ...f.results,
        })),
        timestamp: new Date().toISOString(),
      };

      // Call parent callback with all results
      if (onAnalysisComplete) {
        setTimeout(() => {
          onAnalysisComplete(combinedResults);
        }, 500);
      }
    }
  };

  const resetForm = () => {
    setFiles([]);
    setError(null);
  };

  const analyzedCount = files.filter((f) => f.analyzed).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            ACCESSIBILITY READABILITY ATTENTION INDEX
          </h2>
          <p className="text-gray-600">
            Upload multiple UI/UX designs for comprehensive analysis
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); analyzeAllFiles(); }} className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Design Files (Multiple supported)
            </label>

            {files.length === 0 ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your design files here, or
                </p>
                <label className="cursor-pointer text-gray-600 hover:text-gray-700 font-medium">
                  browse files
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleFileChange(e.target.files)}
                    multiple
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: PNG, JPG, JPEG, WebP (Max 10MB each)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File List */}
                <div className="border border-gray-300 rounded-lg divide-y max-h-96 overflow-y-auto">
                  {files.map((fileObj, index) => (
                    <div key={fileObj.id} className="p-4 flex gap-4 hover:bg-gray-50">
                      <img
                        src={fileObj.preview}
                        alt={fileObj.designName}
                        className="w-20 h-20 object-cover rounded border border-gray-300"
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="text"
                            value={fileObj.designName}
                            onChange={(e) => updateDesignName(fileObj.id, e.target.value)}
                            className="font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-gray-500 focus:outline-none px-1"
                            disabled={isAnalyzing}
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(fileObj.id)}
                            disabled={isAnalyzing}
                            className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                        {/* Status */}
                        {fileObj.analyzed ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Analysis complete</span>
                          </div>
                        ) : analyzingIndex === fileObj.id ? (
                          <div className="flex items-center gap-2 text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Analyzing...</span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Pending</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add more files button */}
                <label className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 cursor-pointer transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add more files</span>
                  <input
                    type="file"
                    className="hidden"
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
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Analysis Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              What We'll Analyze:
            </h3>
            <ul className="space-y-1 text-sm text-gray-800 ml-7">
              <li>• <strong>Accessibility:</strong> WCAG 2.1 compliance (contrast, text size, touch targets)</li>
              <li>• <strong>Readability:</strong> Text clarity, reading level, content density</li>
              <li>• <strong>Attention:</strong> Visual hierarchy, predicted user focus, cognitive load</li>
            </ul>
            <p className="text-xs text-gray-600 mt-3 italic">
              ⏱️ Analysis typically takes 1-3 minutes per image. Multiple images analyzed sequentially.
            </p>
          </div>

          {/* Retry Message */}
          {retryMessage && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
              <p className="text-blue-700 text-sm">{retryMessage}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={files.length === 0 || isAnalyzing}
              className={`flex-1 py-3 px-4 rounded-md font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                files.length === 0 || isAnalyzing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing {analyzedCount}/{files.length}... (This may take 1-3 minutes per image)
                </>
              ) : (
                <>
                  <FileImage className="h-5 w-5" />
                  Analyze {files.length} Design{files.length !== 1 ? 's' : ''}
                </>
              )}
            </button>

            {files.length > 0 && !isAnalyzing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadAnalysisMultiple;
