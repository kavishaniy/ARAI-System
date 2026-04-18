import React, { useState, useEffect } from 'react';
import {
  Users, Upload, Layers, Clock, Plus, X, ArrowLeft, FilePlus,
  Trash2, Calendar, Eye, Search, UserPlus, Mail, CheckCircle,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Common/Sidebar';
import PageHeader from '../components/Common/PageHeader';
import UploadAnalysis from '../components/Analysis/UploadAnalysis';
import FigmaProjectInput from '../components/Analysis/FigmaProjectInput';
import MultipleAnalysisResults from '../components/Analysis/MultipleAnalysisResults';
import SimplifiedAnalysisResults from '../components/Analysis/SimplifiedAnalysisResults';
import { teamService, sharingService } from '../services/sharing';
import { analysisService } from '../services/analysis';
import { projectService } from '../services/projects';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const css = `
  /* ── Layout ─────────────────────────────────────── */
  .teams-shell {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
  }

  .teams-pg-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 240px;
    transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    width: calc(100% - 240px);
    max-width: calc(100% - 240px);
  }

  @media (max-width: 1024px) {
    .teams-pg-container { margin-left: 80px; width: calc(100% - 80px); max-width: calc(100% - 80px); }
  }
  @media (max-width: 768px) {
    .teams-pg-container { margin-left: 60px; }
  }
  @media (max-width: 480px) {
    .teams-pg-container { margin-left: 56px; }
  }

  .teams-pg-main {
    flex: 1;
    padding: 32px 60px;
    overflow-y: auto;
  }
  @media (max-width: 1024px) { .teams-pg-main { padding: 24px 40px; } }
  @media (max-width: 768px)  { .teams-pg-main { padding: 20px 24px; } }
  @media (max-width: 480px)  { .teams-pg-main { padding: 16px 16px; } }

  .teams-pg-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  /* ── Tab bar ─────────────────────────────────────── */
  .tpg-tab-bar {
    display: flex;
    gap: 4px;
    margin-bottom: 28px;
    background: white;
    border: 1.5px solid rgba(15,37,87,0.1);
    border-radius: 12px;
    padding: 5px;
  }

  .tpg-tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgba(15,37,87,0.55);
    background: transparent;
    white-space: nowrap;
  }

  .tpg-tab-btn:hover {
    color: #0f2557;
    background: rgba(15,37,87,0.04);
  }

  .tpg-tab-btn.active {
    background: linear-gradient(135deg, #0f2557, #091840);
    color: white;
    box-shadow: 0 4px 12px rgba(15,37,87,0.2);
  }

  @media (max-width: 600px) {
    .tpg-tab-btn span { display: none; }
    .tpg-tab-btn { padding: 10px; }
  }

  /* ── Analysis sub-tabs ───────────────────────────── */
  .tpg-subtabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }

  .tpg-subtab-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 20px;
    border: 1.5px solid rgba(15,37,87,0.15);
    border-radius: 10px;
    background: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(15,37,87,0.6);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tpg-subtab-btn:hover {
    border-color: rgba(15,37,87,0.3);
    color: #0f2557;
  }

  .tpg-subtab-btn.active {
    border-color: #0f2557;
    background: rgba(15,37,87,0.04);
    color: #0f2557;
    font-weight: 600;
  }

  /* ── Shared card ─────────────────────────────────── */
  .tpg-card {
    background: white;
    border: 1.5px solid rgba(15,37,87,0.1);
    border-radius: 14px;
    padding: 28px;
    box-shadow: 0 4px 16px rgba(15,37,87,0.05);
    transition: box-shadow 0.2s ease;
  }

  .tpg-card:hover { box-shadow: 0 8px 24px rgba(15,37,87,0.09); }

  .tpg-card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.2rem;
    font-weight: 400;
    color: #0f2557;
    margin: 0 0 4px 0;
  }

  .tpg-card-subtitle {
    font-size: 0.85rem;
    color: rgba(15,37,87,0.55);
    margin: 0 0 20px 0;
  }

  /* ── Create Project banner ───────────────────────── */
  .tpg-create-banner {
    background: linear-gradient(135deg, #0f2557 0%, #091840 100%);
    border-radius: 16px;
    padding: 32px 36px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  @media (max-width: 600px) {
    .tpg-create-banner { flex-direction: column; align-items: flex-start; padding: 24px 20px; }
  }

  .tpg-create-banner h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    font-weight: 400;
    color: white;
    margin: 0 0 6px 0;
  }

  .tpg-create-banner p {
    font-size: 0.9rem;
    color: rgba(255,255,255,0.7);
    margin: 0;
  }

  .tpg-btn-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: white;
    color: #0f2557;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .tpg-btn-banner:hover {
    background: rgba(255,255,255,0.9);
    box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    transform: translateY(-1px);
  }

  /* ── Form elements ───────────────────────────────── */
  .tpg-form { display: flex; flex-direction: column; gap: 18px; }

  .tpg-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  @media (max-width: 640px) { .tpg-form-row { grid-template-columns: 1fr; } }

  .tpg-form-group { display: flex; flex-direction: column; gap: 6px; }

  .tpg-form-group label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #0f2557;
    letter-spacing: 0.2px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .tpg-input, .tpg-textarea {
    padding: 11px 14px;
    border: 1.5px solid rgba(15,37,87,0.15);
    border-radius: 9px;
    font-size: 0.92rem;
    font-family: 'DM Sans', sans-serif;
    color: #0f2557;
    background: #fafafa;
    transition: all 0.2s ease;
    width: 100%;
    box-sizing: border-box;
  }

  .tpg-input:focus, .tpg-textarea:focus {
    outline: none;
    border-color: #64b4ff;
    box-shadow: 0 0 0 3px rgba(100,180,255,0.1);
    background: white;
  }

  .tpg-input::placeholder, .tpg-textarea::placeholder { color: rgba(15,37,87,0.35); }

  /* ── Email tags ──────────────────────────────────── */
  .tpg-email-tags {
    border: 1.5px solid rgba(15,37,87,0.15);
    border-radius: 9px;
    padding: 8px 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    background: #fafafa;
    transition: all 0.2s ease;
    cursor: text;
    min-height: 48px;
    align-items: center;
  }

  .tpg-email-tags:focus-within {
    border-color: #64b4ff;
    box-shadow: 0 0 0 3px rgba(100,180,255,0.1);
    background: white;
  }

  .tpg-email-tag {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    background: rgba(15,37,87,0.08);
    border-radius: 20px;
    font-size: 0.82rem;
    color: #0f2557;
    font-weight: 500;
  }

  .tpg-email-tag button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    color: rgba(15,37,87,0.45);
    transition: color 0.15s;
  }

  .tpg-email-tag button:hover { color: #ef4444; }

  .tpg-email-input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.875rem;
    font-family: 'DM Sans', sans-serif;
    color: #0f2557;
    min-width: 180px;
    flex: 1;
  }

  .tpg-email-input::placeholder { color: rgba(15,37,87,0.35); }

  .tpg-email-hint { font-size: 0.77rem; color: rgba(15,37,87,0.42); margin-top: 4px; }

  /* ── Buttons ─────────────────────────────────────── */
  .tpg-btn-navy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px 22px;
    background: linear-gradient(135deg, #0f2557, #091840);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .tpg-btn-navy:hover:not(:disabled) {
    background: linear-gradient(135deg, #091840, #051026);
    box-shadow: 0 8px 24px rgba(15,37,87,0.2);
    transform: translateY(-1px);
  }

  .tpg-btn-navy:disabled { opacity: 0.5; cursor: not-allowed; }

  .tpg-btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    background: white;
    border: 1.5px solid rgba(15,37,87,0.2);
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: #0f2557;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .tpg-btn-outline:hover:not(:disabled) {
    border-color: rgba(15,37,87,0.4);
    background: rgba(15,37,87,0.02);
  }

  .tpg-btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

  .tpg-btn-danger {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    background: white;
    border: 1.5px solid rgba(239,68,68,0.3);
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: #991b1b;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .tpg-btn-danger:hover:not(:disabled) {
    border-color: rgba(239,68,68,0.55);
    background: rgba(239,68,68,0.04);
  }

  .tpg-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Alerts ──────────────────────────────────────── */
  .tpg-error {
    padding: 14px 18px;
    background: linear-gradient(135deg, rgba(239,68,68,0.07), rgba(239,68,68,0.03));
    border: 1.5px solid rgba(239,68,68,0.2);
    border-radius: 10px;
    color: #991b1b;
    font-size: 0.9rem;
  }

  .tpg-success {
    padding: 14px 18px;
    background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03));
    border: 1.5px solid rgba(16,185,129,0.25);
    border-radius: 10px;
    color: #065f46;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ── Teams grid ──────────────────────────────────── */
  .tpg-teams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .tpg-team-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .tpg-team-name {
    font-family: 'DM Serif Display', serif;
    font-size: 1.12rem;
    font-weight: 400;
    color: #0f2557;
    margin: 0;
  }

  .tpg-member-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    background: rgba(15,37,87,0.07);
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 600;
    color: #0f2557;
    flex-shrink: 0;
  }

  .tpg-team-desc {
    font-size: 0.875rem;
    color: rgba(15,37,87,0.58);
    margin: 0 0 12px 0;
    line-height: 1.5;
  }

  .tpg-team-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.78rem;
    color: rgba(15,37,87,0.42);
    margin-bottom: 16px;
  }

  .tpg-team-btns { display: flex; gap: 8px; flex-wrap: wrap; }

  /* ── Members ─────────────────────────────────────── */
  .tpg-members-section {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid rgba(15,37,87,0.08);
  }

  .tpg-members-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: rgba(15,37,87,0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }

  .tpg-members-list {
    list-style: none;
    padding: 0;
    margin: 0 0 12px 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .tpg-member-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(15,37,87,0.02);
    border: 1px solid rgba(15,37,87,0.07);
    border-radius: 8px;
  }

  .tpg-member-email {
    font-size: 0.875rem;
    color: #0f2557;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tpg-role-badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: capitalize;
    letter-spacing: 0.3px;
    flex-shrink: 0;
  }

  .tpg-role-badge.role-admin  { background: rgba(249,115,22,0.1);  color: #c2410c; }
  .tpg-role-badge.role-member { background: rgba(59,130,246,0.1);  color: #1d4ed8; }
  .tpg-role-badge.role-viewer { background: rgba(107,114,128,0.1); color: #374151; }

  .tpg-invite-row { display: flex; gap: 8px; margin-top: 10px; }
  .tpg-invite-row .tpg-input { flex: 1; padding: 9px 12px; font-size: 0.875rem; }

  /* ── Empty / loading ─────────────────────────────── */
  .tpg-empty {
    text-align: center;
    padding: 56px 20px;
    background: white;
    border: 1.5px solid rgba(15,37,87,0.08);
    border-radius: 16px;
  }

  .tpg-empty-icon {
    width: 68px;
    height: 68px;
    margin: 0 auto 18px;
    background: rgba(15,37,87,0.06);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
  }

  .tpg-empty h3 { font-size: 1.1rem; font-weight: 600; color: #0f2557; margin: 0 0 8px 0; }
  .tpg-empty p  { font-size: 0.875rem; color: rgba(15,37,87,0.52); margin: 0; }

  .tpg-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 14px;
    color: rgba(15,37,87,0.52);
    font-size: 0.9rem;
  }

  .tpg-spinner {
    width: 26px;
    height: 26px;
    border: 3px solid rgba(15,37,87,0.1);
    border-top-color: #0f2557;
    border-radius: 50%;
    animation: tpg-spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes tpg-spin { to { transform: rotate(360deg); } }

  /* ── History ─────────────────────────────────────── */
  .tpg-history-wrap {
    background: white;
    border: 1.5px solid rgba(15,37,87,0.1);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(15,37,87,0.05);
  }

  .tpg-search-bar {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(15,37,87,0.07);
    position: relative;
  }

  .tpg-search-icon {
    position: absolute;
    left: 32px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(15,37,87,0.35);
    pointer-events: none;
  }

  .tpg-search-input {
    width: 100%;
    padding: 10px 14px 10px 38px;
    border: 1.5px solid rgba(15,37,87,0.12);
    border-radius: 9px;
    font-size: 0.9rem;
    font-family: 'DM Sans', sans-serif;
    color: #0f2557;
    background: #f9f9f7;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }

  .tpg-search-input:focus {
    outline: none;
    border-color: #64b4ff;
    box-shadow: 0 0 0 3px rgba(100,180,255,0.1);
    background: white;
  }

  .tpg-search-input::placeholder { color: rgba(15,37,87,0.35); }

  .tpg-history-list { list-style: none; padding: 0; margin: 0; }

  .tpg-history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 28px;
    border-bottom: 1px solid rgba(15,37,87,0.06);
    transition: background 0.2s ease;
  }

  .tpg-history-item:last-child { border-bottom: none; }

  .tpg-history-item:hover {
    background: linear-gradient(135deg, rgba(15,37,87,0.015), rgba(100,180,255,0.02));
  }

  .tpg-history-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: #0f2557;
    margin: 0 0 5px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tpg-history-date {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    color: rgba(15,37,87,0.48);
  }

  .tpg-history-actions { display: flex; gap: 8px; flex-shrink: 0; }

  /* ── Modal ───────────────────────────────────────── */
  .tpg-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.42);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    backdrop-filter: blur(4px);
  }

  .tpg-modal {
    background: white;
    border-radius: 16px;
    max-width: 1000px;
    max-height: 88vh;
    width: 100%;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.22);
    animation: tpg-slide-up 0.25s ease;
  }

  @keyframes tpg-slide-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .tpg-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 28px;
    border-bottom: 1.5px solid rgba(15,37,87,0.08);
    background: linear-gradient(135deg, rgba(15,37,87,0.02), rgba(100,180,255,0.02));
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .tpg-modal-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.3rem;
    font-weight: 400;
    color: #0f2557;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tpg-modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(15,37,87,0.48);
    padding: 6px;
    border-radius: 6px;
    display: flex;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .tpg-modal-close:hover { background: rgba(15,37,87,0.07); color: #0f2557; }

  .tpg-modal-body { padding: 28px; }

  /* ── Back / new analysis buttons ─────────────────── */
  .tpg-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 14px;
    background: transparent;
    border: 1px solid rgba(15,37,87,0.18);
    border-radius: 9px;
    color: #0f2557;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 20px;
  }

  .tpg-back-btn:hover { background: rgba(15,37,87,0.04); border-color: rgba(15,37,87,0.28); }

  .tpg-new-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 16px;
    background: linear-gradient(135deg, #0f2557, #091840);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tpg-new-btn:hover {
    box-shadow: 0 6px 18px rgba(15,37,87,0.18);
    transform: translateY(-1px);
  }

  /* ── Section heading / divider ───────────────────── */
  .tpg-section-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 1.25rem;
    font-weight: 400;
    color: #0f2557;
    margin: 0 0 18px 0;
  }

  .tpg-divider {
    margin: 28px 0;
    border: none;
    border-top: 1px solid rgba(15,37,87,0.08);
  }
`;

/* ───────────────────────────────────────────────────────────
   EmailTagsInput
──────────────────────────────────────────────────────────── */
const EmailTagsInput = ({ emails, onChange }) => {
  const [input, setInput] = useState('');

  const addEmail = () => {
    const val = input.trim().toLowerCase();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || emails.includes(val)) {
      setInput('');
      return;
    }
    onChange([...emails, val]);
    setInput('');
  };

  const removeEmail = (email) => onChange(emails.filter((e) => e !== email));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(); }
    else if (e.key === 'Backspace' && !input && emails.length > 0) removeEmail(emails[emails.length - 1]);
  };

  return (
    <>
      <div className="tpg-email-tags">
        {emails.map((email) => (
          <span key={email} className="tpg-email-tag">
            {email}
            <button type="button" onClick={() => removeEmail(email)}><X size={11} /></button>
          </span>
        ))}
        <input
          className="tpg-email-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addEmail}
          placeholder={emails.length === 0 ? 'colleague@example.com' : 'Add another…'}
        />
      </div>
      <p className="tpg-email-hint">Press Enter or comma after each email address</p>
    </>
  );
};

