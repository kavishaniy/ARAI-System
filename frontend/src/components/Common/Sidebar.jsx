import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Upload, Clock, Settings, LogOut, Menu } from 'lucide-react';
import { authService } from '../../services/auth';
import LogoutModal from './LogoutModal';

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
  const navItem = (to, label, Icon, id) => (
    <Link
      to={to}
      onClick={() => onNavigate(id)}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${active === id ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="lg:hidden bg-white border-b">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary-500 text-white flex items-center justify-center font-semibold">A</div>
            <div className="text-sm font-medium">ARAI</div>
          </div>
          <button onClick={() => setOpen(true)} className="p-2 rounded-md">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Sidebar for large screens */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-100 min-h-screen px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary-500 text-white flex items-center justify-center font-semibold">A</div>
            <div>
              <div className="text-sm font-semibold text-gray-800">ARAI</div>
              <div className="text-xs text-gray-500">Design Critique</div>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItem('/dashboard', 'Home', Home, 'dashboard')}
          {navItem('#upload', 'Upload', Upload, 'upload')}
          {navItem('/dashboard?tab=history', 'History', Clock, 'history')}
          {navItem('/settings', 'Settings', Settings, 'settings')}

          <div className="pt-4 border-t border-gray-100 mt-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-800">Account</div>
                </div>
              </div>
            <div className="mt-3 px-3">
              <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setOpen(false)}></div>
          <div className="relative w-64 bg-white border-r border-gray-100 p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary-500 text-white flex items-center justify-center font-semibold">A</div>
                <div className="text-sm font-medium">ARAI</div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2">Close</button>
            </div>
            <nav className="space-y-1">
              {navItem('/dashboard', 'Home', Home, 'dashboard')}
              {navItem('#upload', 'Upload', Upload, 'upload')}
              {navItem('/dashboard?tab=history', 'History', Clock, 'history')}
              {navItem('/settings', 'Settings', Settings, 'settings')}
              <div className="pt-4 border-t border-gray-100 mt-4">
                <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      <LogoutModal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={async () => {
        setShowLogoutModal(false);
        try {
          await authService.logout();
        } catch (e) {
          // ignore
        }
        navigate('/login');
      }} />
    </>
  );
};

export default Sidebar;
