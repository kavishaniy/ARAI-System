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
    loadAnalysis();
  }, [id]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{analysis.design_name}</h1>
        <p className="text-gray-500 mt-2">
          Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Original Design */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Original Design</h2>
        <img
          src={analysis.design_url}
          alt={analysis.design_name}
          className="w-full max-w-2xl mx-auto rounded shadow-lg"
        />
      </div>

      {/* Overall Score */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Overall ARAI Score</h2>
          <div className="text-6xl font-bold mb-2">
            {Math.round(analysis.overall_score)}
          </div>
          <div className="text-xl">out of 100</div>
          <div className="mt-4 text-sm opacity-90">
            Processing time: {analysis.processing_time.toFixed(2)}s
          </div>
        </div>
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ScoreCard
          title="Accessibility"
          score={analysis.accessibility_score}
          weight={40}
          color="blue"
        />
        <ScoreCard
          title="Readability"
          score={analysis.readability_score}
          weight={30}
          color="green"
        />
        <ScoreCard
          title="Attention"
          score={analysis.attention_score}
          weight={30}
          color="purple"
        />
      </div>

      {/* Detailed Reports */}
      <div className="space-y-8">
        <AccessibilityReport data={analysis.accessibility_details} />
        <ReadabilityReport data={analysis.readability_details} />
        <AttentionReport data={analysis.attention_details} />
      </div>
    </div>
  );
};

export default AnalysisReport;