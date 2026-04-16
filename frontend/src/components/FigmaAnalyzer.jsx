import React, { useState } from 'react';
import api from '../services/api';

const FigmaAnalyzer = ({ onAnalysisComplete }) => {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisScopes, setAnalysisScopes] = useState({
    accessibility: true,
    readability: true,
    attention: true
  });

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

    // Client-side URL format check — no network call needed
    const trimmedUrl = figmaUrl.trim();
    if (!trimmedUrl.includes('figma.com/file/') && !trimmedUrl.includes('figma.com/design/')) {
      setError('Invalid Figma URL. Expected format: https://www.figma.com/design/abc123/ProjectName');
      return;
    }

    setLoading(true);

    try {
      // Go straight to analysis — the backend validates the URL and token too
      console.log('📊 Starting Figma analysis...');
      const analysisRes = await api.post(
        '/analysis/figma-screens',
        {
          figma_url: trimmedUrl,
          figma_token: null // Will use env token on backend
        },
        { timeout: 0 } // NO TIMEOUT - analysis can take as long as needed (typically 15-120 seconds)
      );

      console.log('✅ Analysis completed, results received:', analysisRes.data);
      setLoading(false);
      setError(null);
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisRes.data);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      const errorMsg = err.response?.data?.detail || 
                       err.message || 
                       'Unknown error occurred. Please check the console for more details.';
      setError(errorMsg);
      setLoading(false);
    }
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
            placeholder="https://www.figma.com/design/abc123/MyDesign"
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
          {loading ? '⏳ Analyzing... This may take 15-60 seconds (no timeout)' : 'Analyze All Screens'}
        </button>
      </div>

      {/* Loading Progress */}
      {loading && (
        <div className="progress-message">
          <div className="progress-message-title">⏳ Analysis in Progress</div>
          <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#1e40af' }}>
            <p>📊 <strong>What's happening:</strong></p>
            <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
              <li>Extracting Figma file structure...</li>
              <li>Analyzing each frame for accessibility, readability, and attention</li>
              <li>Generating recommendations...</li>
              <li>Saving results to database...</li>
            </ul>
            <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#3b82f6' }}>
              💡 This may take 15-60 seconds depending on project size. Please be patient.
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <div className="error-message-title">❌ Error</div>
          <p>{error}</p>
          {error.toLowerCase().includes('token') && (
            <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#7f1d1d', padding: '10px', background: 'rgba(239,68,68,0.05)', borderRadius: '6px' }}>
              <strong>💡 Tip:</strong> This error indicates that the Figma API token is not configured on the server. 
              <br/>Please contact the system administrator to set up the Figma API token by:
              <ol style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
                <li>Getting a token from <a href="https://www.figma.com/developers/api#auth" target="_blank" rel="noopener noreferrer" style={{ color: '#991b1b', textDecoration: 'underline' }}>Figma Developers</a></li>
                <li>Setting the <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '3px' }}>FIGMA_API_TOKEN</code> environment variable in the backend</li>
              </ol>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default FigmaAnalyzer;
