import React, { useState } from 'react';
import UploadAnalysis from '../Analysis/UploadAnalysis';
import AnalysisResults from '../Analysis/AnalysisResults';
import HistorySection from './HistorySection';
import Sidebar from '../Common/Sidebar';

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
      <div className="flex">
        <Sidebar active={activeTab} onNavigate={(id) => setActiveTab(id)} />

        <main className="flex-1 flex items-start justify-center py-10">
          <div className="w-full max-w-5xl px-6">
            <div className="bg-white rounded-xl shadow p-10">
              <div className="flex items-center justify-between mb-6">
                <div />
                {activeTab === 'results' && (
                  <button onClick={handleNewAnalysis} className="text-sm px-3 py-1 border rounded text-gray-700 hover:bg-gray-50">New Analysis</button>
                )}
              </div>

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
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
