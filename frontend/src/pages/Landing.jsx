import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Download } from 'lucide-react';
import { authService } from '../services/auth';

const N = '#0f2557';
const ND = '#091840';

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.r { font-family: 'DM Sans', sans-serif; background: #f5f4f0; color: #0f2557; overflow-x: hidden; }

/* ── NAV ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center; 
  padding: 0 3rem 0 2.5rem; height: 60px;
  background: #f5f4f0; border-bottom: 1.5px solid #0f2557;
}
.nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 1rem; letter-spacing: 0.1em; cursor: pointer; }
.nav-logo-sq { width: 28px; height: 28px; background: #0f2557; display: flex; align-items: center; justify-content: center; }
.nav-center { display: none; }
.nav-link { font-size: 0.8rem; letter-spacing: 0.05em; color: rgba(15,37,87,0.55); background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: color 0.15s; }
.nav-link:hover { color: #0f2557; }
.nav-right { display: flex; justify-content: flex-end; gap: 0.75rem; align-items: center; }
.btn-nv { padding: 0.45rem 1.2rem; font-size: 0.8rem; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.btn-nv-g { background: none; border: 1.5px solid rgba(15,37,87,0.3); color: #0f2557; }
.btn-nv-g:hover { border-color: #0f2557; }
.btn-nv-f { background: #0f2557; border: 1.5px solid #0f2557; color: #fff; }
.btn-nv-f:hover { background: #091840; }

/* ── TICKER ── */
.ticker { background: #0f2557; height: 38px; overflow: hidden; display: flex; align-items: center; margin-top: 60px; }
.ticker-track { display: flex; white-space: nowrap; animation: tick 30s linear infinite; }
.ticker-item { font-size: 0.68rem; letter-spacing: 0.13em; text-transform: uppercase; color: rgba(255,255,255,0.6); padding: 0 2.5rem; font-weight: 500; display: flex; align-items: center; gap: 2.5rem; }
.ticker-dot { width: 3px; height: 3px; background: rgba(255,255,255,0.3); display: inline-block; }
@keyframes tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* ── HERO ── */
.hero-top { display: grid; grid-template-columns: 300px 1fr; border-bottom: 1.5px solid #0f2557; }
.hero-sidebar {
  border-right: 1.5px solid #0f2557; display: flex; flex-direction: column;
  justify-content: space-between; padding: 3rem 2rem; min-height: calc(100vh - 98px);
}
.hsl { font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(15,37,87,0.38); font-weight: 600; margin-bottom: 0.6rem; }
.hst { font-size: 0.82rem; color: #0f2557; font-weight: 500; line-height: 1.6; }
.hs-stat { padding: 1.2rem 0; border-top: 1px solid rgba(15,37,87,0.11); }
.hs-stat-n { font-family: 'DM Serif Display', serif; font-size: 2rem; color: #0f2557; line-height: 1; }
.hs-stat-d { font-size: 0.7rem; color: rgba(15,37,87,0.48); margin-top: 0.3rem; line-height: 1.4; }

.hero-main { display: flex; flex-direction: column; }
.hero-main-top { flex: 1; padding: 4rem 4rem 3rem; display: flex; flex-direction: column; justify-content: center; }
.h-eyebrow { font-size: 0.63rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(15,37,87,0.38); font-weight: 600; margin-bottom: 2.5rem; }
.hero-h1 { font-family: 'DM Serif Display', serif; font-size: clamp(3rem, 5.5vw, 5.2rem); line-height: 1.0; color: #0f2557; font-weight: 400; margin-bottom: 2.5rem; }
.hero-h1 span { display: block; }
.hero-h1 em { font-style: italic; }
.hero-desc { font-size: 0.95rem; color: rgba(15,37,87,0.6); max-width: 460px; line-height: 1.85; margin-bottom: 3rem; }
.hero-cta { display: flex; align-items: center; gap: 1rem; }
.btn-h { display: inline-flex; align-items: center; gap: 8px; padding: 0.85rem 2rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.btn-hf { background: #0f2557; color: #fff; border: 1.5px solid #0f2557; }
.btn-hf:hover { background: #091840; gap: 12px; }
.btn-ho { background: none; color: #0f2557; border: 1.5px solid rgba(15,37,87,0.28); }
.btn-ho:hover { border-color: #0f2557; }

.hero-stats-bar { border-top: 1.5px solid #0f2557; display: grid; grid-template-columns: repeat(4,1fr); }
.hsc { padding: 1.5rem 2rem; border-right: 1.5px solid #0f2557; }
.hsc:last-child { border-right: none; }
.hsc-n { font-family: 'DM Serif Display', serif; font-size: 2.2rem; color: #0f2557; line-height: 1; }
.hsc-l { font-size: 0.68rem; color: rgba(15,37,87,0.48); margin-top: 0.4rem; line-height: 1.45; }

/* ── SECTION TAG BAR ── */
.stb { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 3rem; border-top: 1.5px solid #0f2557; border-bottom: 1.5px solid #0f2557; }
.stb-t { font-size: 0.63rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(15,37,87,0.38); font-weight: 600; }
.stb-n { font-size: 0.63rem; letter-spacing: 0.1em; color: rgba(15,37,87,0.22); font-weight: 600; }

/* ── ARAI SCORE SECTION ── */
.score-section {
  background: #0f2557;
  padding: 0;
  position: relative;
  overflow: hidden;
  border-bottom: 1.5px solid #091840;
}

/* Subtle animated diagonal lines as background texture */
.score-section::before {
  content: '';
  position: absolute; inset: 0;
  background-image: repeating-linear-gradient(
    -55deg,
    rgba(255,255,255,0.018) 0px,
    rgba(255,255,255,0.018) 1px,
    transparent 1px,
    transparent 60px
  );
  pointer-events: none;
}

.score-inner {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1fr;
}

/* Left panel — heading + sub scores */
.score-left {
  padding: 5rem 4rem;
  border-right: 1.5px solid rgba(255,255,255,0.1);
  display: flex; flex-direction: column; justify-content: center;
}

.score-eyebrow {
  font-size: 0.63rem; letter-spacing: 0.18em; text-transform: uppercase;
  font-weight: 600; color: rgba(255,255,255,0.35); margin-bottom: 1.5rem;
}
.score-h2 {
  font-family: 'DM Serif Display', serif; font-size: clamp(2rem,3.5vw,3rem);
  color: #fff; font-weight: 400; line-height: 1.1; margin-bottom: 1rem;
}
.score-h2 em { font-style: italic; opacity: 0.55; }
.score-subtext {
  font-size: 0.88rem; color: rgba(255,255,255,0.5); line-height: 1.8;
  max-width: 380px; margin-bottom: 3.5rem; font-weight: 300;
}

/* Sub-score rows */
.sub-scores { display: flex; flex-direction: column; gap: 0; }
.sub-row {
  display: flex; align-items: center; gap: 2rem;
  padding: 1.4rem 0; border-top: 1px solid rgba(255,255,255,0.08);
  position: relative;
}
.sub-row:last-child { border-bottom: 1px solid rgba(255,255,255,0.08); }

/* Small ring */
.mini-ring-wrap { position: relative; width: 64px; height: 64px; flex-shrink: 0; }
.mini-ring-wrap svg { transform: rotate(-90deg); width: 64px; height: 64px; }
.mr-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 5; }
.mr-fill { fill: none; stroke-width: 5; stroke-linecap: butt; stroke-dasharray: 175.9; stroke-dashoffset: 175.9; transition: stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1); }
.mr-fill.c1 { stroke: rgba(255,255,255,0.9); }
.mr-fill.c2 { stroke: rgba(255,255,255,0.7); }
.mr-fill.c3 { stroke: rgba(255,255,255,0.5); }
.mini-ring-num {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: #fff; line-height: 1;
}
.sub-meta { flex: 1; }
.sub-name { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 0.3rem; }
.sub-desc { font-size: 0.8rem; color: rgba(255,255,255,0.38); line-height: 1.55; font-weight: 300; }
.sub-pct { font-family: 'DM Serif Display', serif; font-size: 1.6rem; color: rgba(255,255,255,0.9); flex-shrink: 0; }

/* Right panel — composite score */
.score-right {
  padding: 5rem 4rem;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
}

.composite-wrap { position: relative; width: 200px; height: 200px; margin-bottom: 3rem; }
.composite-wrap svg { transform: rotate(-90deg); width: 200px; height: 200px; }
.cr-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 8; }
.cr-fill {
  fill: none; stroke-width: 8; stroke-linecap: butt;
  stroke: rgba(255,255,255,0.9);
  stroke-dasharray: 565.5; stroke-dashoffset: 565.5;
  transition: stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1) 0.5s;
}
/* second ring decorative */
.cr-deco { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 1; stroke-dasharray: 4 8; }

.composite-num {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  text-align: center;
}
.comp-big { display: block; font-family: 'DM Serif Display', serif; font-size: 4.5rem; color: #fff; line-height: 1; }
.comp-small { display: block; font-size: 0.72rem; letter-spacing: 0.12em; color: rgba(255,255,255,0.35); text-transform: uppercase; margin-top: 0.3rem; font-weight: 600; }

.composite-label {
  text-align: center; margin-bottom: 2rem;
}
.composite-label h3 { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #fff; font-weight: 400; margin-bottom: 0.5rem; }
.composite-label p { font-size: 0.8rem; color: rgba(255,255,255,0.4); line-height: 1.6; max-width: 280px; font-weight: 300; }

.export-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 0.85rem 2rem; background: #fff; color: #0f2557;
  border: none; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: all 0.15s; letter-spacing: 0.02em;
}
.export-btn:hover { background: rgba(255,255,255,0.9); gap: 12px; }

/* Floating indicator lines on right panel */
.score-right::before {
  content: '';
  position: absolute; left: 0; top: 20%; height: 60%; width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent);
}

/* ── CAPABILITIES ── */
.caps-header { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1.5px solid #0f2557; }
.caps-header-l { padding: 4rem 3rem; border-right: 1.5px solid #0f2557; }
.caps-header-r { padding: 4rem 3rem; display: flex; align-items: flex-end; }
.caps-h2 { font-family: 'DM Serif Display', serif; font-size: clamp(2rem,3.8vw,3.2rem); line-height: 1.1; color: #0f2557; font-weight: 400; }
.caps-h2 em { font-style: italic; }
.caps-desc { font-size: 0.9rem; color: rgba(15,37,87,0.58); line-height: 1.85; font-weight: 300; }

.caps-grid { display: grid; grid-template-columns: repeat(3,1fr); border-bottom: 1.5px solid #0f2557; }
.cap-cell { padding: 3rem; border-right: 1.5px solid #0f2557; position: relative; overflow: hidden; transition: background 0.2s; }
.cap-cell:last-child { border-right: none; }
.cap-cell:hover { background: rgba(15,37,87,0.025); }
.cap-ghost { position: absolute; right: -0.5rem; bottom: -3rem; font-family: 'DM Serif Display', serif; font-size: 9rem; color: rgba(15,37,87,0.04); line-height: 1; pointer-events: none; font-style: italic; }
.cap-n { font-size: 0.62rem; letter-spacing: 0.18em; color: rgba(15,37,87,0.28); font-weight: 600; text-transform: uppercase; margin-bottom: 2rem; }
.cap-t { font-family: 'DM Serif Display', serif; font-size: 1.45rem; color: #0f2557; margin-bottom: 1rem; line-height: 1.2; }
.cap-t em { font-style: italic; }
.cap-d { font-size: 0.82rem; color: rgba(15,37,87,0.58); line-height: 1.8; }
.cap-more { display: inline-flex; align-items: center; gap: 5px; margin-top: 2rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; color: #0f2557; text-transform: uppercase; }

/* ── WHO ── */
.who-grid { display: grid; grid-template-columns: 1fr 1fr; }
.who-l { background: #0f2557; padding: 4rem 3rem; display: flex; flex-direction: column; border-right: 1.5px solid #0f2557; }
.who-l h2 { font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem,3vw,2.8rem); color: #fff; font-weight: 400; line-height: 1.15; margin-bottom: 3rem; }
.who-l h2 em { font-style: italic; opacity: 0.5; }
.who-row { display: flex; align-items: flex-start; gap: 1.5rem; padding: 1.2rem 0; border-top: 1px solid rgba(255,255,255,0.09); }
.who-rn { font-size: 0.62rem; letter-spacing: 0.1em; color: rgba(255,255,255,0.28); font-weight: 600; padding-top: 0.15rem; min-width: 20px; }
.who-rt { font-size: 0.87rem; color: rgba(255,255,255,0.62); line-height: 1.75; }
.who-r { padding: 4rem 3rem; display: flex; flex-direction: column; justify-content: space-between; }
.who-r h3 { font-family: 'DM Serif Display', serif; font-size: 1.3rem; color: #0f2557; margin-bottom: 2rem; }
.aud-item { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 0; border-bottom: 1px solid rgba(15,37,87,0.09); transition: padding-left 0.18s; cursor: default; }
.aud-item:hover { padding-left: 0.6rem; }
.aud-label { font-size: 0.9rem; font-weight: 500; color: #0f2557; }
.aud-arr { color: rgba(15,37,87,0.22); transition: color 0.18s; }
.aud-item:hover .aud-arr { color: #0f2557; }
.who-fn { font-size: 0.74rem; color: rgba(15,37,87,0.36); line-height: 1.65; margin-top: 2rem; font-style: italic; }

/* ── RESEARCH ── */
.research-top { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1.5px solid #0f2557; }
.res-l { padding: 4rem 3rem; border-right: 1.5px solid #0f2557; }
.res-l h2 { font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem,3vw,2.8rem); color: #0f2557; font-weight: 400; line-height: 1.15; margin-bottom: 1.5rem; }
.res-l h2 em { font-style: italic; }
.res-l p { font-size: 0.87rem; color: rgba(15,37,87,0.58); line-height: 1.85; font-weight: 300; }
.res-r { padding: 4rem 3rem; }
.rpill { display: flex; align-items: center; justify-content: space-between; padding: 1.4rem 0; border-bottom: 1px solid rgba(15,37,87,0.09); transition: padding-left 0.18s; }
.rpill:first-child { border-top: 1px solid rgba(15,37,87,0.09); }
.rpill:hover { padding-left: 0.5rem; }
.rpill-l { font-family: 'DM Serif Display', serif; font-size: 1rem; color: #0f2557; }
.rpill-b { font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; color: rgba(15,37,87,0.32); background: rgba(15,37,87,0.05); padding: 4px 10px; }

/* ── CTA ── */
.cta-wrap { background: #0f2557; display: grid; grid-template-columns: 1fr 320px; }
.cta-l { padding: 5rem 4rem; display: flex; flex-direction: column; justify-content: space-between; border-right: 1.5px solid rgba(255,255,255,0.09); }
.cta-l h2 { font-family: 'DM Serif Display', serif; font-size: clamp(2.2rem,4vw,3.8rem); color: #fff; font-weight: 400; line-height: 1.05; }
.cta-l h2 em { font-style: italic; opacity: 0.45; }
.cta-l p { font-size: 0.9rem; color: rgba(255,255,255,0.5); line-height: 1.85; max-width: 460px; margin-top: 1.5rem; font-weight: 300; }
.cta-btns { display: flex; gap: 1rem; margin-top: 3rem; flex-wrap: wrap; }
.btn-cw { display: inline-flex; align-items: center; gap: 8px; padding: 0.85rem 2rem; background: #fff; color: #0f2557; border: 1.5px solid #fff; font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.btn-cw:hover { gap: 12px; }
.btn-cg { display: inline-flex; align-items: center; gap: 8px; padding: 0.85rem 2rem; background: none; color: rgba(255,255,255,0.72); border: 1.5px solid rgba(255,255,255,0.2); font-size: 0.875rem; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.btn-cg:hover { border-color: rgba(255,255,255,0.55); color: #fff; }
.cta-r { padding: 4rem 2.5rem; display: flex; flex-direction: column; justify-content: center; }
.cta-stat { padding: 1.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
.cta-stat:first-child { border-top: 1px solid rgba(255,255,255,0.07); }
.cta-stat-n { font-family: 'DM Serif Display', serif; font-size: 3.2rem; color: #fff; line-height: 1; }
.cta-stat-l { font-size: 0.7rem; color: rgba(255,255,255,0.35); margin-top: 0.35rem; line-height: 1.4; }

/* ── FOOTER ── */
.footer { background: #0a1a3f; border-top: 1.5px solid rgba(255,255,255,0.06); }
.footer-top { display: grid; grid-template-columns: 280px 1fr 1fr; padding: 3rem; gap: 3rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
.fb-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
.fb-sq { width: 26px; height: 26px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; }
.fb-name { font-size: 0.9rem; font-weight: 600; letter-spacing: 0.1em; color: rgba(255,255,255,0.6); }
.fb-desc { font-size: 0.76rem; color: rgba(255,255,255,0.26); line-height: 1.75; font-weight: 300; }
.fcol-t { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; color: rgba(255,255,255,0.22); margin-bottom: 1.25rem; }
.flink { display: block; font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-bottom: 0.7rem; text-decoration: none; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; text-align: left; transition: color 0.15s; }
.flink:hover { color: rgba(255,255,255,0.75); }
.footer-bottom { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 3rem; }
.footer-copy { font-size: 0.72rem; color: rgba(255,255,255,0.18); }
.footer-uni { font-size: 0.68rem; color: rgba(255,255,255,0.16); letter-spacing: 0.05em; }

/* ── RESPONSIVE ── */
@media (max-width: 960px) {
  .nav { grid-template-columns: 1fr auto; padding: 0 1.5rem; }
  .nav-center { display: none; }
  .hero-top { grid-template-columns: 1fr; }
  .hero-sidebar { display: none; }
  .hero-main-top { padding: 3rem 1.5rem 2rem; }
  .hero-h1 { font-size: 2.6rem; }
  .hero-stats-bar { grid-template-columns: repeat(2,1fr); }
  .hsc:nth-child(2) { border-right: none; }
  .hsc:nth-child(3) { border-top: 1.5px solid #0f2557; }
  .score-inner { grid-template-columns: 1fr; }
  .score-left { border-right: none; border-bottom: 1.5px solid rgba(255,255,255,0.1); }
  .caps-header, .who-grid, .research-top, .cta-wrap { grid-template-columns: 1fr; }
  .caps-header-l { border-right: none; border-bottom: 1.5px solid #0f2557; }
  .caps-grid { grid-template-columns: 1fr; }
  .cap-cell { border-right: none; }
  .who-l { border-right: none; }
  .res-l { border-right: none; border-bottom: 1.5px solid #0f2557; }
  .cta-l { border-right: none; }
  .footer-top { grid-template-columns: 1fr 1fr; }
  .footer-bottom { flex-direction: column; gap: 0.4rem; text-align: center; }
  .stb, .caps-header-l, .caps-header-r, .cap-cell, .who-l, .who-r,
  .res-l, .res-r, .cta-l, .cta-r, .footer-top, .footer-bottom,
  .score-left, .score-right { padding-left: 1.5rem; padding-right: 1.5rem; }
}
`;

// ── Score Section Component ──
const ScoreSection = () => {
  const ref = useRef(null);
  const [animated, setAnimated] = useState(false);

  const scores = { access: 78, read: 91, attn: 76 };
  const composite = Math.round((scores.access + scores.read + scores.attn) / 3);

  const C_MINI = 2 * Math.PI * 28;   // r=28, viewBox 64
  const C_COMP = 2 * Math.PI * 90;   // r=90, viewBox 200

  const getOffset = (score, circumference) =>
    circumference - (circumference * score) / 100;

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimated(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const subScores = [
    { key: 'access', label: 'Accessibility', desc: 'WCAG 2.1 AA compliance across 50+ criteria', score: scores.access, cls: 'c1' },
    { key: 'read',   label: 'Readability',   desc: 'Flesch-Kincaid, Gunning Fog & SMOG indices', score: scores.read, cls: 'c2' },
    { key: 'attn',   label: 'Visual Attention', desc: 'U-Net CNN saliency & hierarchy alignment', score: scores.attn, cls: 'c3' },
  ];

  return (
    <div className="score-section" ref={ref}>
      <div className="score-inner">
        {/* Left — heading + sub scores */}
        <div className="score-left">
          <div className="score-eyebrow">The ARAI Index</div>
          <h2 className="score-h2">
            One score.<br />Three <em>dimensions</em><br />of inclusivity.
          </h2>
          <p className="score-subtext">
            Accessibility, readability, and visual attention — combined into a single, actionable index you can track, export, and present to clients.
          </p>

          <div className="sub-scores">
            {subScores.map((s, i) => (
              <div className="sub-row" key={s.key}>
                {/* Mini ring */}
                <div className="mini-ring-wrap">
                  <svg viewBox="0 0 64 64">
                    <circle className="mr-bg" cx="32" cy="32" r="28" />
                    <circle
                      className={`mr-fill ${s.cls}`}
                      cx="32" cy="32" r="28"
                      style={{
                        strokeDashoffset: animated
                          ? getOffset(s.score, C_MINI)
                          : C_MINI,
                        transitionDelay: `${i * 250}ms`,
                      }}
                    />
                  </svg>
                  <div className="mini-ring-num">{animated ? s.score : 0}</div>
                </div>
                <div className="sub-meta">
                  <div className="sub-name">{s.label}</div>
                  <div className="sub-desc">{s.desc}</div>
                </div>
                <div className="sub-pct">{s.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — composite */}
        <div className="score-right">
          <div className="composite-wrap">
            <svg viewBox="0 0 200 200">
              {/* Outer deco ring */}
              <circle className="cr-deco" cx="100" cy="100" r="96" />
              <circle className="cr-bg" cx="100" cy="100" r="90" />
              <circle
                className="cr-fill"
                cx="100" cy="100" r="90"
                style={{
                  strokeDashoffset: animated
                    ? getOffset(composite, C_COMP)
                    : C_COMP,
                }}
              />
            </svg>
            <div className="composite-num">
              <span className="comp-big">{animated ? composite : 0}</span>
              <span className="comp-small">ARAI Score</span>
            </div>
          </div>

          <div className="composite-label">
            <h3>Overall ARAI Index</h3>
            <p>A weighted composite of all three modules. Export a compliance-ready PDF with annotated violations, WCAG references, and recommended fixes.</p>
          </div>

          <button className="export-btn">
            <Download size={14} /> Export PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Landing ──
const Landing = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService?.isAuthenticated?.() ?? false;

  const tickerItems = [
    '50+ WCAG 2.1 Criteria', 'Visual Attention Analysis', 'Readability Scoring',
    'AI-Powered Feedback', 'Design-Stage Critique', 'University of Westminster',
    '95.9% of Sites Fail WCAG', 'Upload. Analyse. Improve.',
  ];

  return (
    <div className="r">
      <style>{css}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <img src="/arai-black.png" alt="ARAI Logo" style={{ height: 36, width: 'auto', cursor: 'pointer' }} onClick={() => navigate('/')} />
        </div>
        <div className="nav-right">
          {isAuthenticated ? (
            <button className="btn-nv btn-nv-f" onClick={() => navigate('/dashboard')}>Dashboard</button>
          ) : (
            <>
              <button className="btn-nv btn-nv-g" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn-nv btn-nv-f" onClick={() => navigate('/signup')}>Early Access</button>
            </>
          )}
        </div>
      </nav>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span className="ticker-item" key={i}>
              {item}<span className="ticker-dot" style={{ marginLeft: '2.5rem' }} />
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <div className="hero-top">
        <div className="hero-sidebar">
          <div>
            <div className="hsl">Project</div>
            <div className="hst">AI Accessibility Checker<br />for UX Designers</div>
          </div>
          <div>
            {[{ n: '30s', d: 'Average analysis time' }, { n: '50+', d: 'WCAG 2.1 criteria checked' }, { n: '10×', d: 'Cheaper at design stage' }].map(s => (
              <div className="hs-stat" key={s.n}>
                <div className="hs-stat-n">{s.n}</div>
                <div className="hs-stat-d">{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-main">
          <div className="hero-main-top">
            <div className="h-eyebrow">AI-Powered Accessibility Analysis — 2026</div>
            <h1 className="hero-h1">
              <span>The design critique</span>
              <span>that happens <em>before</em></span>
              <span>a line of code.</span>
            </h1>
            <p className="hero-desc">
              Upload your Figma or Adobe XD mock-up and receive instant feedback on accessibility, readability, and visual attention — all scored in one composite ARAI index.
            </p>
            <div className="hero-cta">
              {isAuthenticated ? (
                <button className="btn-h btn-hf" onClick={() => navigate('/dashboard')}>Dashboard <ArrowRight size={15} /></button>
              ) : (
                <>
                  <button className="btn-h btn-hf" onClick={() => navigate('/signup')}>Get Early Access <ArrowRight size={15} /></button>
                  <button className="btn-h btn-ho" onClick={() => navigate('/how-it-works')}>See How It Works</button>
                </>
              )}
            </div>
          </div>

          <div className="hero-stats-bar">
            {[
              { n: '95.9%', l: 'of websites fail at least one WCAG check' },
              { n: '30s',   l: 'Average ARAI analysis time' },
              { n: '50+',   l: 'WCAG 2.1 criteria auto-checked' },
              { n: '10×',   l: 'Cheaper to fix at design stage' },
            ].map(s => (
              <div className="hsc" key={s.n}>
                <div className="hsc-n">{s.n}</div>
                <div className="hsc-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ARAI SCORE SECTION ── */}
      <ScoreSection />

      {/* CAPABILITIES */}
      <div className="stb">
        <span className="stb-t">Core Capabilities</span>
        <span className="stb-n">01 — 03</span>
      </div>
      <div className="caps-header">
        <div className="caps-header-l">
          <h2 className="caps-h2">Everything you need for<br /><em>accessible,</em><br />inclusive design.</h2>
        </div>
        <div className="caps-header-r">
          <p className="caps-desc">ARAI combines three AI modules into one composite score — so you see the full picture of your design's inclusivity at a glance. No switching tools. No guesswork.</p>
        </div>
      </div>
      <div className="caps-grid">
        {[
          { n: '01', t: 'Visual Attention', em: 'Analysis', ghost: 'I', d: 'Saliency mapping via a custom-trained U-Net CNN predicts exactly where users look first — test hierarchy and focal points before a single line of code is written.' },
          { n: '02', t: 'Readability', em: 'Scoring', ghost: 'II', d: 'Multi-metric analysis using Flesch-Kincaid, Gunning Fog, and SMOG indices ensures your copy is accessible to all literacy levels and age groups.' },
          { n: '03', t: 'WCAG 2.1', em: 'Compliance', ghost: 'III', d: 'Automated checks across 50+ WCAG 2.1 success criteria — contrast ratios, alt text, keyboard navigation paths — with clear remediation steps.' },
        ].map(c => (
          <div className="cap-cell" key={c.n}>
            <div className="cap-ghost">{c.ghost}</div>
            <div className="cap-n">{c.n}</div>
            <div className="cap-t">{c.t} <em>{c.em}</em></div>
            <p className="cap-d">{c.d}</p>
            <div className="cap-more">Learn more <ArrowUpRight size={11} /></div>
          </div>
        ))}
      </div>

      {/* WHO */}
      <div className="stb">
        <span className="stb-t">Who It's For</span>
        <span className="stb-n">02 — 03</span>
      </div>
      <div className="who-grid">
        <div className="who-l">
          <h2>Built for the people<br />who <em>design</em>.</h2>
          {[
            'UX designers who need fast, evidence-backed accessibility critique without switching tools or waiting for dev handoff.',
            'Product teams shipping at speed who cannot afford costly post-launch accessibility remediation.',
            'Developers who want design handoffs that already meet WCAG standards, reducing back-and-forth cycles.',
            'Educators and students learning accessibility best practices with real, immediate feedback loops.',
          ].map((txt, i) => (
            <div className="who-row" key={i}>
              <div className="who-rn">0{i + 1}</div>
              <div className="who-rt">{txt}</div>
            </div>
          ))}
        </div>
        <div className="who-r">
          <h3>Built for</h3>
          <div>
            {['UX & UI Designers', 'Product Managers', 'Accessibility Specialists', 'Front-End Developers', 'Design Educators'].map(label => (
              <div className="aud-item" key={label}>
                <span className="aud-label">{label}</span>
                <ArrowRight size={14} className="aud-arr" />
              </div>
            ))}
          </div>
          <p className="who-fn">Developed at the University of Westminster's School of Computer Science and Engineering as a final-year dissertation project.</p>
        </div>
      </div>

      {/* RESEARCH */}
      <div className="stb">
        <span className="stb-t">Research Foundation</span>
        <span className="stb-n">03 — 03</span>
      </div>
      <div className="research-top">
        <div className="res-l">
          <h2>Built on<br /><em>real research.</em></h2>
          <p>ARAI was developed at the University of Westminster grounded in peer-reviewed methodology — not heuristics or guesswork. Every score maps to a standard you can cite and act on.</p>
        </div>
        <div className="res-r">
          {[
            { l: 'WCAG 2.1 — Web Content Accessibility Guidelines', b: 'Standards' },
            { l: 'U-Net CNN — Deep Learning Saliency Model', b: 'AI / ML' },
            { l: 'Flesch-Kincaid, Gunning Fog, SMOG Indices', b: 'Readability' },
            { l: 'University of Westminster — Final Year Dissertation', b: 'Academic' },
          ].map(r => (
            <div className="rpill" key={r.b}>
              <span className="rpill-l">{r.l}</span>
              <span className="rpill-b">{r.b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-wrap">
        <div className="cta-l">
          <div>
            <h2>Stop fixing<br />accessibility<br /><em>after the fact.</em></h2>
            <p>Start building inclusively from the very first design. ARAI gives you the feedback you need, at the stage it actually makes a difference.</p>
          </div>
          <div className="cta-btns">
            {isAuthenticated ? (
              <button className="btn-cw" onClick={() => navigate('/dashboard')}>Open Dashboard <ArrowRight size={15} /></button>
            ) : (
              <>
                <button className="btn-cw" onClick={() => navigate('/signup')}>Get Early Access <ArrowRight size={15} /></button>
                <button className="btn-cg" onClick={() => navigate('/how-it-works')}>How It Works</button>
              </>
            )}
          </div>
        </div>
        <div className="cta-r">
          {[{ n: '95.9%', l: 'of websites fail WCAG' }, { n: '30s', l: 'analysis turnaround' }, { n: '50+', l: 'automated checks' }].map(s => (
            <div className="cta-stat" key={s.n}>
              <div className="cta-stat-n">{s.n}</div>
              <div className="cta-stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <div className="fb-logo">
              <img src="/arai-logo.jpeg" alt="ARAI Logo" style={{ height: 26, width: 'auto' }} />
              <span className="fb-name">ARAI</span>
            </div>
            <p className="fb-desc">AI-powered accessibility analysis for modern design teams. Built with research-backed methods and WCAG standards.</p>
          </div>
          <div>
            <div className="fcol-t">Navigation</div>
            {['Home', 'About', 'Features', 'How It Works', 'Contact Us'].map(l => (
              <button key={l} className="flink" onClick={() => navigate(`/${l.toLowerCase().replace(/ /g, '-')}`)}>{l}</button>
            ))}
          </div>
          <div>
            <div className="fcol-t">Get Involved</div>
            <button className="flink" onClick={() => navigate('/signup')}>Early Access Waitlist</button>
            <a className="flink" href="https://arai-system.vercel.app/dashboard" target="_blank" rel="noreferrer">Live Demo</a>
            <a className="flink" href="https://youtu.be/l45GjL4E0BY" target="_blank" rel="noreferrer">Watch Demo Video</a>
            <a className="flink" href="https://forms.gle/36mRjCnWcD8Vu3wX9" target="_blank" rel="noreferrer">Join Waitlist</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 ARAI · AI-Powered UX Design Critique</span>
          <span className="footer-uni">University of Westminster · Final Year Project</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;