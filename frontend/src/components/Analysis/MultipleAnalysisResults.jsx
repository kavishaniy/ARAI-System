import React, { useState } from 'react';
import SimplifiedAnalysisResults from './SimplifiedAnalysisResults';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const css = `
.multi-analysis-container {
  font-family: 'DM Sans', sans-serif;
  background: #ffffff;
  color: #0f2557;
  min-height: 100vh;
  padding: 3rem 2rem;
}

.multi-analysis-header {
  max-width: 1200px;
  margin: 0 auto 3.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.multi-analysis-header-content {
  flex: 1;
}

.multi-analysis-export-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #0f2557 0%, #1a3a7a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  margin-left: 1rem;
}

.multi-analysis-export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 37, 87, 0.3);
}

.multi-analysis-export-btn:active {
  transform: translateY(0);
}

.multi-analysis-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid rgba(15,37,87,0.08);
  border-radius: 8px;
  color: #0f2557;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
  margin-bottom: 2rem;
}

.multi-analysis-back:hover {
  background: rgba(15,37,87,0.02);
  border-color: rgba(15,37,87,0.12);
  transform: translateX(-2px);
}

.multi-analysis-title {
  font-family: 'DM Serif Display', serif;
  font-size: 2.2rem;
  font-weight: 400;
  letter-spacing: -0.5px;
  color: #0f2557;
  margin-bottom: 0.5rem;
}

.multi-analysis-subtitle {
  font-size: 0.95rem;
  color: rgba(15,37,87,0.45);
  font-weight: 400;
  letter-spacing: 0.3px;
}

/* Design Cards - Modern minimal layout */
.design-cards-container {
  max-width: 1400px;
  margin: 0 auto 3rem;
}

.design-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.design-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 0;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.design-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0px;
  background: #0f2557;
  transition: height 0.5s ease;
  z-index: 1;
}

.design-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(15, 37, 87, 0.02) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.design-card:hover {
  border-color: #0f2557;
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(15, 37, 87, 0.12);
}

.design-card:hover::before {
  height: 4px;
}

.design-card:hover::after {
  opacity: 1;
}

.design-card.active {
  border-color: #0f2557;
  box-shadow: 0 16px 32px rgba(15, 37, 87, 0.16);
}

.design-card.active::before {
  height: 4px;
}

.design-card-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.design-card-image {
  width: 100%;
  height: 130px;
  object-fit: cover;
  border-radius: 16px 16px 0 0;
  transition: transform 0.5s ease;
}

.design-card:hover .design-card-image {
  transform: scale(1.02);
}

.design-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.2rem;
  flex: 1;
  justify-content: space-between;
}

.design-card-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f2557;
  letter-spacing: -0.3px;
  margin: 0;
  line-height: 1.3;
  word-break: break-word;
}

.design-card-meta {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  padding-top: 0.6rem;
  border-top: 1px solid #f0f0f0;
}

.design-card-score-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.design-card-score {
  font-family: 'DM Serif Display', serif;
  font-size: 1.9rem;
  font-weight: 400;
  color: #0f2557;
  line-height: 1;
  letter-spacing: -0.5px;
}

.design-card-score-label {
  font-size: 0.65rem;
  color: rgba(15, 37, 87, 0.5);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

/* Image Lightbox Modal */
.lightbox-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
  overflow: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.lightbox-modal.hidden {
  display: none;
}

.lightbox-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: auto;
}

.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .lightbox-close {
    top: 1rem;
    right: 1rem;
    width: 35px;
    height: 35px;
    font-size: 20px;
  }
}

/* Results Container */
.results-container {
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .multi-analysis-container {
    padding: 2rem 1.5rem;
  }

  .multi-analysis-header {
    margin-bottom: 2.5rem;
  }

  .multi-analysis-title {
    font-size: 1.8rem;
  }

  .design-cards-container {
    margin-bottom: 2.5rem;
  }

  .design-cards {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .design-card-image {
    height: 120px;
  }

  .design-card-name {
    font-size: 0.9rem;
  }

  .design-card-score {
    font-size: 1.8rem;
  }

  .design-card-info {
    padding: 1rem;
    gap: 0.8rem;
  }
}

@media (max-width: 480px) {
  .multi-analysis-container {
    padding: 1.5rem 1rem;
  }

  .multi-analysis-header {
    margin-bottom: 1.5rem;
  }

  .multi-analysis-title {
    font-size: 1.4rem;
  }

  .design-cards-container {
    margin-bottom: 2rem;
  }

  .design-cards {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.9rem;
  }

  .design-card-image {
    height: 110px;
  }

  .design-card-name {
    font-size: 0.85rem;
  }

  .design-card-score {
    font-size: 1.6rem;
  }

  .design-card-info {
    padding: 0.9rem;
    gap: 0.7rem;
  }

  .design-card-meta {
    gap: 1rem;
    padding-top: 0.5rem;
  }

  .design-card-score-label {
    font-size: 0.6rem;
  }
}

/* PDF Export Modal */
.export-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.export-modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.export-modal-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  color: #0f2557;
  margin-bottom: 0.5rem;
  font-weight: 400;
}

.export-modal-description {
  color: rgba(15, 37, 87, 0.6);
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.export-modal-buttons {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.export-modal-btn {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.export-modal-btn-all {
  background: linear-gradient(135deg, #0f2557 0%, #1a3a7a 100%);
  color: white;
}

.export-modal-btn-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 37, 87, 0.3);
}

.export-modal-btn-separate {
  background: #f0f4f9;
  color: #0f2557;
  border: 1px solid rgba(15, 37, 87, 0.15);
}

.export-modal-btn-separate:hover {
  background: rgba(15, 37, 87, 0.05);
  border-color: rgba(15, 37, 87, 0.25);
}

.export-modal-btn-cancel {
  background: transparent;
  color: rgba(15, 37, 87, 0.6);
  border: none;
}

.export-modal-btn-cancel:hover {
  background: rgba(15, 37, 87, 0.05);
}

.export-loading {
  text-align: center;
  color: rgba(15, 37, 87, 0.6);
  font-size: 0.95rem;
}

.export-loading::after {
  content: '';
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0%, 20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%, 100% {
    content: '...';
  }
}
`;