/* ───────────────────────────────────────────────────────────
   TeamCard
──────────────────────────────────────────────────────────── */
const TeamCard = ({ team, onRefresh }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  const handleInvite = async (e) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      await teamService.inviteTeamMember(team.id, email, 'member');
      setInviteSuccess(`Collaboration invite sent to ${email}`);
      setInviteEmail('');
      setShowInvite(false);
      onRefresh();
    } catch (err) {
      setInviteError(err.response?.data?.detail || 'Failed to send invite. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="tpg-card">
      <div className="tpg-team-header">
        <h3 className="tpg-team-name">{team.name}</h3>
        <span className="tpg-member-badge">
          <Users size={11} />{team.members?.length || 0}
        </span>
      </div>

      {team.description && <p className="tpg-team-desc">{team.description}</p>}

      <p className="tpg-team-meta">
        <Calendar size={11} />
        {new Date(team.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      {inviteError   && <div className="tpg-error"   style={{ marginBottom: 12, fontSize: '0.85rem' }}>{inviteError}</div>}
      {inviteSuccess && <div className="tpg-success" style={{ marginBottom: 12, fontSize: '0.85rem' }}><CheckCircle size={14} />{inviteSuccess}</div>}

      <div className="tpg-team-btns">
        <button
          className="tpg-btn-outline"
          onClick={() => { setShowMembers(!showMembers); setShowInvite(false); }}
        >
          {showMembers ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showMembers ? 'Hide Members' : 'View Members'}
        </button>
        <button
          className="tpg-btn-outline"
          onClick={() => { setShowInvite(!showInvite); setShowMembers(true); }}
        >
          <UserPlus size={13} />
          Invite
        </button>
      </div>

      {showMembers && (
        <div className="tpg-members-section">
          <p className="tpg-members-label">Members ({team.members?.length || 0})</p>

          {(!team.members || team.members.length === 0) ? (
            <p style={{ fontSize: '0.85rem', color: 'rgba(15,37,87,0.45)', marginBottom: 10 }}>
              No members yet — invite your first collaborator.
            </p>
          ) : (
            <ul className="tpg-members-list">
              {team.members.map((m) => (
                <li key={m.id} className="tpg-member-item">
                  <span className="tpg-member-email">{m.email || 'Unknown'}</span>
                  <span className={`tpg-role-badge role-${m.role}`}>{m.role}</span>
                </li>
              ))}
            </ul>
          )}

          {showInvite && (
            <form className="tpg-invite-row" onSubmit={handleInvite}>
              <input
                type="email"
                className="tpg-input"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
                disabled={inviteLoading}
              />
              <button type="submit" className="tpg-btn-navy" disabled={inviteLoading} style={{ padding: '9px 16px', fontSize: '0.875rem' }}>
                {inviteLoading ? 'Sending…' : 'Send Invite'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   TeamsTab
──────────────────────────────────────────────────────────── */
const TeamsTab = ({ teams, loading, error, onRefresh }) => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [inviteEmails, setInviteEmails] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState(null);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) { setCreateError('Project name is required.'); return; }
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      const project = await projectService.createProject(projectName.trim(), projectDesc.trim());
      const pid = project.id || project.project_id;
      if (inviteEmails.length > 0 && pid) {
        await sharingService.shareProject(pid, [], inviteEmails, 'editor');
      }
      const emailList = inviteEmails.length > 0 ? inviteEmails.join(', ') : null;
      setCreateSuccess(
        emailList
          ? `Project "${projectName.trim()}" created! Collaboration invites sent to: ${emailList}`
          : `Project "${projectName.trim()}" created successfully.`
      );
      setProjectName('');
      setProjectDesc('');
      setInviteEmails([]);
      setShowCreateProject(false);
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Failed to create project. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) { setTeamError('Team name is required.'); return; }
    setTeamLoading(true);
    setTeamError(null);
    try {
      await teamService.createTeam(teamName.trim(), teamDesc.trim());
      setTeamName(''); setTeamDesc('');
      setShowCreateTeam(false);
      onRefresh();
    } catch (err) {
      setTeamError(err.response?.data?.detail || 'Failed to create team.');
    } finally {
      setTeamLoading(false);
    }
  };

  return (
    <div>
      {/* ── Create Project Banner ── */}
      <div className="tpg-create-banner">
        <div>
          <h2>Start a New Project</h2>
          <p>Create a shared project and invite collaborators by email — they'll receive an invite instantly.</p>
        </div>
        <button
          className="tpg-btn-banner"
          onClick={() => { setShowCreateProject(!showCreateProject); setCreateSuccess(null); setCreateError(null); }}
        >
          <Plus size={15} />
          {showCreateProject ? 'Cancel' : 'Create Project'}
        </button>
      </div>

      {createSuccess && (
        <div className="tpg-success" style={{ marginBottom: 22 }}>
          <CheckCircle size={15} />{createSuccess}
        </div>
      )}

      {showCreateProject && (
        <div className="tpg-card" style={{ marginBottom: 28 }}>
          <h3 className="tpg-card-title">New Shared Project</h3>
          <p className="tpg-card-subtitle">Set up your project and invite team members by email in one step.</p>

          {createError && <div className="tpg-error" style={{ marginBottom: 16 }}>{createError}</div>}

          <form className="tpg-form" onSubmit={handleCreateProject}>
            <div className="tpg-form-row">
              <div className="tpg-form-group">
                <label>Project Name *</label>
                <input className="tpg-input" value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Mobile App Redesign" required />
              </div>
              <div className="tpg-form-group">
                <label>Description</label>
                <input className="tpg-input" value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Brief description (optional)" />
              </div>
            </div>

            <div className="tpg-form-group">
              <label><Mail size={13} />Invite Collaborators by Email</label>
              <EmailTagsInput emails={inviteEmails} onChange={setInviteEmails} />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="tpg-btn-navy" disabled={createLoading}>
                {createLoading ? 'Creating…' : <><Plus size={14} /> Create &amp; Send Invites</>}
              </button>
              <button type="button" className="tpg-btn-outline" onClick={() => setShowCreateProject(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <hr className="tpg-divider" />

      {/* ── Teams heading + new team button ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 className="tpg-section-heading" style={{ margin: 0 }}>My Teams</h2>
        <button className="tpg-btn-outline" onClick={() => setShowCreateTeam(!showCreateTeam)}>
          <Plus size={13} /> New Team
        </button>
      </div>

      {showCreateTeam && (
        <div className="tpg-card" style={{ marginBottom: 20 }}>
          <h3 className="tpg-card-title">Create Team</h3>
          {teamError && <div className="tpg-error" style={{ marginBottom: 14 }}>{teamError}</div>}
          <form className="tpg-form" onSubmit={handleCreateTeam}>
            <div className="tpg-form-row">
              <div className="tpg-form-group">
                <label>Team Name *</label>
                <input className="tpg-input" value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Design Team" required />
              </div>
              <div className="tpg-form-group">
                <label>Description</label>
                <input className="tpg-input" value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Optional" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="tpg-btn-navy" disabled={teamLoading}>
                {teamLoading ? 'Creating…' : <><Plus size={13} /> Create Team</>}
              </button>
              <button type="button" className="tpg-btn-outline" onClick={() => setShowCreateTeam(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="tpg-loading"><div className="tpg-spinner" /> Loading teams…</div>
      ) : error ? (
        <div className="tpg-error">{error}</div>
      ) : teams.length === 0 ? (
        <div className="tpg-empty">
          <div className="tpg-empty-icon"><Users size={30} color="#0f2557" /></div>
          <h3>No teams yet</h3>
          <p>Create a team or a shared project above to start collaborating.</p>
        </div>
      ) : (
        <div className="tpg-teams-grid">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   AnalysisTab
──────────────────────────────────────────────────────────── */
const AnalysisTab = () => {
  const [subTab, setSubTab] = useState('upload');

  // Upload state
  const [uploadResult, setUploadResult] = useState(null);

  // Figma state
  const [figmaStep, setFigmaStep] = useState('input');
  const [figmaResults, setFigmaResults] = useState(null);
  const [figmaLoading, setFigmaLoading] = useState(false);
  const [figmaLoadingMsg, setFigmaLoadingMsg] = useState('');
  const [figmaError, setFigmaError] = useState('');

  const handleFigmaSubmit = async ({ frameUrls }) => {
    setFigmaError('');
    setFigmaLoading(true);
    setFigmaLoadingMsg(`Analyzing ${frameUrls.length} frame${frameUrls.length !== 1 ? 's' : ''}…`);
    try {
      const resp = await axios.post(
        `${API_BASE}/api/v1/figma/analyze-frames`,
        { frame_urls: frameUrls },
        { headers: { 'Content-Type': 'application/json' }, timeout: 300000 }
      );
      if (resp.data?.analyses?.length) {
        setFigmaResults(resp.data);
        setFigmaStep('results');
      } else {
        setFigmaError('No frames could be analyzed. Check that the Figma file is public.');
      }
    } catch (err) {
      setFigmaError(err.response?.data?.detail || err.message || 'Analysis failed.');
    } finally {
      setFigmaLoading(false);
      setFigmaLoadingMsg('');
    }
  };

  const resetFigma = () => { setFigmaResults(null); setFigmaError(''); setFigmaStep('input'); };
  const resetUpload = () => setUploadResult(null);

  return (
    <div>
      <div className="tpg-subtabs">
        <button
          className={`tpg-subtab-btn ${subTab === 'upload' ? 'active' : ''}`}
          onClick={() => setSubTab('upload')}
        >
          <Upload size={14} /> Upload Analysis
        </button>
        <button
          className={`tpg-subtab-btn ${subTab === 'figma' ? 'active' : ''}`}
          onClick={() => setSubTab('figma')}
        >
          <Layers size={14} /> Figma Analysis
        </button>
      </div>

      {subTab === 'upload' && (
        uploadResult ? (
          <div>
            <button className="tpg-back-btn" onClick={resetUpload}>
              <ArrowLeft size={13} /> New Analysis
            </button>
            <SimplifiedAnalysisResults results={uploadResult} />
          </div>
        ) : (
          <UploadAnalysis onAnalysisComplete={setUploadResult} />
        )
      )}

      {subTab === 'figma' && (
        figmaStep === 'results' && figmaResults ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button className="tpg-back-btn" style={{ margin: 0 }} onClick={resetFigma}>
                <ArrowLeft size={13} /> Back
              </button>
              <button className="tpg-new-btn" onClick={resetFigma}>
                <FilePlus size={13} /> New Analysis
              </button>
            </div>
            <MultipleAnalysisResults results={figmaResults} onNewAnalysis={resetFigma} />
          </div>
        ) : (
          <>
            {figmaError && <div className="tpg-error" style={{ marginBottom: 18 }}>{figmaError}</div>}
            {figmaLoading ? (
              <div className="tpg-loading">
                <div className="tpg-spinner" />{figmaLoadingMsg}
              </div>
            ) : (
              <FigmaProjectInput onProjectSubmit={handleFigmaSubmit} />
            )}
          </>
        )
      )}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   HistoryTab
──────────────────────────────────────────────────────────── */
const HistoryTab = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true); setError(null);
      const res = await analysisService.getHistory(1, 100);
      setAnalyses(res.analyses || []);
    } catch { setError('Failed to load analysis history.'); }
    finally { setLoading(false); }
  };

  const handleView = async (analysis) => {
    setSelectedAnalysis({ ...analysis, results: null });
    setViewLoading(true);
    try {
      const fullData = await analysisService.getAnalysis(analysis.analysis_id);
      setSelectedAnalysis({ ...analysis, results: fullData });
    } catch { /* keep modal open */ }
    finally { setViewLoading(false); }
  };

  const handleDelete = async (analysisId) => {
    if (!window.confirm('Delete this analysis?')) return;
    setDeleting(analysisId);
    try {
      await analysisService.deleteAnalysis(analysisId);
      setAnalyses((prev) => prev.filter((a) => a.analysis_id !== analysisId));
    } catch { setError('Failed to delete analysis.'); }
    finally { setDeleting(null); }
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
  };

  const filtered = analyses.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (a.design_name || '').toLowerCase().includes(q) || (a.filename || '').toLowerCase().includes(q);
  });

  return (
    <div>
      {error && <div className="tpg-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="tpg-history-wrap">
        <div className="tpg-search-bar">
          <Search className="tpg-search-icon" size={15} />
          <input
            className="tpg-search-input"
            type="text"
            placeholder="Search by design name or filename…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="tpg-loading"><div className="tpg-spinner" /> Loading history…</div>
        ) : analyses.length === 0 ? (
          <div className="tpg-empty" style={{ border: 'none', borderRadius: 0 }}>
            <div className="tpg-empty-icon"><Clock size={28} color="#0f2557" /></div>
            <h3>No analyses yet</h3>
            <p>Run an Upload or Figma analysis — results will appear here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tpg-empty" style={{ border: 'none', borderRadius: 0 }}>
            <div className="tpg-empty-icon"><Search size={26} color="#0f2557" /></div>
            <h3>No results found</h3>
            <p>No analyses match "{searchQuery}".</p>
          </div>
        ) : (
          <ul className="tpg-history-list">
            {filtered.map((a) => (
              <li key={a.analysis_id} className="tpg-history-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="tpg-history-name">{a.design_name || 'Untitled'}</p>
                  <div className="tpg-history-date"><Calendar size={12} />{formatDate(a.timestamp)}</div>
                </div>
                <div className="tpg-history-actions">
                  <button className="tpg-btn-outline" onClick={() => handleView(a)}>
                    <Eye size={13} /> View
                  </button>
                  <button
                    className="tpg-btn-danger"
                    onClick={() => handleDelete(a.analysis_id)}
                    disabled={deleting === a.analysis_id}
                  >
                    <Trash2 size={13} />
                    {deleting === a.analysis_id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedAnalysis && (
        <div className="tpg-overlay" onClick={() => setSelectedAnalysis(null)}>
          <div className="tpg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tpg-modal-header">
              <h2 className="tpg-modal-title">{selectedAnalysis.design_name || 'Analysis Results'}</h2>
              <button className="tpg-modal-close" onClick={() => setSelectedAnalysis(null)}><X size={20} /></button>
            </div>
            <div className="tpg-modal-body">
              {viewLoading ? (
                <div className="tpg-loading"><div className="tpg-spinner" /> Loading results…</div>
              ) : selectedAnalysis.results ? (
                <SimplifiedAnalysisResults results={selectedAnalysis.results} />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────
   Page
──────────────────────────────────────────────────────────── */
const TeamsPage = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState(null);

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
    try {
      setTeamsLoading(true); setTeamsError(null);
      const res = await teamService.getTeams();
      setTeams(res.teams || []);
    } catch { setTeamsError('Failed to load teams.'); }
    finally { setTeamsLoading(false); }
  };

  const tabs = [
    { id: 'teams',    label: 'Teams',    Icon: Users  },
    { id: 'analysis', label: 'Analysis', Icon: Upload },
    { id: 'history',  label: 'History',  Icon: Clock  },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="teams-shell">
        <Sidebar active="teams" />

        <div className="teams-pg-container">
          <PageHeader
            title="Teams"
            subtitle="Collaborate, share projects, and run design analyses together"
          />

          <div className="teams-pg-main">
            <div className="teams-pg-wrapper">
              <div className="tpg-tab-bar">
                {tabs.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    className={`tpg-tab-btn ${activeTab === id ? 'active' : ''}`}
                    onClick={() => setActiveTab(id)}
                  >
                    <Icon size={15} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {activeTab === 'teams'    && <TeamsTab teams={teams} loading={teamsLoading} error={teamsError} onRefresh={fetchTeams} />}
              {activeTab === 'analysis' && <AnalysisTab />}
              {activeTab === 'history'  && <HistoryTab />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamsPage;
