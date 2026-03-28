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
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      const u = authService.getCurrentUser();
      setUser(u);
    } catch (e) {
      setUser(null);
    }

    // fetch recent analyses (last 5)
    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`/api/v1/analysis/history?limit=5`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setRecent(data.analyses || []);
        }
      } catch (err) {
        // ignore
      }
    };

    fetchRecent();
  }, []);

  const handleNewAnalysis = () => {
    // navigate to upload flow or open upload modal anchor
    onNavigate('upload');
    navigate('/');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full text-sm">
      {/* Logo area */}
      <div className="h-14 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border)', padding: '0 12px' }}>
        <div className="w-10 h-10 flex items-center justify-center">
          <img src="/nobg-arai.jpeg" alt="ARAI" className="w-full h-full object-contain" onError={(e)=>{e.target.onerror=null;e.target.style.display='none'}} />
        </div>
      </div>

      <div className="p-3">
        <button
          onClick={handleNewAnalysis}
          className="w-full h-9 flex items-center justify-center gap-2 rounded transition-150"
          style={{ background: 'var(--accent)', color: '#fff', borderRadius: '6px' }}
        >
          <FilePlus className="h-4 w-4" />
          <span className="text-sm font-medium">New Analysis</span>
        </button>
      </div>

      <nav className="px-3 flex-1 flex flex-col overflow-auto">
        <div className="text-xs uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Navigation</div>
        <div className="flex flex-col gap-2">
          {navItems.map(({ to, label, Icon, id }) => {
            const isActive = active === id;
            return (
              <Link
                key={id}
                to={to}
                onClick={() => onNavigate(id)}
                className="flex items-center gap-3 px-3"
                style={{ height: '36px', borderRadius: '6px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', background: isActive ? 'var(--bg-active)' : 'transparent' }}
              >
                <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="text-xs uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Recent</div>
          <div className="flex flex-col gap-1">
            {recent.length === 0 && (
              <div className="text-sm text-[13px]" style={{ color: 'var(--text-muted)' }}>No recent uploads</div>
            )}
            {recent.map((r) => (
              <button
                key={r.analysis_id}
                onClick={() => navigate(`/results/${r.analysis_id}`)}
                className="text-sm text-left truncate px-2 py-1"
                style={{ color: 'var(--text-secondary)', borderRadius: '6px' }}
              >
                {r.filename || r.design_name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="px-3 pb-4 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name ?? user?.email ?? 'Account'}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>View profile</div>
            </div>
          </div>

          <div>
            <button onClick={() => setShowLogoutModal(true)} className="p-1 text-sm" style={{ color: 'var(--text-muted)' }} title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
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

      {/* Desktop fixed sidebar */}
  <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full" style={{ width: 240, background: 'var(--bg-base)', borderRight: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {SidebarContent}
        </div>
      </aside>

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
            <div style={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>{SidebarContent}</div>
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
