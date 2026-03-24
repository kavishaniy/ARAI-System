import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center text-white font-semibold">A</div>
            <span className="text-lg font-medium text-gray-800">ARAI</span>
          </Link>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-800">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-800 border rounded px-3 py-1"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800">Login</Link>
                <Link to="/signup" className="text-sm text-gray-600 hover:text-gray-800">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
