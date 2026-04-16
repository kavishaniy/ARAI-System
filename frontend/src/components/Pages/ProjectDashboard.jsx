import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../Common/Sidebar';
import { projectService } from '../../services/projects';
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

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjectDetail(project.id);
      setProjectDetails(data);
      setAnalyses(data.analyses || []);
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
      margin-left: 0;
      overflow-x: auto;
    }

    .dashboard-header-top {
      max-width: 1200px;
      margin: 0 auto 32px;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .dashboard-back-btn {
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .dashboard-back-btn:hover {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
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
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.03) 100%);
      border: none;
      border-radius: 16px;
      padding: 20px 32px;
      margin-bottom: 32px;
      box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
      transition: all 0.3s ease;
    }

    .project-header-main:hover {
      box-shadow: 0 15px 50px rgba(15, 37, 87, 0.1);
    }

    .project-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }

    .project-title-section {
      flex: 1;
    }

    .project-name-main {
      margin: 0 0 8px 0;
      font-family: 'DM Serif Display', serif;
      font-size: 1.8rem;
      font-weight: 400;
      color: #0f2557;
      line-height: 1.2;
    }

    .project-subtitle-main {
      color: rgba(15, 37, 87, 0.6);
      font-size: 0.9rem;
      margin: 0;
      font-weight: 300;
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
      gap: 10px;
      align-items: center;
    }

    .project-btn {
      padding: 11px 18px;
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

    .dashboard-stat-icon {
      font-size: 2.5rem;
      opacity: 0.7;
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

    .dashboard-stat-value {
      display: block;
      font-family: 'DM Serif Display', serif;
      font-size: 1.8rem;
      font-weight: 400;
      color: #0f2557;
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
        padding: 24px;
      }

      .project-header-content {
        flex-direction: column;
      }

      .project-actions-main {
        width: 100%;
        flex-wrap: wrap;
      }

      .project-btn {
        flex: 1;
        min-width: 120px;
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
                <button className="dashboard-back-btn" onClick={onBack}>
                  ← Back
                </button>
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
                      {isSaving ? '⏳ Saving...' : '✓ Save'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="project-btn project-btn-secondary"
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="project-btn project-btn-danger"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this project?')) {
                          onDelete(project.id);
                        }
                      }}
                    >
                      🗑️ Delete
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
                + Analyze Design
              </button>
              <button
                className={`dashboard-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                History ({analyses.length})
              </button>
              <button
                className={`dashboard-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
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
                      onAnalysisComplete={(results) => {
                        // Show the analysis results
                        setAnalysisResults(results);
                        // Also refresh the analyses list in background
                        fetchProjectDetails();
                      }}
                    />
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <div className="overview-card-main">
                    <h3 className="overview-card-title">Project Information</h3>
                    <div className="info-grid-main">
                      <div className="info-item-main">
                        <span className="info-label-main">Project Name</span>
                        <span className="info-value-main">{projectDetails.name}</span>
                      </div>
                      <div className="info-item-main">
                        <span className="info-label-main">Description</span>
                        <span className="info-value-main">
                          {projectDetails.description || 'No description provided'}
                        </span>
                      </div>
                      <div className="info-item-main">
                        <span className="info-label-main">Total Analyses</span>
                        <span className="info-value-main">{analyses.length}</span>
                      </div>
                      <div className="info-item-main">
                        <span className="info-label-main">Created Date</span>
                        <span className="info-value-main">
                          {new Date(projectDetails.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {analyses.length > 0 && (
                    <div className="overview-card-main">
                      <h3 className="overview-card-title">Quick Stats</h3>
                      <div className="quick-stats-main">
                        {analyses.some(a => a.accessibility_score) && (
                          <div className="quick-stat-main">
                            <span className="quick-stat-label-main">Avg Accessibility</span>
                            <span className="quick-stat-value-main">
                              {(
                                analyses.reduce((sum, a) => sum + (a.accessibility_score || 0), 0) /
                                analyses.filter(a => a.accessibility_score).length
                              ).toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {analyses.some(a => a.readability_score) && (
                          <div className="quick-stat-main">
                            <span className="quick-stat-label-main">Avg Readability</span>
                            <span className="quick-stat-value-main">
                              {(
                                analyses.reduce((sum, a) => sum + (a.readability_score || 0), 0) /
                                analyses.filter(a => a.readability_score).length
                              ).toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {analyses.some(a => a.attention_score) && (
                          <div className="quick-stat-main">
                            <span className="quick-stat-label-main">Avg Attention</span>
                            <span className="quick-stat-value-main">
                              {(
                                analyses.reduce((sum, a) => sum + (a.attention_score || 0), 0) /
                                analyses.filter(a => a.attention_score).length
                              ).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  {analyses.length === 0 ? (
                    <div className="analyses-empty">
                      <div className="analyses-empty-icon">📊</div>
                      <h3 className="analyses-empty-title">No Analyses Yet</h3>
                      <p className="analyses-empty-text">Start analyzing designs to see results here</p>
                    </div>
                  ) : (
                    <div className="analyses-list-main">
                      {analyses.map(analysis => (
                        <div key={analysis.id} className="analysis-item-main">
                          <div className="analysis-header-main">
                            <h4 className="analysis-title-main">{analysis.design_name}</h4>
                            <span className="analysis-date-main">
                              {new Date(analysis.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="analysis-scores-main">
                            <div className="analysis-score-badge">
                              <span className="analysis-score-label">Accessibility</span>
                              <span className="analysis-score-value">
                                {analysis.accessibility_score?.toFixed(1) || 'N/A'}%
                              </span>
                            </div>
                            <div className="analysis-score-badge">
                              <span className="analysis-score-label">Readability</span>
                              <span className="analysis-score-value">
                                {analysis.readability_score?.toFixed(1) || 'N/A'}%
                              </span>
                            </div>
                            <div className="analysis-score-badge">
                              <span className="analysis-score-label">Attention</span>
                              <span className="analysis-score-value">
                                {analysis.attention_score?.toFixed(1) || 'N/A'}%
                              </span>
                            </div>
                            {analysis.overall_score && (
                              <div className="analysis-score-badge overall">
                                <span className="analysis-score-label">Overall</span>
                                <span className="analysis-score-value">
                                  {analysis.overall_score.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>

                          <a href={`/analysis/${analysis.id}`} className="analysis-view-btn">
                            View Details →
                          </a>
                        </div>
                      ))}
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
