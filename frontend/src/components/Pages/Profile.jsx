import React, { useState, useEffect } from 'react';
import Sidebar from '../Common/Sidebar';
import PageHeader from '../Common/PageHeader';
import { authService } from '../../services/auth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const u = authService.getCurrentUser();
    setUser(u);
    setFullName(u?.full_name || '');
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await authService.updateProfile({ full_name: fullName });
      setUser(authService.getCurrentUser());
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
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
      .page-container { margin-left: 80px; }
      .page-main { padding: 24px 30px; }
    }
    @media (max-width: 768px) {
      .page-container { margin-left: 60px; }
      .page-main { padding: 20px 16px; }
    }
    @media (max-width: 480px) {
      .page-container { margin-left: 56px; }
      .page-main { padding: 16px 12px; }
    }
    .page-content { max-width: 640px; margin: 0 auto; width: 100%; }

    .profile-card {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
    }
    @media (max-width: 768px) { .profile-card { padding: 24px; } }
    @media (max-width: 480px) { .profile-card { padding: 16px; } }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
      font-size: 2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }

    .profile-field {
      margin-bottom: 20px;
    }
    .profile-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #0f2557;
      margin-bottom: 6px;
    }
    .profile-input {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid rgba(15, 37, 87, 0.2);
      border-radius: 8px;
      font-size: 0.95rem;
      color: #0f2557;
      background: white;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .profile-input:focus {
      border-color: #0f2557;
    }
    .profile-input:disabled {
      background: #f5f5f5;
      color: rgba(15, 37, 87, 0.5);
      cursor: not-allowed;
    }

    .profile-save-btn {
      padding: 11px 28px;
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 8px;
    }
    .profile-save-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
    }
    .profile-save-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .profile-success {
      color: #16a34a;
      font-size: 0.875rem;
      margin-top: 12px;
    }
    .profile-error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 12px;
    }
  `;

  const initials = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <div className="page-shell">
      <Sidebar />
      <main className="page-container">
        <style>{css}</style>

        <PageHeader
          title="Profile"
          subtitle="View and update your personal information"
        />

        <div className="page-main">
          <div className="page-content">
            <div className="profile-card">
              <div className="profile-avatar">{initials}</div>

              <form onSubmit={handleSave}>
                <div className="profile-field">
                  <label className="profile-label">Full Name</label>
                  <input
                    className="profile-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label">Email</label>
                  <input
                    className="profile-input"
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                </div>

                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                {successMsg && <p className="profile-success">{successMsg}</p>}
                {errorMsg && <p className="profile-error">{errorMsg}</p>}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
