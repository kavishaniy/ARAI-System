import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Upload, Clock, Settings, LogOut, Menu, X } from 'lucide-react';
import { authService } from '../../services/auth';
import LogoutModal from './LogoutModal';

const navItems = [
  { to: '/dashboard', label: 'Home', Icon: Home, id: 'dashboard' },
  { to: '#upload', label: 'Upload', Icon: Upload, id: 'upload' },
  { to: '/dashboard?tab=history', label: 'History', Icon: Clock, id: 'history' },
  { to: '/settings', label: 'Settings', Icon: Settings, id: 'settings' },
];

const Sidebar = ({ active = 'dashboard', onNavigate = () => {} }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // drawer open for mobile
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = authService.getCurrentUser();
      setUser(u);
    } catch (e) {
      setUser(null);
    }
  }, []);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center -mt-1">
              <img
                src="/nobg-arai.jpeg"
                alt="ARAI"
                title="ARAI"
                className="max-w-full max-h-full object-contain"
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
              />
            </div>
            {/* logo only */}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-md text-slate-600 hover:bg-slate-50"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-slate-100 min-h-screen px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 flex items-center justify-center -mt-1">
            <img
              src="/nobg-arai.jpeg"
              alt="ARAI"
              title="ARAI"
              className="max-w-full max-h-full object-contain"
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1" aria-label="Main navigation">
          {navItems.map(({ to, label, Icon, id }) => {
            const isActive = active === id;
            return (
              <Link
                key={id}
                to={to}
                onClick={() => onNavigate(id)}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                  isActive ? 'bg-slate-50 text-slate-900 border-l-2 border-blue-600 pl-[calc(0.75rem-2px)]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-sm">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-900 truncate">{user?.email ?? 'Account'}</div>
                <div className="text-xs text-slate-500">View profile</div>
              </div>
            </div>

            <div className="mt-3 px-3">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4 text-slate-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-white border-r border-slate-100 p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center -mt-1">
                  <img
                    src="/nobg-arai.jpeg"
                    alt="ARAI"
                    title="ARAI"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  />
                </div>
                {/* logo only */}
              </div>
              <button onClick={() => setOpen(false)} className="p-2" aria-label="Close sidebar">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map(({ to, label, Icon, id }) => (
                <Link
                  key={id}
                  to={to}
                  onClick={() => { onNavigate(id); setOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active === id ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
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
