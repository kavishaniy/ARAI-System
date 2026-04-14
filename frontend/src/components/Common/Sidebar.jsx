import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Folder, FilePlus, Clock, Settings, LogOut, Menu, X, User, Figma } from 'lucide-react';
import { authService } from '../../services/auth';
import LogoutModal from './LogoutModal';

const css = `
/* Main sidebar container */
.side-rail {
  width: 80px;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(180deg, #0a1f3d 0%, #061428 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
  padding: 0;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.side-rail.expanded {
  width: 240px;
}

.sidebar-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 8px;
  justify-content: space-between;
}

.sidebar-logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  height: 48px;
  overflow: hidden;
  flex-shrink: 0;
}

.side-rail.expanded .sidebar-logo-section {
  justify-content: flex-start;
  padding-left: -3px;
}

.sidebar-logo {
  height: 100%;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}

/* Navigation section */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}

.nav-item {
  position: relative;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 44px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  padding: 0;
  border: none;
  background: transparent;
  margin: 0 auto;
  flex-shrink: 0;
}

.side-rail.expanded .nav-item {
  width: 100%;
  justify-content: flex-start;
  padding: 0 12px;
  margin: 0;
  gap: 12px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.nav-item.active {
  background: rgba(100, 180, 255, 0.15);
  color: rgba(100, 200, 255, 1);
  box-shadow: inset 0 0 0 1px rgba(100, 180, 255, 0.3),
              0 0 12px rgba(100, 180, 255, 0.15);
}

.nav-item.active:hover {
  background: rgba(100, 180, 255, 0.2);
}

.nav-item svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  flex-shrink: 0;
}

.nav-label {
  display: none;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.side-rail.expanded .nav-label {
  display: inline;
}

/* Actions section */
.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
  flex-shrink: 0;
}

.sidebar-action-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 44px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: transparent;
  padding: 0;
  margin: 0 auto;
  flex-shrink: 0;
}

.side-rail.expanded .sidebar-action-item {
  width: 100%;
  justify-content: flex-start;
  padding: 0 12px;
  margin: 0;
  gap: 12px;
}

.sidebar-action-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
}

.sidebar-action-item.logout:hover {
  background: rgba(255, 75, 75, 0.15);
  color: rgba(255, 100, 100, 1);
}

.sidebar-action-item svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  flex-shrink: 0;
}

.action-label {
  display: none;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.side-rail.expanded .action-label {
  display: inline;
}

/* Mobile top bar */
.sidebar-mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(180deg, #0a1f3d, #061428);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 40;
}

.mobile-logo-text {
  font-family: 'DM Serif Display', serif;
  font-size: 1.3rem;
  font-weight: 400;
  color: white;
  letter-spacing: -0.5px;
}

.sidebar-mobile-menu-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(100, 180, 255, 0.15);
  color: rgba(100, 200, 255, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid rgba(100, 180, 255, 0.3);
  flex-shrink: 0;
}

/* Mobile drawer */
.sidebar-drawer {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: none;
  flex;
}

.sidebar-drawer-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.sidebar-drawer-content {
  position: relative;
  width: 240px;
  background: linear-gradient(180deg, #0a1f3d, #061428);
  display: flex;
  flex-direction: column;
  animation: slideInLeft 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-drawer-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-drawer-close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar-mobile-header {
    display: flex;
  }

  .sidebar-drawer {
    display: flex;
  }

  .side-rail {
    display: none !important;
  }
}

@media (min-width: 1025px) {
  .sidebar-mobile-header,
  .sidebar-drawer {
    display: none !important;
  }
}
`;

const navItems = [
  { to: '/', label: 'New Analysis', Icon: FilePlus, id: 'upload' },
  { to: '/figma', label: 'Figma Analysis', Icon: Figma, id: 'figma' },
  { to: '/projects', label: 'Projects', Icon: Folder, id: 'projects' },
  { to: '/history', label: 'History', Icon: Clock, id: 'history' },
  { to: '/settings', label: 'Settings', Icon: Settings, id: 'settings' },
];

const Sidebar = ({ active = 'home', onNavigate = () => {} }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [collapsed] = useState(() => {
    try {
      const v = localStorage.getItem('sidebar_collapsed');
      return v === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      const u = authService.getCurrentUser();
      setUser(u);
    } catch (e) {
      setUser(null);
    }
  }, []);

  const handleNewAnalysis = () => {
    onNavigate('upload');
  };

  const handleNavClick = (id, to) => {
    if (id === 'upload') {
      handleNewAnalysis();
    } else {
      onNavigate(id);
      navigate(to);
    }
    setDrawerOpen(false);
  };

  const Rail = (
    <div className={`sidebar-wrapper`}>
      <div>
        <div className="sidebar-logo-section">
          <img src="/arai.png" alt="ARAI Logo" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, Icon, id }) => {
            const isActive = active === id;
            return (
              <Link
                key={id}
                to={to}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(id, to);
                }}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={label}
              >
                <Icon />
                <span className="nav-label">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-actions">
        <button
          className="sidebar-action-item logout"
          onClick={() => setShowLogoutModal(true)}
          title="Logout"
          type="button"
        >
          <LogOut />
          <span className="action-label">Logout</span>
        </button>

        <button
          className="sidebar-action-item"
          onClick={() => navigate('/profile')}
          title="Profile"
          type="button"
        >
          <User />
          <span className="action-label">Profile</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>

      {/* Mobile top bar */}
      <div className="sidebar-mobile-header">
        <button
          className="sidebar-mobile-menu-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
        <img src="/arai.png" alt="ARAI Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        <div className="user-avatar">
          {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex side-rail fixed left-0 top-0 h-full ${!collapsed ? 'expanded' : ''}`} style={{ paddingTop: '0px' }}>
        {Rail}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="sidebar-drawer">
          <div className="sidebar-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="sidebar-drawer-content">
            <div className="sidebar-drawer-header">
              <img src="/arai.png" alt="ARAI Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              <button
                className="sidebar-drawer-close"
                onClick={() => setDrawerOpen(false)}
                title="Close"
                aria-label="Close"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 8px' }}>
              {navItems.map(({ to, label, Icon, id }) => {
                const isActive = active === id;
                return (
                  <Link
                    key={id}
                    to={to}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(id, to);
                    }}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0 12px', margin: 0, gap: '12px' }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="nav-label" style={{ display: 'inline' }}>{label}</span>
                  </Link>
                );
              })}
            </nav>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px 8px' }}>
              <button
                className="sidebar-action-item logout"
                onClick={() => {
                  setShowLogoutModal(true);
                  setDrawerOpen(false);
                }}
                type="button"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0 12px', margin: 0, gap: '12px' }}
              >
                <LogOut className="h-5 w-5" />
                <span className="action-label" style={{ display: 'inline' }}>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          setShowLogoutModal(false);
          try {
            await authService.logout();
          } catch (e) {
            // ignore
          }
          navigate('/login');
        }}
      />
    </>
  );
};

export default Sidebar;
