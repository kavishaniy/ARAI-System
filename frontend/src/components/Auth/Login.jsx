import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🚀 Starting login...');
      console.log('📧 Email:', email);
      
      const response = await authService.login(email, password);
      
      console.log('✅ Login response:', response);
      console.log('✅ Token saved:', localStorage.getItem('access_token'));
      console.log('✅ User saved:', localStorage.getItem('user'));
      
      // Check if there's a redirect path stored (from expired session)
      const redirectPath = localStorage.getItem('redirect_after_login');
      if (redirectPath) {
        console.log('🔄 Redirecting to stored path:', redirectPath);
        localStorage.removeItem('redirect_after_login');
        navigate(redirectPath, { replace: true });
      } else {
        console.log('🔄 Navigating to /dashboard...');
        navigate('/dashboard', { replace: true });
      }
      
      console.log('✅ Navigate called!');
      
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Handle different error formats
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data) {
        const data = err.response.data;
        
        // Handle validation errors (array of objects)
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(error => {
            const field = error.loc ? error.loc[error.loc.length - 1] : 'Field';
            return `${field}: ${error.msg}`;
          }).join(', ');
        } 
        // Handle string error message
        else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
          // Add helpful hint for email confirmation errors
          if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('confirm')) {
            errorMessage += '. Check your inbox for the confirmation email.';
          }
        }
        // Handle object error
        else if (data.detail && typeof data.detail === 'object') {
          errorMessage = data.detail.msg || JSON.stringify(data.detail);
        }
        // Handle simple error message
        else if (data.message) {
          errorMessage = data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 48 }}>
      <div className="auth-split">
        <div className="auth-visual">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="brand-mark">A</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>ARAI</div>
              <div className="muted">AI-powered UX design critique</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }} className="muted">Upload a design and see concise, actionable suggestions that improve clarity, accessibility, and hierarchy.</div>
        </div>

        <div>
          <div className="glass-card">
            <h2 style={{ marginTop: 0, marginBottom: 6, fontSize: 20, fontWeight: 800 }}>Sign in</h2>
            <div className="muted" style={{ marginBottom: 16 }}>Sign in to access your analyses</div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
              {error && (
                <div className="card" style={{ background: '#FFF6F6', borderColor: 'var(--danger)', color: 'var(--danger)' }}>{error}</div>
              )}

              <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="Email address" />
              <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="Password" />

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>{loading ? 'Signing in...' : 'Sign in'}</button>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link to="/signup" className="muted">Don't have an account? Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;