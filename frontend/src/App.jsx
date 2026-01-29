import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authService } from './services/auth';

// Components
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import AnalysisReport from './components/Analysis/AnalysisReport';
import Navbar from './components/Common/Navbar';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const location = useLocation();
  
  console.log('ProtectedRoute check:', {
    isAuthenticated,
    hasToken: !!localStorage.getItem('access_token'),
    path: location.pathname
  });
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  console.log('Authenticated, rendering protected content');
  return children;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/login" 
            element={
              authService.isAuthenticated() ? 
                <Navigate to="/dashboard" replace /> : 
                <Login />
            } 
          />
          <Route 
            path="/signup" 
            element={
              authService.isAuthenticated() ? 
                <Navigate to="/dashboard" replace /> : 
                <Signup />
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/:id"
            element={
              <ProtectedRoute>
                <AnalysisReport />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;