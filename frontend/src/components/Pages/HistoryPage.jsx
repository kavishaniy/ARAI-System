import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, Calendar, Zap, X } from 'lucide-react';
import Sidebar from '../Common/Sidebar';
import { analysisService } from '../../services/analysis';

const HistoryPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [viewingResults, setViewingResults] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
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

  const handleViewReport = async (analysisId) => {
    try {
      setResultsLoading(true);
      const results = await analysisService.getAnalysis(analysisId);
      setSelectedAnalysis(results);
      setViewingResults(true);
    } catch (err) {
      console.error('Failed to fetch analysis results:', err);
      setError('Failed to load analysis results. Please try again.');
    } finally {
      setResultsLoading(false);
    }
  };

  const closeResultsModal = () => {
    setViewingResults(false);
    setSelectedAnalysis(null);
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
      display: none;
    }

    .history-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      backdrop-filter: blur(4px);
    }

    .history-modal-content {
      background: white;
      border-radius: 16px;
      max-width: 1000px;
      max-height: 85vh;
      width: 100%;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .history-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      border-bottom: 1.5px solid rgba(15, 37, 87, 0.1);
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.02) 100%);
    }

    .history-modal-title {
      margin: 0;
      font-family: 'DM Serif Display', serif;
      font-size: 1.5rem;
      font-weight: 400;
      color: #0f2557;
    }

    .history-modal-close {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(15, 37, 87, 0.6);
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .history-modal-close:hover {
      background: rgba(15, 37, 87, 0.1);
      color: #0f2557;
    }

    .history-modal-body {
      padding: 32px;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .result-card {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.03) 100%);
      border: 1.5px solid rgba(15, 37, 87, 0.1);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }

    .result-card-label {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      font-weight: 500;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .result-card-value {
      font-family: 'DM Serif Display', serif;
      font-size: 2.5rem;
      font-weight: 400;
      color: #0f2557;
      margin: 8px 0;
    }

    .result-card-subtitle {
      font-size: 0.9rem;
      color: rgba(15, 37, 87, 0.5);
    }

    .results-section {
      margin-bottom: 32px;
    }

    .results-section-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.3rem;
      font-weight: 400;
      color: #0f2557;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid rgba(15, 37, 87, 0.1);
    }

    .results-details {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.02) 100%);
      border: 1.5px solid rgba(15, 37, 87, 0.08);
      border-radius: 12px;
      padding: 20px;
    }

    .results-detail-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(15, 37, 87, 0.05);
    }

    .results-detail-item:last-child {
      border-bottom: none;
    }

    .results-detail-label {
      color: rgba(15, 37, 87, 0.6);
      font-weight: 500;
    }

    .results-detail-value {
      color: #0f2557;
      font-weight: 600;
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

    /* COMPREHENSIVE MODAL STYLING */
    .history-modal-body {
      padding: 32px;
      max-height: 75vh;
      overflow-y: auto;
    }

    /* MAIN SCORES SECTION */
    .modal-main-scores {
      margin-bottom: 40px;
    }

    .modal-score-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 30px;
      align-items: start;
    }

    .modal-arai-card {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.05) 0%, rgba(100, 180, 255, 0.08) 100%);
      border: 2px solid rgba(15, 37, 87, 0.15);
      border-radius: 16px;
      padding: 40px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .modal-arai-value {
      font-family: 'DM Serif Display', serif;
      font-size: 4rem;
      font-weight: 400;
      color: #0f2557;
      line-height: 1;
      margin-bottom: 10px;
    }

    .modal-arai-label {
      font-size: 0.9rem;
      color: rgba(15, 37, 87, 0.6);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }

    .modal-arai-grade {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f2557;
      background: rgba(100, 180, 255, 0.2);
      width: 50px;
      height: 50px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-sub-scores {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .modal-sub-score-item {
      background: white;
      border: 2px solid rgba(15, 37, 87, 0.12);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .modal-sub-score-item:hover {
      border-color: rgba(15, 37, 87, 0.3);
      box-shadow: 0 8px 20px rgba(15, 37, 87, 0.1);
      transform: translateY(-2px);
    }

    .modal-sub-score-item.accessibility {
      border-color: #14b8a6;
    }

    .modal-sub-score-item.readability {
      border-color: #3b82f6;
    }

    .modal-sub-score-item.attention {
      border-color: #f59e0b;
    }

    .modal-sub-score-value {
      font-family: 'DM Serif Display', serif;
      font-size: 2.5rem;
      font-weight: 400;
      color: #0f2557;
      line-height: 1;
      margin-bottom: 8px;
    }

    .modal-sub-score-label {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ANALYSIS SECTIONS */
    .modal-analysis-section {
      margin-bottom: 40px;
      padding: 28px;
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.02) 100%);
      border: 1.5px solid rgba(15, 37, 87, 0.1);
      border-radius: 14px;
    }

    .modal-section-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.4rem;
      font-weight: 400;
      color: #0f2557;
      margin: 0 0 24px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid rgba(15, 37, 87, 0.1);
    }

    .modal-detail-group {
      margin-bottom: 24px;
    }

    .modal-detail-group:last-child {
      margin-bottom: 0;
    }

    .modal-detail-label {
      display: block;
      font-weight: 600;
      color: #0f2557;
      margin-bottom: 10px;
      font-size: 0.95rem;
    }

    .modal-detail-value {
      font-size: 1rem;
      color: rgba(15, 37, 87, 0.7);
      padding: 10px 14px;
      background: white;
      border-radius: 8px;
      border: 1px solid rgba(15, 37, 87, 0.08);
    }

    /* ISSUES LIST */
    .modal-issues-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .modal-issue-item {
      display: flex;
      gap: 12px;
      padding: 14px;
      background: white;
      border-left: 4px solid;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .modal-issue-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateX(2px);
    }

    .modal-issue-critical {
      border-left-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .modal-issue-high {
      border-left-color: #f97316;
      background: rgba(249, 115, 22, 0.05);
    }

    .modal-issue-medium {
      border-left-color: #eab308;
      background: rgba(234, 179, 8, 0.05);
    }

    .modal-issue-low {
      border-left-color: #3b82f6;
      background: rgba(59, 130, 246, 0.05);
    }

    .modal-issue-severity {
      font-weight: 700;
      font-size: 0.75rem;
      padding: 4px 8px;
      border-radius: 4px;
      height: fit-content;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .modal-issue-critical .modal-issue-severity {
      color: #991b1b;
      background: rgba(239, 68, 68, 0.15);
    }

    .modal-issue-high .modal-issue-severity {
      color: #92400e;
      background: rgba(249, 115, 22, 0.15);
    }

    .modal-issue-medium .modal-issue-severity {
      color: #713f12;
      background: rgba(234, 179, 8, 0.15);
    }

    .modal-issue-low .modal-issue-severity {
      color: #1e40af;
      background: rgba(59, 130, 246, 0.15);
    }

    .modal-issue-text {
      flex: 1;
    }

    .modal-issue-title {
      font-weight: 600;
      color: #0f2557;
      margin-bottom: 4px;
      font-size: 0.95rem;
    }

    .modal-issue-desc {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      line-height: 1.5;
    }

    /* RECOMMENDATIONS */
    .modal-recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .modal-recommendation-item {
      display: flex;
      gap: 12px;
      padding: 14px;
      background: white;
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-left: 4px solid #10b981;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .modal-recommendation-item:hover {
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
      background: rgba(16, 185, 129, 0.02);
    }

    .modal-rec-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .modal-rec-text {
      flex: 1;
    }

    .modal-rec-title {
      font-weight: 600;
      color: #0f2557;
      margin-bottom: 4px;
      font-size: 0.95rem;
    }

    .modal-rec-desc {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      line-height: 1.5;
    }

    /* METRICS GRID */
    .modal-metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .modal-metric-card {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.1);
      border-radius: 10px;
      padding: 16px;
      text-align: center;
    }

    .modal-metric-value {
      font-family: 'DM Serif Display', serif;
      font-size: 2rem;
      font-weight: 400;
      color: #0f2557;
      line-height: 1;
      margin-bottom: 6px;
    }

    .modal-metric-label {
      font-size: 0.8rem;
      color: rgba(15, 37, 87, 0.6);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .modal-metric-desc {
      font-size: 0.75rem;
      color: rgba(15, 37, 87, 0.5);
      line-height: 1.4;
    }

    /* FOCUS AREAS */
    .modal-focus-areas {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .modal-focus-area-item {
      background: white;
      border: 1.5px solid rgba(245, 158, 11, 0.2);
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
      padding: 14px;
      transition: all 0.2s ease;
    }

    .modal-focus-area-item:hover {
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
    }

    .modal-focus-area-content {
      font-size: 0.9rem;
      color: rgba(15, 37, 87, 0.7);
    }

    .modal-focus-title {
      font-weight: 600;
      color: #0f2557;
      margin-bottom: 6px;
    }

    .modal-focus-location,
    .modal-focus-intensity {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      margin-bottom: 4px;
    }

    .modal-focus-desc {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.55);
      margin-top: 8px;
      line-height: 1.5;
    }

    /* ISSUE SUMMARY GRID */
    .modal-issue-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
    }

    .modal-summary-card {
      background: white;
      border: 2px solid rgba(15, 37, 87, 0.12);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: all 0.2s ease;
    }

    .modal-summary-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .modal-summary-card.critical {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .modal-summary-card.high {
      border-color: #f97316;
      background: rgba(249, 115, 22, 0.05);
    }

    .modal-summary-card.medium {
      border-color: #eab308;
      background: rgba(234, 179, 8, 0.05);
    }

    .modal-summary-card.passing {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.05);
    }

    .modal-summary-icon {
      font-size: 1.8rem;
      margin-bottom: 8px;
    }

    .modal-summary-label {
      font-size: 0.8rem;
      color: rgba(15, 37, 87, 0.6);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .modal-summary-value {
      font-family: 'DM Serif Display', serif;
      font-size: 2.5rem;
      font-weight: 400;
      color: #0f2557;
      line-height: 1;
    }

    /* STATUS BAR */
    .modal-status-bar {
      margin-top: 32px;
      padding: 16px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(100, 200, 150, 0.05) 100%);
      border: 1.5px solid rgba(16, 185, 129, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.95rem;
    }

    .modal-status-label {
      font-weight: 600;
      color: #0f2557;
    }

    .modal-status-value {
      font-weight: 600;
      color: #10b981;
    }

    .modal-status-completed {
      color: #10b981;
    }

    .modal-status-partial {
      color: #f59e0b;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .modal-score-grid {
        grid-template-columns: 1fr;
      }

      .modal-sub-scores {
        grid-template-columns: 1fr;
      }

      .modal-arai-card {
        padding: 30px 15px;
      }

      .modal-arai-value {
        font-size: 3rem;
      }

      .modal-metrics-grid {
        grid-template-columns: 1fr;
      }

      .modal-issue-summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .history-modal-body {
        padding: 20px;
      }
    }

    .results-grid {
      display: none;
    }

    .results-section {
      display: none;
    }

    .results-details {
      display: none;
    }

    .results-detail-item {
      display: none;
    }

    .results-detail-label {
      display: none;
    }

    .results-detail-value {
      display: none;
    }

    .result-card {
      display: none;
    }

    .result-card-label {
      display: none;
    }

    .result-card-value {
      display: none;
    }

    .result-card-subtitle {
      display: none;
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
                    </div>

                    <div className="history-item-actions">
                      <button
                        className="action-button"
                        onClick={() => handleViewReport(analysis.analysis_id)}
                        title="View detailed analysis results"
                        disabled={resultsLoading}
                      >
                        <Eye size={16} />
                        {resultsLoading ? 'Loading...' : 'View'}
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

      {viewingResults && selectedAnalysis && (
        <div className="history-modal-overlay" onClick={closeResultsModal}>
          <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="history-modal-header">
              <h2 className="history-modal-title">{selectedAnalysis.design_name || 'Analysis Results'}</h2>
              <button className="history-modal-close" onClick={closeResultsModal} title="Close">
                <X size={24} />
              </button>
            </div>

            <div className="history-modal-body">
              {/* MAIN SCORES SECTION */}
              <div className="modal-main-scores">
                <div className="modal-score-grid">
                  {/* ARAI Score - Large */}
                  <div className="modal-arai-card">
                    <div className="modal-arai-value">{selectedAnalysis.arai_score?.toFixed(1) || 0}</div>
                    <div className="modal-arai-label">ARAI Score</div>
                    {selectedAnalysis.overall_grade && (
                      <div className="modal-arai-grade">{selectedAnalysis.overall_grade}</div>
                    )}
                  </div>

                  {/* Component Scores */}
                  <div className="modal-sub-scores">
                    {selectedAnalysis.accessibility?.score !== undefined && (
                      <div className="modal-sub-score-item accessibility">
                        <div className="modal-sub-score-value">{selectedAnalysis.accessibility.score?.toFixed(1)}</div>
                        <div className="modal-sub-score-label">Accessibility</div>
                      </div>
                    )}
                    {selectedAnalysis.readability?.score !== undefined && (
                      <div className="modal-sub-score-item readability">
                        <div className="modal-sub-score-value">{selectedAnalysis.readability.score?.toFixed(1)}</div>
                        <div className="modal-sub-score-label">Readability</div>
                      </div>
                    )}
                    {selectedAnalysis.attention?.score !== undefined && (
                      <div className="modal-sub-score-item attention">
                        <div className="modal-sub-score-value">{selectedAnalysis.attention.score?.toFixed(1)}</div>
                        <div className="modal-sub-score-label">Attention</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ACCESSIBILITY SECTION */}
              {selectedAnalysis.accessibility && (
                <div className="modal-analysis-section">
                  <h3 className="modal-section-title">
                    ♿ Accessibility Analysis
                  </h3>
                  
                  {selectedAnalysis.accessibility.conformance && (
                    <div className="modal-detail-group">
                      <label className="modal-detail-label">WCAG Conformance Level</label>
                      <div className="modal-detail-value">{selectedAnalysis.accessibility.conformance}</div>
                    </div>
                  )}

                  {selectedAnalysis.accessibility.issues && selectedAnalysis.accessibility.issues.length > 0 && (
                    <div className="modal-detail-group">
                      <label className="modal-detail-label">Issues Found: {selectedAnalysis.accessibility.issues.length}</label>
                      <div className="modal-issues-list">
                        {selectedAnalysis.accessibility.issues.map((issue, idx) => (
                          <div key={idx} className={`modal-issue-item modal-issue-${issue.severity?.toLowerCase() || 'medium'}`}>
                            <div className="modal-issue-severity">{issue.severity}</div>
                            <div className="modal-issue-text">
                              <div className="modal-issue-title">{issue.title || issue.type}</div>
                              {issue.description && (
                                <div className="modal-issue-desc">{issue.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAnalysis.accessibility.recommendations && selectedAnalysis.accessibility.recommendations.length > 0 && (
                    <div className="modal-detail-group">
                      <label className="modal-detail-label">Recommendations: {selectedAnalysis.accessibility.recommendations.length}</label>
                      <div className="modal-recommendations-list">
                        {selectedAnalysis.accessibility.recommendations.map((rec, idx) => (
                          <div key={idx} className="modal-recommendation-item">
                            <div className="modal-rec-icon">💡</div>
                            <div className="modal-rec-text">
                              <div className="modal-rec-title">{rec.title || rec}</div>
                              {typeof rec === 'object' && rec.description && (
                                <div className="modal-rec-desc">{rec.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* READABILITY SECTION */}
              {selectedAnalysis.readability && (
                <div className="modal-analysis-section">
                  <h3 className="modal-section-title">
                    📖 Readability Analysis
                  </h3>

                  {selectedAnalysis.readability.metrics && (
                    <div className="modal-metrics-grid">
                      {selectedAnalysis.readability.metrics.flesch_kincaid_grade !== undefined && (
                        <div className="modal-metric-card">
                          <div className="modal-metric-value">{selectedAnalysis.readability.metrics.flesch_kincaid_grade?.toFixed(1)}</div>
                          <div className="modal-metric-label">Flesch-Kincaid Grade</div>
                          <div className="modal-metric-desc">Grade level needed to understand</div>
                        </div>
                      )}
                      {selectedAnalysis.readability.metrics.avg_word_length !== undefined && (
                        <div className="modal-metric-card">
                          <div className="modal-metric-value">{selectedAnalysis.readability.metrics.avg_word_length?.toFixed(2)}</div>
                          <div className="modal-metric-label">Avg Word Length</div>
                          <div className="modal-metric-desc">Characters per word</div>
                        </div>
                      )}
                      {selectedAnalysis.readability.metrics.avg_sentence_length !== undefined && (
                        <div className="modal-metric-card">
                          <div className="modal-metric-value">{selectedAnalysis.readability.metrics.avg_sentence_length?.toFixed(1)}</div>
                          <div className="modal-metric-label">Avg Sentence Length</div>
                          <div className="modal-metric-desc">Words per sentence</div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedAnalysis.readability.issues && selectedAnalysis.readability.issues.length > 0 && (
                    <div className="modal-detail-group">
                      <label className="modal-detail-label">Readability Issues: {selectedAnalysis.readability.issues.length}</label>
                      <div className="modal-issues-list">
                        {selectedAnalysis.readability.issues.map((issue, idx) => (
                          <div key={idx} className={`modal-issue-item modal-issue-${issue.severity?.toLowerCase() || 'medium'}`}>
                            <div className="modal-issue-severity">{issue.severity}</div>
                            <div className="modal-issue-text">
                              <div className="modal-issue-title">{issue.title || issue.type}</div>
                              {issue.description && (
                                <div className="modal-issue-desc">{issue.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAnalysis.readability.recommendations && selectedAnalysis.readability.recommendations.length > 0 && (
                    <div className="modal-detail-group">
                      <label className="modal-detail-label">Recommendations: {selectedAnalysis.readability.recommendations.length}</label>
                      <div className="modal-recommendations-list">
                        {selectedAnalysis.readability.recommendations.map((rec, idx) => (
                          <div key={idx} className="modal-recommendation-item">
                            <div className="modal-rec-icon">💡</div>
                            <div className="modal-rec-text">
                              <div className="modal-rec-title">{rec.title || rec}</div>
                              {typeof rec === 'object' && rec.description && (
                                <div className="modal-rec-desc">{rec.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ATTENTION SECTION */}
              {selectedAnalysis.attention && (
                <div className="modal-analysis-section">
                  <h3 className="modal-section-title">
                    👁️ Visual Attention Analysis
                  </h3>

                  {selectedAnalysis.attention.distribution && (
                    <div className="modal-detail-group">
                      <label className="modal-detail-label">Visual Distribution</label>
                      <div className="modal-detail-value">{selectedAnalysis.attention.distribution}</div>
                    </div>
                  )}

                  {selectedAnalysis.attention.focus_areas && selectedAnalysis.attention.focus_areas.length > 0 && (
                    <div className="modal-detail-group">
                      <label className="modal-detail-label">Focus Areas Detected: {selectedAnalysis.attention.focus_areas.length}</label>
                      <div className="modal-focus-areas">
                        {selectedAnalysis.attention.focus_areas.map((area, idx) => (
                          <div key={idx} className="modal-focus-area-item">
                            <div className="modal-focus-area-content">
                              {area.title && <div className="modal-focus-title">{area.title}</div>}
                              {area.location && <div className="modal-focus-location">Location: {area.location}</div>}
                              {area.intensity && <div className="modal-focus-intensity">Intensity: {area.intensity}</div>}
                              {area.description && <div className="modal-focus-desc">{area.description}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAnalysis.attention.issues && selectedAnalysis.attention.issues.length > 0 && (
                    <div className="modal-detail-group">
                      <label className="modal-detail-label">Attention Issues: {selectedAnalysis.attention.issues.length}</label>
                      <div className="modal-issues-list">
                        {selectedAnalysis.attention.issues.map((issue, idx) => (
                          <div key={idx} className={`modal-issue-item modal-issue-${issue.severity?.toLowerCase() || 'medium'}`}>
                            <div className="modal-issue-severity">{issue.severity}</div>
                            <div className="modal-issue-text">
                              <div className="modal-issue-title">{issue.title || issue.type}</div>
                              {issue.description && (
                                <div className="modal-issue-desc">{issue.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ISSUE SUMMARY */}
              {selectedAnalysis.issue_summary && (
                <div className="modal-analysis-section">
                  <h3 className="modal-section-title">📊 Issue Summary</h3>
                  <div className="modal-issue-summary-grid">
                    {selectedAnalysis.issue_summary.critical !== undefined && (
                      <div className="modal-summary-card critical">
                        <div className="modal-summary-icon">🔴</div>
                        <div className="modal-summary-label">Critical</div>
                        <div className="modal-summary-value">{selectedAnalysis.issue_summary.critical}</div>
                      </div>
                    )}
                    {selectedAnalysis.issue_summary.high !== undefined && (
                      <div className="modal-summary-card high">
                        <div className="modal-summary-icon">🟠</div>
                        <div className="modal-summary-label">High</div>
                        <div className="modal-summary-value">{selectedAnalysis.issue_summary.high}</div>
                      </div>
                    )}
                    {selectedAnalysis.issue_summary.medium !== undefined && (
                      <div className="modal-summary-card medium">
                        <div className="modal-summary-icon">🟡</div>
                        <div className="modal-summary-label">Medium</div>
                        <div className="modal-summary-value">{selectedAnalysis.issue_summary.medium}</div>
                      </div>
                    )}
                    {selectedAnalysis.issue_summary.passing !== undefined && (
                      <div className="modal-summary-card passing">
                        <div className="modal-summary-icon">🟢</div>
                        <div className="modal-summary-label">Passing</div>
                        <div className="modal-summary-value">{selectedAnalysis.issue_summary.passing}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STATUS */}
              {selectedAnalysis.status && (
                <div className="modal-status-bar">
                  <span className="modal-status-label">Analysis Status:</span>
                  <span className={`modal-status-value modal-status-${selectedAnalysis.status}`}>
                    {selectedAnalysis.status === 'completed' ? '✓ Completed' : selectedAnalysis.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
