import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HistorySection = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      // TODO: Implement API call to fetch analysis history
      console.log('Fetching analyses...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setAnalyses([
        {
          id: 1,
          name: 'Landing Page Design',
          date: '2026-01-28',
          score: 85,
          status: 'completed'
        },
        {
          id: 2,
          name: 'Mobile App UI',
          date: '2026-01-27',
          score: 92,
          status: 'completed'
        }
      ]);
    } catch (err) {
      console.error('Failed to fetch analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (id) => {
    navigate(`/analysis/${id}`);
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-500 text-center">Loading history...</p>
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
    <div className="space-y-4">
      {analyses.map((analysis) => (
        <div key={analysis.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-800">{analysis.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{analysis.date} • <span className="capitalize">{analysis.status}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">{analysis.score}/100</div>
            <button onClick={() => handleViewReport(analysis.id)} className="text-sm text-primary-600 hover:underline">View</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistorySection;
