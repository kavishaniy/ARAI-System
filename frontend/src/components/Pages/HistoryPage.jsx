import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, Calendar, Zap } from 'lucide-react';
import Sidebar from '../Common/Sidebar';
import { analysisService } from '../../services/analysis';

const HistoryPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analysisService.getHistory(1, 100);
      setAnalyses(response.analyses || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load analysis history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (analysisId) => {
    navigate(`/analysis/${analysisId}`);
  };

  const handleDelete = async (analysisId) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        setDeleting(analysisId);
        await analysisService.deleteAnalysis(analysisId);
        setAnalyses(analyses.filter(a => a.analysis_id !== analysisId));
      } catch (err) {
        console.error('Failed to delete analysis:', err);
        setError('Failed to delete analysis. Please try again.');
      } finally {
        setDeleting(null);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getGradeColor = (grade) => {
    switch (grade?.toUpperCase()) {
      case 'A':
        return '#10b981';
      case 'B':
        return '#3b82f6';
      case 'C':
        return '#f59e0b';
      case 'D':
      case 'F':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const css = `
    .history-page-wrapper {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
    }

    .history-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 48px 40px;
    }

    .history-header {
      max-width: 1200px;
      margin: 0 auto 32px;
      width: 100%;
    }

    .history-title {
      margin: 0 0 8px 0;
      font-family: 'DM Serif Display', serif;
      font-size: 2.2rem;
      font-weight: 400;
      color: #0f2557;
      line-height: 1.2;
    }

    .history-subtitle {
      font-size: 0.95rem;
      color: rgba(15, 37, 87, 0.6);
      font-weight: 300;
      letter-spacing: 0.3px;
      margin: 0;
    }

    .history-container {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      flex: 1;
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

    .empty-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #0f2557;
      margin: 0 0 8px 0;
    }

    .empty-text {
      color: rgba(15, 37, 87, 0.6);
      margin: 0 0 24px 0;
      font-size: 0.95rem;
    }

    .empty-button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .empty-button:hover {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
    }

    .history-error {
      padding: 20px 40px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
      border-bottom: 1.5px solid rgba(239, 68, 68, 0.2);
      color: #991b1b;
      font-size: 0.95rem;
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

    .history-item-score {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .score-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      color: white;
      background: rgba(15, 37, 87, 0.1);
    }

    .score-value {
      font-weight: 600;
      color: #0f2557;
    }

    .grade-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      font-weight: 700;
      color: white;
      font-size: 0.85rem;
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
      .history-content {
        padding: 24px 16px;
      }

      .history-title {
        font-size: 1.8rem;
      }

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

  return (
    <div className="history-page-wrapper">
      <style>{css}</style>
      <Sidebar />
      <main className="history-content">
        <div className="history-header">
          <h1 className="history-title">Analysis History</h1>
          <p className="history-subtitle">View all your previous design analyses and results</p>
        </div>

        <div className="history-container">
          <div className="history-main">
            {error && (
              <div className="history-error">
                {error}
              </div>
            )}

            {loading ? (
              <div className="history-loading">
                <span className="loading-spinner"></span>
                Loading your analysis history...
              </div>
            ) : analyses.length === 0 ? (
              <div className="history-empty">
                <div className="empty-icon">
                  <Zap size={40} />
                </div>
                <h3 className="empty-title">No analyses yet</h3>
                <p className="empty-text">
                  Start by uploading a design or connecting your Figma file to get your first analysis
                </p>
                <button className="empty-button" onClick={() => navigate('/dashboard')}>
                  Start Analyzing
                </button>
              </div>
            ) : (
              <ul className="history-list">
                {analyses.map((analysis) => (
                  <li key={analysis.analysis_id} className="history-item">
                    <div className="history-item-content">
                      <h3 className="history-item-name">
                        {analysis.design_name}
                      </h3>
                      <div className="history-item-meta">
                        <span className="history-item-date">
                          <Calendar size={16} />
                          {formatDate(analysis.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="history-item-score">
                      {analysis.arai_score && (
                        <>
                          <div className="score-badge" style={{
                            background: `linear-gradient(135deg, ${getGradeColor(analysis.overall_grade)}, ${getGradeColor(analysis.overall_grade)}80)`
                          }}>
                            {analysis.arai_score?.toFixed(0)}
                          </div>
                          <div className="score-value">
                            {analysis.arai_score?.toFixed(1)}/100
                          </div>
                          {analysis.overall_grade && (
                            <div 
                              className="grade-badge"
                              style={{ backgroundColor: getGradeColor(analysis.overall_grade) }}
                            >
                              {analysis.overall_grade}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="history-item-actions">
                      <button
                        className="action-button"
                        onClick={() => handleViewReport(analysis.analysis_id)}
                        title="View detailed report"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDelete(analysis.analysis_id)}
                        disabled={deleting === analysis.analysis_id}
                        title="Delete this analysis"
                      >
                        <Trash2 size={16} />
                        {deleting === analysis.analysis_id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
