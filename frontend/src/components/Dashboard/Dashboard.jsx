import React, { useState } from 'react';
import UploadAnalysis from '../Analysis/UploadAnalysis';
import AnalysisResults from '../Analysis/AnalysisResults';
import HistorySection from './HistorySection';
import { FileText, History, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  const handleAnalysisComplete = (analysisData) => {
    setCurrentAnalysis(analysisData);
    setRefreshHistory(prev => prev + 1);
    setActiveTab('results');
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                AI-Powered UX Design Critique
              </h1>
              <p className="text-gray-600 mt-2">
                Analyze your designs for accessibility, readability, and visual attention
              </p>
            </div>
            {activeTab === 'results' && (
              <button
                onClick={handleNewAnalysis}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                New Analysis
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`${
                  activeTab === 'upload'
                    ? 'border-gray-500 text-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <FileText className="h-4 w-4" />
                Upload Design
              </button>
              {currentAnalysis && (
                <button
                  onClick={() => setActiveTab('results')}
                  className={`${
                    activeTab === 'results'
                      ? 'border-gray-500 text-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Current Results
                </button>
              )}
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-gray-500 text-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <History className="h-4 w-4" />
                Analysis History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'upload' && (
              <UploadAnalysis onAnalysisComplete={handleAnalysisComplete} />
            )}
            {activeTab === 'results' && currentAnalysis && (
              <AnalysisResults results={currentAnalysis} />
            )}
            {activeTab === 'history' && (
              <HistorySection key={refreshHistory} onSelectAnalysis={setCurrentAnalysis} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
