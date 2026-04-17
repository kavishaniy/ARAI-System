import React, { useState } from 'react';
import { ArrowLeft, FilePlus } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Common/Sidebar';
import PageHeader from '../components/Common/PageHeader';
import FigmaProjectInput from '../components/Analysis/FigmaProjectInput';
import MultipleAnalysisResults from '../components/Analysis/MultipleAnalysisResults';

const css = `
.figma-page-shell {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
}
.figma-page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 240px;
  width: calc(100% - 240px);
  max-width: calc(100% - 240px);
}
@media (max-width: 1024px) {
  .figma-page-content {
    margin-left: 80px;
    width: calc(100% - 80px);
    max-width: calc(100% - 80px);
  }
}
.figma-page-main { flex: 1; overflow-y: auto; }
.figma-inner { padding: 2rem; }

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid rgba(15,37,87,0.2);
  border-radius: 10px;
  color: #0f2557;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
}
.back-button:hover {
  background: rgba(15,37,87,0.05);
  border-color: rgba(15,37,87,0.3);
}
.btn-new-analysis {
  padding: 11px 22px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white; border: none; border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; gap: 7px;
}
.btn-new-analysis:hover {
  box-shadow: 0 6px 20px rgba(15,37,87,0.2);
  transform: translateY(-1px);
}
.figma-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 4rem 2rem; gap: 1.2rem;
}
.figma-loading-spinner {
  width: 48px; height: 48px;
  border: 3px solid rgba(15,37,87,0.12);
  border-top-color: #0f2557;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.figma-loading p { color: rgba(15,37,87,0.6); font-size: 0.95rem; margin: 0; }
.figma-error {
  background: #fee2e2; border: 1.5px solid #fecaca;
  border-radius: 12px; padding: 1.2rem 1.5rem; color: #991b1b;
  font-size: 0.9rem; margin-bottom: 1.5rem;
}
`;

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const FigmaAnalysis = () => {
  const [step, setStep]                   = useState('input');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [loadingMsg, setLoadingMsg]       = useState('');
  const [error, setError]                 = useState('');

  const handleProjectSubmit = async ({ frameUrls }) => {
    setError('');
    setIsLoading(true);
    setLoadingMsg(`Analyzing ${frameUrls.length} frame${frameUrls.length !== 1 ? 's' : ''}…`);

    try {
      const resp = await axios.post(
        `${API_BASE}/api/v1/figma/analyze-frames`,
        { frame_urls: frameUrls },
        { headers: { 'Content-Type': 'application/json' }, timeout: 300000 }
      );

      if (resp.data?.analyses?.length) {
        setAnalysisResults(resp.data);
        setStep('results');
      } else {
        setError('No frames could be analyzed. Check that the Figma file is public.');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Analysis failed.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoadingMsg('');
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResults(null);
    setError('');
    setStep('input');
  };

  const pageTitle    = step === 'input' ? 'Figma Analysis' : 'Analysis Results';
  const pageSubtitle = step === 'input'
    ? 'Analyze each Figma frame individually for accessibility, readability and visual attention'
    : analysisResults
      ? `${analysisResults.analyses?.length ?? 0} frame${analysisResults.analyses?.length !== 1 ? 's' : ''} analyzed`
      : '';

  return (
    <>
      <style>{css}</style>
      <div className="figma-page-shell">
        <Sidebar active="figma" onNavigate={() => {}} />

        <div className="figma-page-content">
          <PageHeader
            currentPage="Figma Analysis"
            title={pageTitle}
            subtitle={pageSubtitle}
            actions={
              step === 'results' ? (
                <button onClick={handleNewAnalysis} className="btn-new-analysis">
                  <FilePlus size={16} />
                  New Analysis
                </button>
              ) : null
            }
          />

          <div className="figma-page-main">
            <div className="figma-inner">

              {step === 'results' && (
                <button className="back-button" onClick={handleNewAnalysis}>
                  <ArrowLeft size={16} /> Back
                </button>
              )}

              {error && <div className="figma-error">{error}</div>}

              {isLoading ? (
                <div className="figma-loading">
                  <div className="figma-loading-spinner" />
                  <p>{loadingMsg}</p>
                </div>
              ) : step === 'input' ? (
                <FigmaProjectInput onProjectSubmit={handleProjectSubmit} />
              ) : step === 'results' && analysisResults ? (
                <MultipleAnalysisResults
                  results={analysisResults}
                  onNewAnalysis={handleNewAnalysis}
                />
              ) : null}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FigmaAnalysis;
