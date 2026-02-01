import React from 'react';

const ScoreCard = ({ title, score, description }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-gray-900';
    if (score >= 60) return 'text-gray-700';
    return 'text-gray-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-gray-50';
    if (score >= 60) return 'bg-gray-100';
    return 'bg-gray-200';
  };

  const getScoreBorderColor = (score) => {
    if (score >= 80) return 'border-gray-300';
    if (score >= 60) return 'border-gray-400';
    return 'border-gray-500';
  };

  return (
    <div className={`${getScoreBgColor(score)} border ${getScoreBorderColor(score)} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-sm text-gray-500">
            out of 100
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
