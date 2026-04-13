import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap,
  ArrowRight
} from 'lucide-react';

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

.analysis-container {
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
  color: #0f2557;
  min-height: 100vh;
  padding: 3rem 2rem;
}

.analysis-header {
  max-width: 1400px;
  margin: 0 auto 3rem;
  text-align: center;
}

.analysis-header h1 {
  font-family: 'DM Serif Display', serif;
  font-size: 2.5rem;
  font-weight: 400;
  color: #0f2557;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.analysis-header p {
  font-size: 1rem;
  color: rgba(15,37,87,0.6);
  font-weight: 300;
}

/* Main Scores Section */
.main-scores-section {
  max-width: 1400px;
  margin: 0 auto 3rem;
  background: white;
  border: 1.5px solid rgba(15,37,87,0.15);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(15,37,87,0.08);
}

.main-score-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: center;
}

.main-score-left h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  color: #0f2557;
  font-weight: 400;
  line-height: 1.3;
  margin-bottom: 1rem;
}

.main-score-left h2 em {
  font-style: italic;
  opacity: 0.8;
}

.main-score-left p {
  font-size: 0.95rem;
  color: rgba(15,37,87,0.6);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.overall-score-ring {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.overall-score-ring svg {
  transform: rotate(-90deg);
  width: 200px;
  height: 200px;
}

.ring-bg {
  fill: none;
  stroke: rgba(15,37,87,0.1);
  stroke-width: 8;
}

.ring-fill {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 565;
  stroke-dashoffset: 565;
  transition: stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1);
  stroke: url(#scoreGradient);
}

.ring-fill.animated {
  stroke-dashoffset: var(--offset);
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
}

.ring-score {
  font-family: 'DM Serif Display', serif;
  font-size: 3.5rem;
  font-weight: 400;
  color: #0f2557;
  line-height: 1;
}

.ring-grade {
  font-size: 0.85rem;
  color: rgba(15,37,87,0.5);
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

/* Sub Scores Grid */
.sub-scores-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  margin-top: 2rem;
  width: 100%;
}

.sub-score-card {
  background: white;
  border: 2px solid rgba(15,37,87,0.12);
  border-radius: 14px;
  padding: 1.2rem;
  text-align: center;
  transition: all 0.3s;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.sub-score-card:hover {
  border-color: rgba(15,37,87,0.3);
  box-shadow: 0 8px 20px rgba(15,37,87,0.1);
  transform: translateY(-4px);
}

.sub-score-card.accessibility {
  border-color: #14b8a6;
}

.sub-score-card.accessibility:hover {
  border-color: #14b8a6;
  box-shadow: 0 8px 20px rgba(20,184,166,0.15);
}

.sub-score-card.readability {
  border-color: #3b82f6;
}

.sub-score-card.readability:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 20px rgba(59,130,246,0.15);
}

.sub-score-card.attention {
  border-color: #f59e0b;
}

.sub-score-card.attention:hover {
  border-color: #f59e0b;
  box-shadow: 0 8px 20px rgba(245,158,11,0.15);
}

.sub-score-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-bottom: 0.5rem;
}

.sub-score-label {
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(15,37,87,0.4);
  margin-bottom: 0.3rem;
}

.sub-score-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f2557;
  letter-spacing: 0.02em;
}

.sub-score-value-container {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.2rem;
}

.sub-score-value {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #0f2557;
  line-height: 1.1;
}

.sub-score-unit {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(15,37,87,0.5);
  margin-bottom: 0.3rem;
}

.sub-score-description {
  font-size: 0.7rem;
  color: rgba(15,37,87,0.55);
  line-height: 1.3;
  margin-top: 0.4rem;
  letter-spacing: 0.02em;
}

/* Category Sections - Tabbed Layout */
.categories-section {
  max-width: 1400px;
  margin: 0 auto;
}

