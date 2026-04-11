import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Eye, FileText, Zap, Users, GraduationCap, ChevronRight } from 'lucide-react';
import { authService } from '../services/auth';

const NAVY = '#0f2557';
const NAVY_DARK = '#091840';
const NAVY_LIGHT = '#1a3a7c';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .arai-root * { box-sizing: border-box; }

  .arai-root {
    font-family: 'DM Sans', sans-serif;
    background: #f8f7f4;
    color: #0f2557;
    overflow-x: hidden;
  }

  .serif { font-family: 'DM Serif Display', serif; }

  /* Nav */
  .arai-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 4rem;
    height: 68px;
    background: rgba(248, 247, 244, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(15,37,87,0.08);
    transition: all 0.3s;
  }
  .arai-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; color: inherit;
  }
  .arai-logo-mark {
    width: 36px; height: 36px; border-radius: 8px;
    background: ${NAVY}; display: flex; align-items: center; justify-content: center;
  }
  .arai-logo-text {
    font-size: 1.15rem; font-weight: 600; letter-spacing: 0.08em; color: ${NAVY};
  }
  .arai-nav-links { display: flex; align-items: center; gap: 2rem; }
  .arai-nav-link {
    font-size: 0.875rem; font-weight: 500; color: rgba(15,37,87,0.65);
    text-decoration: none; transition: color 0.2s; letter-spacing: 0.01em;
    cursor: pointer; background: none; border: none;
  }
  .arai-nav-link:hover { color: ${NAVY}; }
  .arai-btn-primary {
    padding: 0.55rem 1.4rem; background: ${NAVY}; color: #fff;
    border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500;
    cursor: pointer; transition: background 0.2s, transform 0.15s;
    font-family: 'DM Sans', sans-serif; letter-spacing: 0.01em;
  }
  .arai-btn-primary:hover { background: ${NAVY_DARK}; transform: translateY(-1px); }
  .arai-btn-secondary {
    padding: 0.55rem 1.4rem; background: transparent; color: ${NAVY};
    border: 1.5px solid rgba(15,37,87,0.3); border-radius: 6px;
    font-size: 0.875rem; font-weight: 500; cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .arai-btn-secondary:hover { border-color: ${NAVY}; background: rgba(15,37,87,0.04); }

  /* Hero */
  .arai-hero {
    min-height: 100vh; display: flex; align-items: center;
    padding: 8rem 4rem 5rem;
    position: relative; overflow: hidden;
  }
  .arai-hero-bg {
    position: absolute; inset: 0; pointer-events: none; overflow: hidden;
  }
  .arai-hero-circle {
    position: absolute; border-radius: 50%;
    background: rgba(15,37,87,0.06);
  }
  .arai-hero-inner {
    max-width: 1280px; margin: 0 auto; width: 100%;
    display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: center;
  }
  .arai-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.14em;
    text-transform: uppercase; color: ${NAVY}; margin-bottom: 1.75rem;
    padding: 6px 14px; border: 1px solid rgba(15,37,87,0.2);
    border-radius: 100px; background: rgba(15,37,87,0.04);
  }
  .arai-h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.6rem, 4.5vw, 3.8rem); line-height: 1.1;
    color: ${NAVY}; margin: 0 0 1.5rem; font-weight: 400;
  }
  .arai-h1 em { font-style: italic; color: ${NAVY_LIGHT}; }
  .arai-hero-sub {
    font-size: 1.05rem; color: rgba(15,37,87,0.65); line-height: 1.75;
    max-width: 440px; margin: 0 0 2.5rem; font-weight: 400;
  }
  .arai-hero-cta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
  .arai-btn-large {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 0.875rem 2rem; background: ${NAVY}; color: #fff;
    border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .arai-btn-large:hover { background: ${NAVY_DARK}; gap: 12px; }
  .arai-btn-large-outline {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 0.875rem 2rem; background: transparent; color: ${NAVY};
    border: 1.5px solid rgba(15,37,87,0.25); border-radius: 8px;
    font-size: 0.95rem; font-weight: 500; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .arai-btn-large-outline:hover { border-color: ${NAVY}; background: rgba(15,37,87,0.04); }

  /* Hero visual */
  .arai-hero-visual {
    position: relative; display: flex; align-items: center; justify-content: center;
  }
  .arai-hero-card {
    background: #fff; border: 1px solid rgba(15,37,87,0.1);
    border-radius: 20px; padding: 2rem; width: 100%; max-width: 420px;
    box-shadow: 0 20px 60px rgba(15,37,87,0.08);
    animation: floatCard 6s ease-in-out infinite;
  }
  @keyframes floatCard {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  .arai-score-ring {
    width: 120px; height: 120px; border-radius: 50%;
    border: 8px solid ${NAVY}; display: flex; flex-direction: column;
    align-items: center; justify-content: center; margin: 0 auto 1.5rem;
    position: relative;
  }
  .arai-score-ring::before {
    content: ''; position: absolute;
    width: 136px; height: 136px; border-radius: 50%;
    border: 2px solid rgba(15,37,87,0.12);
    animation: pulse 2.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.06); opacity: 0.4; }
  }
  .arai-score-num {
    font-family: 'DM Serif Display', serif; font-size: 2rem; color: ${NAVY}; line-height: 1;
  }
  .arai-score-label { font-size: 0.65rem; letter-spacing: 0.1em; color: rgba(15,37,87,0.5); text-transform: uppercase; font-weight: 600; }
  .arai-score-bars { display: flex; flex-direction: column; gap: 10px; }
  .arai-bar-row { display: flex; align-items: center; gap: 10px; }
  .arai-bar-name { font-size: 0.75rem; color: rgba(15,37,87,0.6); width: 80px; font-weight: 500; }
  .arai-bar-track { flex: 1; height: 6px; background: rgba(15,37,87,0.08); border-radius: 100px; overflow: hidden; }
  .arai-bar-fill { height: 100%; background: ${NAVY}; border-radius: 100px; animation: fillBar 1.5s ease-out forwards; }
  @keyframes fillBar { from { width: 0; } }
  .arai-bar-pct { font-size: 0.75rem; color: ${NAVY}; font-weight: 600; width: 32px; text-align: right; }

  /* Stats */
  .arai-stats {
    background: ${NAVY}; padding: 4rem;
  }
  .arai-stats-inner {
    max-width: 1280px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
    background: rgba(255,255,255,0.12);
  }
  .arai-stat {
    background: ${NAVY}; padding: 2.5rem 2rem; text-align: center;
    position: relative;
  }
  .arai-stat-num {
    font-family: 'DM Serif Display', serif; font-size: 3rem; color: #fff;
    line-height: 1; margin-bottom: 0.5rem;
  }
  .arai-stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.55); letter-spacing: 0.05em; font-weight: 400; line-height: 1.4; }

  /* Section spacing */
  .arai-section { padding: 6rem 4rem; }
  .arai-section-inner { max-width: 1280px; margin: 0 auto; }
  .arai-section-header { max-width: 600px; margin-bottom: 4rem; }
  .arai-section-tag {
    display: inline-block; font-size: 0.7rem; letter-spacing: 0.14em;
    text-transform: uppercase; font-weight: 600; color: rgba(15,37,87,0.5);
    margin-bottom: 1.2rem;
  }
  .arai-h2 {
    font-family: 'DM Serif Display', serif; font-size: clamp(2rem, 3.5vw, 2.8rem);
    line-height: 1.15; color: ${NAVY}; font-weight: 400; margin: 0 0 1rem;
  }
  .arai-h2 em { font-style: italic; }
  .arai-section-desc { font-size: 1rem; color: rgba(15,37,87,0.6); line-height: 1.75; margin: 0; }

  /* Capabilities */
  .arai-capabilities-bg { background: #fff; }
  .arai-caps-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
    background: rgba(15,37,87,0.08); border: 1px solid rgba(15,37,87,0.08);
    border-radius: 16px; overflow: hidden;
  }
  .arai-cap-card {
    background: #fff; padding: 2.5rem; position: relative; overflow: hidden;
    transition: background 0.3s;
  }
  .arai-cap-card:hover { background: rgba(15,37,87,0.02); }
  .arai-cap-card::before {
    content: attr(data-num); position: absolute; right: 1.5rem; top: 1.5rem;
    font-family: 'DM Serif Display', serif; font-size: 5rem; color: rgba(15,37,87,0.05);
    line-height: 1; pointer-events: none;
  }
  .arai-cap-icon {
    width: 48px; height: 48px; border-radius: 10px;
    background: rgba(15,37,87,0.07); display: flex; align-items: center;
    justify-content: center; margin-bottom: 1.5rem; color: ${NAVY};
  }
  .arai-cap-title { font-size: 1.05rem; font-weight: 600; margin: 0 0 0.75rem; color: ${NAVY}; }
  .arai-cap-desc { font-size: 0.875rem; color: rgba(15,37,87,0.6); line-height: 1.7; margin: 0; }

  /* Who Section */
  .arai-who-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
  }
  .arai-who-visual {
    position: relative; height: 380px;
    background: ${NAVY}; border-radius: 16px; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  .arai-who-visual-inner { position: relative; z-index: 2; text-align: center; padding: 2rem; }
  .arai-audience-pills { display: flex; flex-direction: column; gap: 12px; }
  .arai-audience-pill {
    display: flex; align-items: center; gap: 14px;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
    border-radius: 100px; padding: 14px 20px; color: #fff;
    transition: background 0.2s;
  }
  .arai-audience-pill:hover { background: rgba(255,255,255,0.15); }
  .arai-audience-pill-icon {
    width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .arai-audience-pill-text { font-size: 0.9rem; font-weight: 500; }

  .arai-who-text-list { list-style: none; padding: 0; margin: 1.5rem 0 0; }
  .arai-who-text-item {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 1.25rem 0; border-bottom: 1px solid rgba(15,37,87,0.08);
    font-size: 0.9rem; color: rgba(15,37,87,0.7); line-height: 1.6;
  }
  .arai-who-text-item:last-child { border-bottom: none; }
  .arai-who-dot {
    width: 6px; height: 6px; border-radius: 50%; background: ${NAVY};
    flex-shrink: 0; margin-top: 0.5rem;
  }

  /* Research */
  .arai-research-bg { background: #f8f7f4; }
  .arai-research-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
  .arai-research-card {
    background: #fff; padding: 2.5rem; border-radius: 0;
    transition: transform 0.2s;
  }
  .arai-research-card:first-child { border-radius: 16px 0 0 16px; }
  .arai-research-card:last-child { border-radius: 0 16px 16px 0; }
  .arai-research-card:hover { transform: translateY(-4px); z-index: 1; }
  .arai-research-num {
    font-family: 'DM Serif Display', serif; font-size: 2.5rem; color: ${NAVY}; margin-bottom: 0.5rem;
  }
  .arai-research-title { font-size: 1rem; font-weight: 600; color: ${NAVY}; margin: 0 0 0.75rem; }
  .arai-research-desc { font-size: 0.875rem; color: rgba(15,37,87,0.6); line-height: 1.7; margin: 0; }

  /* CTA */
  .arai-cta {
    background: ${NAVY}; padding: 7rem 4rem;
    position: relative; overflow: hidden;
  }
  .arai-cta::before {
    content: 'ARAI'; position: absolute; right: -2rem; top: 50%;
    transform: translateY(-50%);
    font-family: 'DM Serif Display', serif; font-size: 22rem; color: rgba(255,255,255,0.03);
    line-height: 1; pointer-events: none; white-space: nowrap;
  }
  .arai-cta-inner { max-width: 700px; margin: 0 auto; text-align: center; position: relative; z-index: 1; }
  .arai-cta h2 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.2rem, 4vw, 3.2rem); color: #fff; margin: 0 0 1.25rem; font-weight: 400;
  }
  .arai-cta h2 em { font-style: italic; opacity: 0.75; }
  .arai-cta p { font-size: 1rem; color: rgba(255,255,255,0.6); margin: 0 0 2.5rem; }
  .arai-cta-btns { display: flex; align-items: center; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  .arai-btn-white {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 0.875rem 2rem; background: #fff; color: ${NAVY};
    border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .arai-btn-white:hover { background: rgba(255,255,255,0.92); gap: 12px; }
  .arai-btn-white-outline {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 0.875rem 2rem; background: transparent; color: rgba(255,255,255,0.9);
    border: 1.5px solid rgba(255,255,255,0.3); border-radius: 8px;
    font-size: 0.95rem; font-weight: 500; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .arai-btn-white-outline:hover { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.08); }

  /* Footer */
  .arai-footer {
    background: #0c1e4a; padding: 3rem 4rem;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;
  }
  .arai-footer-links { display: flex; gap: 2rem; }
  .arai-footer-link {
    font-size: 0.8rem; color: rgba(255,255,255,0.4);
    text-decoration: none; transition: color 0.2s; cursor: pointer;
    background: none; border: none; font-family: 'DM Sans', sans-serif;
  }
  .arai-footer-link:hover { color: rgba(255,255,255,0.75); }
  .arai-footer-copy { font-size: 0.8rem; color: rgba(255,255,255,0.3); }

  @media (max-width: 900px) {
    .arai-nav { padding: 0 1.5rem; }
    .arai-hero { padding: 7rem 1.5rem 3rem; }
    .arai-hero-inner { grid-template-columns: 1fr; gap: 3rem; }
    .arai-stats-inner { grid-template-columns: repeat(2, 1fr); }
    .arai-section { padding: 4rem 1.5rem; }
    .arai-caps-grid, .arai-who-grid, .arai-research-grid { grid-template-columns: 1fr; }
    .arai-cta { padding: 5rem 1.5rem; }
    .arai-footer { padding: 2rem 1.5rem; flex-direction: column; align-items: flex-start; }
    .arai-nav-links { gap: 1rem; }
    .arai-cap-card:first-child { border-radius: 16px 16px 0 0; }
    .arai-cap-card:last-child { border-radius: 0 0 16px 16px; }
    .arai-research-card:first-child, .arai-research-card:last-child { border-radius: 16px; }
  }
`;

const capabilities = [
  {
    icon: <Eye size={20} />,
    title: 'Visual Attention Analysis',
    desc: 'Saliency mapping using a custom U-Net CNN predicts exactly where users look first — so you can test hierarchy and focal points before dev.',
    num: '01'
  },
  {
    icon: <FileText size={20} />,
    title: 'Readability Scoring',
    desc: 'Multi-metric readability analysis (Flesch-Kincaid, Gunning Fog, SMOG) ensures your copy is accessible to all literacy levels.',
    num: '02'
  },
  {
    icon: <Brain size={20} />,
    title: 'WCAG 2.1 Compliance',
    desc: 'Automated checks across 50+ WCAG 2.1 criteria — contrast ratios, alt text, keyboard accessibility, and more.',
    num: '03'
  }
];

// Tiny inline SVG for Palette since not imported
const Palette = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/>
    <circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12a10 10 0 0 0 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

const audience = [
  { icon: <Palette size={14} />, label: 'UX & UI Designers' },
  { icon: <Users size={14} />, label: 'Product Teams' },
  { icon: <GraduationCap size={14} />, label: 'Accessibility Specialists' },
  { icon: <Zap size={14} />, label: 'Front-End Developers' },
];

const Landing = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService?.isAuthenticated?.() ?? false;

  return (
    <div className="arai-root">
      <style>{styles}</style>

      {/* Navigation */}
      <nav className="arai-nav">
        <div className="arai-logo">
          <div className="arai-logo-mark">
            <Brain size={18} color="#fff" />
          </div>
          <span className="arai-logo-text">ARAI</span>
        </div>

        <div className="arai-nav-links">
          <button className="arai-nav-link" onClick={() => navigate('/about')}>About</button>
          <button className="arai-nav-link" onClick={() => navigate('/features')}>Features</button>
          <button className="arai-nav-link" onClick={() => navigate('/how-it-works')}>How It Works</button>
          <button className="arai-nav-link" onClick={() => navigate('/contact')}>Contact</button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isAuthenticated ? (
            <button className="arai-btn-primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
          ) : (
            <>
              <button className="arai-btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
              <button className="arai-btn-primary" onClick={() => navigate('/signup')}>Get Early Access</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="arai-hero">
        <div className="arai-hero-bg">
          <div className="arai-hero-circle" style={{ width: 600, height: 600, top: -200, right: -200 }} />
          <div className="arai-hero-circle" style={{ width: 400, height: 400, bottom: -100, left: -100 }} />
        </div>

        <div className="arai-hero-inner">
          <div>
            <div className="arai-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: NAVY, display: 'inline-block' }} />
              AI-Powered Design Analysis
            </div>

            <h1 className="arai-h1">
              Accessibility checks,<br />
              <em>before</em> a line of code<br />
              is written.
            </h1>

            <p className="arai-hero-sub">
              Upload your Figma or Adobe XD mock-up and receive instant feedback on accessibility, readability, and visual attention — all from one composite ARAI score.
            </p>

            <div className="arai-hero-cta">
              {isAuthenticated ? (
                <button className="arai-btn-large" onClick={() => navigate('/dashboard')}>
                  Open Dashboard <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button className="arai-btn-large" onClick={() => navigate('/signup')}>
                    Get Early Access <ArrowRight size={16} />
                  </button>
                  <button className="arai-btn-large-outline" onClick={() => navigate('/how-it-works')}>
                    See How It Works
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero Visual — mock analysis card */}
          <div className="arai-hero-visual">
            <div className="arai-hero-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(15,37,87,0.5)', textTransform: 'uppercase' }}>ARAI Score</span>
                <span style={{ fontSize: '0.7rem', padding: '3px 10px', background: 'rgba(15,37,87,0.06)', borderRadius: 100, color: NAVY, fontWeight: 600 }}>Analysis Complete</span>
              </div>

              <div className="arai-score-ring">
                <span className="arai-score-num">87</span>
                <span className="arai-score-label">/ 100</span>
              </div>

              <div className="arai-score-bars">
                {[
                  { name: 'Accessibility', pct: 91 },
                  { name: 'Readability', pct: 82 },
                  { name: 'Attention', pct: 88 },
                ].map(({ name, pct }) => (
                  <div className="arai-bar-row" key={name}>
                    <span className="arai-bar-name">{name}</span>
                    <div className="arai-bar-track">
                      <div className="arai-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="arai-bar-pct">{pct}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(15,37,87,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(15,37,87,0.45)' }}>Analysed in 28s · 54 checks</span>
                <span style={{ fontSize: '0.75rem', color: NAVY, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Full report <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="arai-stats">
        <div className="arai-stats-inner">
          {[
            { num: '95.9%', label: 'of websites fail at least one WCAG check' },
            { num: '30s', label: 'Average ARAI analysis time' },
            { num: '50+', label: 'WCAG 2.1 criteria checked automatically' },
            { num: '10×', label: 'Cheaper to fix at design stage vs. post-launch' },
          ].map(({ num, label }) => (
            <div className="arai-stat" key={num}>
              <div className="arai-stat-num">{num}</div>
              <div className="arai-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Capabilities */}
      <section className="arai-section arai-capabilities-bg">
        <div className="arai-section-inner">
          <div className="arai-section-header">
            <span className="arai-section-tag">Core Capabilities</span>
            <h2 className="arai-h2">
              Everything you need for<br /><em>accessible, inclusive design</em>
            </h2>
            <p className="arai-section-desc">
              ARAI combines three AI modules into one composite score — so you can see the full picture of your design's inclusivity at a glance.
            </p>
          </div>

          <div className="arai-caps-grid">
            {capabilities.map((cap) => (
              <div className="arai-cap-card" key={cap.num} data-num={cap.num}>
                <div className="arai-cap-icon">{cap.icon}</div>
                <p className="arai-cap-title">{cap.title}</p>
                <p className="arai-cap-desc">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="arai-section">
        <div className="arai-section-inner">
          <div className="arai-who-grid">
            <div className="arai-who-visual">
              <div className="arai-who-visual-inner">
                <div className="arai-audience-pills">
                  {audience.map(({ icon, label }) => (
                    <div className="arai-audience-pill" key={label}>
                      <div className="arai-audience-pill-icon">{icon}</div>
                      <span className="arai-audience-pill-text">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <span className="arai-section-tag">Who It's For</span>
              <h2 className="arai-h2">Built for the<br /><em>people who design</em></h2>
              <ul className="arai-who-text-list">
                {[
                  'UX designers who need fast, evidence-backed accessibility critique without switching tools.',
                  'Product teams shipping at speed who can\'t afford costly post-launch remediation.',
                  'Developers who want design handoffs that already meet WCAG standards.',
                  'Educators and students learning accessibility best practices with real feedback.',
                ].map((txt, i) => (
                  <li className="arai-who-text-item" key={i}>
                    <div className="arai-who-dot" />
                    {txt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Built on Research */}
      <section className="arai-section arai-research-bg">
        <div className="arai-section-inner">
          <div className="arai-section-header">
            <span className="arai-section-tag">Research Foundation</span>
            <h2 className="arai-h2">Built on <em>real research</em></h2>
            <p className="arai-section-desc">
              ARAI was developed at the University of Westminster's School of Computer Science and Engineering, grounded in peer-reviewed methodology.
            </p>
          </div>

          <div className="arai-research-grid">
            {[
              {
                num: 'WCAG 2.1',
                title: 'Web Content Accessibility Guidelines',
                desc: 'Every check maps directly to a WCAG 2.1 success criterion, giving you a clear path from score to remediation.'
              },
              {
                num: 'U-Net CNN',
                title: 'Deep Learning Saliency Model',
                desc: 'A custom-trained convolutional neural network generates saliency maps that predict where the human eye travels across your design.'
              },
            ].map(({ num, title, desc }) => (
              <div className="arai-research-card" key={num}>
                <div className="arai-research-num">{num}</div>
                <p className="arai-research-title">{title}</p>
                <p className="arai-research-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="arai-cta">
        <div className="arai-cta-inner">
          <h2>Stop fixing accessibility<br /><em>after the fact.</em></h2>
          <p>Start building inclusively from the very first design. ARAI gives you the feedback you need, at the stage it actually makes a difference.</p>
          <div className="arai-cta-btns">
            {isAuthenticated ? (
              <button className="arai-btn-white" onClick={() => navigate('/dashboard')}>
                Open Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button className="arai-btn-white" onClick={() => navigate('/signup')}>
                  Get Early Access <ArrowRight size={16} />
                </button>
                <button className="arai-btn-white-outline" onClick={() => navigate('/how-it-works')}>
                  How It Works
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="arai-footer">
        <div className="arai-logo" style={{ textDecoration: 'none' }}>
          <div className="arai-logo-mark">
            <Brain size={16} color="#fff" />
          </div>
          <span className="arai-logo-text" style={{ color: 'rgba(255,255,255,0.7)' }}>ARAI</span>
        </div>

        <div className="arai-footer-links">
          {['Home', 'About', 'Features', 'How It Works', 'Contact'].map(link => (
            <button
              key={link}
              className="arai-footer-link"
              onClick={() => navigate(`/${link.toLowerCase().replace(' ', '-')}`)}>
              {link}
            </button>
          ))}
        </div>

        <span className="arai-footer-copy">© 2026 ARAI · University of Westminster</span>
      </footer>
    </div>
  );
};

export default Landing;