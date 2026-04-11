import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  ArrowRight
} from 'lucide-react';

/**
 * Simplified Analysis Results Component
 * Shows only 4 key metrics per category with clear "How to Fix" guidance
 */
const SimplifiedAnalysisResults = ({ results }) => {
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  if (!results) {
    return (
      <div className="p-8 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center">No analysis results available</p>
      </div>
    );
  }

  const { arai_score, arai_breakdown, overall_grade, accessibility, readability, attention } = results;

  // Score cards component
  const ScoreCard = ({ title, score, grade, icon: Icon, color }) => {
    const getGradeColor = (g) => {
      if (g === 'A') return 'text-emerald-600 bg-emerald-50';
      if (g === 'B') return 'text-teal-600 bg-teal-50';
      if (g === 'C') return 'text-amber-600 bg-amber-50';
      return 'text-orange-600 bg-orange-50';
    };

    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-navy-900 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(grade)}`}>
            Grade {grade}
          </div>
        </div>
        <h3 className="text-gray-800 font-semibold mb-2">{title}</h3>
        <div className="text-4xl font-bold text-navy-900 mb-2">{score.toFixed(1)}</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${color}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Issue component
  const IssueItem = ({ issue, index }) => {
    const isExpanded = expandedIssue === index;
    const isSuccess = issue.severity === 'success';
    const isCritical = issue.severity === 'critical';
    const isHigh = issue.severity === 'high';

    const getSeverityColor = () => {
      if (isSuccess) return 'bg-white border-emerald-200 hover:bg-emerald-50';
      if (isCritical) return 'bg-white border-red-200 hover:bg-red-50';
      if (isHigh) return 'bg-white border-orange-200 hover:bg-orange-50';
      return 'bg-white border-amber-200 hover:bg-amber-50';
    };

    const getSeverityIcon = () => {
      if (isSuccess) return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      if (isCritical) return <AlertTriangle className="w-5 h-5 text-red-600" />;
      if (isHigh) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      return <Info className="w-5 h-5 text-amber-600" />;
    };

    return (
      <div key={index} className={`border rounded-lg p-4 mb-3 ${getSeverityColor()} cursor-pointer transition-all`}
        onClick={() => setExpandedIssue(isExpanded ? null : index)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 flex-shrink-0">
            {getSeverityIcon()}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
            <p className="text-gray-700 text-sm mb-2">{issue.description}</p>

            {isExpanded && (
              <div className="mt-4 pl-4 border-l-2 border-navy-900 space-y-3">
                {/* How to Fix Section */}
                {issue.how_to_fix && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <h5 className="font-semibold text-gray-900 text-sm">How to Fix</h5>
                    </div>
                    <ul className="space-y-1">
                      {Array.isArray(issue.how_to_fix) ? (
                        issue.how_to_fix.map((fix, i) => (
                          <li key={i} className="text-gray-700 text-sm flex gap-2">
                            <ArrowRight className="w-4 h-4 text-navy-900 flex-shrink-0 mt-0.5" />
                            <span>{fix}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-700 text-sm flex gap-2">
                          <ArrowRight className="w-4 h-4 text-navy-900 flex-shrink-0 mt-0.5" />
                          <span>{issue.how_to_fix}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Best Practice */}
                {issue.best_practice && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <h5 className="font-semibold text-gray-900 text-sm">Best Practice</h5>
                    </div>
                    <p className="text-gray-700 text-sm">{issue.best_practice}</p>
                  </div>
                )}
              </div>
            )}

            {!isExpanded && issue.how_to_fix && (
              <div className="flex items-center gap-2 mt-2 text-navy-900">
                <ChevronDown className="w-4 h-4" />
                <span className="text-sm font-medium">Click to see solutions</span>
              </div>
            )}

            {isExpanded && (
              <div className="flex items-center gap-2 mt-3 text-navy-900">
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm font-medium">Click to collapse</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Category section
  const CategorySection = ({ title, data, icon: Icon, color }) => {
    if (!data || !data.issues) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">Score: {data.score?.toFixed(1) || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-2">
          {data.issues.map((issue, idx) => (
            <IssueItem key={idx} issue={issue} index={`${title}-${idx}`} />
          ))}
        </div>
      </div>
    );
  };

  // Content for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <ScoreCard
                title="ARAI Score"
                score={arai_score}
                grade={overall_grade}
                icon={BarChart3}
                color="bg-indigo-600"
              />
              <ScoreCard
                title="Accessibility"
                score={arai_breakdown.accessibility}
                grade={arai_breakdown.accessibility >= 80 ? 'A' : arai_breakdown.accessibility >= 70 ? 'B' : 'C'}
                icon={Target}
                color="bg-teal-600"
              />
              <ScoreCard
                title="Readability"
                score={arai_breakdown.readability}
                grade={arai_breakdown.readability >= 80 ? 'A' : arai_breakdown.readability >= 70 ? 'B' : 'C'}
                icon={TrendingUp}
                color="bg-blue-600"
              />
              <ScoreCard
                title="Attention"
                score={arai_breakdown.attention}
                grade={arai_breakdown.attention >= 80 ? 'A' : arai_breakdown.attention >= 70 ? 'B' : 'C'}
                icon={Zap}
                color="bg-amber-600"
              />
            </div>

            {/* All Issues Combined */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Key Findings</h3>
              <div className="space-y-2">
                {results.issues?.map((issue, idx) => (
                  <IssueItem key={idx} issue={issue} index={idx} />
                )) || <p className="text-gray-500">No issues found - great work!</p>}
              </div>
            </div>
          </div>
        );

      case 'accessibility':
        return <CategorySection title="Accessibility Analysis" data={accessibility} icon={Target} color="bg-teal-600" />;

      case 'readability':
        return <CategorySection title="Readability Analysis" data={readability} icon={TrendingUp} color="bg-blue-600" />;

      case 'attention':
        return <CategorySection title="Attention Analysis" data={attention} icon={Zap} color="bg-amber-600" />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Design Analysis Results</h1>
          <p className="text-gray-600">Your ARAI (Accessibility Readability Attention Index) Score</p>
        </div>

        {/* Main Score Display */}
        <div className="bg-white rounded-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-lg mb-2">Overall ARAI Score</p>
              <div className="flex items-baseline gap-4">
                <div className="text-6xl font-bold text-navy-900">{arai_score.toFixed(1)}</div>
                <div className={`text-5xl font-bold ${
                  overall_grade === 'A' ? 'text-emerald-600' :
                  overall_grade === 'B' ? 'text-teal-600' :
                  overall_grade === 'C' ? 'text-amber-600' : 'text-orange-600'
                }`}>
                  {overall_grade}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 mb-2">Performance Summary</p>
              <div className="space-y-2">
                <div className="flex gap-2 items-center justify-end">
                  <span className="text-gray-700 font-semibold">Accessibility:</span>
                  <span className="text-lg font-bold text-teal-600">{arai_breakdown.accessibility.toFixed(1)}</span>
                </div>
                <div className="flex gap-2 items-center justify-end">
                  <span className="text-gray-700 font-semibold">Readability:</span>
                  <span className="text-lg font-bold text-blue-600">{arai_breakdown.readability.toFixed(1)}</span>
                </div>
                <div className="flex gap-2 items-center justify-end">
                  <span className="text-gray-700 font-semibold">Attention:</span>
                  <span className="text-lg font-bold text-amber-600">{arai_breakdown.attention.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-2 border border-gray-200">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'accessibility', label: '♿ Accessibility' },
            { id: 'readability', label: '📖 Readability' },
            { id: 'attention', label: '👁️ Attention' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          {renderTabContent()}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>💡 Click on any issue to see detailed solutions on how to improve your design</p>
        </div>
      </div>
    </div>
  );
};

SimplifiedAnalysisResults.propTypes = {
  results: PropTypes.object
};

export default SimplifiedAnalysisResults;