.category-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 0;
  border-bottom: 2px solid rgba(15,37,87,0.15);
  background: white;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.category-tab {
  flex: 1;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  background: rgba(15,37,87,0.02);
  border: none;
  border-bottom: 3px solid transparent;
  font-family: 'DM Serif Display', serif;
  font-size: 1.3rem;
  color: rgba(15,37,87,0.6);
  transition: all 0.3s;
}

.category-tab:hover {
  background: rgba(15,37,87,0.05);
  color: #0f2557;
}

.category-tab.active {
  background: white;
  color: #0f2557;
  border-bottom-color: #14b8a6;
  font-weight: 500;
}

.category-tab.active.readability {
  border-bottom-color: #3b82f6;
}

.category-tab.active.attention {
  border-bottom-color: #f59e0b;
}

.category-container {
  background: white;
  border: 1.5px solid rgba(15,37,87,0.15);
  border-top: none;
  border-radius: 0 0 20px 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(15,37,87,0.08);
}

.category-header {
  margin-bottom: 2rem;
  padding-bottom: 0;
  border-bottom: none;
}

.category-header .category-info {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.category-info h3 {
  font-family: 'DM Serif Display', serif;
  font-size: 1.8rem;
  color: #0f2557;
  font-weight: 400;
  margin: 0;
  letter-spacing: 0.5px;
}

.category-score {
  font-size: 1rem;
  color: rgba(15,37,87,0.5);
  font-weight: 300;
  margin: 0;
}

.category-icon {
  display: none;
}

/* Issues and Points Grid */
.issues-points-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.issue-point-card {
  background: linear-gradient(135deg, rgba(15,37,87,0.02) 0%, rgba(15,37,87,0.01) 100%);
  border: 1.5px solid rgba(15,37,87,0.1);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.issue-point-card:hover {
  border-color: rgba(15,37,87,0.2);
  box-shadow: 0 6px 16px rgba(15,37,87,0.1);
  transform: translateY(-2px);
}

.issue-point-header {
  display: flex;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 1rem;
}
}

.issue-severity-icon {
  display: none;
}

.issue-point-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 0.5rem;
}

.issue-point-desc {
  font-size: 0.9rem;
  color: rgba(15,37,87,0.65);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.points-box {
  background: white;
  border: 1px solid rgba(15,37,87,0.1);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.points-label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
  color: rgba(15,37,87,0.5);
  margin-bottom: 0.5rem;
}

.points-content {
  font-size: 0.95rem;
  color: #0f2557;
  line-height: 1.6;
}

.solution-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15,37,87,0.08);
}

.solution-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.solution-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.solution-item {
  display: flex;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: rgba(15,37,87,0.65);
  line-height: 1.5;
}

.solution-arrow {
  color: #0f2557;
  flex-shrink: 0;
  margin-top: 2px;
}

