import React, { useState, useEffect } from 'react';
import { sharingService, teamService } from '../../services/sharing';
import './ShareDialog.css';

const ShareDialog = ({ projectId, onClose, onShare }) => {
  const [teams, setTeams] = useState([]);
  const [shares, setShares] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [userEmails, setUserEmails] = useState('');
  const [accessLevel, setAccessLevel] = useState('viewer');
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [teamsResponse, sharesResponse] = await Promise.all([
          teamService.getTeams(),
          sharingService.getProjectShares(projectId),
        ]);
        setTeams(teamsResponse.teams || []);
        setShares(sharesResponse.shares || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load sharing information');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [projectId]);

  const handleToggleTeam = (teamId) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleShare = async (e) => {
    e.preventDefault();
    
    if (selectedTeams.length === 0 && userEmails.trim() === '') {
      setError('Please select at least one team or enter user emails');
      return;
    }

    try {
      setSharing(true);
      setError(null);

      const emails = userEmails
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email);

      await sharingService.shareProject(
        projectId,
        selectedTeams,
        emails,
        accessLevel
      );

      setSuccess('Project shared successfully!');
      setSelectedTeams([]);
      setUserEmails('');
      setAccessLevel('viewer');

      // Refresh shares list
      const sharesResponse = await sharingService.getProjectShares(projectId);
      setShares(sharesResponse.shares || []);

      if (onShare) {
        onShare();
      }

      // Close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error sharing project:', err);
      setError(err.response?.data?.detail || 'Failed to share project');
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveShare = async (shareId) => {
    if (!window.confirm('Are you sure you want to remove this share?')) {
      return;
    }

    try {
      await sharingService.removeProjectShare(projectId, shareId);
      const sharesResponse = await sharingService.getProjectShares(projectId);
      setShares(sharesResponse.shares || []);
      setSuccess('Share removed successfully');
    } catch (err) {
      setError('Failed to remove share');
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>Share Project</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="share-form-section">
          <h3>Share With Teams</h3>
          {teams.length === 0 ? (
            <p className="empty-message">No teams available. Create a team first!</p>
          ) : (
            <div className="teams-checkbox-list">
              {teams.map((team) => (
                <label key={team.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team.id)}
                    onChange={() => handleToggleTeam(team.id)}
                  />
                  <div className="checkbox-content">
                    <span className="team-name">{team.name}</span>
                    {team.description && (
                      <span className="team-desc">{team.description}</span>
                    )}
                    <span className="member-count">
                      {team.members?.length || 0} member(s)
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="divider">OR</div>

        <div className="share-form-section">
          <h3>Share With Users (Email)</h3>
          <textarea
            value={userEmails}
            onChange={(e) => setUserEmails(e.target.value)}
            placeholder="user1@example.com, user2@example.com"
            rows="3"
            className="email-input"
          />
          <small className="helper-text">
            Enter one or more email addresses separated by commas
          </small>
        </div>

        <div className="share-form-section">
          <label>Access Level</label>
          <div className="access-level-options">
            <label className="radio-item">
              <input
                type="radio"
                value="viewer"
                checked={accessLevel === 'viewer'}
                onChange={(e) => setAccessLevel(e.target.value)}
              />
              <div className="radio-content">
                <span>👁️ Viewer</span>
                <small>Can view only</small>
              </div>
            </label>
            <label className="radio-item">
              <input
                type="radio"
                value="editor"
                checked={accessLevel === 'editor'}
                onChange={(e) => setAccessLevel(e.target.value)}
              />
              <div className="radio-content">
                <span>✏️ Editor</span>
                <small>Can view and edit</small>
              </div>
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={sharing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleShare}
            disabled={sharing || (selectedTeams.length === 0 && userEmails.trim() === '')}
          >
            {sharing ? 'Sharing...' : 'Share Project'}
          </button>
        </div>

        {shares.length > 0 && (
          <div className="current-shares">
            <h3>Current Shares ({shares.length})</h3>
            <div className="shares-list">
              {shares.map((share) => (
                <div key={share.id} className="share-item">
                  <div className="share-info">
                    <span className="share-with">
                      {share.team_id
                        ? `🏢 Team ${share.team_id.substring(0, 8)}`
                        : `👤 User ${share.user_id.substring(0, 8)}`}
                    </span>
                    <span className={`access-level-badge access-${share.access_level}`}>
                      {share.access_level}
                    </span>
                  </div>
                  <button
                    className="btn btn-remove"
                    onClick={() => handleRemoveShare(share.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareDialog;
