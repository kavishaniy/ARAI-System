import React, { useState, useEffect } from 'react';
import UploadAnalysis from '../Analysis/UploadAnalysis';
import SimplifiedAnalysisResults from '../Analysis/SimplifiedAnalysisResults';
import HistorySection from './HistorySection';
import Sidebar from '../Common/Sidebar';

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
}

.dashboard-header {
  padding: 48px 40px 24px;
  border-bottom: 1px solid rgba(15,37,87,0.08);
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(8px);
}

.dashboard-header-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-title-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.dashboard-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dashboard-title h1 {
  margin: 0;
  font-family: 'DM Serif Display', serif;
  font-size: 2.2rem;
  font-weight: 400;
  color: #0f2557;
  line-height: 1.2;
}

.dashboard-subtitle {
  font-size: 0.95rem;
  color: rgba(15,37,87,0.6);
  font-weight: 300;
  letter-spacing: 0.3px;
}

.dashboard-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.btn-new-analysis:hover {
  background: linear-gradient(135deg, #091840, #051026);
  box-shadow: 0 8px 24px rgba(15,37,87,0.15);
  transform: translateY(-2px);
}

.dashboard-main {
  flex: 1;
  padding: 32px 40px;
  overflow-y: auto;
}

.dashboard-card {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border: 1.5px solid rgba(15,37,87,0.12);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(15,37,87,0.06);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  border-color: rgba(15,37,87,0.2);
  box-shadow: 0 15px 50px rgba(15,37,87,0.1);
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 24px 16px 16px;
  }

  .dashboard-main {
    padding: 20px 16px;
  }

  .dashboard-card {
    padding: 20px;
  }

  .dashboard-title h1 {
    font-size: 1.6rem;
  }

  .dashboard-title-section {
    flex-direction: column;
    gap: 16px;
  }

  .dashboard-actions {
    width: 100%;
  }

  .btn-new-analysis {
    width: 100%;
    text-align: center;
  }
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
    setActiveTab('results'); // Keep on results tab for new dashboard
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
          <div className="dashboard-header">
            <div className="dashboard-header-content">
              <div className="dashboard-title-section">
                <div className="dashboard-title">
                  {activeTab === 'results' && currentAnalysis ? (
                    <>
                      <h1>Design Analysis Results</h1>
                      <p className="dashboard-subtitle">Your ARAI Score (Accessibility, Readability, Attention Index)</p>
                    </>
                  ) : (
                    <>
                      <h1>Dashboard</h1>
                      <p className="dashboard-subtitle">Upload designs and view analysis</p>
                    </>
                  )}
                </div>

                <div className="dashboard-actions">
                  {activeTab === 'results' && currentAnalysis && (
                    <button onClick={handleNewAnalysis} className="btn-new-analysis">
                      + New Analysis
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <main className="dashboard-main">
            <div className="dashboard-card">
              {activeTab === 'upload' && (
                <UploadAnalysis onAnalysisComplete={handleAnalysisComplete} />
              )}
              {activeTab === 'results' && (
                <>
                  {currentAnalysis ? (
                    <SimplifiedAnalysisResults key={analysisKey} results={currentAnalysis} />
                  ) : (
                    <UploadAnalysis onAnalysisComplete={handleAnalysisComplete} />
                  )}
                </>
              )}
              {activeTab === 'history' && (
                <HistorySection key={refreshHistory} onSelectAnalysis={setCurrentAnalysis} />
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
