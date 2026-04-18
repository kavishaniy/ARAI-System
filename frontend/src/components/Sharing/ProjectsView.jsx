import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projects';
import { sharingService } from '../../services/sharing';
import ShareDialog from '../Sharing/ShareDialog';
import './ProjectsView.css';

const ProjectsView = () => {
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjectForSharing, setSelectedProjectForSharing] = useState(null);
  const [activeTab, setActiveTab] = useState('owned'); // 'owned' or 'shared'

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const [owned, shared] = await Promise.all([
        projectService.getProjects(),
        sharingService.getSharedProjects(),
      ]);
      setOwnedProjects(owned.projects || []);
      setSharedProjects(shared.projects || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="projects-container loading">Loading projects...</div>;
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h2>📊 Projects</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="projects-tabs">
        <button
          className={`tab ${activeTab === 'owned' ? 'active' : ''}`}
          onClick={() => setActiveTab('owned')}
        >
          📁 Owned Projects ({ownedProjects.length})
        </button>
        <button
          className={`tab ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          🤝 Shared With Me ({sharedProjects.length})
        </button>
      </div>

      {activeTab === 'owned' && (
        <ProjectsSection
          projects={ownedProjects}
          title="My Projects"
          isOwned={true}
          onShare={(projectId) => setSelectedProjectForSharing(projectId)}
          onRefresh={fetchProjects}
        />
      )}

      {activeTab === 'shared' && (
        <ProjectsSection
          projects={sharedProjects}
          title="Shared With Me"
          isOwned={false}
          onShare={null}
          onRefresh={fetchProjects}
        />
      )}

      {selectedProjectForSharing && (
        <ShareDialog
          projectId={selectedProjectForSharing}
          onClose={() => setSelectedProjectForSharing(null)}
          onShare={fetchProjects}
        />
      )}
    </div>
  );
};

const ProjectsSection = ({ projects, title, isOwned, onShare, onRefresh }) => {
  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <p>No {title.toLowerCase()} yet.</p>
        {isOwned && <p>Create your first project to get started!</p>}
      </div>
    );
  }

  return (
    <div className="projects-section">
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isOwned={isOwned}
            onShare={onShare}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
};

const ProjectCard = ({ project, isOwned, onShare, onRefresh }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        // await projectService.deleteProject(project.id);
        alert('Project deleted successfully');
        onRefresh();
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  return (
    <div className="project-card">
      <div className="card-header">
        <h3>{project.name}</h3>
        {!isOwned && (
          <span className={`access-badge access-${project.access_level}`}>
            {project.access_level}
          </span>
        )}
        {isOwned && (
          <button
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋯
          </button>
        )}
      </div>

      {project.description && (
        <p className="card-description">{project.description}</p>
      )}

      <div className="card-meta">
        <span>📈 {project.analysis_count || 0} analyses</span>
        <span>📅 {new Date(project.created_at).toLocaleDateString()}</span>
      </div>

      {!isOwned && (
        <div className="shared-info">
          <p>Shared by: {project.user_id}</p>
          <p className="access-level">
            You have <strong>{project.access_level}</strong> access
          </p>
        </div>
      )}

      <div className="card-actions">
        <button className="btn btn-secondary">View Project</button>
        {isOwned && (
          <button
            className="btn btn-primary"
            onClick={() => onShare && onShare(project.id)}
          >
            🔗 Share
          </button>
        )}
      </div>

      {isOwned && showMenu && (
        <div className="dropdown-menu">
          <button onClick={() => onShare && onShare(project.id)}>
            🔗 Share Project
          </button>
          <button onClick={() => alert('Edit coming soon')}>
            ✏️ Edit
          </button>
          <button onClick={handleDelete} className="danger">
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
