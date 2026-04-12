import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Folder, FilePlus, Clock, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { authService } from '../../services/auth';
import LogoutModal from './LogoutModal';

const css = `
.sidebar-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 12px;
}

.sidebar-logo-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 28px;
  height: 64px;
  padding: 8px;
}

.sidebar-logo {
  height: 100%;
  width: auto;
  object-fit: contain;
  padding: 0;
  max-width: 80%;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  position: relative;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
  transform: translateX(2px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.2),
              0 0 20px rgba(255, 255, 255, 0.1);
}

.nav-item svg {
  width: 20px;
  height: 20px;
  stroke-width: 1.8;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 16px;
}

.sidebar-action-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: transparent;
}

.sidebar-action-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
  transform: translateX(2px);
}

.sidebar-action-item svg {
  width: 20px;
  height: 20px;
  stroke-width: 1.8;
}

/* Expanded sidebar styles */
.sidebar-expanded .sidebar-logo-section {
  margin-bottom: 32px;
}

.sidebar-expanded .sidebar-logo {
  /* Logo image automatically scales with section height */
}

.sidebar-expanded .nav-item,
.sidebar-expanded .sidebar-action-item {
  width: 100%;
  justify-content: flex-start;
  padding: 0 14px;
  gap: 14px;
}

.sidebar-expanded .nav-label,
.sidebar-expanded .action-label {
  display: inline;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.nav-label,
.action-label {
  display: none;
}

/* Mobile top bar */
.sidebar-mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(180deg, #0f2557, #091840);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
  color: white;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.sidebar-mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}

.sidebar-drawer-content {
  position: relative;
  width: 240px;
  background: linear-gradient(180deg, #0f2557, #091840);
  display: flex;
  flex-direction: column;
  animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-drawer-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  { to: '/projects', label: 'Projects', Icon: Folder, id: 'projects' },
  { to: '/history', label: 'History', Icon: Clock, id: 'history' },
  { to: '/settings', label: 'Settings', Icon: Settings, id: 'settings' },
];

const Sidebar = ({ active = 'home', onNavigate = () => {} }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(() => {
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
    navigate('/');
  };

  const handleToggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false'); } catch (e) {}
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
    <div className={`sidebar-wrapper ${!collapsed ? 'sidebar-expanded' : ''}`}>
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

      <div className="sidebar-actions">
        <button
          className="sidebar-action-item"
          onClick={() => setShowLogoutModal(true)}
          title="Logout"
          type="button"
        >
          <LogOut />
          <span className="action-label">Logout</span>
        </button>

        <button
          className="sidebar-action-item"
          onClick={handleToggleCollapse}
          title={collapsed ? 'Expand' : 'Collapse'}
          type="button"
        >
          {collapsed ? <Menu /> : <ChevronRight />}
          <span className="action-label">{collapsed ? 'Expand' : 'Collapse'}</span>
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
      <aside className={`hidden lg:flex side-rail fixed left-0 top-0 h-full ${collapsed ? 'collapsed' : ''}`}>
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
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px 12px' }}>
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
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0 14px' }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="nav-label" style={{ display: 'inline' }}>{label}</span>
                  </Link>
                );
              })}
            </nav>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px 12px' }}>
              <button
                className="sidebar-action-item"
                onClick={() => {
                  setShowLogoutModal(true);
                  setDrawerOpen(false);
                }}
                type="button"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0 14px' }}
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
