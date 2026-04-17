import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { analysisService } from '../../services/analysis';
import SimplifiedAnalysisResults from './SimplifiedAnalysisResults';

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

.report-container {
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
  color: #0f2557;
  min-height: 100vh;
  margin-left: 240px;
  transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 1024px) {
  .report-container {
    margin-left: 80px;
  }
}

@media (max-width: 768px) {
  .report-container {
    margin-left: 60px;
  }
}

@media (max-width: 480px) {
  .report-container {
    margin-left: 56px;
  }
}

.report-header {
  background: white;
  border-bottom: 1.5px solid rgba(15,37,87,0.15);
  padding: 2rem;
}

.report-header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.report-header h1 {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #0f2557;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.report-header p {
  font-size: 0.95rem;
  color: rgba(15,37,87,0.6);
  font-weight: 300;
}

.report-body {
  padding: 2rem;
}

.design-preview-section {
  max-width: 1400px;
  margin: 0 auto 2rem;
  background: white;
  border: 1.5px solid rgba(15,37,87,0.15);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(15,37,87,0.08);
}

.design-preview-header {
  margin-bottom: 2rem;
}

.design-preview-header h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #0f2557;
  margin-bottom: 0.5rem;
}

.design-preview-header p {
  font-size: 0.9rem;
  color: rgba(15,37,87,0.5);
}

.design-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, rgba(15,37,87,0.02) 0%, rgba(15,37,87,0.01) 100%);
  border: 1.5px solid rgba(15,37,87,0.1);
  border-radius: 16px;
  padding: 2rem;
}

.design-image {
  max-width: 100%;
  max-height: 600px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15,37,87,0.1);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(15,37,87,0.1);
  border-top-color: #0f2557;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  max-width: 1400px;
  margin: 3rem auto;
  padding: 0 2rem;
}

.error-box {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04));
  border: 1.5px solid #EF4444;
  border-radius: 16px;
  padding: 2rem;
  color: #DC2626;
}

.error-box h3 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

@media (max-width: 1024px) {
  .design-preview-section {
    padding: 1.5rem;
  }

  .report-header h1 {
    font-size: 1.6rem;
  }

  .design-image {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .report-header {
    padding: 1.5rem;
  }

  .report-body {
    padding: 1rem;
  }

  .design-preview-section {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .report-header h1 {
    font-size: 1.4rem;
  }

  .design-image {
    max-height: 300px;
  }
}
`;

const AnalysisReport = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const data = await analysisService.getAnalysis(id);
        setAnalysis(data);
      } catch (err) {
        setError('Failed to load analysis. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [id]);

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{css}</style>
        <div className="error-container">
          <div className="error-box">
            <h3>Unable to Load Analysis</h3>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!analysis) {
    return (
      <>
        <style>{css}</style>
        <div className="error-container">
          <div className="error-box">
            <h3>No Data Found</h3>
            <p>The analysis you're looking for could not be found.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <div className="report-header-content">
            <h1>{analysis.design_name || 'Design Analysis Report'}</h1>
            <p>
              {analysis.created_at 
                ? `Analyzed on ${new Date(analysis.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`
                : `Analysis ID: ${analysis.analysis_id || id}`
              }
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="report-body">
          {/* Original Design Preview */}
          {analysis.design_url && (
            <div className="design-preview-section">
              <div className="design-preview-header">
                <h2>Original Design</h2>
                <p>The design image that was analyzed</p>
              </div>
              <div className="design-image-wrapper">
                <img
                  src={analysis.design_url}
                  alt={analysis.design_name || 'Analyzed Design'}
                  className="design-image"
                />
              </div>
            </div>
          )}

          {/* Analysis Results */}
          <SimplifiedAnalysisResults results={analysis} />
        </div>
      </div>
    </>
  );
};

export default AnalysisReport;