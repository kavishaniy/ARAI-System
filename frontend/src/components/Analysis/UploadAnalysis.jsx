import React, { useState } from 'react';
import { Upload, FileImage, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const UploadAnalysis = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [designName, setDesignName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('design_name', designName || file.name);

      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(
        'http://localhost:8000/api/v1/analysis/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Analysis completed:', response.data);
      
      // Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }

    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err.response?.data?.detail || 
        'Failed to analyze design. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
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
                    ? 'border-blue-500 bg-blue-50' 
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
                <label className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
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
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
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
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Analysis Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              What We'll Analyze:
            </h3>
            <ul className="space-y-1 text-sm text-blue-800 ml-7">
              <li>• <strong>Accessibility:</strong> WCAG 2.1 compliance (contrast, text size, touch targets)</li>
              <li>• <strong>Readability:</strong> Text clarity, reading level, content density</li>
              <li>• <strong>Attention:</strong> Visual hierarchy, predicted user focus, cognitive load</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || isAnalyzing}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
              !file || isAnalyzing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing Design...
              </>
            ) : (
              <>
                <FileImage className="h-5 w-5" />
                Analyze Design
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadAnalysis;
