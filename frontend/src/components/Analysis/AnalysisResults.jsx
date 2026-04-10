import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Shield, Eye, BookOpen, AlertTriangle, CheckCircle,
  TrendingUp, ArrowRight, ChevronDown, ChevronUp, Zap
} from 'lucide-react';

/**
 * Minimal & Sleek Analysis Results Component
 * Matches dashboard theme with clean, modern design
 */
const AnalysisResults = ({ results }) => {
  const [expandedCategory, setExpandedCategory] = useState('overview');

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analysis results available</p>
      </div>
    );
  }

  const { arai_score, overall_grade, accessibility, readability, attention } = results;

  // Score Card Component
  const ScoreCard = ({ icon: Icon, title, score, description }) => {
    return (
      <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-slate-900">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{score.toFixed(0)}</span>
        </div>
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-600 mb-3">{description}</p>
        <div className="w-full bg-gray-300 rounded-full h-1.5">
          <div
            className="h-full rounded-full transition-all bg-slate-700"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  // Overall Score Component
  const OverallScore = () => (
    <div className="bg-slate-900 rounded-lg p-8 text-white mb-6">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-gray-300 mb-2">Overall ARAI Score</p>
          <div className="text-5xl font-bold mb-2">{arai_score.toFixed(1)}</div>
          <div className="inline-block bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold">
            Grade {overall_grade}
          </div>
        </div>
        <div className="flex items-center justify-end opacity-30">
          <TrendingUp className="w-24 h-24 text-white" />
        </div>
      </div>
    </div>
  );

  // Category Section Component
  const CategorySection = ({ title, score, icon: Icon, issues, isExpanded, onToggle }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-900">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {issues && issues.length > 0 ? `${issues.length} issues found` : 'No issues found'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-gray-900">{score.toFixed(0)}</div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-5 bg-gray-50 space-y-3">
          {issues && issues.length > 0 ? (
            issues.slice(0, 3).map((issue, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{issue.title || issue.type}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{issue.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 py-4">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-700">Perfect! No issues found.</p>
            </div>
          )}
          {issues && issues.length > 3 && (
            <button className="text-sm text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1">
              View all {issues.length} issues <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Issue Severity Badge
  const SeverityBadge = ({ severity }) => {
    const colors = {
      critical: 'bg-gray-300 text-gray-900',
      high: 'bg-gray-200 text-gray-900',
      medium: 'bg-gray-100 text-gray-700',
      low: 'bg-gray-50 text-gray-600'
    };
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded border border-gray-300 ${colors[severity] || colors.low}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  // Quick Stats Component
  const QuickStats = () => {
    const totalIssues =
      (accessibility?.issues?.length || 0) +
      (readability?.issues?.length || 0) +
      (attention?.issues?.length || 0);

    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalIssues}</div>
          <p className="text-xs text-gray-600">Total Issues</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {arai_score >= 80 ? '✓' : arai_score >= 60 ? '◐' : '✗'}
          </div>
          <p className="text-xs text-gray-600">Overall Status</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">{overall_grade}</div>
          <p className="text-xs text-gray-600">Grade</p>
        </div>
      </div>
    );
  };

  // Recommendations Component
  const Recommendations = () => {
    const allIssues = [
      ...(accessibility?.issues || []).map(i => ({ ...i, category: 'Accessibility' })),
      ...(readability?.issues || []).map(i => ({ ...i, category: 'Readability' })),
      ...(attention?.issues || []).map(i => ({ ...i, category: 'Attention' }))
    ].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
    }).slice(0, 5);

    if (allIssues.length === 0) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5 mt-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-gray-600" />
          Top Priority Fixes
        </h3>
        <div className="space-y-3">
          {allIssues.map((issue, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
              <SeverityBadge severity={issue.severity} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{issue.title || issue.type}</p>
                <p className="text-xs text-gray-600 mt-1">{issue.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Overall Score */}
      <OverallScore />

      {/* Quick Stats */}
      <QuickStats />

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ScoreCard
          icon={Shield}
          title="Accessibility"
          score={accessibility?.score || 0}
          description="Can everyone use it?"
        />
        <ScoreCard
          icon={BookOpen}
          title="Readability"
          score={readability?.score || 0}
          description="Easy to read?"
        />
        <ScoreCard
          icon={Eye}
          title="Attention"
          score={attention?.score || 0}
          description="Good hierarchy?"
        />
      </div>

      {/* Detailed Sections */}
      <div className="space-y-4 mb-6">
        <CategorySection
          title="Accessibility"
          score={accessibility?.score || 0}
          icon={Shield}
          issues={accessibility?.issues}
          isExpanded={expandedCategory === 'accessibility'}
          onToggle={() => setExpandedCategory(expandedCategory === 'accessibility' ? null : 'accessibility')}
        />
        <CategorySection
          title="Readability"
          score={readability?.score || 0}
          icon={BookOpen}
          issues={readability?.issues}
          isExpanded={expandedCategory === 'readability'}
          onToggle={() => setExpandedCategory(expandedCategory === 'readability' ? null : 'readability')}
        />
        <CategorySection
          title="Visual Attention"
          score={attention?.score || 0}
          icon={Eye}
          issues={attention?.issues}
          isExpanded={expandedCategory === 'attention'}
          onToggle={() => setExpandedCategory(expandedCategory === 'attention' ? null : 'attention')}
        />
      </div>

      {/* Top Priority Fixes */}
      <Recommendations />
    </div>
  );
};

AnalysisResults.propTypes = {
  results: PropTypes.shape({
    arai_score: PropTypes.number,
    overall_grade: PropTypes.string,
    accessibility: PropTypes.object,
    readability: PropTypes.object,
    attention: PropTypes.object
  })
};

export default AnalysisResults;
