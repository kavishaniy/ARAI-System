import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Figma, Clock, ArrowLeft, Trash2, Calendar, Search, X, Eye, Zap } from 'lucide-react';
import Sidebar from '../components/Common/Sidebar';
import PageHeader from '../components/Common/PageHeader';
import UploadAnalysisMultiple from '../components/Analysis/UploadAnalysisMultiple';
import FigmaProjectInput from '../components/Analysis/FigmaProjectInput';
import MultipleAnalysisResults from '../components/Analysis/MultipleAnalysisResults';
import SimplifiedAnalysisResults from '../components/Analysis/SimplifiedAnalysisResults';
import { teamService } from '../services/sharing';
import { analysisService } from '../services/analysis';
import { figmaService } from '../services/figma';
import './TeamDetail.css';

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('analysis');
  
  // Upload Analysis states (like Dashboard)
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisKey, setAnalysisKey] = useState(0);
  
  // Figma Analysis states
  const [figmaStep, setFigmaStep] = useState('input');
  const [figmaResults, setFigmaResults] = useState(null);
  const [figmaLoading, setFigmaLoading] = useState(false);
  const [figmaError, setFigmaError] = useState('');
  
  // History states
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

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

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const response = await analysisService.getTeamHistory(teamId, 1, 100);
      const mappedAnalyses = (response.analyses || []).map(item => ({
        ...item,
        analysis_id: item.id || item.analysis_id
      }));
      console.log('📋 Fetched team history:', mappedAnalyses);
      setHistory(mappedAnalyses);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistory([]);
      setHistoryError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to load team analysis history.'
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  const handleFigmaSubmit = async ({ frameUrls }) => {
    setFigmaError('');
    setFigmaLoading(true);
    try {
      const resp = await figmaService.analyzeFrames(frameUrls);
      if (resp?.analyses?.length) {
        setFigmaResults(resp);
        setFigmaStep('results');
      } else {
        setFigmaError('No frames could be analyzed. Check that the Figma file is public.');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        (err.code === 'ERR_NETWORK'
          ? 'Unable to reach the analysis server. Check that the backend is running and the frontend API URL is configured correctly.'
          : err.message) ||
        'Analysis failed.';
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

  // Handle upload analysis completion (Dashboard-style)
  const handleAnalysisComplete = (analysisData) => {
    setCurrentAnalysis(analysisData);
    setAnalysisKey(prev => prev + 1);

    const savedAnalyses = (analysisData?.analyses || [])
      .filter((analysis) => analysis?.saved_to_history !== false)
      .map((analysis) => ({
        ...analysis,
        analysis_id: analysis.analysis_id || analysis.id,
        id: analysis.id || analysis.analysis_id,
        design_name: analysis.design_name || analysis.filename || 'Untitled',
        created_at: analysis.timestamp || analysis.created_at || new Date().toISOString(),
      }))
      .filter((analysis) => analysis.analysis_id);

    if (savedAnalyses.length > 0) {
      setHistory((prev) => {
        const seen = new Set(savedAnalyses.map((analysis) => analysis.analysis_id));
        const remaining = prev.filter((analysis) => !seen.has(analysis.analysis_id));
        return [...savedAnalyses, ...remaining];
      });
    }

    setTimeout(() => {
      fetchHistory();
    }, 750);
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setAnalysisKey(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    try {
      console.log('📅 Formatting date:', dateString, 'Type:', typeof dateString);
      
      if (!dateString) return 'Unknown date';
      
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date:', dateString);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('❌ Date formatting error:', e, 'dateString:', dateString);
      return 'Invalid date';
    }
  };

  const handleView = async (analysis) => {
    console.log('Viewing analysis:', analysis);
    setSelectedAnalysis({ ...analysis, results: null });
    setViewLoading(true);
    try {
      const fullData = await analysisService.getAnalysis(analysis.analysis_id);
      console.log('Fetched analysis data:', fullData);
      setSelectedAnalysis({ ...analysis, results: fullData });
      setViewLoading(false);
    } catch (err) {
      console.error('Failed to fetch analysis details:', err);
      setViewLoading(false);
    }
  };

  const handleDelete = async (analysisId) => {
    console.log('🗑️ handleDelete called with analysisId:', analysisId);
    console.log('Current history state before delete:', history);
    
    const confirmed = window.confirm('Are you sure you want to delete this analysis?');
    console.log('🗑️ User confirmed deletion:', confirmed);
    
    if (!confirmed) {
      console.log('🗑️ User cancelled deletion');
      return;
    }
    
    try {
      setDeleting(analysisId);
      console.log('🗑️ setDeleting to:', analysisId);
      console.log('🗑️ Calling analysisService.deleteAnalysis...');
      
      const result = await analysisService.deleteAnalysis(analysisId);
      console.log('🗑️ Delete API response:', result);
      console.log('🗑️ Delete was successful, now updating UI...');
      
      // Update the history list by removing the deleted item
      setHistory(prev => {
        console.log('🗑️ Previous history length:', prev.length);
        const updated = prev.filter(h => h.analysis_id !== analysisId);
        console.log('🗑️ Updated history length:', updated.length);
        console.log('🗑️ Items removed:', prev.length - updated.length);
        console.log('🗑️ Updated history:', updated);
        return updated;
      });
      
      // Clear selected analysis if it was deleted
      if (selectedAnalysis?.analysis_id === analysisId) {
        console.log('🗑️ Clearing selectedAnalysis because it was deleted');
        setSelectedAnalysis(null);
      }
      
      console.log('✅ Analysis deleted successfully');
      alert('Analysis deleted successfully!');
    } catch (err) {
      console.error('❌ Failed to delete analysis:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      alert(`Failed to delete analysis: ${err.response?.data?.detail || err.message}`);
    } finally {
      console.log('🗑️ Resetting deleting state');
      setDeleting(null);
    }
  };

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

    /* ── History Section Styling ─────────────────────── */
    .history-search-input {
      width: 100%;
      padding: 11px 16px 11px 40px;
      border: 1.5px solid rgba(15, 37, 87, 0.15);
      border-radius: 10px;
      font-size: 0.95rem;
      color: #0f2557;
      background: white;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    @media (max-width: 480px) {
      .history-search-input {
        font-size: 0.85rem;
        padding: 10px 14px 10px 36px;
      }
    }

    .history-search-input::placeholder {
      color: rgba(15, 37, 87, 0.4);
    }

    .history-search-input:focus {
      outline: none;
      border-color: #64b4ff;
      box-shadow: 0 0 0 3px rgba(100, 180, 255, 0.1);
      background: white;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(15, 37, 87, 0.4);
      pointer-events: none;
    }

    @media (max-width: 480px) {
      .search-icon {
        left: 10px;
        width: 16px;
        height: 16px;
      }
    }

    .search-clear-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(15, 37, 87, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: all 0.2s ease;
    }

    .search-clear-btn:hover {
      color: rgba(15, 37, 87, 0.7);
    }

    .history-search-results {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      white-space: nowrap;
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }

    @media (max-width: 480px) {
      .history-search-results {
        font-size: 0.75rem;
      }
    }

    .history-main {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
      padding: 0;
      box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
      overflow: hidden;
    }

    .history-empty {
      padding: 60px 40px;
      text-align: center;
    }

    @media (max-width: 768px) {
      .history-empty {
        padding: 40px 24px;
      }
    }

    @media (max-width: 480px) {
      .history-empty {
        padding: 30px 16px;
      }
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: rgba(15, 37, 87, 0.08);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
    }

    @media (max-width: 480px) {
      .empty-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto 16px;
      }
    }

    .empty-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #0f2557;
      margin: 0 0 8px 0;
    }

    @media (max-width: 480px) {
      .empty-title {
        font-size: 1.1rem;
      }
    }

    .empty-text {
      color: rgba(15, 37, 87, 0.6);
      margin: 0 0 24px 0;
      font-size: 0.95rem;
    }

    @media (max-width: 480px) {
      .empty-text {
        font-size: 0.85rem;
        margin: 0 0 18px 0;
      }
    }

    .history-list {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .history-item {
      padding: 24px 40px;
      border-bottom: 1px solid rgba(15, 37, 87, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      transition: all 0.2s ease;
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-item:hover {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.03) 100%);
    }

    .history-item-content {
      flex: 1;
      min-width: 0;
    }

    .history-item-name {
      margin: 0 0 8px 0;
      font-weight: 600;
      color: #0f2557;
      font-size: 1rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .history-item-meta {
      display: flex;
      gap: 16px;
      align-items: center;
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      flex-wrap: wrap;
    }

    .history-item-date {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .history-item-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .action-button {
      padding: 10px 14px;
      border: 1.5px solid rgba(15, 37, 87, 0.2);
      background: white;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #0f2557;
      transition: all 0.2s ease;
      font-weight: 500;
      font-family: inherit;
    }

    .action-button:hover:not(:disabled) {
      border-color: rgba(15, 37, 87, 0.4);
      background: rgba(15, 37, 87, 0.02);
    }

    .action-button.delete {
      border-color: rgba(239, 68, 68, 0.3);
      color: #991b1b;
    }

    .action-button.delete:hover:not(:disabled) {
      border-color: rgba(239, 68, 68, 0.6);
      background: rgba(239, 68, 68, 0.05);
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .history-loading {
      padding: 60px 40px;
      text-align: center;
      color: rgba(15, 37, 87, 0.6);
    }

    .loading-spinner {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 3px solid rgba(15, 37, 87, 0.1);
      border-top-color: #0f2557;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 12px;
      vertical-align: middle;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .history-item {
        padding: 16px;
        flex-direction: column;
        align-items: flex-start;
      }

      .history-item-actions {
        width: 100%;
        justify-content: flex-start;
      }

      .action-button {
        flex: 1;
        justify-content: center;
      }
    }
  `;

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

  if (selectedAnalysis) {
    console.log('Rendering analysis detail view, selectedAnalysis:', selectedAnalysis);
    console.log('viewLoading:', viewLoading);
    console.log('selectedAnalysis.results:', selectedAnalysis.results);
    return (
      <div className="team-detail-shell">
        <style>{css}</style>
        <Sidebar active="teams" />
        <div className="team-detail-pg-container">
          <PageHeader
            title={team?.name || 'Team'}
            subtitle={`Analysis: ${selectedAnalysis.design_name || selectedAnalysis.filename || 'Untitled'}`}
          />
          <div className="team-detail-pg-main">
            <div className="team-detail-pg-wrapper">
              <button
                className="action-button"
                onClick={() => setSelectedAnalysis(null)}
                style={{ marginBottom: '24px' }}
              >
                ← Back to History
              </button>
              {viewLoading ? (
                <div className="history-loading">
                  <span className="loading-spinner"></span>
                  Loading analysis results...
                </div>
              ) : selectedAnalysis.results ? (
                <SimplifiedAnalysisResults 
                  key={selectedAnalysis.analysis_id}
                  results={selectedAnalysis.results} 
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <Figma size={15} />
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
            {currentAnalysis ? (
              <MultipleAnalysisResults 
                key={analysisKey} 
                results={currentAnalysis} 
                onNewAnalysis={handleNewAnalysis}
              />
            ) : (
              <UploadAnalysisMultiple teamId={teamId} onAnalysisComplete={handleAnalysisComplete} />
            )}
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
            <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '100%' }}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="history-search-input"
                placeholder="Search by design name or filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={18} />
                </button>
              )}
              {history.length > 0 && (
                <span className="history-search-results">
                  {history.filter(item => 
                    !searchQuery || 
                    (item.design_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.filename || '').toLowerCase().includes(searchQuery.toLowerCase())
                  ).length} of {history.length} results
                </span>
              )}
            </div>

            <div className="history-main">
              {historyLoading ? (
                <div className="history-loading">
                  <span className="loading-spinner"></span>
                  Loading your analysis history...
                </div>
              ) : historyError ? (
                <div className="history-empty">
                  <div className="empty-icon">
                    <Zap size={40} />
                  </div>
                  <h3 className="empty-title">History unavailable</h3>
                  <p className="empty-text">
                    {historyError}
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="history-empty">
                  <div className="empty-icon">
                    <Zap size={40} />
                  </div>
                  <h3 className="empty-title">No analyses yet</h3>
                  <p className="empty-text">
                    Start by uploading a design or connecting your Figma file to get your first analysis
                  </p>
                </div>
              ) : (
                <ul className="history-list">
                  {history
                    .filter(item => 
                      !searchQuery || 
                      (item.design_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (item.filename || '').toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item) => {
                      console.log('📌 Rendering history item:', item);
                      console.log('📌 Item properties:', Object.keys(item));
                      console.log('📌 Date field - timestamp:', item.timestamp, 'created_at:', item.created_at);
                      
                      const dateToDisplay = item.timestamp || item.created_at || item.date || 'Unknown';
                      
                      return (
                      <li key={item.analysis_id} className="history-item">
                        <div className="history-item-content">
                          <h3 className="history-item-name">
                            {item.design_name || item.filename || 'Untitled'}
                          </h3>
                          <div className="history-item-meta">
                            <span className="history-item-date">
                              <Calendar size={16} />
                              {formatDate(dateToDisplay)}
                            </span>
                          </div>
                        </div>

                        <div className="history-item-actions">
                          <button
                            className="action-button"
                            onClick={() => handleView(item)}
                            title="View full results"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => {
                              console.log('🗑️ Delete button clicked, item:', item);
                              handleDelete(item.analysis_id);
                            }}
                            disabled={deleting === item.analysis_id}
                            title="Delete this analysis"
                          >
                            <Trash2 size={16} />
                            {deleting === item.analysis_id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </li>
                    );
                    })}
                </ul>
              )}
            </div>
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
