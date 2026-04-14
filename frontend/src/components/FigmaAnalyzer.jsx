import React, { useState } from 'react';
import axios from 'axios';

const FigmaAnalyzer = () => {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [analysisId, setAnalysisId] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisScopes, setAnalysisScopes] = useState({
    accessibility: true,
    readability: true,
    attention: true
  });

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const css = `
    .figma-analyzer-wrapper {
      width: 100%;
    }

    .figma-analyzer-title {
      margin: 0 0 24px 0;
      font-family: 'DM Serif Display', serif;
      font-size: 1.8rem;
      font-weight: 400;
      color: #0f2557;
    }

    /* Input section - matches dashboard style */
    .analyzer-input-section {
      margin-bottom: 32px;
      padding: 28px;
      background: linear-gradient(135deg, rgba(15,37,87,0.03) 0%, rgba(100,180,255,0.05) 100%);
      border: 1.5px solid rgba(15,37,87,0.1);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .analyzer-input-section:hover {
      border-color: rgba(15,37,87,0.15);
      background: linear-gradient(135deg, rgba(15,37,87,0.05) 0%, rgba(100,180,255,0.08) 100%);
    }

    .input-field-group {
      margin-bottom: 20px;
    }

    .input-field-group:last-child {
      margin-bottom: 0;
    }

    .input-label {
      display: block;
      font-weight: 600;
      font-size: 0.95rem;
      color: #0f2557;
      margin-bottom: 10px;
      letter-spacing: 0.3px;
    }

    .input-field {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid rgba(15,37,87,0.15);
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: 'DM Sans', sans-serif;
      background: white;
      color: #0f2557;
      transition: all 0.2s ease;
    }

    .input-field:focus {
      outline: none;
      border-color: rgba(100,180,255,0.5);
      box-shadow: 0 0 0 3px rgba(100,180,255,0.1);
      background: rgba(255,255,255,0.8);
    }

    .input-field::placeholder {
      color: rgba(15,37,87,0.4);
    }

    /* Analysis types section */
    .analysis-types-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }

    .analysis-type-checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: white;
      border: 1.5px solid rgba(15,37,87,0.15);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .analysis-type-checkbox:hover {
      border-color: rgba(100,180,255,0.4);
      background: rgba(100,180,255,0.02);
    }

    .analysis-type-checkbox input[type="checkbox"] {
      cursor: pointer;
      accent-color: #0f2557;
      width: 18px;
      height: 18px;
    }

    .analysis-type-label {
      font-weight: 500;
      color: #0f2557;
      cursor: pointer;
      text-transform: capitalize;
      user-select: none;
      font-size: 0.95rem;
    }

    /* Button styling */
    .analyze-button {
      width: 100%;
      padding: 14px 24px;
      background: linear-gradient(135deg, #0f2557, #091840);
      color: white;
      border: 1.5px solid #0f2557;
      border-radius: 10px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }

    .analyze-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #091840, #051026);
      box-shadow: 0 8px 24px rgba(15,37,87,0.15);
      transform: translateY(-2px);
    }

    .analyze-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Error message */
    .error-message {
      margin-top: 20px;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(239,68,68,0.02) 100%);
      border: 1.5px solid rgba(239,68,68,0.2);
      border-radius: 8px;
      color: #991b1b;
    }

    .error-message-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    /* Progress message */
    .progress-message {
      margin-top: 20px;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0.02) 100%);
      border: 1.5px solid rgba(59,130,246,0.2);
      border-radius: 8px;
      color: #1e40af;
    }

    .progress-message-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    /* Results section */
    .results-section {
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1.5px solid rgba(15,37,87,0.1);
    }

    .results-title {
      margin: 0 0 24px 0;
      font-size: 1.4rem;
      font-weight: 600;
      color: #0f2557;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .summary-card {
      padding: 20px;
      background: linear-gradient(135deg, rgba(100,180,255,0.08) 0%, rgba(15,37,87,0.03) 100%);
      border: 1.5px solid rgba(15,37,87,0.1);
      border-radius: 10px;
      text-align: center;
    }

    .summary-label {
      font-size: 0.85rem;
      color: rgba(15,37,87,0.6);
      font-weight: 500;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #0f2557;
    }

    /* Score cards grid */
    .score-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    @media (max-width: 768px) {
      .analyzer-input-section {
        padding: 20px;
      }

      .analysis-types-container {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      }

      .summary-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .figma-analyzer-title {
        font-size: 1.4rem;
      }
    }
  `;

  const handleAnalyzeClick = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validate URL
      const validationRes = await axios.post(
        `${API_BASE}/api/v1/figma/validate-url`,
        { url: figmaUrl }
      );

      if (!validationRes.data.valid) {
        throw new Error(validationRes.data.message);
      }

      // Start analysis
      const scopes = Object.keys(analysisScopes)
        .filter(key => analysisScopes[key]);

      const analysisRes = await axios.post(
        `${API_BASE}/api/v1/figma/analyze`,
        {
          figma_url: figmaUrl,
          analysis_scope: scopes
        }
      );

      setAnalysisId(analysisRes.data.analysis_id);
      setAnalysisStatus('pending');

      // Poll for results
      pollAnalysisProgress(analysisRes.data.analysis_id);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      setLoading(false);
    }
  };

  const pollAnalysisProgress = (id) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await axios.get(
          `${API_BASE}/api/v1/figma/analyze/${id}`
        );

        const status = statusRes.data.status;
        setAnalysisStatus(status);

        if (status === 'completed') {
          setResults(statusRes.data);
          setLoading(false);
          clearInterval(pollInterval);
        } else if (status === 'failed') {
          setError(`Analysis failed: ${statusRes.data.error}`);
          setLoading(false);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  return (
    <div className="figma-analyzer-wrapper">
      <style>{css}</style>

      <h1 className="figma-analyzer-title">Figma Design Analyzer</h1>

      {/* Input Section */}
      <div className="analyzer-input-section">
        <div className="input-field-group">
          <label className="input-label">Figma File URL</label>
          <input
            type="text"
            placeholder="https://www.figma.com/file/abc123/MyDesign"
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-field-group">
          <label className="input-label">Analysis Types</label>
          <div className="analysis-types-container">
            {Object.keys(analysisScopes).map((scope) => (
              <label key={scope} className="analysis-type-checkbox">
                <input
                  type="checkbox"
                  checked={analysisScopes[scope]}
                  onChange={(e) =>
                    setAnalysisScopes({
                      ...analysisScopes,
                      [scope]: e.target.checked
                    })
                  }
                />
                <span className="analysis-type-label">{scope}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleAnalyzeClick}
          disabled={!figmaUrl || loading}
          className="analyze-button"
        >
          {loading ? `Analyzing... (${analysisStatus})` : 'Analyze Design'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <div className="error-message-title">Error</div>
          <p>{error}</p>
        </div>
      )}

      {/* Progress Display */}
      {loading && analysisStatus && (
        <div className="progress-message">
          <div className="progress-message-title">Analysis in Progress</div>
          <p>Status: {analysisStatus}</p>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="results-section">
          <h2 className="results-title">Analysis Results</h2>
          
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">File Name</div>
              <div className="summary-value">{results.file_name}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Pages</div>
              <div className="summary-value">{results.total_pages}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Frames</div>
              <div className="summary-value">{results.total_frames}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Overall Score</div>
              <div className="summary-value">
                {results.average_accessibility_score
                  ? Math.round(
                    (results.average_accessibility_score +
                      (results.average_readability_score || 0) +
                      (results.average_attention_score || 0)) / 3
                  )
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* Score Cards */}
          <div className="score-cards-grid">
            {results.average_accessibility_score !== null && (
              <ScoreCard
                title="Accessibility"
                score={results.average_accessibility_score}
                icon="🎯"
              />
            )}
            {results.average_readability_score !== null && (
              <ScoreCard
                title="Readability"
                score={results.average_readability_score}
                icon="📖"
              />
            )}
            {results.average_attention_score !== null && (
              <ScoreCard
                title="Visual Hierarchy"
                score={results.average_attention_score}
                icon="👁️"
              />
            )}
          </div>

          {/* Detailed Results */}
          {results.page_results && (
            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1.5px solid rgba(15,37,87,0.1)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '600', color: '#0f2557' }}>
                Page Details
              </h3>
              {results.page_results.map((page, pageIdx) => (
                <div key={pageIdx} style={{ marginBottom: '20px', padding: '20px', background: 'linear-gradient(135deg, rgba(15,37,87,0.03) 0%, rgba(100,180,255,0.03) 100%)', border: '1.5px solid rgba(15,37,87,0.08)', borderRadius: '10px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600', color: '#0f2557' }}>
                    {page.page_name} ({page.frame_results.length} frames)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {page.frame_results.map((frame, frameIdx) => (
                      <FrameDetails key={frameIdx} frame={frame} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ScoreCard = ({ title, score, icon }) => (
  <div style={{
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(100,180,255,0.08) 0%, rgba(15,37,87,0.03) 100%)',
    border: '1.5px solid rgba(15,37,87,0.1)',
    borderRadius: '10px',
    transition: 'all 0.3s ease'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0f2557' }}>{title}</h3>
      <span style={{ fontSize: '1.8rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0f2557', marginBottom: '12px' }}>
      {Math.round(score)}
    </div>
    <div style={{ width: '100%', height: '6px', background: 'rgba(15,37,87,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #0f2557, #64b4ff)',
          borderRadius: '3px',
          width: `${score}%`,
          transition: 'width 0.3s ease'
        }}
      ></div>
    </div>
  </div>
);

const FrameDetails = ({ frame }) => (
  <div style={{
    padding: '16px',
    background: 'white',
    border: '1.5px solid rgba(15,37,87,0.08)',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  }}>
    <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '600', color: '#0f2557', wordBreak: 'break-word' }}>
      {frame.frame_name}
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.85rem' }}>
      {frame.accessibility && (
        <div style={{ padding: '8px', background: 'rgba(15,37,87,0.03)', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 4px 0', color: 'rgba(15,37,87,0.6)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Accessibility
          </p>
          <p style={{ margin: 0, fontWeight: '600', color: '#0f2557' }}>
            {Math.round(frame.accessibility.score)}
          </p>
        </div>
      )}
      {frame.readability && (
        <div style={{ padding: '8px', background: 'rgba(15,37,87,0.03)', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 4px 0', color: 'rgba(15,37,87,0.6)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Readability
          </p>
          <p style={{ margin: 0, fontWeight: '600', color: '#0f2557' }}>
            {Math.round(frame.readability.score)}
          </p>
        </div>
      )}
      {frame.attention && (
        <div style={{ padding: '8px', background: 'rgba(15,37,87,0.03)', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 4px 0', color: 'rgba(15,37,87,0.6)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Hierarchy
          </p>
          <p style={{ margin: 0, fontWeight: '600', color: '#0f2557' }}>
            {Math.round(frame.attention.score)}
          </p>
        </div>
      )}
    </div>
  </div>
);

export default FigmaAnalyzer;
