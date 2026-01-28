import React from 'react';
import ScoreCard from './ScoreCard';

const AttentionReport = ({ data }) => {
  const { score, heatmap } = data;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Attention Analysis
      </h2>

      <div className="mb-6">
        <ScoreCard
          title="Attention Score"
          score={score}
          description="Visual hierarchy and attention guidance"
        />
      </div>

      {/* Heatmap Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Attention Heatmap
        </h3>
        {heatmap ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={heatmap}
              alt="Attention Heatmap"
              className="w-full h-auto"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              Heatmap visualization will appear here
            </p>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Key Insights
        </h4>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>Primary focal points are well-distributed</li>
          <li>Call-to-action elements receive appropriate attention</li>
          <li>Visual hierarchy guides users effectively</li>
        </ul>
      </div>
    </div>
  );
};

export default AttentionReport;
