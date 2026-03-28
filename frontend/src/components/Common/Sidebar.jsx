import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, FilePlus, Clock, Settings, LogOut, Menu, X } from 'lucide-react';
import { authService } from '../../services/auth';
import LogoutModal from './LogoutModal';

const navItems = [
  { to: '/', label: 'Home', Icon: Home, id: 'home' },
  { to: '/dashboard', label: 'Dashboard', Icon: Home, id: 'dashboard' },
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

    // optional: fetch recent analyses if needed later
  }, []);

  const handleNewAnalysis = () => {
    // navigate to upload flow or open upload modal anchor
    onNavigate('upload');
    navigate('/');
  };

  const Rail = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
      <div style={{ marginBottom: 8 }}>
        <div className={`brand-mark ${collapsed ? 'hidden' : ''}`}>A</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
        {navItems.map(({ to, label, Icon, id }) => {
          const isActive = active === id;
          return (
            <Link key={id} to={to} onClick={() => onNavigate(id)} style={{ textDecoration: 'none' }}>
              <div className={`rail-item ${isActive ? 'active' : ''}`} title={label}>
                <Icon className="h-5 w-5" />
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ marginBottom: 6 }}>
        <div className="rail-item" onClick={handleNewAnalysis} title="New Analysis">
          <FilePlus className="h-5 w-5" />
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <div className="rail-item" onClick={() => setShowLogoutModal(true)} title="Logout">
          <LogOut className="h-5 w-5" />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="rail-item" onClick={() => {
          const next = !collapsed;
          setCollapsed(next);
          try { localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false'); } catch (e) {}
        }} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
  <div className="lg:hidden bg-[var(--bg-base)] border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} className="p-2" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/nobg-arai.jpeg" alt="ARAI" className="w-8 h-8 object-contain" onError={(e)=>{e.target.onerror=null;e.target.style.display='none'}} />
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ARAI</div>
            </div>
          </div>

          <div>
            <div className="w-8 h-8 rounded-full" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>
          </div>
        </div>
      </div>

  {/* Slim rail for desktop */}
  <aside className={`hidden lg:flex side-rail fixed left-0 top-0 h-full ${collapsed ? 'collapsed' : ''}`}>{Rail}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={() => setDrawerOpen(false)} />
          <div className="relative w-64" style={{ background: 'var(--bg-base)', borderRight: '1px solid var(--border)' }}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/nobg-arai.jpeg" alt="ARAI" className="w-10 h-10 object-contain" onError={(e)=>{e.target.onerror=null;e.target.style.display='none'}} />
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ARAI</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2"><X className="h-5 w-5" /></button>
            </div>
            <div style={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>{Rail}</div>
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
