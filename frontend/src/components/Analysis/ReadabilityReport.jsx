import React from 'react';
import ScoreCard from './ScoreCard';

const ReadabilityReport = ({ data }) => {
  const { score, issues = [] } = data;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Readability Analysis
      </h2>

      <div className="mb-6">
        <ScoreCard
          title="Readability Score"
          score={score}
          description="Typography, contrast, and text legibility"
        />
      </div>

      {/* Issues List */}
      {issues.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Issues Found
          </h3>
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div
                key={index}
                className="border-l-4 border-gray-400 bg-gray-50 p-4"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-800">
                      {issue.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-700">
                      {issue.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-800">
             No readability issues found
          </p>
        </div>
      )}
    </div>
  );
};

export default ReadabilityReport;
