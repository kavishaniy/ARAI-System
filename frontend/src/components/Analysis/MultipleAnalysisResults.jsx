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
  display: none;
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
  margin: 0 auto 4rem;
  background: linear-gradient(180deg, rgba(15, 37, 87, 0.02) 0%, rgba(15, 37, 87, 0.01) 100%);
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid rgba(15, 37, 87, 0.05);
}

.design-cards-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(15, 37, 87, 0.08);
}

.design-cards-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #0f2557;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.3px;
}

.design-cards-subtitle {
  font-size: 0.9rem;
  color: rgba(15, 37, 87, 0.5);
  margin: 0;
}

/* Detailed Analysis Section Header - Redesigned */
.detailed-analysis-header {
  padding: 0;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.2rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(15, 37, 87, 0.06);
  border: 1px solid rgba(15, 37, 87, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 1rem 1.5rem;
}

.detailed-analysis-header:hover {
  box-shadow: 0 4px 16px rgba(15, 37, 87, 0.08);
  border-color: rgba(15, 37, 87, 0.1);
  transform: translateY(-1px);
}

.detailed-analysis-header-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0;
  background: transparent;
  position: relative;
}

.detailed-analysis-header-content::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(180deg, #0f2557 0%, #1a3a7a 100%);
}

.detailed-analysis-header-icon {
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(15, 37, 87, 0.06) 0%, rgba(15, 37, 87, 0.02) 100%);
  border-radius: 8px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.detailed-analysis-header:hover .detailed-analysis-header-icon {
  background: linear-gradient(135deg, rgba(15, 37, 87, 0.08) 0%, rgba(15, 37, 87, 0.04) 100%);
  transform: scale(1.05);
}

.detailed-analysis-header-text {
  font-size: 0.9rem;
  color: rgba(15, 37, 87, 0.7);
  font-weight: 400;
  letter-spacing: -0.1px;
  line-height: 1.3;
}

.detailed-analysis-header-text strong {
  color: #0f2557;
  font-weight: 600;
  background: transparent;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: unset;
  background-clip: unset;
  display: inline;
}

.detailed-analysis-export-btn {
  padding: 0.55rem 1rem;
  background: linear-gradient(135deg, #0f2557 0%, #1a3a7a 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  position: relative;
  overflow: hidden;
  height: auto;
}

.detailed-analysis-export-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.4s ease;
}

.detailed-analysis-export-btn:hover {
  box-shadow: 0 4px 12px rgba(15, 37, 87, 0.2);
  transform: translateY(-2px);
}

.detailed-analysis-export-btn:hover::before {
  left: 100%;
}

.detailed-analysis-export-btn:active {
  transform: translateY(0);
}

.design-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.design-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  padding: 0;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(15, 37, 87, 0.08);
}

.design-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0px;
  background: linear-gradient(90deg, #0f2557 0%, #1a3a7a 100%);
  transition: height 0.4s ease;
  z-index: 1;
}

.design-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(15, 37, 87, 0.04) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.design-card:hover {
  border-color: #0f2557;
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(15, 37, 87, 0.18);
  background: linear-gradient(135deg, #ffffff 0%, #f0f4f9 100%);
}

.design-card:hover::before {
  height: 5px;
}

.design-card:hover::after {
  opacity: 1;
}

.design-card.active {
  border-color: #0f2557;
  box-shadow: 0 20px 50px rgba(15, 37, 87, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #f0f4f9 100%);
}

.design-card.active::before {
  height: 5px;
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
  height: 140px;
  object-fit: cover;
  border-radius: 20px 20px 0 0;
  transition: transform 0.4s ease;
  background: linear-gradient(135deg, #f0f4f9 0%, #e8eef7 100%);
}

.design-card:hover .design-card-image {
  transform: scale(1.04);
}

.design-card-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.4rem;
  flex: 1;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(248,250,255,0.8) 100%);
}

.design-card-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f2557;
  letter-spacing: -0.3px;
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.design-card-meta {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  padding-top: 0.8rem;
  border-top: 2px solid rgba(15, 37, 87, 0.06);
}

.design-card-score-container {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.design-card-score {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #0f2557;
  line-height: 1;
  letter-spacing: -0.5px;
}

.design-card-score-label {
  font-size: 0.65rem;
  color: rgba(15, 37, 87, 0.5);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
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

  .detailed-analysis-header {
    padding: 1rem 1.3rem;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .detailed-analysis-header-text {
    font-size: 0.88rem;
  }

  .detailed-analysis-export-btn {
    padding: 0.6rem 1rem;
    font-size: 0.75rem;
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

  .detailed-analysis-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 0.8rem 1.2rem;
  }

  .detailed-analysis-export-btn {
    width: 100%;
    justify-content: center;
    padding: 0.6rem 1rem;
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

  // Debug log the data structure
  console.log('🎯 MultipleAnalysisResults - currentAnalysis:', currentAnalysis);
  console.log('🎯 currentAnalysis.arai_score:', currentAnalysis?.arai_score);
  console.log('🎯 currentAnalysis.arai_breakdown:', currentAnalysis?.arai_breakdown);
  console.log('🎯 currentAnalysis.accessibility:', currentAnalysis?.accessibility);

  const exportAllAsPDF = async () => {
    try {
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

      for (const analysis of analyses) {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
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
            ${formatIssues(analysis.accessibility?.issues || [])}
          </div>

          <!-- Readability Analysis -->
          <div style="margin-bottom: 15px;">
            <h3 style="font-size: 13px; color: #0f2557; margin: 0 0 8px 0; font-weight: 600;">📖 Readability</h3>
            ${formatIssues(analysis.readability?.issues || [])}
          </div>

          <!-- Attention Analysis -->
          <div>
            <h3 style="font-size: 13px; color: #0f2557; margin: 0 0 8px 0; font-weight: 600;">👁️ Attention</h3>
            ${formatIssues(analysis.attention?.issues || [])}
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
        
        // Save PDF with design name
        pdf.save(`${analysis.designName}_report.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
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
        </div>
      </div>

      {/* Expanded Design Cards */}
      {analyses.length >= 1 && (
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
                  {analysis.preview ? (
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
                  ) : (
                    <div
                      className="design-card-image"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f0f4f9 0%, #e8eef7 100%)',
                        color: 'rgba(15,37,87,0.3)',
                        fontSize: '0.75rem',
                        gap: '6px',
                      }}
                    >
                      <span style={{ fontSize: '1.6rem' }}>🖼</span>
                      <span>No preview</span>
                    </div>
                  )}
                  <div className="design-card-info">
                    <h3 className="design-card-name" title={analysis.designName}>
                      {analysis.designName}
                    </h3>
                    <div className="design-card-meta">
                      <div className="design-card-score-container">
                        <div className="design-card-score">
                          {(() => {
                            const score = analysis.arai_score || analysis.arai_breakdown?.overall || 0;
                            console.log('📊 Design card score:', score, 'analysis:', analysis.designName);
                            return typeof score === 'number' ? score.toFixed(1) : 'N/A';
                          })()}
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
            {/* Show the currently selected design name with Export button */}
            <div className="detailed-analysis-header">
              <div className="detailed-analysis-header-content">
                <div className="detailed-analysis-header-text">
                  Detailed Analysis for: <strong>{currentAnalysis.designName}</strong>
                </div>
              </div>
              <button 
                className="detailed-analysis-export-btn"
                onClick={exportAllAsPDF}
              >
                Export as PDF
              </button>
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

      {/* PDF Export Modal - Removed, exporting directly to all PDFs */}
    </div>
  );
};

export default MultipleAnalysisResults;
