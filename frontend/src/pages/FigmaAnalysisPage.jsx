import React, { useState } from 'react';
import Sidebar from '../components/Common/Sidebar';
import PageHeader from '../components/Common/PageHeader';
import FigmaAnalyzer from '../components/FigmaAnalyzer';
import MultipleAnalysisResults from '../components/Analysis/MultipleAnalysisResults';

const FigmaAnalysisPage = () => {
  const [analysisResults, setAnalysisResults] = useState(null);

  const css = `
.page-shell {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
}

.page-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 80px;
  transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-main {
  flex: 1;
  padding: 32px 40px;
  overflow-y: auto;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page-card {
  background: white;
  border: 1.5px solid rgba(15,37,87,0.12);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(15,37,87,0.06);
  transition: all 0.3s ease;
}

.page-card:hover {
  border-color: rgba(15,37,87,0.2);
  box-shadow: 0 15px 50px rgba(15,37,87,0.1);
}

@media (max-width: 768px) {
  .page-container {
    margin-left: 60px;
  }

  .page-main {
    padding: 20px 16px;
  }

  .page-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .page-container {
    margin-left: 56px;
  }

  .page-main {
    padding: 16px 12px;
  }

  .page-card {
    padding: 16px;
  }
}
`;

  return (
    <>
      <style>{css}</style>
      <div className="page-shell">
        <Sidebar />
        <div className="page-container">
          <PageHeader 
            title="Figma Analysis"
            subtitle="Connect and analyze your Figma designs directly"
          />
          <main className="page-main">
            <div className="page-content">
              <div className="page-card">
                {analysisResults ? (
                  <MultipleAnalysisResults
                    results={analysisResults}
                    onNewAnalysis={() => setAnalysisResults(null)}
                  />
                ) : (
                  <FigmaAnalyzer onAnalysisComplete={setAnalysisResults} />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default FigmaAnalysisPage;
