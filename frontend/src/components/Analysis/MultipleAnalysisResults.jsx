import React, { useState } from 'react';
import SimplifiedAnalysisResults from './SimplifiedAnalysisResults';

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

  return (
    <div className="multi-analysis-container">
      <style>{css}</style>

      {/* Header */}
      

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
      <div className="results-container">
        <SimplifiedAnalysisResults results={currentAnalysis} />
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
    </div>
  );
};

export default MultipleAnalysisResults;
