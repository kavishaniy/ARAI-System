import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Calendar, Zap, Eye } from 'lucide-react';
import Sidebar from '../Common/Sidebar';
import { projectService } from '../../services/projects';
import { analysisService } from '../../services/analysis';
import UploadAnalysisMultiple from '../Analysis/UploadAnalysisMultiple';
import SimplifiedAnalysisResults from '../Analysis/SimplifiedAnalysisResults';

const ProjectDashboard = ({ project, onBack, onDelete }) => {
  const [projectDetails, setProjectDetails] = useState(project);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [editedDescription, setEditedDescription] = useState(project.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedHistoryAnalysis, setSelectedHistoryAnalysis] = useState(null);
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false);
  const [deletingAnalysis, setDeletingAnalysis] = useState(null);

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjectDetail(project.id);
      console.log('📊 Project detail response:', data);
      console.log('📈 Analyses from response:', data.analyses);
      setProjectDetails(data);
      
      // Only update analyses if we got a valid response with analyses
      if (data.analyses && Array.isArray(data.analyses)) {
        if (data.analyses.length > 0) {
          console.log('✅ Setting analyses from backend:', data.analyses.length, 'items');
          // Store the full analysis object so all details are available
          const analyzesWithResults = data.analyses.map(analysis => ({
            ...analysis,
            results: analysis,  // Store entire object for viewing
          }));
          setAnalyses(analyzesWithResults);
        } else {
          console.log('📝 Backend returned empty analyses array - keeping local state');
          // Don't clear existing analyses if backend returns empty
          // This prevents analyses from disappearing if they haven't synced yet
        }
      } else {
        console.warn('⚠️ Invalid analyses in backend response, type:', typeof data.analyses);
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleSaveChanges = async () => {
    if (!editedName.trim()) {
      setError('Project name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      await projectService.updateProject(project.id, {
        name: editedName.trim(),
        description: editedDescription.trim(),
      });
      
      setProjectDetails({
        ...projectDetails,
        name: editedName.trim(),
        description: editedDescription.trim(),
      });
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(projectDetails.name);
    setEditedDescription(projectDetails.description || '');
    setIsEditing(false);
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;
    try {
      setDeletingAnalysis(analysisId);
      await analysisService.deleteAnalysis(analysisId);
      setAnalyses(prev => prev.filter(a => (a.id || a.analysis_id) !== analysisId));
    } catch (err) {
      console.error('Failed to delete analysis:', err);
    } finally {
      setDeletingAnalysis(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const css = `
    .dashboard-page-wrapper {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
      width: 100%;
    }

    .dashboard-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 48px 40px;
      width: 100%;
      margin-left: 240px;
      transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-x: auto;
    }

    @media (max-width: 1024px) {
      .dashboard-content {
        margin-left: 80px;
        padding: 32px 24px;
      }
    }

    @media (max-width: 768px) {
      .dashboard-content {
        margin-left: 60px;
        padding: 24px 16px;
      }
    }

    @media (max-width: 480px) {
      .dashboard-content {
        margin-left: 56px;
      }
    }
    }

    @media (max-width: 480px) {
      .dashboard-content {
        padding: 16px 12px;
      }
    }

    .dashboard-header-top {
      max-width: 1200px;
      margin: 0 auto 32px;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .dashboard-header-top {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 24px;
        gap: 12px;
      }
    }

    .dashboard-title {
      font-family: 'DM Serif Display', serif;
      font-size: 2.2rem;
      font-weight: 400;
      color: #0f2557;
      margin: 0;
      line-height: 1.2;
      flex: 1;
    }

    @media (max-width: 768px) {
      .dashboard-title {
        font-size: 1.6rem;
      }
    }

    @media (max-width: 480px) {
      .dashboard-title {
        font-size: 1.3rem;
      }
    }

    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      flex: 1;
    }

    .dashboard-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
      border: 1.5px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      color: #991b1b;
      font-size: 0.95rem;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dashboard-error button {
      background: none;
      border: none;
      color: #991b1b;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0;
    }

    .dashboard-loading {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
      padding: 60px 40px;
      text-align: center;
    }

    .dashboard-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(15, 37, 87, 0.1);
      border-top-color: #0f2557;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .dashboard-loading p {
      color: rgba(15, 37, 87, 0.6);
      margin: 0;
    }

    .project-header-main {
      background: transparent;
      border: none;
      border-radius: 0;
      padding: 0 0 32px 0;
      margin-bottom: 32px;
      box-shadow: none;
      transition: all 0.3s ease;
    }

    .project-header-content {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      gap: 24px;
    }

    @media (max-width: 768px) {
      .project-header-content {
        flex-direction: column;
        gap: 16px;
      }
    }

    .project-title-section {
      flex: 1;
    }

    .project-name-main {
      margin: 0;
      font-family: 'DM Serif Display', serif;
      font-size: 2.2rem;
      font-weight: 400;
      color: #0f2557;
      line-height: 1.2;
    }

    @media (max-width: 768px) {
      .project-name-main {
        font-size: 1.6rem;
      }
    }

    @media (max-width: 480px) {
      .project-name-main {
        font-size: 1.3rem;
      }
    }

    .project-subtitle-main {
      color: rgba(15, 37, 87, 0.6);
      font-size: 0.95rem;
      margin: 8px 0 0 0;
      font-weight: 300;
      letter-spacing: 0.3px;
    }

    .edit-form-inline {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .edit-input-main {
      padding: 11px 14px;
      border: 1.5px solid rgba(15, 37, 87, 0.15);
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: #0f2557;
      font-family: 'DM Serif Display', serif;
    }

    .edit-input-main:focus {
      outline: none;
      border-color: #0f2557;
      box-shadow: 0 0 0 3px rgba(15, 37, 87, 0.08);
    }

    .project-actions-main {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    @media (max-width: 768px) {
      .project-actions-main {
        width: 100%;
        flex-wrap: wrap;
      }
    }

    .project-back-button {
      padding: 8px 0;
      background: none;
      border: none;
      color: #0f2557;
      font-size: 1.3rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      opacity: 0.7;
      margin-top: 8px;
      align-self: flex-start;
    }

    .project-back-button:hover {
      opacity: 1;
      transform: translateX(-4px);
    }

    .project-btn {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .project-btn-primary {
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
    }

    .project-btn-primary:hover {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
    }

    .project-btn-secondary {
      background: white;
      color: rgba(15, 37, 87, 0.7);
      border: 1.5px solid rgba(15, 37, 87, 0.15);
    }

    .project-btn-secondary:hover {
      background: rgba(15, 37, 87, 0.05);
      border-color: rgba(15, 37, 87, 0.25);
      color: #0f2557;
    }

    .project-btn-danger {
      background: white;
      color: #dc2626;
      border: 1.5px solid rgba(220, 38, 38, 0.3);
    }

    .project-btn-danger:hover {
      background: rgba(220, 38, 38, 0.08);
      border-color: #dc2626;
      color: #b91c1c;
    }

    .project-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .edit-section-main {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.02) 100%);
      border: 1.5px solid rgba(15, 37, 87, 0.1);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .edit-section-main label {
      display: block;
      font-size: 0.9rem;
      font-weight: 600;
      color: #0f2557;
      margin-bottom: 8px;
    }

    .edit-textarea-main {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid rgba(15, 37, 87, 0.15);
      border-radius: 8px;
      font-size: 0.95rem;
      color: #0f2557;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
    }

    .edit-textarea-main:focus {
      outline: none;
      border-color: #0f2557;
      box-shadow: 0 0 0 3px rgba(15, 37, 87, 0.08);
    }

    .char-count-main {
      text-align: right;
      font-size: 0.8rem;
      color: rgba(15, 37, 87, 0.5);
      margin-top: 6px;
    }

    .dashboard-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .dashboard-stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
    }

    @media (max-width: 480px) {
      .dashboard-stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }

    .dashboard-stat-card {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
    }

    @media (max-width: 768px) {
      .dashboard-stat-card {
        padding: 18px;
      }
    }

    @media (max-width: 480px) {
      .dashboard-stat-card {
        padding: 16px;
        gap: 12px;
      }
    }

    .dashboard-stat-icon {
      font-size: 2.5rem;
      opacity: 0.7;
    }

    @media (max-width: 480px) {
      .dashboard-stat-icon {
        font-size: 2rem;
      }
    }

    .dashboard-stat-info {
      flex: 1;
    }

    .dashboard-stat-label {
      display: block;
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    @media (max-width: 480px) {
      .dashboard-stat-label {
        font-size: 0.75rem;
        letter-spacing: 0.3px;
      }
    }

    .dashboard-stat-value {
      display: block;
      font-family: 'DM Serif Display', serif;
      font-size: 1.8rem;
      font-weight: 400;
      color: #0f2557;
    }

    @media (max-width: 768px) {
      .dashboard-stat-value {
        font-size: 1.4rem;
      }
    }

    @media (max-width: 480px) {
      .dashboard-stat-value {
        font-size: 1.2rem;
      }
    }

    .dashboard-tabs {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
    }

    .dashboard-tab-buttons {
      display: flex;
      border-bottom: 2px solid rgba(15, 37, 87, 0.08);
      padding: 0;
      margin: 0;
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.02) 100%);
      overflow-x: auto;
    }

    @media (max-width: 768px) {
      .dashboard-tab-buttons {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }

    .dashboard-tab-btn {
      padding: 16px 24px;
      background: none;
      border: none;
      color: rgba(15, 37, 87, 0.6);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .dashboard-tab-btn {
        padding: 12px 18px;
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .dashboard-tab-btn {
        padding: 10px 14px;
        font-size: 0.75rem;
      }
    }

    .dashboard-tab-btn:hover {
      color: #0f2557;
    }

    .dashboard-tab-btn.active {
      color: #0f2557;
      border-bottom-color: #0f2557;
    }

    .dashboard-tab-content {
      padding: 32px;
    }

    .overview-card-main {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.02) 100%);
      border: 1.5px solid rgba(15, 37, 87, 0.1);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .overview-card-main:last-child {
      margin-bottom: 0;
    }

    .overview-card-title {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #0f2557;
      padding-bottom: 12px;
      border-bottom: 1.5px solid rgba(15, 37, 87, 0.1);
    }

    .info-grid-main {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .info-item-main {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label-main {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value-main {
      font-size: 0.95rem;
      color: #0f2557;
      font-weight: 600;
    }

    .quick-stats-main {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .quick-stat-main {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.08);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .quick-stat-label-main {
      display: block;
      font-size: 0.8rem;
      color: rgba(15, 37, 87, 0.6);
      margin-bottom: 6px;
    }

    .quick-stat-value-main {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f2557;
    }

    .analyses-empty {
      padding: 60px 40px;
      text-align: center;
    }

    /* ── Project History (matches sidebar HistoryPage) ── */
    .ph-main {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
    }

    .ph-list {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .ph-item {
      padding: 24px 32px;
      border-bottom: 1px solid rgba(15, 37, 87, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      transition: background 0.2s ease;
    }

    .ph-item:last-child { border-bottom: none; }

    .ph-item:hover {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.03) 100%);
    }

    .ph-item-content { flex: 1; min-width: 0; }

    .ph-item-name {
      margin: 0 0 8px 0;
      font-weight: 600;
      color: #0f2557;
      font-size: 1rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ph-item-meta {
      display: flex;
      gap: 16px;
      align-items: center;
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
    }

    .ph-item-date {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ph-item-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-shrink: 0;
    }

    .ph-action-button {
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
      font-weight: 500;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .ph-action-button:hover:not(:disabled) {
      border-color: rgba(15, 37, 87, 0.4);
      background: rgba(15, 37, 87, 0.02);
    }

    .ph-action-button:disabled { opacity: 0.5; cursor: not-allowed; }

    .ph-delete {
      border-color: rgba(239, 68, 68, 0.3);
      color: #991b1b;
    }

    .ph-delete:hover:not(:disabled) {
      border-color: rgba(239, 68, 68, 0.6);
      background: rgba(239, 68, 68, 0.05);
    }

    .ph-empty {
      padding: 60px 40px;
      text-align: center;
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
    }

    .ph-empty-icon {
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

    .ph-empty-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #0f2557;
      margin: 0 0 8px 0;
    }

    .ph-empty-text {
      color: rgba(15, 37, 87, 0.6);
      margin: 0 0 24px 0;
      font-size: 0.95rem;
    }

    .ph-empty-button {
      padding: 12px 24px;
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .ph-empty-button:hover {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
    }

    .ph-loading {
      padding: 60px 40px;
      text-align: center;
      color: rgba(15, 37, 87, 0.6);
    }

    .ph-spinner {
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

    @media (max-width: 768px) {
      .ph-item {
        padding: 16px;
        flex-direction: column;
        align-items: flex-start;
      }
      .ph-item-actions {
        width: 100%;
      }
      .ph-action-button {
        flex: 1;
        justify-content: center;
      }
    }

    .analyses-empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .analyses-empty-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #0f2557;
      margin: 0 0 8px 0;
    }

    .analyses-empty-text {
      color: rgba(15, 37, 87, 0.6);
      margin: 0;
    }

    .project-analyzer-section {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
    }

    .analyses-list-main {
      display: grid;
      gap: 16px;
    }

    .analysis-item-main {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.02) 100%);
      border: 1.5px solid rgba(15, 37, 87, 0.1);
      border-radius: 12px;
      padding: 20px;
    }

    .analysis-header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(15, 37, 87, 0.08);
    }

    .analysis-title-main {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #0f2557;
    }

    .analysis-date-main {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
    }

    .analysis-scores-main {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .analysis-score-badge {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.08);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .analysis-score-label {
      display: block;
      font-size: 0.8rem;
      color: rgba(15, 37, 87, 0.6);
      margin-bottom: 4px;
    }

    .analysis-score-value {
      display: block;
      font-size: 1.3rem;
      font-weight: 700;
      color: #0f2557;
    }

    .analysis-score-badge.overall {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.08) 0%, rgba(100, 180, 255, 0.08) 100%);
    }

    .analysis-view-btn {
      display: inline-block;
      padding: 10px 16px;
      background: transparent;
      color: #0f2557;
      border: 1.5px solid rgba(15, 37, 87, 0.15);
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .analysis-view-btn:hover {
      background: rgba(15, 37, 87, 0.05);
      border-color: rgba(15, 37, 87, 0.3);
      color: #0f2557;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        padding: 32px 20px;
      }

      .dashboard-title {
        font-size: 1.8rem;
      }

      .project-header-main {
        padding: 0;
        margin-bottom: 24px;
      }

      .project-header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .project-back-button {
        margin-bottom: 12px;
      }

      .project-actions-main {
        width: 100%;
        flex-wrap: wrap;
      }

      .project-btn {
        flex: 1;
        min-width: 100px;
      }

      .project-name-main {
        font-size: 1.6rem;
      }

      .dashboard-stats-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-tab-buttons {
        flex-direction: column;
      }

      .dashboard-tab-btn {
        border-bottom: 1px solid rgba(15, 37, 87, 0.08);
        margin-bottom: 0;
        text-align: left;
      }

      .dashboard-tab-btn.active {
        border-bottom: 3px solid #0f2557;
        border-left: 3px solid #0f2557;
      }

      .analysis-scores-main {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `;

  if (loading) {
    return (
      <div className="dashboard-page-wrapper">
        <Sidebar />
        <main className="dashboard-content">
          <style>{css}</style>
          <div className="dashboard-loading">
            <div className="dashboard-spinner"></div>
            <p>Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page-wrapper">
      <Sidebar />
      <main className="dashboard-content">
        <style>{css}</style>

        {/* Error */}
        {error && (
          <div className="dashboard-error">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Container */}
        <div className="dashboard-container">
          {/* Project Header */}
          <div className="project-header-main">
            <div className="project-header-content">
              <button className="project-back-button" onClick={onBack} title="Go back">
                ←
              </button>
              <div className="project-title-section">
                {isEditing ? (
                  <div className="edit-form-inline">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="edit-input-main"
                      maxLength={255}
                    />
                    <div className="char-count-main">{editedName.length}/255</div>
                  </div>
                ) : (
                  <div>
                    <h2 className="project-name-main">{projectDetails.name}</h2>
                    {projectDetails.description && (
                      <p className="project-subtitle-main">{projectDetails.description}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="project-actions-main">
                {isEditing ? (
                  <>
                    <button
                      className="project-btn project-btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      className="project-btn project-btn-primary"
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="project-btn project-btn-secondary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                    <button
                      className="project-btn project-btn-primary"
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Edit Description */}
          {isEditing && (
            <div className="edit-section-main">
              <label>Description (optional)</label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="edit-textarea-main"
                maxLength={1000}
                placeholder="Add a description for this project..."
              />
              <div className="char-count-main">{editedDescription.length}/1000</div>
            </div>
          )}

          {/* Tabs */}
          <div className="dashboard-tabs">
            <div className="dashboard-tab-buttons">
              <button
                className={`dashboard-tab-btn ${activeTab === 'analyze' ? 'active' : ''}`}
                onClick={() => setActiveTab('analyze')}
              >
                Analyze Design
              </button>
              <button
                className={`dashboard-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                History ({analyses.length})
              </button>
            </div>

            <div className="dashboard-tab-content">
              {activeTab === 'analyze' && (
                <div className="project-analyzer-section">
                  {analysisResults ? (
                    <div>
                      <button
                        className="project-btn project-btn-secondary"
                        onClick={() => setAnalysisResults(null)}
                        style={{ marginBottom: '24px' }}
                      >
                        ← Back to Upload
                      </button>
                      {analysisResults.analyses && analysisResults.analyses.length > 0 ? (
                        <SimplifiedAnalysisResults results={analysisResults.analyses[0]} />
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                          <p>No analysis results available</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <UploadAnalysisMultiple 
                      projectId={project.id}
                      onAnalysisComplete={(results) => {
                        console.log('✅ Analysis complete, results:', results);
                        
                        // Show the analysis results
                        setAnalysisResults(results);
                        
                        // Add new analyses to the local state immediately
                        // so the count increases right away
                        if (results.analyses && results.analyses.length > 0) {
                          console.log('📝 Adding', results.analyses.length, 'analyses to local state');
                          const newAnalyses = results.analyses.map((analysis) => ({
                            id: analysis.analysis_id,
                            design_name: analysis.design_name || analysis.filename,
                            filename: analysis.filename,
                            created_at: analysis.timestamp || new Date().toISOString(),
                            accessibility_score: analysis.arai_breakdown?.accessibility,
                            readability_score: analysis.arai_breakdown?.readability,
                            attention_score: analysis.arai_breakdown?.attention,
                            overall_score: analysis.arai_breakdown?.overall,
                            arai_score: analysis.arai_score,
                            // Store the entire analysis object for viewing details
                            // It contains all the accessibility, readability, attention data
                            results: analysis,
                          }));
                          
                          // Add new analyses to the beginning of the list
                          setAnalyses((prev) => {
                            const updated = [...newAnalyses, ...prev];
                            console.log('📊 Updated analyses list:', updated);
                            return updated;
                          });
                        }
                        
                        // Also refresh the analyses list from backend after a short delay
                        // to ensure the database has been updated
                        console.log('⏳ Waiting 2 seconds before fetching from backend...');
                        setTimeout(() => {
                          console.log('🔄 Fetching updated project details from backend...');
                          fetchProjectDetails();
                        }, 2000);
                      }}
                    />
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  {selectedHistoryAnalysis ? (
                    <div>
                      <button
                        className="ph-action-button"
                        onClick={() => setSelectedHistoryAnalysis(null)}
                        style={{ marginBottom: '24px' }}
                      >
                        ← Back to History
                      </button>
                      {historyDetailLoading ? (
                        <div className="ph-loading">
                          <span className="ph-spinner"></span>
                          Loading analysis results...
                        </div>
                      ) : selectedHistoryAnalysis?.results ? (
                        <SimplifiedAnalysisResults results={selectedHistoryAnalysis.results} />
                      ) : null}
                    </div>
                  ) : analyses.length === 0 ? (
                    <div className="ph-empty">
                      <div className="ph-empty-icon">
                        <Zap size={40} />
                      </div>
                      <h3 className="ph-empty-title">No analyses yet</h3>
                      <p className="ph-empty-text">Start by uploading a design in the Analyze tab</p>
                      <button className="ph-empty-button" onClick={() => setActiveTab('analyze')}>
                        Start Analyzing
                      </button>
                    </div>
                  ) : (
                    <div className="ph-main">
                      <ul className="ph-list">
                        {analyses.map(analysis => {
                          const id = analysis.id || analysis.analysis_id;
                          return (
                            <li key={id} className="ph-item">
                              <div className="ph-item-content">
                                <h3 className="ph-item-name">{analysis.design_name}</h3>
                                <div className="ph-item-meta">
                                  <span className="ph-item-date">
                                    <Calendar size={16} />
                                    {formatDate(analysis.created_at || analysis.timestamp)}
                                  </span>
                                </div>
                              </div>
                              <div className="ph-item-actions">
                                <button
                                  className="ph-action-button"
                                  onClick={async () => {
                                    setSelectedHistoryAnalysis({ ...analysis, results: null });
                                    setHistoryDetailLoading(true);
                                    try {
                                      const fullData = await analysisService.getAnalysis(id);
                                      setSelectedHistoryAnalysis({ ...analysis, results: fullData });
                                    } catch (err) {
                                      console.error('Failed to fetch analysis details:', err);
                                    } finally {
                                      setHistoryDetailLoading(false);
                                    }
                                  }}
                                >
                                  <Eye size={16} />
                                  View Details
                                </button>
                                <button
                                  className="ph-action-button ph-delete"
                                  onClick={() => handleDeleteAnalysis(id)}
                                  disabled={deletingAnalysis === id}
                                >
                                  <Trash2 size={16} />
                                  {deletingAnalysis === id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDashboard;
