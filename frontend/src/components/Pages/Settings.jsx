import React, { useState, useEffect } from 'react';
import Sidebar from '../Common/Sidebar';
import PageHeader from '../Common/PageHeader';
import { authService } from '../../services/auth';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    try {
      const u = authService.getCurrentUser();
      setUser(u);
    } catch (e) {
      setUser(null);
    }
  }, []);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await authService.deleteAccount();
      window.location.href = '/';
    } catch (e) {
      setDeleteError(e?.response?.data?.detail || 'Failed to delete account. Please try again.');
      setDeleting(false);
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
      .page-container {
        margin-left: 80px;
      }

      .page-main {
        padding: 24px 30px;
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

    .settings-card {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
      transition: all 0.3s ease;
    }

    @media (max-width: 768px) {
      .settings-card {
        padding: 20px;
      }
    }

    @media (max-width: 480px) {
      .settings-card {
        padding: 16px;
      }
    }

    .settings-card:hover {
      border-color: rgba(15, 37, 87, 0.2);
      box-shadow: 0 15px 50px rgba(15, 37, 87, 0.1);
    }

    .settings-section {
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid rgba(15, 37, 87, 0.08);
    }

    @media (max-width: 480px) {
      .settings-section {
        margin-bottom: 24px;
        padding-bottom: 24px;
      }
    }

    .settings-section:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .settings-section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #0f2557;
      margin: 0 0 16px 0;
    }

    @media (max-width: 480px) {
      .settings-section-title {
        font-size: 1rem;
      }
    }

    .settings-section-description {
      font-size: 0.9rem;
      color: rgba(15, 37, 87, 0.6);
      margin: 0;
    }

    .settings-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }

    @media (max-width: 768px) {
      .settings-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    @media (max-width: 480px) {
      .settings-item {
        padding: 12px 0;
      }
    }

    .settings-item-label {
      font-weight: 500;
      color: #0f2557;
    }

    @media (max-width: 480px) {
      .settings-item-label {
        font-size: 0.95rem;
      }
    }

    .settings-item-value {
      color: rgba(15, 37, 87, 0.6);
      font-size: 0.95rem;
    }

    @media (max-width: 480px) {
      .settings-item-value {
        font-size: 0.85rem;
      }
    }

    .settings-button {
      padding: 11px 20px;
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    @media (max-width: 768px) {
      .settings-button {
        padding: 10px 16px;
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .settings-button {
        width: 100%;
        padding: 10px 14px;
        font-size: 0.8rem;
      }
    }

    .settings-button:hover {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
      transform: translateY(-2px);
    }

    .settings-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  `;

  return (
    <div className="page-shell">
      <Sidebar />
      <main className="page-container">
        <style>{css}</style>
        
        <PageHeader 
          title="Settings"
          subtitle="Manage your account and application settings"
        />

        <div className="page-main">
          <div className="page-content">
            <div className="settings-card">
              <div className="settings-section">
                <h3 className="settings-section-title">Account Settings</h3>
                <p className="settings-section-description">Manage your account preferences and profile information</p>
                
                {user?.full_name && (
                  <div className="settings-item">
                    <span className="settings-item-label">Full Name</span>
                    <span className="settings-item-value">{user.full_name}</span>
                  </div>
                )}

                <div className="settings-item">
                  <span className="settings-item-label">Email</span>
                  <span className="settings-item-value">{user?.email ?? '—'}</span>
                </div>

                <div className="settings-item">
                  <span className="settings-item-label">Account Status</span>
                  <span className="settings-item-value">Active</span>
                </div>
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title">Preferences</h3>
                <p className="settings-section-description">Customize your experience with the application</p>
                
                <div className="settings-item">
                  <span className="settings-item-label">Theme</span>
                  <span className="settings-item-value">Light</span>
                </div>
                
                <div className="settings-item">
                  <span className="settings-item-label">Notifications</span>
                  <span className="settings-item-value">Enabled</span>
                </div>
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title">Danger Zone</h3>
                <p className="settings-section-description">Irreversible actions</p>

                {deleteError && (
                  <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: '8px 0' }}>{deleteError}</p>
                )}

                {!showConfirm ? (
                  <div className="settings-item">
                    <button
                      className="settings-button"
                      style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
                      onClick={() => setShowConfirm(true)}
                    >
                      Delete Account
                    </button>
                  </div>
                ) : (
                  <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                    <p style={{ margin: 0, color: '#dc2626', fontWeight: 500 }}>
                      Are you sure? This will permanently delete your account and all data.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        className="settings-button"
                        style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                      >
                        {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                      </button>
                      <button
                        className="settings-button"
                        style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}
                        onClick={() => { setShowConfirm(false); setDeleteError(''); }}
                        disabled={deleting}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
