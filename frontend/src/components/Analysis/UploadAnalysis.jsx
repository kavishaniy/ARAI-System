import React, { useState } from 'react';
import { Upload, FileImage, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { authService } from '../../services/auth';

// Upload and Analysis Component - Production Ready
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
              timeout: 180000, // 3 minutes timeout (analysis can be slow)
            }
          );

          console.log('✅ Analysis completed:', response.data);
          
          // Success! Break out of retry loop
          lastError = null;
          
          // Notify parent component
          if (onAnalysisComplete) {
            onAnalysisComplete(response.data);
          }

          // Reset form
          setFile(null);
          setPreview(null);
          setDesignName('');
          
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            AI-Powered UX Design Critique
          </h2>
          <p className="text-gray-600">
            Upload your UI/UX design for comprehensive accessibility, readability, and attention analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Design File
            </label>
            
            {!preview ? (
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
                  Drag and drop your design file here, or
                </p>
                <label className="cursor-pointer text-gray-600 hover:text-gray-700 font-medium">
                  browse files
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: PNG, JPG, JPEG, WebP (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-contain bg-gray-100 rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={resetForm}
                  className="absolute top-2 right-2 bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Design Name Input */}
          <div>
            <label htmlFor="designName" className="block text-sm font-medium text-gray-700 mb-2">
              Design Name (Optional)
            </label>
            <input
              type="text"
              id="designName"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="e.g., Homepage Design V2"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <p className="text-gray-700 text-sm">{error}</p>
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
              ⏱️ Analysis typically takes 1-3 minutes on the first request while AI models load. Subsequent analyses are much faster!
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || isAnalyzing}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
              !file || isAnalyzing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing Design... (This may take 1-3 minutes)
              </>
            ) : (
              <>
                <FileImage className="h-5 w-5" />
                Analyze Design
              </>
            )}
          </button>

          {/* Retry Message */}
          {retryMessage && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
              <p className="text-blue-700 text-sm">{retryMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadAnalysis;
