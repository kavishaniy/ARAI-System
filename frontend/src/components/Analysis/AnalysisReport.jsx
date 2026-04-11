import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { analysisService } from '../../services/analysis';
import SimplifiedAnalysisResults from './SimplifiedAnalysisResults';

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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-lg">
          No analysis data found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900">
            {analysis.design_name || 'Design Analysis'}
          </h1>
          <p className="text-gray-600 mt-2">
            {analysis.created_at 
              ? `Analyzed on ${new Date(analysis.created_at).toLocaleDateString()}`
              : `Analysis ID: ${analysis.analysis_id || id}`
            }
          </p>
        </div>

        {/* Original Design */}
        {analysis.design_url && (
          <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Original Design</h2>
            <div className="flex justify-center">
              <img
                src={analysis.design_url}
                alt={analysis.design_name || 'Design'}
                className="w-full max-w-2xl rounded-lg border border-gray-200"
              />
            </div>
          </div>
        )}

        {/* Use Simplified Analysis Results */}
        <SimplifiedAnalysisResults results={analysis} />
      </div>
    </div>
  );
};

export default AnalysisReport;