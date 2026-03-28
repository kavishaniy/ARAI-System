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
    <div className="flex flex-col h-full text-sm" style={{ padding: 12 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 flex items-center justify-center" style={{ borderRadius: 8, background: 'var(--bg-surface)', padding: 6 }}>
          <img src="/nobg-arai.jpeg" alt="ARAI" className="w-full h-full object-contain" onError={(e)=>{e.target.onerror=null;e.target.style.display='none'}} />
        </div>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>ARAI</div>
      </div>

      <div className="mb-4">
        <button onClick={handleNewAnalysis} className="btn-primary w-full" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <FilePlus className="h-4 w-4" />
          <span>New Analysis</span>
        </button>
      </div>

      <nav className="flex-1 overflow-auto">
        <div className="muted text-xs uppercase mb-3">Navigation</div>
        <div className="flex flex-col gap-2">
          {navItems.map(({ to, label, Icon, id }) => {
            const isActive = active === id;
            return (
              <Link
                key={id}
                to={to}
                onClick={() => onNavigate(id)}
                className="flex items-center gap-3 px-3"
                style={{ height: 44, borderRadius: 8, color: isActive ? 'var(--accent)' : 'var(--text-secondary)', background: isActive ? 'rgba(37,99,235,0.06)' : 'transparent' }}
              >
                <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="muted text-xs uppercase mb-2">Recent</div>
          <div className="flex flex-col gap-1">
            {recent.length === 0 && (
              <div className="text-sm muted">No recent uploads</div>
            )}
            {recent.map((r) => (
              <button
                key={r.analysis_id}
                onClick={() => navigate(`/results/${r.analysis_id}`)}
                className="text-sm text-left truncate px-2 py-1"
                style={{ color: 'var(--text-secondary)', borderRadius: 6 }}
              >
                {r.filename || r.design_name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name ?? user?.email ?? 'Account'}</div>
              <div className="text-xs muted">View profile</div>
            </div>
          </div>

          <div>
            <button onClick={() => setShowLogoutModal(true)} className="p-1 text-sm muted" title="Logout">
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
