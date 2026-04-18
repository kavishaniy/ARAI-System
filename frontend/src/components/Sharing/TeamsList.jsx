import React, { useState, useEffect } from 'react';
import {
  Users, Plus, X, ChevronDown, ChevronUp, Calendar, UserPlus, Mail, CheckCircle,
  Upload, Layers, Clock, Search, Eye, Trash2, ArrowLeft, FilePlus,
} from 'lucide-react';
import axios from 'axios';
import { teamService, sharingService } from '../../services/sharing';
import { projectService } from '../../services/projects';
import { analysisService } from '../../services/analysis';
import UploadAnalysis from '../Analysis/UploadAnalysis';
import FigmaProjectInput from '../Analysis/FigmaProjectInput';
import MultipleAnalysisResults from '../Analysis/MultipleAnalysisResults';
import SimplifiedAnalysisResults from '../Analysis/SimplifiedAnalysisResults';
import './TeamsList.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ───────────────────────────────────────────────────────────
   EmailTagsInput for project sharing
──────────────────────────────────────────────────────────── */
const EmailTagsInput = ({ emails, onChange }) => {
  const [input, setInput] = useState('');

  const addEmail = () => {
    const val = input.trim().toLowerCase();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || emails.includes(val)) {
      setInput('');
      return;
    }
    onChange([...emails, val]);
    setInput('');
  };

  const removeEmail = (email) => onChange(emails.filter((e) => e !== email));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(); }
    else if (e.key === 'Backspace' && !input && emails.length > 0) removeEmail(emails[emails.length - 1]);
  };

  return (
    <div className="email-tags-wrapper">
      <div className="email-tags">
        {emails.map((email) => (
          <span key={email} className="email-tag">
            {email}
            <button type="button" onClick={() => removeEmail(email)}><X size={11} /></button>
          </span>
        ))}
        <input
          className="email-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addEmail}
          placeholder={emails.length === 0 ? 'colleague@example.com' : 'Add another…'}
        />
      </div>
      <p className="email-hint">Press Enter or comma after each email address</p>
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   TeamProjectCard - Individual project in a team
──────────────────────────────────────────────────────────── */
const TeamProjectCard = ({ project, teamId, onDelete, onAnalyzeClick }) => {
  const [showShare, setShowShare] = useState(false);
  const [shareEmails, setShareEmails] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(null);

  const handleShare = async (e) => {
    e.preventDefault();
    if (shareEmails.length === 0) return;

    setShareLoading(true);
    setShareError(null);
    setShareSuccess(null);

    try {
      await sharingService.shareProject(project.id, [teamId], shareEmails, 'editor');
      setShareSuccess(`Project shared with ${shareEmails.length} collaborator(s)!`);
      setShareEmails([]);
      setShowShare(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to share project';
      setShareError(typeof errorMsg === 'string' ? errorMsg : 'Failed to share project');
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="team-project-card">
      <div className="project-header">
        <h4 className="project-name">{project.name}</h4>
        <span className="project-badge">Shared</span>
      </div>

      {project.description && <p className="project-description">{project.description}</p>}

      <div className="project-meta">
        <Calendar size={12} />
        {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>

      {shareError && <div className="alert-error" style={{ marginBottom: 10, fontSize: '0.85rem' }}>{shareError}</div>}
      {shareSuccess && <div className="alert-success" style={{ marginBottom: 10, fontSize: '0.85rem' }}><CheckCircle size={12} />{shareSuccess}</div>}

      <div className="project-actions">
        <button className="btn-small" onClick={() => onAnalyzeClick(project)}>
          <Upload size={12} /> Analyze
        </button>
        <button className="btn-small-secondary" onClick={() => setShowShare(!showShare)}>
          {showShare ? 'Cancel' : <><Mail size={12} /> Share</>}
        </button>
        <button className="btn-small-danger" onClick={() => onDelete(project.id)}>
          <Trash2 size={12} />
        </button>
      </div>

      {showShare && (
        <form className="share-form" onSubmit={handleShare}>
          <EmailTagsInput emails={shareEmails} onChange={setShareEmails} />
          <button type="submit" className="btn-share" disabled={shareLoading || shareEmails.length === 0}>
            {shareLoading ? 'Sharing…' : `Share with ${shareEmails.length}`}
          </button>
        </form>
      )}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   TeamAnalysisModal - Analysis within team context
──────────────────────────────────────────────────────────── */
const TeamAnalysisModal = ({ project, teamId, onClose }) => {
  const [tab, setTab] = useState('upload');
  const [uploadResult, setUploadResult] = useState(null);
  const [figmaStep, setFigmaStep] = useState('input');
  const [figmaResults, setFigmaResults] = useState(null);
  const [figmaLoading, setFigmaLoading] = useState(false);
  const [figmaError, setFigmaError] = useState('');

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

  const resetFigma = () => { setFigmaResults(null); setFigmaError(''); setFigmaStep('input'); };
  const resetUpload = () => setUploadResult(null);

  return (
    <div className="analysis-modal-overlay" onClick={onClose}>
      <div className="analysis-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{project.name} - Analysis</h3>
            <p className="modal-subtitle">Analyze screens and share results with your team</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="analysis-tabs">
            <button
              className={`tab-btn ${tab === 'upload' ? 'active' : ''}`}
              onClick={() => setTab('upload')}
            >
              <Upload size={14} /> Upload Analysis
            </button>
            <button
              className={`tab-btn ${tab === 'figma' ? 'active' : ''}`}
              onClick={() => setTab('figma')}
            >
              <Layers size={14} /> Figma Analysis
            </button>
          </div>

          <div className="analysis-content">
            {tab === 'upload' && (
              uploadResult ? (
                <div>
                  <button className="btn-back" onClick={resetUpload}>
                    <ArrowLeft size={13} /> New Analysis
                  </button>
                  <SimplifiedAnalysisResults results={uploadResult} />
                </div>
              ) : (
                <UploadAnalysis onAnalysisComplete={setUploadResult} />
              )
            )}

            {tab === 'figma' && (
              figmaStep === 'results' && figmaResults ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <button className="btn-back" style={{ margin: 0 }} onClick={resetFigma}>
                      <ArrowLeft size={13} /> Back
                    </button>
                    <button className="btn-new-analysis" onClick={resetFigma}>
                      <FilePlus size={13} /> New Analysis
                    </button>
                  </div>
                  <MultipleAnalysisResults results={figmaResults} onNewAnalysis={resetFigma} />
                </div>
              ) : (
                <>
                  {figmaError && <div className="alert-error" style={{ marginBottom: 18 }}>{figmaError}</div>}
                  {figmaLoading ? (
                    <div className="loading-state">
                      <div className="spinner" /> Analyzing frames…
                    </div>
                  ) : (
                    <FigmaProjectInput onProjectSubmit={handleFigmaSubmit} />
                  )}
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   TeamHistoryModal - Team project analysis history
──────────────────────────────────────────────────────────── */
const TeamHistoryModal = ({ teamId, onClose }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => { fetchHistory(); }, [teamId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analysisService.getHistory(1, 50);
      setAnalyses(res.analyses || []);
    } catch {
      setError('Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (analysis) => {
    setSelectedAnalysis({ ...analysis, results: null });
    setViewLoading(true);
    try {
      const fullData = await analysisService.getAnalysis(analysis.analysis_id);
      setSelectedAnalysis({ ...analysis, results: fullData });
    } catch {
      // Keep modal open
    } finally {
      setViewLoading(false);
    }
  };

  const filtered = analyses.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (a.design_name || '').toLowerCase().includes(q) || (a.filename || '').toLowerCase().includes(q);
  });

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Team Analysis History</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="search-bar">
            <Search className="search-icon" size={15} />
            <input
              className="search-input"
              type="text"
              placeholder="Search by design name or filename…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner" /> Loading history…</div>
          ) : analyses.length === 0 ? (
            <div className="empty-state">
              <Clock size={28} color="#0f2557" />
              <h3>No analyses yet</h3>
              <p>Team analyses will appear here.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Search size={26} color="#0f2557" />
              <h3>No results found</h3>
              <p>No analyses match "{searchQuery}".</p>
            </div>
          ) : (
            <ul className="history-list">
              {filtered.map((a) => (
                <li key={a.analysis_id} className="history-item">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="history-name">{a.design_name || 'Untitled'}</p>
                    <div className="history-date"><Calendar size={12} />{new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <button className="btn-small" onClick={() => handleView(a)}>
                    <Eye size={13} /> View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedAnalysis && (
          <div className="analysis-modal-overlay" onClick={() => setSelectedAnalysis(null)}>
            <div className="analysis-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{selectedAnalysis.design_name || 'Analysis Results'}</h3>
                <button className="modal-close" onClick={() => setSelectedAnalysis(null)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                {viewLoading ? (
                  <div className="loading-state"><div className="spinner" /> Loading results…</div>
                ) : selectedAnalysis.results ? (
                  <SimplifiedAnalysisResults results={selectedAnalysis.results} />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   TeamCard - Main team card with projects, analysis, history
──────────────────────────────────────────────────────────── */
const TeamCard = ({ team, onRefresh }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  // Projects
  const [teamProjects, setTeamProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [createError, setCreateError] = useState(null);

  // Analysis & History
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load team projects
  useEffect(() => {
    fetchTeamProjects();
  }, [team.id]);

  const fetchTeamProjects = async () => {
    try {
      setProjectsLoading(true);
      const res = await projectService.getProjects('', 100);
      // Filter projects related to this team (if there's a team_id field)
      setTeamProjects(res.projects || []);
    } catch (err) {
      console.error('Error loading team projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      await teamService.inviteTeamMember(team.id, email, 'member');
      setInviteSuccess(`Collaboration invite sent to ${email}`);
      setInviteEmail('');
      setShowInvite(false);
      onRefresh();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to send invite.';
      setInviteError(typeof errorMsg === 'string' ? errorMsg : 'Failed to send invite.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setCreateError('Project name is required.');
      return;
    }

    try {
      setCreateError(null);
      
      // Create a unique project name by appending team name + timestamp to avoid duplicates
      // This ensures uniqueness even if user creates multiple projects with same name
      // Format: "projectName (teamName) - timestamp"
      const timestamp = Date.now();
      const uniqueProjectName = `${projectName.trim()} (${team.name}) - ${timestamp}`;
      
      console.log('Creating project with unique name:', uniqueProjectName);
      
      const response = await projectService.createProject(
        uniqueProjectName,
        projectDesc.trim()
      );
      
      // Now share this project with the team
      if (response.id) {
        await sharingService.shareProject(
          response.id,
          [team.id],  // Share with this team
          [],         // No individual user emails
          'editor'    // Team members get editor access
        );
      }
      
      setProjectName('');
      setProjectDesc('');
      setShowCreateProject(false);
      await fetchTeamProjects();
    } catch (err) {
      console.error('Full error creating project:', err);
      console.error('Error details:', err.response?.data);
      let errorMsg = 'Failed to create project.';
      
      // Check for duplicate key error
      if (err.response?.data?.code === '23505' || 
          err.response?.data?.message?.includes('duplicate key')) {
        errorMsg = '⚠️ A project with this name already exists. Try a different name.';
        console.error('Duplicate key detected:', err.response?.data);
      } else if (err.response?.status === 401) {
        errorMsg = '🔐 Session expired. Please log in again.';
        localStorage.removeItem('access_token');
      } else if (err.response?.status === 500) {
        errorMsg = '⚠️ Server error (500). Backend may be down or experiencing issues.';
        console.error('Server response:', err.response?.data);
      } else if (err.response?.status === 403) {
        errorMsg = '❌ Access denied. You may not have permission to create projects.';
      } else if (err.message === 'Network Error') {
        errorMsg = '🌐 Network error. Check if backend is running on localhost:8000';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      // Extract just the error message if it contains a dict
      if (typeof errorMsg === 'object') {
        errorMsg = errorMsg.message || JSON.stringify(errorMsg);
      }
      setCreateError(typeof errorMsg === 'string' ? errorMsg : 'Failed to create project.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await projectService.deleteProject(projectId);
      await fetchTeamProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  return (
    <div className="team-card-container">
      <div className="team-card-main">
        <div className="team-header">
          <h3 className="team-name">{team.name}</h3>
          <span className="member-badge"><Users size={11} />{team.members?.length || 0}</span>
        </div>

        {team.description && <p className="team-description">{team.description}</p>}

        <div className="team-info-meta">
          <Calendar size={11} />
          {new Date(team.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>

        {inviteError && <div className="alert-error" style={{ marginBottom: 12, fontSize: '0.85rem' }}>{inviteError}</div>}
        {inviteSuccess && <div className="alert-success" style={{ marginBottom: 12, fontSize: '0.85rem' }}><CheckCircle size={14} />{inviteSuccess}</div>}

        <div className="team-action-buttons">
          <button
            className="btn-outline"
            onClick={() => { setShowMembers(!showMembers); setShowInvite(false); }}
          >
            {showMembers ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showMembers ? 'Hide Members' : 'View Members'}
          </button>
          <button
            className="btn-outline"
            onClick={() => { setShowInvite(!showInvite); setShowMembers(true); }}
          >
            <UserPlus size={13} /> Invite
          </button>
        </div>

        {showMembers && (
          <div className="members-section">
            <p className="members-label">Members ({team.members?.length || 0})</p>
            {(!team.members || team.members.length === 0) ? (
              <p style={{ fontSize: '0.85rem', color: 'rgba(15,37,87,0.45)', marginBottom: 10 }}>
                No members yet — invite your first collaborator.
              </p>
            ) : (
              <ul className="members-list">
                {team.members.map((m) => (
                  <li key={m.id} className="member-item">
                    <span className="member-email">{m.email || 'Unknown'}</span>
                    <span className={`role-badge role-${m.role}`}>{m.role}</span>
                  </li>
                ))}
              </ul>
            )}

            {showInvite && (
              <form className="invite-row" onSubmit={handleInvite}>
                <input
                  type="email"
                  className="input-email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                  disabled={inviteLoading}
                />
                <button type="submit" className="btn-invite" disabled={inviteLoading}>
                  {inviteLoading ? 'Sending…' : 'Send Invite'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Projects & Analysis Tab Area */}
      <div className="team-content-tabs">
        <div className="content-tab-buttons">
          <button
            className={`content-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <Plus size={13} /> Projects
          </button>
          <button
            className={`content-tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <Upload size={13} /> Analysis
          </button>
          <button
            className={`content-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock size={13} /> History
          </button>
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="projects-tab-content">
            <div className="projects-header">
              <h4 className="section-title">Shared Projects</h4>
              <button className="btn-small" onClick={() => setShowCreateProject(!showCreateProject)}>
                {showCreateProject ? 'Cancel' : <><Plus size={12} /> New Project</>}
              </button>
            </div>

            {createError && <div className="alert-error" style={{ marginBottom: 14 }}>{createError}</div>}

            {showCreateProject && (
              <form className="create-project-form" onSubmit={handleCreateProject}>
                <div className="form-row">
                  <input
                    type="text"
                    className="form-input"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project name"
                    required
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="Description (optional)"
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn-create">Create</button>
                  <button type="button" className="btn-cancel" onClick={() => setShowCreateProject(false)}>Cancel</button>
                </div>
              </form>
            )}

            {projectsLoading ? (
              <div className="loading-state"><div className="spinner" /> Loading projects…</div>
            ) : teamProjects.length === 0 ? (
              <div className="empty-state">
                <p>No projects yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="projects-grid">
                {teamProjects.map((project) => (
                  <TeamProjectCard
                    key={project.id}
                    project={project}
                    teamId={team.id}
                    onAnalyzeClick={setSelectedProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="analysis-tab-content">
            <p style={{ color: 'rgba(15,37,87,0.5)', textAlign: 'center', padding: '40px 20px' }}>
              Select a project above to run analyses for your team.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedProject && (
        <TeamAnalysisModal project={selectedProject} teamId={team.id} onClose={() => setSelectedProject(null)} />
      )}

      {showHistory && (
        <TeamHistoryModal teamId={team.id} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   TeamsList
──────────────────────────────────────────────────────────── */
const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in before fetching teams
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('🔐 Please log in to access teams');
      setLoading(false);
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('🔐 Please log in to access teams');
        setLoading(false);
        return;
      }
      
      const response = await teamService.getTeams();
      setTeams(response.teams || []);
      setError(null);
    } catch (err) {
      console.error('Full error:', err);
      let errorMsg = 'Failed to load teams';
      
      if (err.response?.status === 401) {
        errorMsg = '🔐 Session expired. Please log in again.';
        localStorage.removeItem('access_token');
      } else if (err.response?.status === 500) {
        errorMsg = '⚠️ Server error (500). Backend may be down or experiencing issues.';
        console.error('Server response:', err.response?.data);
      } else if (err.response?.status === 403) {
        errorMsg = '❌ Access denied. You may not have permission to view teams.';
      } else if (err.message === 'Network Error') {
        errorMsg = '🌐 Network error. Check if backend is running on localhost:8000';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="teams-container loading"><div className="spinner" />Loading teams...</div>;
  }

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h2>📁 Teams & Projects</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      {teams.length === 0 ? (
        <div className="empty-state">
          <p>No teams yet. Join or create a team to start collaborating!</p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onRefresh={fetchTeams} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsList;
