import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { analysisService } from '../../services/analysis';

const HistorySection = ({ refreshTrigger = 0 }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyses();
  }, [refreshTrigger]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await analysisService.getHistory(1, 5);
      const analysesList = response.analyses || [];
      
      // Sort by timestamp (newest first)
      analysesList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setAnalyses(analysesList.slice(0, 5)); // Show only 5 most recent
    } catch (err) {
      console.error('Failed to fetch analyses:', err);
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (analysisId) => {
    navigate(`/analysis/${analysisId}`);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      return dateString;
    }
  };

  const getGradeColor = (grade) => {
    switch (grade?.toUpperCase()) {
      case 'A':
        return 'text-green-600 bg-green-50';
      case 'B':
        return 'text-blue-600 bg-blue-50';
      case 'C':
        return 'text-amber-600 bg-amber-50';
      case 'D':
      case 'F':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-500 text-center animate-pulse">Loading history...</p>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-500 text-center">No analyses yet. Upload a design to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis) => (
        <div 
          key={analysis.analysis_id} 
          className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-800 truncate">
              {analysis.design_name}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(analysis.timestamp)}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            {analysis.arai_score && (
              <>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    {analysis.arai_score?.toFixed(0)}/100
                  </div>
                  {analysis.overall_grade && (
                    <div className={`text-xs font-bold px-2 py-1 rounded ${getGradeColor(analysis.overall_grade)}`}>
                      Grade {analysis.overall_grade}
                    </div>
                  )}
                </div>
              </>
            )}
            <button 
              onClick={() => handleViewReport(analysis.analysis_id)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="View detailed report"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>
      ))}
      
      <button
        onClick={() => navigate('/history')}
        className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-colors"
      >
        View All History
      </button>
    </div>
  );
};

export default HistorySection;