.expand-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #0f2557;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 1200px) {
  .sub-scores-grid {
    grid-template-columns: 1fr;
  }

  .main-score-content {
    grid-template-columns: 1fr;
  }

  .issues-points-grid {
    grid-template-columns: 1fr;
  }

  .analysis-header h1 {
    font-size: 2rem;
  }

  .main-scores-section {
    padding: 2rem;
  }

  .category-container {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .analysis-container {
    padding: 1.5rem 1rem;
  }

  .analysis-header h1 {
    font-size: 1.6rem;
  }

  .main-scores-section {
    padding: 1.5rem;
  }

  .category-container {
    padding: 1.5rem;
  }

  .issue-point-card {
    padding: 1.25rem;
  }

  .sub-score-card {
    padding: 1.25rem;
  }

  .main-score-left h2 {
    font-size: 1.8rem;
  }

  .category-header {
    gap: 1rem;
  }

  .category-info h3 {
    font-size: 1.3rem;
  }
}
`;

/**
 * Simplified Analysis Results Component with Theme Design
 * Shows scoring system with animated rings and point-based improvements
 */
const SimplifiedAnalysisResults = ({ results }) => {
  const [animated, setAnimated] = useState(false);
  const [activeTab, setActiveTab] = useState('accessibility');
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

  if (!results) {
    return (
      <div className="analysis-container">
        <style>{css}</style>
        <div className="analysis-header">
          <h1>No Results Available</h1>
          <p>Analysis data could not be loaded</p>
        </div>
      </div>
    );
  }

  const { arai_score, arai_breakdown, overall_grade, accessibility, readability, attention } = results;

  // Calculate stroke offset for rings
  const calculateStrokeOffset = (score, maxValue = 100) => {
    const percentage = Math.min(score, maxValue) / maxValue;
    return 565 * (1 - percentage); // Main ring circumference
  };

  // Issue Point Card Component
  const IssuePointCard = ({ issue, categoryName, index }) => {
    const [expanded, setExpanded] = useState(false);
    const isSuccess = issue.severity === 'success';
    const isCritical = issue.severity === 'critical';

    const getSeverityIcon = () => {
      if (isSuccess) return <CheckCircle className="w-6 h-6 text-teal-600" />;
      if (isCritical) return <AlertTriangle className="w-6 h-6 text-red-600" />;
      return <Info className="w-6 h-6 text-amber-600" />;
    };

    return (
      <div
        className="issue-point-card"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="issue-point-header">
          <div className="issue-severity-icon">
            {getSeverityIcon()}
          </div>
          <div className="flex-1">
            <div className="issue-point-title">{issue.title}</div>
            <div className="issue-point-desc">{issue.description}</div>
          </div>
        </div>

        {/* Points Box */}
        <div className="points-box">
          <div className="points-label">Points to Change</div>
          <div className="points-content">
            {issue.improvement_points || 'Click to see what needs improvement'}
          </div>
        </div>

        {/* Expandable Solutions */}
        {expanded && issue.how_to_fix && (
          <div className="solution-section">
            <div className="solution-title">
              <Lightbulb className="w-4 h-4" />
              How to Fix
            </div>
            <div className="solution-list">
              {Array.isArray(issue.how_to_fix) ? (
                issue.how_to_fix.map((fix, i) => (
                  <div key={i} className="solution-item">
                    <ArrowRight className="solution-arrow" />
                    <span>{fix}</span>
                  </div>
                ))
              ) : (
                <div className="solution-item">
                  <ArrowRight className="solution-arrow" />
                  <span>{issue.how_to_fix}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Best Practice */}
        {expanded && issue.best_practice && (
          <div className="solution-section">
            <div className="solution-title">
              <Zap className="w-4 h-4" />
              Best Practice
            </div>
            <div className="points-content">{issue.best_practice}</div>
          </div>
        )}

        {/* Toggle Indicator */}
        <div className="expand-toggle">
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Close Details</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>View Solutions</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="analysis-container">
      <style>{css}</style>

      {/* Main Score Section */}
      <div className="main-scores-section" ref={scoreRef}>
        <div className="main-score-content">
          {/* Left - Main Info */}
          <div className="main-score-left">
            <div>
              <h2>One score.<br />Three <em>dimensions</em><br />of inclusivity.</h2>
              <p>
                Accessibility, readability, and visual attention — combined into a single, actionable index you can track and improve.
              </p>
            </div>

            {/* Sub Scores Cards */}
            <div className="sub-scores-grid">
              {/* Accessibility */}
              <div className="sub-score-card accessibility">
                <div className="sub-score-header">
                  <div className="sub-score-label">Accessibility</div>
                  <div className="sub-score-value-container">
                    <div className="sub-score-value">{animated ? arai_breakdown.accessibility.toFixed(1) : 0}</div>
                    <div className="sub-score-unit">%</div>
                  </div>
                </div>
                <div className="sub-score-description">WCAG Compliance</div>
              </div>

              {/* Readability */}
              <div className="sub-score-card readability">
                <div className="sub-score-header">
                  <div className="sub-score-label">Readability</div>
                  <div className="sub-score-value-container">
                    <div className="sub-score-value">{animated ? arai_breakdown.readability.toFixed(1) : 0}</div>
                    <div className="sub-score-unit">%</div>
                  </div>
                </div>
                <div className="sub-score-description">Text Clarity</div>
              </div>

              {/* Attention */}
              <div className="sub-score-card attention">
                <div className="sub-score-header">
                  <div className="sub-score-label">Attention</div>
                  <div className="sub-score-value-container">
                    <div className="sub-score-value">{animated ? arai_breakdown.attention.toFixed(1) : 0}</div>
                    <div className="sub-score-unit">%</div>
                  </div>
                </div>
                <div className="sub-score-description">Visual Hierarchy</div>
              </div>
            </div>
          </div>

          {/* Right - Main Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="overall-score-ring">
              <svg viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f2557" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
                <circle className="ring-bg" cx="100" cy="100" r="90" />
                <circle
                  className={`ring-fill ${animated ? 'animated' : ''}`}
                  cx="100" cy="100" r="90"
                  style={{
                    '--offset': `${animated ? calculateStrokeOffset(arai_score) : 565}px`,
                  }}
                />
              </svg>
              <div className="ring-center">
                <div className="ring-score">{animated ? arai_score.toFixed(1) : 0}</div>
                <div className="ring-grade">Grade {overall_grade}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Sections - Tabbed */}
      <div className="categories-section">
        <div className="category-tabs">
          <button 
            className={`category-tab accessibility ${activeTab === 'accessibility' ? 'active' : ''}`}
            onClick={() => setActiveTab('accessibility')}
          >
            Accessibility Analysis
          </button>
          <button 
            className={`category-tab readability ${activeTab === 'readability' ? 'active' : ''}`}
            onClick={() => setActiveTab('readability')}
          >
            Readability Analysis
          </button>
          <button 
            className={`category-tab attention ${activeTab === 'attention' ? 'active' : ''}`}
            onClick={() => setActiveTab('attention')}
          >
            Visual Attention Analysis
          </button>
        </div>

        {/* Accessibility Tab Content */}
        {activeTab === 'accessibility' && accessibility && (
          <div className="category-container">
            <div className="category-header">
              <div className="category-info">
                <h3>Accessibility Analysis</h3>
                <div className="category-score">Score: {accessibility.score?.toFixed(1) || 'N/A'}</div>
              </div>
            </div>
            <div className="issues-points-grid">
              {accessibility.issues.map((issue, idx) => (
                <IssuePointCard
                  key={idx}
                  issue={issue}
                  categoryName="accessibility"
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}

        {/* Readability Tab Content */}
        {activeTab === 'readability' && readability && (
          <div className="category-container">
            <div className="category-header">
              <div className="category-info">
                <h3>Readability Analysis</h3>
                <div className="category-score">Score: {readability.score?.toFixed(1) || 'N/A'}</div>
              </div>
            </div>
            <div className="issues-points-grid">
              {readability.issues.map((issue, idx) => (
                <IssuePointCard
                  key={idx}
                  issue={issue}
                  categoryName="readability"
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}

        {/* Attention Tab Content */}
        {activeTab === 'attention' && attention && (
          <div className="category-container">
            <div className="category-header">
              <div className="category-info">
                <h3>Visual Attention Analysis</h3>
                <div className="category-score">Score: {attention.score?.toFixed(1) || 'N/A'}</div>
              </div>
            </div>
            <div className="issues-points-grid">
              {attention.issues.map((issue, idx) => (
                <IssuePointCard
                  key={idx}
                  issue={issue}
                  categoryName="attention"
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SimplifiedAnalysisResults.propTypes = {
  results: PropTypes.object
};

export default SimplifiedAnalysisResults;
