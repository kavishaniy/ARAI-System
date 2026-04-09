import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Starting signup...');
      console.log('📧 Email:', formData.email);
      console.log('👤 Name:', formData.name);
      
      const response = await authService.signup(
        formData.email,
        formData.password,
        formData.name
      );
      
      console.log(' Signup response:', response);
      console.log(' Token saved:', localStorage.getItem('access_token'));
      console.log(' User saved:', localStorage.getItem('user'));
      console.log('🔄 Navigating to /dashboard...');
      
      // Navigate to dashboard using React Router
      navigate('/dashboard', { replace: true });
      
      console.log(' Navigate called!');
      
    } catch (err) {
      console.error(' Signup error:', err);
      console.error(' Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Handle different error formats
      let errorMessage = 'Signup failed. Please try again.';
      
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)', padding: '40px 16px', position: 'relative' }}>
      <img src="/arai-logo.jpeg" alt="ARAI" className="auth-logo" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Create your account</h2>
          <div className="muted" style={{ marginTop: 6 }}>You'll need to confirm your email address before logging in</div>
        </div>

        <div className="glass-card">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            {error && (
              <div className="card" style={{ background: '#FFF6F6', borderColor: 'var(--danger)', color: 'var(--danger)' }}>{error}</div>
            )}

            <input className="form-input" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            <input className="form-input" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} required />
            <input className="form-input" name="password" type="password" placeholder="Password (min. 8 characters)" value={formData.password} onChange={handleChange} minLength={8} required />
            <input className="form-input" name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={loading} className="btn-primary btn-navy" style={{ flex: 1 }}>{loading ? 'Signing up...' : 'Sign up'}</button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span className="muted">Already have an account? </span>
              <Link to="/login" className="muted" style={{ fontWeight: 600, marginLeft: 6 }}>Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
