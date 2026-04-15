import React, { useState } from 'react';
import api from '../services/api';

const FigmaAnalyzer = () => {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [results, setResults] = useState(null);
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
    setLoading(true);

    try {
      // Validate URL
      console.log('🔍 Validating Figma URL:', figmaUrl);
      const validationRes = await api.post(
        '/analysis/validate-url',
        { url: figmaUrl },
        { timeout: 10000 } // 10 second timeout for validation
      );

      if (!validationRes.data.valid) {
        throw new Error(validationRes.data.message);
      }
      console.log('✅ URL validation passed');

      // Use new endpoint for analyzing all screens
      console.log('📊 Starting Figma analysis...');
      const analysisRes = await api.post(
        '/analysis/figma-screens',
        {
          figma_url: figmaUrl,
          figma_token: null // Will use env token on backend
        },
        { timeout: 300000 } // 5 minute timeout for analysis
      );

      console.log('✅ Analysis completed, results received:', analysisRes.data);
      
      // Results are already in dashboard format
      setResults(analysisRes.data);
      setLoading(false);
      setError(null);
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
          {loading ? 'Analyzing... Please wait (this may take 2-5 minutes)' : 'Analyze All Screens'}
        </button>
      </div>

      {/* Loading Progress */}
      {loading && (
        <div className="progress-message">
          <div className="progress-message-title">⏳ Analysis in Progress</div>
          <p>Extracting Figma screens and running analysis... This typically takes 2-5 minutes depending on the project size.</p>
          <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'rgba(30, 64, 175, 0.7)' }}>
            💡 <strong>Tip:</strong> You can check your browser's console (Developer Tools → Console) to see real-time analysis logs.
          </p>
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

      {/* Results Display */}
      {results && (
        <div className="results-section">
          <h2 className="results-title">Analysis Results</h2>
          
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">File Name</div>
              <div className="summary-value">{results.fileName}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Pages</div>
              <div className="summary-value">{results.totalPages}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Screens</div>
              <div className="summary-value">{results.totalScreens}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Average ARAI Score</div>
              <div className="summary-value">
                {results.averageAraiScore ? Math.round(results.averageAraiScore) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Screen Results Cards */}
          {results.analyses && results.analyses.length > 0 && (
            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1.5px solid rgba(15,37,87,0.1)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '600', color: '#0f2557' }}>
                Individual Screen Analysis ({results.analyses.length} screens)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {results.analyses.map((analysis, idx) => (
                  <ScreenAnalysisCard key={idx} analysis={analysis} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ScreenAnalysisCard = ({ analysis }) => (
  <div style={{
    padding: '20px',
    background: 'white',
    border: '1.5px solid rgba(15,37,87,0.1)',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(15,37,87,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = 'rgba(15,37,87,0.2)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,37,87,0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = 'rgba(15,37,87,0.1)';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,37,87,0.05)';
  }}
  >
    <div>
      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'rgba(15,37,87,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
        Screen
      </p>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0f2557', wordBreak: 'break-word', lineHeight: '1.4' }}>
        {analysis.designName}
      </h4>
    </div>

    <div style={{
      padding: '12px',
      background: 'linear-gradient(135deg, rgba(15,37,87,0.03) 0%, rgba(100,180,255,0.05) 100%)',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'space-around',
      textAlign: 'center',
      gap: '8px'
    }}>
      <div>
        <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', color: 'rgba(15,37,87,0.5)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          ARAI
        </p>
        <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#0f2557' }}>
          {Math.round(analysis.araiScore)}
        </p>
      </div>
      <div style={{ width: '1px', background: 'rgba(15,37,87,0.1)' }}></div>
      <div>
        <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', color: 'rgba(15,37,87,0.5)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          A11y
        </p>
        <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#0f2557' }}>
          {Math.round(analysis.accessibilityScore)}
        </p>
      </div>
      <div style={{ width: '1px', background: 'rgba(15,37,87,0.1)' }}></div>
      <div>
        <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', color: 'rgba(15,37,87,0.5)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          Read
        </p>
        <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#0f2557' }}>
          {Math.round(analysis.readabilityScore)}
        </p>
      </div>
      <div style={{ width: '1px', background: 'rgba(15,37,87,0.1)' }}></div>
      <div>
        <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', color: 'rgba(15,37,87,0.5)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          Vision
        </p>
        <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#0f2557' }}>
          {Math.round(analysis.attentionScore)}
        </p>
      </div>
    </div>

    {analysis.issueCounts && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        fontSize: '0.85rem',
        padding: '12px',
        background: 'rgba(15,37,87,0.02)',
        borderRadius: '8px'
      }}>
        {analysis.issueCounts.critical > 0 && (
          <div style={{ color: '#dc2626', fontWeight: '600' }}>
            ⚠️ {analysis.issueCounts.critical} Critical
          </div>
        )}
        {analysis.issueCounts.high > 0 && (
          <div style={{ color: '#f97316', fontWeight: '600' }}>
            🔴 {analysis.issueCounts.high} High
          </div>
        )}
        {analysis.issueCounts.medium > 0 && (
          <div style={{ color: '#eab308', fontWeight: '600' }}>
            🟡 {analysis.issueCounts.medium} Medium
          </div>
        )}
        {analysis.issueCounts.success > 0 && (
          <div style={{ color: '#16a34a', fontWeight: '600' }}>
            ✅ {analysis.issueCounts.success} Good
          </div>
        )}
      </div>
    )}
  </div>
);

export default FigmaAnalyzer;
