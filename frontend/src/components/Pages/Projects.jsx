import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Trash2, BarChart2 } from 'lucide-react';
import Sidebar from '../Common/Sidebar';
import PageHeader from '../Common/PageHeader';
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
    .page-shell {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
    }

    .page-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 240px;
      transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .page-main {
      flex: 1;
      padding: 32px 40px;
      overflow-y: auto;
    }

    @media (max-width: 1024px) {
      .page-main {
        padding: 24px 30px;
      }
    }

    @media (max-width: 1024px) {
      .page-container {
        margin-left: 80px;
      }
    }

    @media (max-width: 768px) {
      .page-container {
        margin-left: 60px;
      }

      .page-main {
        padding: 20px 16px;
      }
    }

    @media (max-width: 480px) {
      .page-container {
        margin-left: 56px;
      }

      .page-main {
        padding: 16px 12px;
      }
    }

    .page-content {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .projects-search-input {
      width: 100%;
      max-width: 600px;
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
      .projects-search-input {
        font-size: 0.85rem;
        padding: 10px 14px 10px 36px;
      }
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

    @media (max-width: 480px) {
      .search-icon-projects {
        width: 16px;
        height: 16px;
        left: 10px;
      }
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

    @media (max-width: 768px) {
      .projects-button {
        padding: 10px 16px;
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .projects-button {
        width: 100%;
        padding: 10px 14px;
        font-size: 0.8rem;
      }
    }
    }

    .projects-button:hover {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
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

    @media (max-width: 480px) {
      .projects-error {
        padding: 16px 20px;
        font-size: 0.85rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
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

    @media (max-width: 768px) {
      .projects-empty {
        padding: 40px 24px;
      }
    }

    @media (max-width: 480px) {
      .projects-empty {
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

    @media (max-width: 768px) {
      .projects-item {
        padding: 18px 24px;
        gap: 16px;
        flex-wrap: wrap;
      }
    }

    @media (max-width: 480px) {
      .projects-item {
        padding: 14px 16px;
        gap: 12px;
        flex-direction: column;
        align-items: flex-start;
      }
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

    @media (max-width: 480px) {
      .projects-item-content {
        width: 100%;
      }
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

    @media (max-width: 480px) {
      .projects-item-name {
        font-size: 0.95rem;
      }
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
      <div className="page-shell">
        <Sidebar />
        <ProjectDashboard 
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onDelete={handleDeleteProject}
        />
      </div>
    );
  }

  const headerActions = (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
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
  );

  return (
    <div className="page-shell">
      <Sidebar />
      <main className="page-container">
        <style>{css}</style>
        
        <PageHeader 
          title="Projects"
          subtitle="Organize and manage your design analyses"
          actions={headerActions}
        />

        <div className="page-main">
          <div className="page-content">
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
                  <div className="empty-icon">�</div>
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
                            <BarChart2 size={16} />
                            <span>{project.analysis_count || 0} analyses</span>
                          </div>
                          <div className="projects-item-stat">
                            <Calendar size={16} />
                            <span>{formatDate(project.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="projects-item-actions">
                        <button
                          className="action-button delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          disabled={deletingProjectId === project.id}
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                          {deletingProjectId === project.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
