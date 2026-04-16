import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../Common/Sidebar';
import CreateProjectModal from './CreateProjectModal';
import ProjectDashboard from './ProjectDashboard';
import { projectService } from '../../services/projects';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  // Fetch projects on component mount
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjects(searchTerm);
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (projectData) => {
    try {
      setCreatingProject(true);
      const newProject = await projectService.createProject(
        projectData.name,
        projectData.description
      );
      
      // Add new project to list
      setProjects([newProject, ...projects]);
      setShowCreateModal(false);
      
      // Auto-select and show the newly created project
      setSelectedProject(newProject);
      
      console.log('✅ Project created successfully:', newProject);
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project. Please try again.');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingProjectId(projectId);
      await projectService.deleteProject(projectId);
      
      // Remove from list
      setProjects(projects.filter(p => p.id !== projectId));
      
      // Close project dashboard if the deleted project was selected
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      
      console.log('✅ Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    } finally {
      setDeletingProjectId(null);
    }
  };

  // If a project is selected, show the dashboard
  if (selectedProject) {
    return (
      <ProjectDashboard 
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onDelete={handleDeleteProject}
      />
    );
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const css = `
    .projects-page-wrapper {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
      width: 100%;
    }

    .projects-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 32px 40px;
      width: 100%;
      margin-left: 0;
      overflow-y: auto;
    }

    .projects-header {
      max-width: 1200px;
      margin: 0 auto 32px;
      width: 100%;
    }

    .projects-title {
      margin: 0 0 8px 0;
      font-family: 'DM Serif Display', serif;
      font-size: 2.2rem;
      font-weight: 400;
      color: #0f2557;
      line-height: 1.2;
    }

    .projects-subtitle {
      font-size: 0.95rem;
      color: rgba(15, 37, 87, 0.6);
      font-weight: 300;
      letter-spacing: 0.3px;
      margin: 0;
    }

    .projects-search-wrapper {
      margin-top: 20px;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .projects-search-container {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .projects-search-input {
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

    .projects-search-input::placeholder {
      color: rgba(15, 37, 87, 0.4);
    }

    .projects-search-input:focus {
      outline: none;
      border-color: #64b4ff;
      box-shadow: 0 0 0 3px rgba(100, 180, 255, 0.1);
      background: white;
    }

    .search-icon-projects {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(15, 37, 87, 0.4);
      pointer-events: none;
      width: 18px;
      height: 18px;
    }

    .search-clear-btn-projects {
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

    .search-clear-btn-projects:hover {
      color: rgba(15, 37, 87, 0.7);
    }

    .projects-search-results {
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      margin-top: 4px;
      white-space: nowrap;
    }

    .projects-button {
      padding: 11px 20px;
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .projects-button:hover {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
    }

    .projects-container {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      flex: 1;
    }

    .projects-main {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
      padding: 0;
      box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
      overflow: hidden;
    }

    .projects-error {
      padding: 20px 40px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
      border-bottom: 1.5px solid rgba(239, 68, 68, 0.2);
      color: #991b1b;
      font-size: 0.95rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .projects-error button {
      background: none;
      border: none;
      color: #991b1b;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0;
    }

    .projects-empty {
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

    .projects-list {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .projects-item {
      padding: 24px 40px;
      border-bottom: 1px solid rgba(15, 37, 87, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .projects-item:last-child {
      border-bottom: none;
    }

    .projects-item:hover {
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.03) 100%);
    }

    .projects-item-content {
      flex: 1;
      min-width: 0;
    }

    .projects-item-name {
      margin: 0 0 8px 0;
      font-weight: 600;
      color: #0f2557;
      font-size: 1rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .projects-item-description {
      margin: 0 0 12px 0;
      color: rgba(15, 37, 87, 0.6);
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .projects-item-meta {
      display: flex;
      gap: 24px;
      align-items: center;
      font-size: 0.85rem;
      color: rgba(15, 37, 87, 0.6);
      flex-wrap: wrap;
    }

    .projects-item-stat {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .projects-item-actions {
      display: flex;
      gap: 12px;
    }

    .projects-delete-btn {
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

    .projects-delete-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }

    .projects-delete-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .projects-loading {
      padding: 60px 40px;
      text-align: center;
    }

    .projects-spinner {
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

    .projects-loading p {
      color: rgba(15, 37, 87, 0.6);
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .projects-content {
        padding: 32px 20px;
      }

      .projects-title {
        font-size: 1.8rem;
      }

      .projects-item {
        padding: 16px 20px;
        flex-direction: column;
        align-items: flex-start;
      }

      .projects-item-meta {
        width: 100%;
        flex-direction: column;
        gap: 12px;
      }

      .projects-item-actions {
        align-self: flex-end;
      }

      .projects-search-wrapper {
        flex-direction: column;
      }

      .projects-button {
        width: 100%;
      }
    }
  `;

  if (selectedProject) {
    return (
      <div className="projects-page-wrapper">
        <Sidebar />
        <ProjectDashboard 
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onDelete={handleDeleteProject}
        />
      </div>
    );
  }

  return (
    <div className="projects-page-wrapper">
      <Sidebar />
      <main className="projects-content">
        <style>{css}</style>
        
        {/* Header */}
        <div className="projects-header">
          <h1 className="projects-title">Projects</h1>
          <p className="projects-subtitle">Organize and manage your design analyses</p>
          
          <div className="projects-search-wrapper">
            <div className="projects-search-container">
              <svg className="search-icon-projects" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search projects by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="projects-search-input"
              />
              {searchTerm && (
                <button 
                  className="search-clear-btn-projects"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>
            <button 
              className="projects-button"
              onClick={() => setShowCreateModal(true)}
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Container */}
        <div className="projects-container">
          {/* Error */}
          {error && (
            <div className="projects-main" style={{ marginBottom: '20px' }}>
              <div className="projects-error">
                <span>{error}</span>
                <button onClick={() => setError(null)}>×</button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="projects-main">
            {loading ? (
              <div className="projects-loading">
                <div className="projects-spinner"></div>
                <p>Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="projects-empty">
                <div className="empty-icon">📁</div>
                <h2 className="empty-title">No Projects Yet</h2>
                <p className="empty-text">Create your first project to get started with design analysis</p>
                <button 
                  className="projects-button"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create Project
                </button>
              </div>
            ) : (
              <ul className="projects-list">
                {projects.map(project => (
                  <li 
                    key={project.id}
                    className="projects-item"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="projects-item-content">
                      <h3 className="projects-item-name">{project.name}</h3>
                      {project.description && (
                        <p className="projects-item-description">{project.description}</p>
                      )}
                      <div className="projects-item-meta">
                        <div className="projects-item-stat">
                          <span>📊</span>
                          <span>{project.analysis_count || 0} analyses</span>
                        </div>
                        <div className="projects-item-stat">
                          <span>📅</span>
                          <span>{formatDate(project.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="projects-item-actions">
                      <button
                        className="projects-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        disabled={deletingProjectId === project.id}
                        title="Delete project"
                      >
                        {deletingProjectId === project.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Modal */}
        {showCreateModal && (
          <CreateProjectModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateProject}
            isCreating={creatingProject}
          />
        )}
      </main>
    </div>
  );
};

export default Projects;

