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
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">Loading history...</p>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">No analyses yet. Upload a design to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Design Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {analyses.map((analysis) => (
            <tr key={analysis.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {analysis.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysis.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  analysis.score >= 80 ? 'bg-gray-100 text-gray-800' :
                  analysis.score >= 60 ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {analysis.score}/100
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="capitalize">{analysis.status}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleViewReport(analysis.id)}
                  className="text-gray-800 hover:text-gray-800"
                >
                  View Report
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistorySection;
