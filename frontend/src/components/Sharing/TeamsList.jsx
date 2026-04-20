import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ChevronDown, ChevronUp, Calendar, UserPlus, CheckCircle,
} from 'lucide-react';
import { teamService } from '../../services/sharing';
import './TeamsList.css';

/* ───────────────────────────────────────────────────────────
   TeamCard - Main team card with analysis and history
──────────────────────────────────────────────────────────── */
const TeamCard = ({ team, onRefresh }) => {
  const navigate = useNavigate();
  const [showMembers, setShowMembers] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  // Load team projects
  useEffect(() => {
    // Cleanup if needed
  }, [team.id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const result = await teamService.inviteTeamMember(team.id, email, 'member');
      
      // Handle both successful and pending_signup status
      if (result.status === 'pending_signup' || result.status === 'not_found') {
        setInviteSuccess(`✉️ ${result.message} (they'll be automatically added after signing up)`);
      } else {
        setInviteSuccess(`Collaboration invite sent to ${email}`);
      }
      
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

  return (
    <>
      {/* Team Card - Clickable to view details */}
      <div 
        className="team-card-container"
        onClick={() => navigate(`/teams/${team.id}`)}
        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
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
              onClick={(e) => { e.stopPropagation(); setShowMembers(!showMembers); setShowInvite(false); }}
            >
              {showMembers ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showMembers ? 'Hide Members' : 'View Members'}
            </button>
            <button
              className="btn-outline"
              onClick={(e) => { e.stopPropagation(); setShowInvite(!showInvite); setShowMembers(true); }}
            >
              <UserPlus size={13} /> Invite
            </button>
          </div>

          {showMembers && (
            <div className="members-section" onClick={(e) => e.stopPropagation()}>
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
                <form className="invite-row" onSubmit={handleInvite} onClick={(e) => e.stopPropagation()}>
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
      </div>

      {/* Analysis Result Modal */}
    </>
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
