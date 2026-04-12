import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useEffect, useRef } from 'react';

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body, html { height: 100%; }

.auth-page {
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
  color: #0f2557;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Left side - decorative */
.auth-left {
  background: linear-gradient(180deg, #0f2557 0%, #091840 100%);
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.logo-top-left {
  height: 72px;
  width: auto;
  object-fit: contain;
  z-index: 10;
  margin-left: -18px;
  margin-top: -14px;
}

/* Decorative elements */
.auth-left::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.auth-left::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
  border-radius: 50%;
}

.left-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
}

.left-text h3 {
  font-family: 'DM Serif Display', serif;
  font-size: 2.2rem;
  color: white;
  font-weight: 400;
  line-height: 1.3;
  margin-bottom: 1rem;
}

.left-text h3 em {
  font-style: italic;
  opacity: 0.8;
}

.left-text p {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.7;
  max-width: 320px;
}

.score-content {
  position: relative;
  z-index: 2;
}

.score-eyebrow {
  font-size: 0.63rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 1.5rem;
}

.score-heading {
  font-family: 'DM Serif Display', serif;
  font-size: 1.8rem;
  color: white;
  font-weight: 400;
  line-height: 1.3;
  margin-bottom: 1rem;
}

.score-heading em {
  font-style: italic;
  opacity: 0.8;
}

.score-description {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.8;
  max-width: 320px;
  margin-bottom: 2rem;
  font-weight: 300;
}

.sub-scores {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.sub-score-item {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.sub-score-item:last-child {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mini-ring {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.mini-ring svg {
  transform: rotate(-90deg);
  width: 56px;
  height: 56px;
}

.mr-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 5;
}

.mr-fill {
  fill: none;
  stroke-width: 5;
  stroke-linecap: butt;
  stroke-dasharray: 175.9;
  stroke-dashoffset: 175.9;
  transition: stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1);
}

.mr-fill.c1 {
  stroke: rgba(255, 255, 255, 0.9);
}

.mr-fill.c2 {
  stroke: rgba(255, 255, 255, 0.7);
}

.mr-fill.c3 {
  stroke: rgba(255, 255, 255, 0.5);
}

.mini-ring-num {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'DM Serif Display', serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1;
  font-weight: 400;
}

.score-number {
  font-family: 'DM Serif Display', serif;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1;
  min-width: 35px;
  text-align: right;
  font-weight: 400;
  flex-shrink: 0;
}

.score-details {
  flex: 1;
}

.score-label {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 0.3rem;
}

.score-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.38);
  line-height: 1.55;
  font-weight: 300;
}

.left-features {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 1rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.feature-icon::before {
  content: '✓';
  color: rgba(255, 255, 255, 0.8);
  font-weight: bold;
  font-size: 0.75rem;
}

.feature-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

/* Right side - form */
.auth-right {
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-header {
  text-align: left;
}

.form-header h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  color: #0f2557;
  font-weight: 400;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.form-header p {
  font-size: 0.95rem;
  color: rgba(15,37,87,0.6);
  font-weight: 300;
  line-height: 1.6;
}

.auth-form {
  width: 100%;
  background: white;
  border: 1.5px solid rgba(15,37,87,0.15);
  border-radius: 16px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 10px 40px rgba(15,37,87,0.08);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f2557;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  padding-right: 44px;
  border: 1.5px solid rgba(15,37,87,0.15);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  color: #0f2557;
  background: #fafaf9;
  transition: all 0.2s;
}

.form-input::placeholder {
  color: rgba(15,37,87,0.45);
}

.form-input:focus {
  outline: none;
  border-color: #0f2557;
  background: white;
  box-shadow: 0 0 0 4px rgba(15,37,87,0.08);
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: rgba(15,37,87,0.5);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #0f2557;
}

.error-message {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04));
  border: 1.5px solid #EF4444;
  color: #DC2626;
  padding: 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.btn-submit {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white;
  border: 1.5px solid #0f2557;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: capitalize;
  letter-spacing: 0.01em;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #091840, #051026);
  box-shadow: 0 8px 24px rgba(15,37,87,0.2);
  gap: 12px;
  transform: translateY(-2px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  font-size: 0.95rem;
  color: rgba(15,37,87,0.6);
}

.form-footer a {
  color: #0f2557;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
  margin-left: 0.4rem;
}

.form-footer a:hover {
  color: #091840;
}

@media (max-width: 1024px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-left {
    display: none;
  }

  .auth-right {
    padding: 2rem 1rem;
    background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
  }

  .auth-container {
    max-width: 480px;
  }
}

@media (max-width: 640px) {
  .auth-container {
    gap: 1.5rem;
  }

  .form-header h2 {
    font-size: 1.6rem;
  }

  .auth-form {
    padding: 2rem 1.5rem;
  }
}
`;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animated, setAnimated] = useState(false);
  const scoreRef = useRef(null);

  // Animation setup
  useEffect(() => {
    if (!scoreRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimated(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(scoreRef.current);
    return () => obs.disconnect();
  }, []);

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
    <div className="auth-page">
      <style>{css}</style>

      {/* Left side - Decorative */}
      <div className="auth-left">
        <div>
          <img src="/arai.png" alt="ARAI Logo" className="logo-top-left" />
        </div>
        
        <div className="left-content" ref={scoreRef}>
          <div className="score-content">
            <div className="score-eyebrow">The ARAI Index</div>
            <h3 className="score-heading">One score.<br />Three <em>dimensions</em><br />of inclusivity.</h3>
            <p className="score-description">
              Accessibility, readability, and visual attention — combined into a single, actionable index you can track, export, and present to clients.
            </p>

            <div className="sub-scores">
              <div className="sub-score-item">
                <div className="mini-ring">
                  <svg viewBox="0 0 64 64">
                    <circle className="mr-bg" cx="32" cy="32" r="28" />
                    <circle
                      className="mr-fill c1"
                      cx="32" cy="32" r="28"
                      style={{
                        strokeDashoffset: animated ? 25.35 : 175.9,
                        transitionDelay: '0ms',
                      }}
                    />
                  </svg>
                  <div className="mini-ring-num">{animated ? 78 : 0}</div>
                </div>
                <div className="score-details">
                  <div className="score-label">Accessibility</div>
                  <div className="score-desc">WCAG 2.1 AA compliance across 50+ criteria</div>
                </div>
                <div className="score-number">78</div>
              </div>
              <div className="sub-score-item">
                <div className="mini-ring">
                  <svg viewBox="0 0 64 64">
                    <circle className="mr-bg" cx="32" cy="32" r="28" />
                    <circle
                      className="mr-fill c2"
                      cx="32" cy="32" r="28"
                      style={{
                        strokeDashoffset: animated ? 15.89 : 175.9,
                        transitionDelay: '250ms',
                      }}
                    />
                  </svg>
                  <div className="mini-ring-num">{animated ? 91 : 0}</div>
                </div>
                <div className="score-details">
                  <div className="score-label">Readability</div>
                  <div className="score-desc">Flesch-Kincaid, Gunning Fog & SMOG indices</div>
                </div>
                <div className="score-number">91</div>
              </div>
              <div className="sub-score-item">
                <div className="mini-ring">
                  <svg viewBox="0 0 64 64">
                    <circle className="mr-bg" cx="32" cy="32" r="28" />
                    <circle
                      className="mr-fill c3"
                      cx="32" cy="32" r="28"
                      style={{
                        strokeDashoffset: animated ? 42.24 : 175.9,
                        transitionDelay: '500ms',
                      }}
                    />
                  </svg>
                  <div className="mini-ring-num">{animated ? 76 : 0}</div>
                </div>
                <div className="score-details">
                  <div className="score-label">Visual Attention</div>
                  <div className="score-desc">U-Net CNN saliency & hierarchy alignment</div>
                </div>
                <div className="score-number">76</div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
          University of Westminster © 2026
        </div>
      </div>

      {/* Right side - Form */}
      <div className="auth-right">
        <div className="auth-container">
          {/* Form Header */}
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your ARAI account and continue analyzing</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Signing in...' : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Footer */}
          <div className="form-footer">
            Don't have an account?
            <Link to="/signup">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;