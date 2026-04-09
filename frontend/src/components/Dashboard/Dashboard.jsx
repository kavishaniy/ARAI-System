import React, { useState, useEffect } from 'react';
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
      </main>
    </div>
  );
};

export default Dashboard;
