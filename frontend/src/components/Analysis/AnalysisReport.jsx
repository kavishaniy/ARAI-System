import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { analysisService } from '../../services/analysis';
import ScoreCard from './ScoreCard';
import AccessibilityReport from './AccessibilityReport';
import ReadabilityReport from './ReadabilityReport';
import AttentionReport from './AttentionReport';

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
        setError('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded">
          No analysis data found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {analysis.design_name || 'Design Analysis'}
        </h1>
        <p className="text-gray-500 mt-2">
          {analysis.created_at 
            ? `Analyzed on ${new Date(analysis.created_at).toLocaleDateString()}`
            : `Analysis ID: ${analysis.analysis_id || id}`
          }
        </p>
      </div>

      {/* Original Design */}
      {analysis.design_url && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Original Design</h2>
          <img
            src={analysis.design_url}
            alt={analysis.design_name || 'Design'}
            className="w-full max-w-2xl mx-auto rounded shadow-lg"
          />
        </div>
      )}

      {/* Overall Score */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Overall ARAI Score</h2>
          <div className="text-6xl font-bold mb-2">
            {analysis.overall_score ? Math.round(analysis.overall_score) : 'N/A'}
          </div>
          <div className="text-xl">out of 100</div>
          {analysis.processing_time && (
            <div className="mt-4 text-sm opacity-90">
              Processing time: {analysis.processing_time.toFixed(2)}s
            </div>
          )}
          {analysis.status && (
            <div className="mt-2 text-sm opacity-90">
              Status: {analysis.status}
            </div>
          )}
        </div>
      </div>

      {/* Individual Scores */}
      {(analysis.accessibility_score || analysis.readability_score || analysis.attention_score) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ScoreCard
            title="Accessibility"
            score={analysis.accessibility_score || 0}
            weight={40}
            color="blue"
          />
          <ScoreCard
            title="Readability"
            score={analysis.readability_score || 0}
            weight={30}
            color="green"
          />
          <ScoreCard
            title="Attention"
            score={analysis.attention_score || 0}
            weight={30}
            color="purple"
          />
        </div>
      )}

      {/* Detailed Reports */}
      {(analysis.accessibility_details || analysis.readability_details || analysis.attention_details) && (
        <div className="space-y-8">
          {analysis.accessibility_details && (
            <AccessibilityReport data={analysis.accessibility_details} />
          )}
          {analysis.readability_details && (
            <ReadabilityReport data={analysis.readability_details} />
          )}
          {analysis.attention_details && (
            <AttentionReport data={analysis.attention_details} />
          )}
        </div>
      )}

      {/* Show raw data if no detailed reports */}
      {!analysis.accessibility_details && !analysis.readability_details && !analysis.attention_details && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Data</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AnalysisReport;