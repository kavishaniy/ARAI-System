import React, { useState } from 'react';

const CreateProjectModal = ({ isOpen, onClose, onCreate, isCreating }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    if (projectName.trim().length < 1) {
      setError('Project name must be at least 1 character');
      return;
    }

    if (projectName.trim().length > 255) {
      setError('Project name must be less than 255 characters');
      return;
    }

    if (projectDescription.length > 1000) {
      setError('Description must be less than 1000 characters');
      return;
    }

    try {
      await onCreate({
        name: projectName.trim(),
        description: projectDescription.trim(),
      });
      
      // Reset form
      setProjectName('');
      setProjectDescription('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    }
  };

  const css = `
    .create-modal-overlay {
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

    .create-modal-content {
      background: white;
      border-radius: 16px;
      max-width: 600px;
      width: 100%;
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

    .create-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      border-bottom: 1.5px solid rgba(15, 37, 87, 0.1);
      background: linear-gradient(135deg, rgba(15, 37, 87, 0.02) 0%, rgba(100, 180, 255, 0.02) 100%);
    }

    .create-modal-title {
      margin: 0;
      font-family: 'DM Serif Display', serif;
      font-size: 1.5rem;
      font-weight: 400;
      color: #0f2557;
    }

    .create-modal-close {
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
      font-size: 1.5rem;
    }

    .create-modal-close:hover {
      background: rgba(15, 37, 87, 0.1);
      color: #0f2557;
    }

    .create-project-form {
      padding: 32px;
    }

    .create-form-error {
      padding: 12px 16px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
      border: 1.5px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      color: #991b1b;
      font-size: 0.9rem;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .create-form-error-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .create-form-group {
      margin-bottom: 24px;
    }

    .create-form-group:last-of-type {
      margin-bottom: 32px;
    }

    .create-form-label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f2557;
    }

    .create-required-indicator {
      color: rgba(15, 37, 87, 0.5);
      font-weight: 400;
      font-size: 0.85rem;
    }

    .create-optional-indicator {
      color: rgba(15, 37, 87, 0.4);
      font-weight: 400;
      font-size: 0.85rem;
    }

    .create-form-input {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid rgba(15, 37, 87, 0.15);
      border-radius: 8px;
      font-size: 0.95rem;
      color: #0f2557;
      background: white;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .create-form-input::placeholder {
      color: rgba(15, 37, 87, 0.4);
    }

    .create-form-input:focus {
      outline: none;
      border-color: #0f2557;
      box-shadow: 0 0 0 3px rgba(15, 37, 87, 0.08);
      background: white;
    }

    .create-form-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: rgba(15, 37, 87, 0.02);
    }

    .create-form-textarea {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid rgba(15, 37, 87, 0.15);
      border-radius: 8px;
      font-size: 0.95rem;
      color: #0f2557;
      background: white;
      transition: all 0.2s ease;
      font-family: inherit;
      resize: vertical;
      min-height: 100px;
    }

    .create-form-textarea::placeholder {
      color: rgba(15, 37, 87, 0.4);
    }

    .create-form-textarea:focus {
      outline: none;
      border-color: #0f2557;
      box-shadow: 0 0 0 3px rgba(15, 37, 87, 0.08);
      background: white;
    }

    .create-form-textarea:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: rgba(15, 37, 87, 0.02);
    }

    .create-char-count {
      text-align: right;
      font-size: 0.8rem;
      color: rgba(15, 37, 87, 0.5);
      margin-top: 6px;
    }

    .create-form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .create-btn {
      padding: 11px 24px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .create-btn-secondary {
      background: transparent;
      color: rgba(15, 37, 87, 0.6);
      border: 1.5px solid rgba(15, 37, 87, 0.15);
    }

    .create-btn-secondary:hover:not(:disabled) {
      background: rgba(15, 37, 87, 0.05);
      color: #0f2557;
      border-color: rgba(15, 37, 87, 0.3);
    }

    .create-btn-primary {
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
    }

    .create-btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
    }

    .create-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .create-spinner-small {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      .create-modal-overlay {
        padding: 16px;
      }

      .create-modal-content {
        max-width: 100%;
      }

      .create-modal-header {
        padding: 16px 20px;
      }

      .create-modal-title {
        font-size: 1.3rem;
      }

      .create-project-form {
        padding: 20px;
      }

      .create-form-actions {
        gap: 8px;
      }

      .create-btn {
        flex: 1;
        justify-content: center;
      }
    }
  `;

  if (!isOpen) return null;

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <style>{css}</style>
      <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="create-modal-header">
          <h2 className="create-modal-title">Create New Project</h2>
          <button className="create-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-project-form">
          {/* Error Message */}
          {error && (
            <div className="create-form-error">
              <span className="create-form-error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Project Name Field */}
          <div className="create-form-group">
            <label htmlFor="project-name" className="create-form-label">
              Project Name <span className="create-required-indicator">(required)</span>
            </label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Mobile App Design, Website Redesign"
              maxLength={255}
              disabled={isCreating}
              className="create-form-input"
              autoFocus
            />
            <div className="create-char-count">
              {projectName.length}/255
            </div>
          </div>

          {/* Project Description Field */}
          <div className="create-form-group">
            <label htmlFor="project-description" className="create-form-label">
              Description <span className="create-optional-indicator">(optional)</span>
            </label>
            <textarea
              id="project-description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Add a brief description of your project..."
              maxLength={1000}
              disabled={isCreating}
              rows={4}
              className="create-form-textarea"
            />
            <div className="create-char-count">
              {projectDescription.length}/1000
            </div>
          </div>

          {/* Form Actions */}
          <div className="create-form-actions">
            <button
              type="button"
              className="create-btn create-btn-secondary"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-btn create-btn-primary"
              disabled={isCreating || !projectName.trim()}
            >
              {isCreating ? (
                <>
                  <span className="create-spinner-small"></span> Creating...
                </>
              ) : (
                '✓ Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
