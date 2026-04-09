import React, { useState, useEffect } from 'react';
import UploadAnalysis from '../Analysis/UploadAnalysis';
import AnalysisResults from '../Analysis/AnalysisResults';
import HistorySection from './HistorySection';
import Sidebar from '../Common/Sidebar';
import { Loader2, AlertCircle } from 'lucide-react';

const LoadingScreen = ({ error, onRetry }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-md w-full mx-auto px-6 text-center space-y-6">
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analysis Error</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = seconds < 10 
    ? 'Starting analysis... Loading AI models'
    : seconds < 20
    ? 'Analyzing accessibility features... Please wait'
    : seconds < 30
    ? 'Checking readability metrics... Almost done'
    : 'Computing visual attention patterns... Final step';

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-md w-full mx-auto px-6 text-center space-y-6">
        {/* Animated Loader */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <Loader2 className="w-24 h-24 text-gray-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">{Math.ceil(seconds / 10) * 10}%</span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-800">Analyzing Your Design</h2>
          <p className="text-gray-600 text-lg">{status}</p>
          <div className="flex items-center justify-center gap-1 mt-4">
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>

        {/* Time Elapsed */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Elapsed Time</div>
          <div className="text-4xl font-bold text-gray-800">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {seconds < 20 
              ? 'Usually completes in 1-3 minutes' 
              : seconds < 60 
              ? 'Still processing... (longer on first request)'
              : 'Taking longer than expected. This happens when AI models are loading.'}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> First analysis takes longer (1-3 min) while AI models load. Future analyses will be faster!
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const handleAnalysisComplete = (analysisData) => {
    setIsAnalyzing(false);
    setAnalysisError(null);
    setCurrentAnalysis(analysisData);
    setRefreshHistory(prev => prev + 1);
    setActiveTab('results');
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
  };

  const handleAnalysisError = (error) => {
    setIsAnalyzing(false);
    setAnalysisError(error);
  };

  const handleRetry = () => {
    setAnalysisError(null);
    setCurrentAnalysis(null);
    setActiveTab('upload');
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setActiveTab('upload');
    setIsAnalyzing(false);
    setAnalysisError(null);
  };

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        const v = localStorage.getItem('sidebar_collapsed');
        setCollapsed(v === 'true');
      } catch (e) {
        setCollapsed(false);
      }
    };

    read();
    const onStorage = (e) => { if (e.key === 'sidebar_collapsed') read(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar active={activeTab} onNavigate={(id) => setActiveTab(id)} />

      <main className="content-area" style={{ marginLeft: collapsed ? 72 : 200 }}>
        <div className="container">
          {isAnalyzing ? (
            <LoadingScreen error={analysisError} onRetry={handleRetry} />
          ) : (
            <>
              <div className="hero" style={{ marginBottom: 20 }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Dashboard</h1>
                  <div className="muted">Upload designs and view analysis</div>
                </div>

                <div>
                  {activeTab === 'results' && (
                    <button onClick={handleNewAnalysis} className="btn-primary">New Analysis</button>
                  )}
                </div>
              </div>

              <div className="glass-card">
                {activeTab === 'upload' && (
                  <UploadAnalysis onAnalysisStart={handleAnalysisStart} onAnalysisComplete={handleAnalysisComplete} onAnalysisError={handleAnalysisError} />
                )}
                {activeTab === 'results' && currentAnalysis && (
                  <AnalysisResults results={currentAnalysis} />
                )}
                {activeTab === 'history' && (
                  <HistorySection key={refreshHistory} onSelectAnalysis={setCurrentAnalysis} />
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
