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
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="flex">
        <Sidebar active={activeTab} onNavigate={(id) => setActiveTab(id)} />

        <main className="flex-1 lg:ml-[240px] py-10" style={{ minHeight: '100vh' }}>
          <div className="container">
            <div className="card solid-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</h1>
                  <div className="muted text-sm">Upload designs and view analysis</div>
                </div>

                <div>
                  {activeTab === 'results' && (
                    <button onClick={handleNewAnalysis} className="btn-secondary">New Analysis</button>
                  )}
                </div>
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
