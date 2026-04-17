import React, { useState, useEffect } from 'react';
import { FilePlus } from 'lucide-react';
import UploadAnalysisMultiple from '../Analysis/UploadAnalysisMultiple';
import SimplifiedAnalysisResults from '../Analysis/SimplifiedAnalysisResults';
import MultipleAnalysisResults from '../Analysis/MultipleAnalysisResults';
import HistorySection from './HistorySection';
import Sidebar from '../Common/Sidebar';
import PageHeader from '../Common/PageHeader';

const css = `
.dashboard-shell {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 240px;
  transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  width: calc(100% - 240px);
  max-width: calc(100% - 240px);
  padding: 0;
}

@media (max-width: 1024px) {
  .dashboard-content {
    margin-left: 80px;
    width: calc(100% - 80px);
    max-width: calc(100% - 80px);
  }
}

.btn-new-analysis {
  padding: 12px 24px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white;
  border: 1.5px solid #0f2557;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .dashboard-content {
    margin-left: 60px;
  }

  .btn-new-analysis {
    padding: 10px 18px;
    font-size: 0.85rem;
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .dashboard-content {
    margin-left: 56px;
  }

  .btn-new-analysis {
    width: 100%;
    justify-content: center;
    padding: 11px 16px;
    font-size: 0.8rem;
  }
}

.btn-new-analysis-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .btn-new-analysis-icon {
    width: 16px;
    height: 16px;
  }
}

.btn-new-analysis:hover {
  background: linear-gradient(135deg, #091840, #051026);
  box-shadow: 0 8px 24px rgba(15,37,87,0.15);
  transform: translateY(-2px);
}

.dashboard-main {
  flex: 1;
  padding: 32px 60px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .dashboard-main {
    padding: 24px 30px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 20px 16px;
  }
}

@media (max-width: 480px) {
  .dashboard-main {
    padding: 16px 12px;
  }
}

.dashboard-card {
  max-width: 1000px;
  width: 100%;
  flex-shrink: 0;
  background: white;
  border: 1.5px solid rgba(15,37,87,0.12);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(15,37,87,0.06);
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .dashboard-card {
    padding: 20px;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .dashboard-card {
    padding: 16px;
    border-radius: 10px;
  }
}

.dashboard-card:hover {
  border-color: rgba(15,37,87,0.2);
  box-shadow: 0 15px 50px rgba(15,37,87,0.1);
}
`;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisKey, setAnalysisKey] = useState(0); // Key to force re-render of AnalysisResults

  const handleAnalysisComplete = (analysisData) => {
    setCurrentAnalysis(analysisData);
    setAnalysisKey(prev => prev + 1); // Force re-render with new key
    setRefreshHistory(prev => prev + 1);
    // Use setTimeout to ensure state updates are batched before switching tab
    setTimeout(() => {
      setActiveTab('results');
    }, 0);
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setAnalysisKey(prev => prev + 1); // Reset the key when starting new analysis
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
    <>
      <style>{css}</style>
      <div className="dashboard-shell">
        <Sidebar active={activeTab} onNavigate={(id) => setActiveTab(id)} />

        <div className="dashboard-content" style={{ marginLeft: collapsed ? 72 : 260 }}>
          {activeTab === 'upload' && (
            <PageHeader 
              title="Upload & Analyze"
              subtitle="Upload your design files to get detailed insights and recommendations"
            />
          )}
          {activeTab === 'results' && (
            <PageHeader 
              title="Analysis Results"
              subtitle="View detailed insights and recommendations for your design"
              actions={
                <button onClick={handleNewAnalysis} className="btn-new-analysis">
                  <FilePlus className="btn-new-analysis-icon" />
                  New Analysis
                </button>
              }
            />
          )}

          <main className="dashboard-main">
            <div className="dashboard-card">
              {activeTab === 'upload' && (
                <UploadAnalysisMultiple onAnalysisComplete={handleAnalysisComplete} />
              )}
              {activeTab === 'results' && currentAnalysis && (
                currentAnalysis.analyses ? (
                  <MultipleAnalysisResults 
                    key={analysisKey} 
                    results={currentAnalysis} 
                    onNewAnalysis={handleNewAnalysis}
                  />
                ) : (
                  <SimplifiedAnalysisResults 
                    key={analysisKey} 
                    results={currentAnalysis} 
                  />
                )
              )}
              {activeTab === 'history' && (
                <HistorySection refreshTrigger={refreshHistory} />
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
