import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import SimplifiedAnalysisResults from './SimplifiedAnalysisResults';

const css = `
.multi-analysis-container {
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
  color: #0f2557;
  min-height: 100vh;
  padding: 2rem;
}

.multi-analysis-header {
  max-width: 1400px;
  margin: 0 auto 2rem;
}

.multi-analysis-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1.5px solid rgba(15,37,87,0.12);
  border-radius: 10px;
  color: #0f2557;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
  margin-bottom: 1.5rem;
}

.multi-analysis-back:hover {
  background: rgba(15,37,87,0.05);
  border-color: rgba(15,37,87,0.2);
}

.multi-analysis-title {
  font-family: 'DM Serif Display', serif;
  font-size: 2.2rem;
  font-weight: 400;
  color: #0f2557;
  margin-bottom: 0.5rem;
}

.multi-analysis-subtitle {
  font-size: 1rem;
  color: rgba(15,37,87,0.6);
  font-weight: 300;
}

/* Image Tabs */
.image-tabs-container {
  max-width: 1400px;
  margin: 0 auto 2rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.image-tabs-container::-webkit-scrollbar {
  height: 6px;
}

.image-tabs-container::-webkit-scrollbar-track {
  background: rgba(15,37,87,0.05);
  border-radius: 10px;
}

.image-tabs-container::-webkit-scrollbar-thumb {
  background: rgba(15,37,87,0.2);
  border-radius: 10px;
}

.image-tabs-container::-webkit-scrollbar-thumb:hover {
  background: rgba(15,37,87,0.4);
}

.image-tabs {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  min-width: min-content;
}

.image-tab {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border: 2px solid rgba(15,37,87,0.12);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
  flex-shrink: 0;
}

.image-tab:hover {
  border-color: rgba(15,37,87,0.2);
  box-shadow: 0 4px 12px rgba(15,37,87,0.08);
}

.image-tab.active {
  border-color: #14b8a6;
  background: rgba(20,184,166,0.05);
  box-shadow: 0 6px 16px rgba(20,184,166,0.15);
}

.image-tab-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(15,37,87,0.1);
}

.image-tab-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #0f2557;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.image-tab-status {
  font-size: 0.7rem;
  color: rgba(15,37,87,0.5);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Summary View */
.summary-view {
  max-width: 1400px;
  margin: 0 auto 2rem;
  background: white;
  border: 1.5px solid rgba(15,37,87,0.12);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(15,37,87,0.06);
}

.summary-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #0f2557;
  margin-bottom: 1.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: linear-gradient(135deg, rgba(15,37,87,0.02) 0%, rgba(15,37,87,0.01) 100%);
  border: 1.5px solid rgba(15,37,87,0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.summary-card-name {
  font-size: 1rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-score {
  font-family: 'DM Serif Display', serif;
  font-size: 2.5rem;
  font-weight: 400;
  color: #0f2557;
  margin-bottom: 0.5rem;
}

.summary-grade {
  font-size: 0.85rem;
  color: rgba(15,37,87,0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Results Container */
.results-container {
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .multi-analysis-container {
    padding: 1rem;
  }

  .multi-analysis-title {
    font-size: 1.6rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .image-tabs {
    gap: 0.75rem;
  }

  .image-tab {
    min-width: 80px;
  }

  .image-tab-image {
    height: 60px;
  }
}
`;

const MultipleAnalysisResults = ({ results, onNewAnalysis }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!results || !results.analyses || results.analyses.length === 0) {
    return (
      <div className="multi-analysis-container">
        <style>{css}</style>
        <div className="multi-analysis-header">
          <button onClick={onNewAnalysis} className="multi-analysis-back">
            <ChevronLeft className="w-4 h-4" />
            New Analysis
          </button>
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
      <div className="multi-analysis-header">
        <button onClick={onNewAnalysis} className="multi-analysis-back">
          <ChevronLeft className="w-4 h-4" />
          New Analysis
        </button>
        <h1 className="multi-analysis-title">Analysis Results</h1>
        <p className="multi-analysis-subtitle">
          {analyses.length} design{analyses.length !== 1 ? 's' : ''} analyzed
        </p>
      </div>

      {/* Image Tabs */}
      {analyses.length > 1 && (
        <div className="image-tabs-container">
          <div className="image-tabs">
            {analyses.map((analysis, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`image-tab ${index === selectedIndex ? 'active' : ''}`}
              >
                {analysis.preview && (
                  <img
                    src={analysis.preview}
                    alt={analysis.designName}
                    className="image-tab-image"
                  />
                )}
                <div className="image-tab-name" title={analysis.designName}>
                  {analysis.designName}
                </div>
                <div className="image-tab-status">
                  {analysis.arai_score ? `${analysis.arai_score.toFixed(1)}/100` : 'N/A'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards (showing all scores) */}
      {analyses.length > 1 && (
        <div className="summary-view">
          <h2 className="summary-title">All Scores Overview</h2>
          <div className="summary-grid">
            {analyses.map((analysis, index) => (
              <div
                key={index}
                className="summary-card"
                onClick={() => setSelectedIndex(index)}
              >
                <div className="summary-card-name" title={analysis.designName}>
                  {analysis.designName}
                </div>
                <div className="summary-score">
                  {analysis.arai_score ? analysis.arai_score.toFixed(1) : 'N/A'}
                </div>
                <div className="summary-grade">
                  {analysis.overall_grade || 'Grade N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Results for Selected Image */}
      <div className="results-container">
        <SimplifiedAnalysisResults results={currentAnalysis} />
      </div>
    </div>
  );
};

export default MultipleAnalysisResults;