const MultipleAnalysisResults = ({ results, onNewAnalysis }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!results || !results.analyses || results.analyses.length === 0) {
    return (
      <div className="multi-analysis-container">
        <style>{css}</style>
        <div className="multi-analysis-header">
          <h1 className="multi-analysis-title">No Results Available</h1>
          <p className="multi-analysis-subtitle">Analysis data could not be loaded</p>
        </div>
      </div>
    );
  }

  const analyses = results.analyses;
  const currentAnalysis = analyses[selectedIndex];

  // PDF Export Functions
  const generateSinglePDF = async (analysis, index) => {
    try {
      const element = document.createElement('div');
      element.style.backgroundColor = 'white';
      element.style.padding = '25px';
      element.style.fontFamily = '"DM Sans", sans-serif';
      element.style.fontSize = '13px';
      element.style.lineHeight = '1.6';
      
      const getScoreColor = (score) => {
        if (score >= 80) return '#059669';
        if (score >= 70) return '#2563eb';
        if (score >= 60) return '#f59e0b';
        return '#dc2626';
      };

      const getGrade = (score) => {
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
      };

      const formatIssues = (issues = []) => {
        if (!issues || issues.length === 0) {
          return '<div style="padding: 10px; background: #f0fdf4; border-left: 4px solid #059669; border-radius: 4px; color: #166534;"><strong>✅ No Critical Issues Found</strong></div>';
        }
        
        return issues.map(issue => `
          <div style="margin-bottom: 12px; padding: 10px; background: #f9fafb; border-left: 4px solid ${
            issue.severity === 'critical' ? '#dc2626' : 
            issue.severity === 'high' ? '#f59e0b' : 
            issue.severity === 'medium' ? '#3b82f6' : 
            issue.severity === 'success' ? '#059669' : '#6b7280'
          }; border-radius: 4px;">
            <div style="font-weight: 600; color: #0f2557; margin-bottom: 6px; font-size: 13px;">
              ${issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : issue.severity === 'medium' ? '🔵' : issue.severity === 'success' ? '🟢' : '⚪'} 
              ${issue.title || 'Issue'}
            </div>
            <div style="color: rgba(15,37,87,0.7); margin-bottom: 8px; font-size: 12px;">${issue.description || ''}</div>
            ${issue.how_to_fix ? `
              <div style="background: white; padding: 8px; border-radius: 3px; margin-top: 8px; border-left: 2px solid #2563eb;">
                <div style="font-weight: 600; color: #0f2557; margin-bottom: 6px; font-size: 12px;">💡 How to Fix:</div>
                <div style="color: rgba(15,37,87,0.7); font-size: 11px; line-height: 1.5;">
                  ${Array.isArray(issue.how_to_fix) 
                    ? issue.how_to_fix.map(fix => `<div style="margin-bottom: 4px;">✓ ${fix}</div>`).join('')
                    : `<div>✓ ${issue.how_to_fix}</div>`
                  }
                </div>
              </div>
            ` : ''}
          </div>
        `).join('');
      };

      element.innerHTML = `
        <!-- Cover Page -->
        <div style="text-align: center; padding: 40px 0; border-bottom: 3px solid #0f2557; margin-bottom: 30px;">
          <h1 style="font-family: 'DM Serif Display', serif; font-size: 32px; color: #0f2557; margin: 0 0 10px 0; font-weight: 400;">ARAI Analysis Report</h1>
          <p style="color: rgba(15,37,87,0.6); margin: 0 0 20px 0; font-size: 14px;">Accessibility • Readability • Attention Index</p>
          <p style="color: #0f2557; margin: 0; font-size: 16px; font-weight: 600;">📄 ${analysis.designName}</p>
        </div>

        <!-- Overall Score Cards -->
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; color: #0f2557; margin: 0 0 15px 0; font-weight: 600;">📊 Overall Assessment</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f0f4f9 0%, #f5f8fc 100%); border-radius: 8px; border: 1px solid rgba(15,37,87,0.1);">
              <div style="font-size: 28px; font-weight: bold; color: ${getScoreColor(analysis.arai_score || 0)};">${analysis.arai_score ? analysis.arai_score.toFixed(1) : 'N/A'}</div>
              <div style="font-size: 11px; color: rgba(15,37,87,0.6); margin-top: 5px;">ARAI Score</div>
              <div style="font-size: 10px; color: rgba(15,37,87,0.5); margin-top: 3px; background: white; padding: 3px 6px; border-radius: 3px; display: inline-block;">Grade ${getGrade(analysis.arai_score || 0)}</div>
            </div>
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f0f4f9 0%, #f5f8fc 100%); border-radius: 8px; border: 1px solid rgba(15,37,87,0.1);">
              <div style="font-size: 28px; font-weight: bold; color: ${getScoreColor(analysis.arai_breakdown?.accessibility || 0)};">${analysis.arai_breakdown?.accessibility ? analysis.arai_breakdown.accessibility.toFixed(1) : 'N/A'}</div>
              <div style="font-size: 11px; color: rgba(15,37,87,0.6); margin-top: 5px;">Accessibility</div>
              <div style="font-size: 10px; color: rgba(15,37,87,0.5); margin-top: 3px; background: white; padding: 3px 6px; border-radius: 3px; display: inline-block;">Grade ${getGrade(analysis.arai_breakdown?.accessibility || 0)}</div>
            </div>
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f0f4f9 0%, #f5f8fc 100%); border-radius: 8px; border: 1px solid rgba(15,37,87,0.1);">
              <div style="font-size: 28px; font-weight: bold; color: ${getScoreColor(analysis.arai_breakdown?.readability || 0)};">${analysis.arai_breakdown?.readability ? analysis.arai_breakdown.readability.toFixed(1) : 'N/A'}</div>
              <div style="font-size: 11px; color: rgba(15,37,87,0.6); margin-top: 5px;">Readability</div>
              <div style="font-size: 10px; color: rgba(15,37,87,0.5); margin-top: 3px; background: white; padding: 3px 6px; border-radius: 3px; display: inline-block;">Grade ${getGrade(analysis.arai_breakdown?.readability || 0)}</div>
            </div>
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f0f4f9 0%, #f5f8fc 100%); border-radius: 8px; border: 1px solid rgba(15,37,87,0.1);">
              <div style="font-size: 28px; font-weight: bold; color: ${getScoreColor(analysis.arai_breakdown?.attention || 0)};">${analysis.arai_breakdown?.attention ? analysis.arai_breakdown.attention.toFixed(1) : 'N/A'}</div>
              <div style="font-size: 11px; color: rgba(15,37,87,0.6); margin-top: 5px;">Attention</div>
              <div style="font-size: 10px; color: rgba(15,37,87,0.5); margin-top: 3px; background: white; padding: 3px 6px; border-radius: 3px; display: inline-block;">Grade ${getGrade(analysis.arai_breakdown?.attention || 0)}</div>
            </div>
          </div>
        </div>

        <!-- Issue Summary -->
        <div style="margin-bottom: 30px; padding: 15px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #0f2557;">
          <h3 style="font-size: 14px; color: #0f2557; margin: 0 0 10px 0; font-weight: 600;">📋 Issue Summary</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 12px;">
            <div><span style="font-weight: 600; color: #dc2626; font-size: 14px;">🔴 ${analysis.issue_summary?.critical || 0}</span><div style="color: rgba(15,37,87,0.6);">Critical Issues</div></div>
            <div><span style="font-weight: 600; color: #f59e0b; font-size: 14px;">🟠 ${analysis.issue_summary?.high || 0}</span><div style="color: rgba(15,37,87,0.6);">High Issues</div></div>
            <div><span style="font-weight: 600; color: #3b82f6; font-size: 14px;">🔵 ${analysis.issue_summary?.medium || 0}</span><div style="color: rgba(15,37,87,0.6);">Medium Issues</div></div>
            <div><span style="font-weight: 600; color: #059669; font-size: 14px;">🟢 ${analysis.issue_summary?.passing || 0}</span><div style="color: rgba(15,37,87,0.6);">Passing Checks</div></div>
          </div>
        </div>

        ${analysis.preview ? `
          <!-- Design Preview -->
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h3 style="font-size: 14px; color: #0f2557; margin: 0 0 12px 0; font-weight: 600;">🖼️ Design Preview</h3>
            <img src="${analysis.preview}" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.08);" />
          </div>
        ` : ''}

        <!-- Accessibility Analysis -->
        <div style="margin-bottom: 30px; page-break-inside: avoid; padding: 20px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
          <h2 style="font-size: 15px; color: #0f2557; margin: 0 0 12px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">♿</span> Accessibility Analysis (WCAG 2.1)
          </h2>
          <div style="font-size: 12px; color: rgba(15,37,87,0.6); margin-bottom: 12px;">
            Score: <span style="font-weight: 600; color: ${getScoreColor(analysis.accessibility?.score || 0)};">${analysis.accessibility?.score ? analysis.accessibility.score.toFixed(1) : 'N/A'}/100</span>
            Grade: <span style="font-weight: 600; background: white; padding: 2px 6px; border-radius: 3px;">${getGrade(analysis.accessibility?.score || 0)}</span>
          </div>
          ${formatIssues(analysis.accessibility?.issues || [])}
        </div>

        <!-- Readability Analysis -->
        <div style="margin-bottom: 30px; page-break-inside: avoid; padding: 20px; background: #fefce8; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <h2 style="font-size: 15px; color: #0f2557; margin: 0 0 12px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">📖</span> Readability Analysis
          </h2>
          <div style="font-size: 12px; color: rgba(15,37,87,0.6); margin-bottom: 12px;">
            Score: <span style="font-weight: 600; color: ${getScoreColor(analysis.readability?.score || 0)};">${analysis.readability?.score ? analysis.readability.score.toFixed(1) : 'N/A'}/100</span>
            Grade: <span style="font-weight: 600; background: white; padding: 2px 6px; border-radius: 3px;">${getGrade(analysis.readability?.score || 0)}</span>
          </div>
          ${formatIssues(analysis.readability?.issues || [])}
        </div>

        <!-- Attention Analysis -->
        <div style="margin-bottom: 30px; page-break-inside: avoid; padding: 20px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h2 style="font-size: 15px; color: #0f2557; margin: 0 0 12px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">👁️</span> Visual Attention Analysis
          </h2>
          <div style="font-size: 12px; color: rgba(15,37,87,0.6); margin-bottom: 12px;">
            Score: <span style="font-weight: 600; color: ${getScoreColor(analysis.attention?.score || 0)};">${analysis.attention?.score ? analysis.attention.score.toFixed(1) : 'N/A'}/100</span>
            Grade: <span style="font-weight: 600; background: white; padding: 2px 6px; border-radius: 3px;">${getGrade(analysis.attention?.score || 0)}</span>
          </div>
          ${formatIssues(analysis.attention?.issues || [])}
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: rgba(15,37,87,0.5); font-size: 11px;">
          <p style="margin: 0;">Generated by ARAI System | ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p style="margin: 5px 0 0 0;">Accessibility • Readability • Attention Index</p>
        </div>
      `;
      
      document.body.appendChild(element);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: element.scrollHeight
      });
      document.body.removeChild(element);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${analysis.designName}_analysis.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const exportAllAsPDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const getScoreColor = (score) => {
        if (score >= 80) return '#059669';
        if (score >= 70) return '#2563eb';
        if (score >= 60) return '#f59e0b';
        return '#dc2626';
      };

      const formatIssues = (issues = []) => {
        if (!issues || issues.length === 0) {
          return '<p style="color: #059669; margin: 10px 0;">✅ No issues found</p>';
        }
        
        return issues.map(issue => `
          <div style="margin-bottom: 15px; padding: 12px; background: #f9fafb; border-left: 4px solid ${
            issue.severity === 'critical' ? '#dc2626' : 
            issue.severity === 'high' ? '#f59e0b' : 
            issue.severity === 'medium' ? '#3b82f6' : '#6b7280'
          }; border-radius: 4px;">
            <div style="font-weight: 600; color: #0f2557; margin-bottom: 8px;">${issue.title || 'Issue'}</div>
            <div style="color: rgba(15,37,87,0.7); margin-bottom: 8px; font-size: 13px;">${issue.description || ''}</div>
            ${issue.how_to_fix ? `
              <div style="background: white; padding: 8px; border-radius: 3px; margin-top: 8px;">
                <div style="font-weight: 500; color: #0f2557; margin-bottom: 6px; font-size: 13px;">💡 How to Fix:</div>
                <div style="color: rgba(15,37,87,0.7); font-size: 12px; line-height: 1.5;">
                  ${Array.isArray(issue.how_to_fix) 
                    ? issue.how_to_fix.map(fix => `<div style="margin-bottom: 4px;">• ${fix}</div>`).join('')
                    : issue.how_to_fix
                  }
                </div>
              </div>
            ` : ''}
            <div style="margin-top: 8px; font-size: 12px; color: rgba(15,37,87,0.5);">
              Severity: <span style="font-weight: 600; text-transform: capitalize;">${issue.severity || 'info'}</span>
            </div>
          </div>
        `).join('');
      };

      let isFirstPage = true;
      
      for (const analysis of analyses) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        
        const element = document.createElement('div');
        element.style.backgroundColor = 'white';
        element.style.padding = '30px';
        element.style.fontFamily = '"DM Sans", sans-serif';
        element.style.fontSize = '14px';
        element.style.lineHeight = '1.6';
        
        element.innerHTML = `
          <!-- Header -->
          <div style="margin-bottom: 20px; border-bottom: 2px solid #0f2557; padding-bottom: 12px;">
            <h1 style="font-family: 'DM Serif Display', serif; font-size: 24px; color: #0f2557; margin: 0 0 6px 0; font-weight: 400;">${analysis.designName}</h1>
            <p style="color: rgba(15,37,87,0.6); margin: 0; font-size: 12px;">Analysis Report</p>
          </div>
          
          <!-- Overall Score Section -->
          <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #f0f4f9 0%, #f5f8fc 100%); border-radius: 8px; border: 1px solid rgba(15,37,87,0.1);">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
              <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                <div style="font-size: 28px; font-weight: bold; color: ${getScoreColor(analysis.arai_score || 0)};">${analysis.arai_score ? analysis.arai_score.toFixed(1) : 'N/A'}</div>
                <div style="font-size: 11px; color: rgba(15,37,87,0.6); margin-top: 3px;">ARAI</div>
              </div>
              <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                <div style="font-size: 28px; font-weight: bold; color: ${getScoreColor(analysis.arai_breakdown?.accessibility || 0)};">${analysis.arai_breakdown?.accessibility ? analysis.arai_breakdown.accessibility.toFixed(1) : 'N/A'}</div>
                <div style="font-size: 11px; color: rgba(15,37,87,0.6); margin-top: 3px;">Access</div>
              </div>
              <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                <div style="font-size: 28px; font-weight: bold; color: ${getScoreColor(analysis.arai_breakdown?.readability || 0)};">${analysis.arai_breakdown?.readability ? analysis.arai_breakdown.readability.toFixed(1) : 'N/A'}</div>
                <div style="font-size: 11px; color: rgba(15,37,87,0.6); margin-top: 3px;">Read</div>
              </div>
              <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                <div style="font-size: 28px; font-weight: bold; color: ${getScoreColor(analysis.arai_breakdown?.attention || 0)};">${analysis.arai_breakdown?.attention ? analysis.arai_breakdown.attention.toFixed(1) : 'N/A'}</div>
                <div style="font-size: 11px; color: rgba(15,37,87,0.6); margin-top: 3px;">Attn</div>
              </div>
            </div>
          </div>

          ${analysis.preview ? `
            <div style="margin-bottom: 20px;">
              <img src="${analysis.preview}" style="max-width: 100%; height: auto; border-radius: 6px; border: 1px solid #e5e7eb; max-height: 200px;" />
            </div>
          ` : ''}

          <!-- Accessibility Analysis -->
          <div style="margin-bottom: 15px;">
            <h3 style="font-size: 13px; color: #0f2557; margin: 0 0 8px 0; font-weight: 600;">♿ Accessibility</h3>
            ${formatIssues(analysis.accessibility?.issues || []).substring(0, 500)}...
          </div>

          <!-- Readability Analysis -->
          <div style="margin-bottom: 15px;">
            <h3 style="font-size: 13px; color: #0f2557; margin: 0 0 8px 0; font-weight: 600;">📖 Readability</h3>
            ${formatIssues(analysis.readability?.issues || []).substring(0, 500)}...
          </div>

          <!-- Attention Analysis -->
          <div>
            <h3 style="font-size: 13px; color: #0f2557; margin: 0 0 8px 0; font-weight: 600;">👁️ Attention</h3>
            ${formatIssues(analysis.attention?.issues || []).substring(0, 500)}...
          </div>
        `;
        
        document.body.appendChild(element);
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowHeight: element.scrollHeight
        });
        document.body.removeChild(element);
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        isFirstPage = false;
      }
      
      pdf.save('analysis_results.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  const exportSeparatePDFs = async () => {
    setExporting(true);
    try {
      for (const analysis of analyses) {
        await generateSinglePDF(analysis, 0);
      }
    } catch (error) {
      console.error('Error generating PDFs:', error);
      alert('Error generating PDFs. Please try again.');
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  // Ensure we're showing results for the currently selected analysis
  // This prevents showing cached results from a previous image
  if (!currentAnalysis) {
    return (
      <div className="multi-analysis-container">
        <style>{css}</style>
        <div className="multi-analysis-header">
          <h1 className="multi-analysis-title">Error Loading Results</h1>
          <p className="multi-analysis-subtitle">Unable to load analysis data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="multi-analysis-container">
      <style>{css}</style>

      {/* Header */}
      <div className="multi-analysis-header">
        <div className="multi-analysis-header-content">
          <h1 className="multi-analysis-title">Analysis Results</h1>
          <p className="multi-analysis-subtitle">
            {analyses.length} design{analyses.length !== 1 ? 's' : ''} analyzed
          </p>
        </div>
        <button 
          className="multi-analysis-export-btn"
          onClick={() => setShowExportModal(true)}
        >
          📥 Export as PDF
        </button>
      </div>

      {/* Expanded Design Cards */}
      {analyses.length > 1 && (
        <div className="design-cards-container">
          <div className="design-cards">
            {analyses.map((analysis, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`design-card ${index === selectedIndex ? 'active' : ''}`}
                style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
              >
                <div className="design-card-content">
                  {analysis.preview && (
                    <img
                      src={analysis.preview}
                      alt={analysis.designName}
                      className="design-card-image"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxImage(analysis.preview);
                      }}
                      style={{ cursor: 'zoom-in' }}
                    />
                  )}
                  <div className="design-card-info">
                    <h3 className="design-card-name" title={analysis.designName}>
                      {analysis.designName}
                    </h3>
                    <div className="design-card-meta">
                      <div className="design-card-score-container">
                        <div className="design-card-score">
                          {analysis.arai_score ? analysis.arai_score.toFixed(1) : 'N/A'}
                        </div>
                        <div className="design-card-score-label">ARAI Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Results for Selected Image */}
      <div className="results-container" key={selectedIndex}>
        {currentAnalysis && (
          <>
            {/* Show the currently selected design name */}
            <div style={{
              padding: '1rem 0',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
              color: 'rgba(15, 37, 87, 0.6)',
            }}>
              Showing results for: <strong>{currentAnalysis.designName}</strong>
            </div>

            {/* Show warning for blank/invalid images */}
            {currentAnalysis.designName && currentAnalysis.designName.toLowerCase().includes('blank') && (
              <div style={{
                padding: '1.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                marginBottom: '2rem',
                color: '#991b1b',
                fontSize: '0.95rem',
              }}>
                ⚠️ <strong>Note:</strong> This appears to be a blank or empty image. The analysis results may not be meaningful.
              </div>
            )}
            <SimplifiedAnalysisResults results={currentAnalysis} />
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="lightbox-modal"
          onClick={() => setLightboxImage(null)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Full view"
              className="lightbox-image"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
            <button
              className="lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Close lightbox"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      {showExportModal && (
        <div className="export-modal-overlay" onClick={() => !exporting && setShowExportModal(false)}>
          <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="export-modal-title">Export Results</h2>
            <p className="export-modal-description">
              How would you like to export your analysis results?
            </p>
            
            {exporting ? (
              <div className="export-loading">Generating PDF</div>
            ) : (
              <div className="export-modal-buttons">
                <button
                  className="export-modal-btn export-modal-btn-all"
                  onClick={exportAllAsPDF}
                  disabled={exporting}
                >
                  📄 All in One PDF
                </button>
                <button
                  className="export-modal-btn export-modal-btn-separate"
                  onClick={exportSeparatePDFs}
                  disabled={exporting}
                >
                  📑 Separate PDFs
                </button>
                <button
                  className="export-modal-btn export-modal-btn-cancel"
                  onClick={() => setShowExportModal(false)}
                  disabled={exporting}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleAnalysisResults;
