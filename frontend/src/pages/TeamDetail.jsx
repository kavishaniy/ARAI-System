import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Layers, Clock, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Common/Sidebar';
import PageHeader from '../components/Common/PageHeader';
import UploadAnalysisMultiple from '../components/Analysis/UploadAnalysisMultiple';
import FigmaProjectInput from '../components/Analysis/FigmaProjectInput';
import MultipleAnalysisResults from '../components/Analysis/MultipleAnalysisResults';
import { teamService } from '../services/sharing';
import { analysisService } from '../services/analysis';
import './TeamDetail.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('analysis');
  
  // Analysis states
  const [uploadResults, setUploadResults] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [figmaStep, setFigmaStep] = useState('input');
  const [figmaResults, setFigmaResults] = useState(null);
  const [figmaLoading, setFigmaLoading] = useState(false);
  const [figmaError, setFigmaError] = useState('');
  
  // History states
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await teamService.getTeam(teamId);
        setTeam(response);
      } catch (err) {
        console.error('Error loading team:', err);
        setError('Failed to load team details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamDetails();
  }, [teamId]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, teamId]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await analysisService.getHistory(1, 100);
      setHistory(response.analyses || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFigmaSubmit = async ({ frameUrls }) => {
    setFigmaError('');
    setFigmaLoading(true);
    try {
      const resp = await axios.post(
        `${API_BASE}/api/v1/figma/analyze-frames`,
        { frame_urls: frameUrls },
        { headers: { 'Content-Type': 'application/json' }, timeout: 300000 }
      );
      if (resp.data?.analyses?.length) {
        setFigmaResults(resp.data);
        setFigmaStep('results');
      } else {
        setFigmaError('No frames could be analyzed. Check that the Figma file is public.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Analysis failed.';
      setFigmaError(typeof errorMsg === 'string' ? errorMsg : 'Analysis failed.');
    } finally {
      setFigmaLoading(false);
    }
  };

  const resetFigma = () => {
    setFigmaResults(null);
    setFigmaError('');
    setFigmaStep('input');
  };

  // Handle upload analysis completion and accumulate results
  const handleUploadAnalysisComplete = (result) => {
    setUploadResults(prev => [...prev, result]);
    setShowUploadForm(false); // Hide form after upload
  };

  // Reset uploads to start over
  const resetUpload = () => {
    setUploadResults([]);
    setShowUploadForm(false);
  };

  // Transform upload results into multiple analyses format
  const getUploadResultsForMultiple = () => {
    if (!uploadResults || uploadResults.length === 0) return null;
    return {
      analyses: uploadResults
    };
  };

  if (loading) {
    return (
      <div className="team-detail-container" style={{ backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-state">
          <div className="spinner" /> Loading team details...
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="team-detail-container" style={{ backgroundColor: '#fff' }}>
        <button className="btn-back" onClick={() => navigate('/teams')} style={{ margin: '20px 0' }}>
          <ArrowLeft size={16} /> Back to Teams
        </button>
        <div className="alert-error" style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '6px' }}>
          ❌ {error || 'Team not found. Please go back and try again.'}
        </div>
      </div>
    );
  }

  const css = `
    /* ── Layout ─────────────────────────────────────── */
    .team-detail-shell {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
    }

    .team-detail-pg-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 240px;
      transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      width: calc(100% - 240px);
      max-width: calc(100% - 240px);
    }

    @media (max-width: 1024px) {
      .team-detail-pg-container { margin-left: 80px; width: calc(100% - 80px); max-width: calc(100% - 80px); }
    }
    @media (max-width: 768px) {
      .team-detail-pg-container { margin-left: 60px; }
    }
    @media (max-width: 480px) {
      .team-detail-pg-container { margin-left: 56px; }
    }

    .team-detail-pg-main {
      flex: 1;
      padding: 32px 60px;
      overflow-y: auto;
    }
    @media (max-width: 1024px) { .team-detail-pg-main { padding: 24px 40px; } }
    @media (max-width: 768px)  { .team-detail-pg-main { padding: 20px 24px; } }
    @media (max-width: 480px)  { .team-detail-pg-main { padding: 16px 16px; } }

    .team-detail-pg-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    /* ── Tab bar ─────────────────────────────────────── */
    .tpg-tab-bar {
      display: flex;
      gap: 4px;
      margin-bottom: 28px;
      background: white;
      border: 1.5px solid rgba(15,37,87,0.1);
      border-radius: 12px;
      padding: 5px;
    }

    .tpg-tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      color: rgba(15,37,87,0.55);
      background: transparent;
      white-space: nowrap;
    }

    .tpg-tab-btn:hover {
      color: #0f2557;
      background: rgba(15,37,87,0.04);
    }

    .tpg-tab-btn.active {
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="team-detail-shell">
        <Sidebar active="teams" />

        <div className="team-detail-pg-container">
          <PageHeader
            title={team?.name || 'Team'}
            subtitle={team?.description || 'Team details and analysis'}
          />

          <div className="team-detail-pg-main">
            <div className="team-detail-pg-wrapper">
              {/* Tab Bar */}
              <div className="tpg-tab-bar">
                <button
                  className={`tpg-tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analysis')}
                >
                  <Upload size={15} />
                  <span>Upload Analysis</span>
                </button>
                <button
                  className={`tpg-tab-btn ${activeTab === 'figma' ? 'active' : ''}`}
                  onClick={() => setActiveTab('figma')}
                >
                  <Layers size={15} />
                  <span>Figma Analysis</span>
                </button>
                <button
                  className={`tpg-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <Clock size={15} />
                  <span>History</span>
                </button>
              </div>

        {/* Upload Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="analysis-section" style={{ display: 'block', width: '100%' }}>
            {uploadResults.length > 0 && !showUploadForm ? (
              <>
                <MultipleAnalysisResults results={getUploadResultsForMultiple()} onNewAnalysis={resetUpload} />
                {/* Add more designs button */}
                <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f5f4f0', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ marginBottom: '16px', color: '#666', fontSize: '0.95rem' }}>Want to analyze more designs?</p>
                  <button
                    onClick={() => setShowUploadForm(true)} // Show upload form while keeping results
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                  >
                    <Upload size={14} /> Add Another Design
                  </button>
                </div>
              </>
            ) : null}

            {showUploadForm && uploadResults.length > 0 ? (
              <>
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setShowUploadForm(false)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f5f4f0',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e8e8e8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f4f0'}
                  >
                    <ArrowLeft size={14} /> Back to Results
                  </button>
                </div>
                <UploadAnalysisMultiple onAnalysisComplete={handleUploadAnalysisComplete} />
              </>
            ) : null}

            {!showUploadForm && uploadResults.length === 0 ? (
              <UploadAnalysisMultiple onAnalysisComplete={handleUploadAnalysisComplete} />
            ) : null}
          </div>
        )}

        {/* Figma Analysis Tab */}
        {activeTab === 'figma' && (
          <div className="analysis-section" style={{ display: 'block', width: '100%' }}>
            {figmaStep === 'results' && figmaResults ? (
              <MultipleAnalysisResults results={figmaResults} onNewAnalysis={resetFigma} />
            ) : (
              <>
                {figmaError && (
                  <div className="alert-error" style={{ marginBottom: 18 }}>
                    {figmaError}
                  </div>
                )}
                {figmaLoading ? (
                  <div className="loading-state">
                    <div className="spinner" /> Analyzing frames…
                  </div>
                ) : (
                  <FigmaProjectInput onProjectSubmit={handleFigmaSubmit} />
                )}
              </>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-section" style={{ display: 'block', width: '100%' }}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '8px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            {historyLoading ? (
              <div className="loading-state">
                <div className="spinner" /> Loading history...
              </div>
            ) : history.length === 0 ? (
              <p style={{ color: '#666', padding: '20px 0' }}>
                No analyses yet. Upload a design or Figma file to get started.
              </p>
            ) : (
              <div className="history-list">
                {history
                  .filter(item => 
                    !searchQuery || 
                    (item.design_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.filename || '').toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item, idx) => (
                    <div key={idx} className="history-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0' }}>
                            {item.design_name || item.filename || 'Untitled'}
                          </h4>
                          <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                            {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {item.overall_score !== undefined && (
                          <span style={{
                            backgroundColor: '#f0f0f0',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            Score: {item.overall_score}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamDetail;
