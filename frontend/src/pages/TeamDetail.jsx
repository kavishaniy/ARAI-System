import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Layers, Clock, Users } from 'lucide-react';
import axios from 'axios';
import UploadAnalysis from '../components/Analysis/UploadAnalysis';
import FigmaProjectInput from '../components/Analysis/FigmaProjectInput';
import SimplifiedAnalysisResults from '../components/Analysis/SimplifiedAnalysisResults';
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
  const [uploadResult, setUploadResult] = useState(null);
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

  const resetUpload = () => setUploadResult(null);

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

  return (
    <div className="team-detail-container" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <div className="team-detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn-back" 
            onClick={() => navigate('/teams')}
            style={{ margin: 0 }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="team-detail-title">{team.name}</h1>
            <div className="team-detail-info">
              <Users size={14} /> {team.members?.length || 0} members
            </div>
          </div>
        </div>
      </div>

      {team.description && (
        <p className="team-detail-description">{team.description}</p>
      )}

      {/* Tabs */}
      <div className="team-detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          <Upload size={16} /> Upload Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === 'figma' ? 'active' : ''}`}
          onClick={() => setActiveTab('figma')}
        >
          <Layers size={16} /> Figma Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={16} /> History
        </button>
      </div>

      {/* Content */}
      <div className="team-detail-content">
        {/* Upload Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="analysis-section">
            {uploadResult ? (
              <div>
                <button className="btn-back" onClick={resetUpload}>
                  <ArrowLeft size={14} /> New Analysis
                </button>
                <SimplifiedAnalysisResults results={uploadResult} />
              </div>
            ) : (
              <UploadAnalysis onAnalysisComplete={setUploadResult} />
            )}
          </div>
        )}

        {/* Figma Analysis Tab */}
        {activeTab === 'figma' && (
          <div className="analysis-section">
            {figmaStep === 'results' && figmaResults ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <button className="btn-back" style={{ margin: 0 }} onClick={resetFigma}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button className="btn-primary" onClick={resetFigma}>
                    <Upload size={14} /> New Analysis
                  </button>
                </div>
                <div className="figma-results">
                  {figmaResults.analyses && figmaResults.analyses.length > 0 ? (
                    <div className="results-grid">
                      {figmaResults.analyses.map((analysis, idx) => (
                        <div key={idx} className="result-card">
                          <h3>{analysis.frame_name || `Frame ${idx + 1}`}</h3>
                          <div className="result-details">
                            {analysis.summary && <p>{analysis.summary}</p>}
                            {analysis.metrics && (
                              <div className="metrics">
                                <p>🎯 Score: {analysis.metrics.overall_score || 'N/A'}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No analysis results available</p>
                  )}
                </div>
              </div>
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
          <div className="history-section">
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
  );
};

export default TeamDetail;
