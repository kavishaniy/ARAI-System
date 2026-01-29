import React from 'react';
import { 
  Shield, Eye, BookOpen, AlertTriangle, CheckCircle, 
  XCircle, Info, TrendingUp, Target, Palette 
} from 'lucide-react';

const AnalysisResults = ({ results }) => {
  if (!results) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">No analysis results to display</p>
      </div>
    );
  }

  const { 
    arai_score, 
    overall_grade, 
    accessibility, 
    readability, 
    attention,
    conformance_level 
  } = results;

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get grade badge color
  const getGradeBadgeColor = (grade) => {
    if (grade === 'A') return 'bg-green-100 text-green-800 border-green-300';
    if (grade === 'B') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (grade === 'D') return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Overall Score Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {results.design_name}
            </h1>
            <p className="text-blue-100">
              Comprehensive AI-Powered Accessibility Analysis
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">
              {arai_score}
            </div>
            <div className={`inline-block px-4 py-2 rounded-full text-xl font-bold border-2 ${getGradeBadgeColor(overall_grade)}`}>
              Grade {overall_grade}
            </div>
          </div>
        </div>
      </div>

      {/* WCAG Conformance Badge */}
      {accessibility?.conformance_level && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Shield className="h-12 w-12 text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                WCAG Conformance Level
              </h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {accessibility.conformance_level}
              </p>
              {accessibility.conformance_details && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className={accessibility.conformance_details.passes_a ? 'text-green-600' : 'text-red-600'}>
                    {accessibility.conformance_details.passes_a ? '✓' : '✗'} Level A
                  </span>
                  {' • '}
                  <span className={accessibility.conformance_details.passes_aa ? 'text-green-600' : 'text-red-600'}>
                    {accessibility.conformance_details.passes_aa ? '✓' : '✗'} Level AA
                  </span>
                  {' • '}
                  <span className={accessibility.conformance_details.passes_aaa ? 'text-green-600' : 'text-red-600'}>
                    {accessibility.conformance_details.passes_aaa ? '✓' : '✗'} Level AAA
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Accessibility Score */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Accessibility</h3>
              <p className="text-xs text-gray-500">WCAG 2.1 Compliance</p>
            </div>
          </div>
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(accessibility?.score || 0)}`}>
            {accessibility?.score || 0}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${accessibility?.score || 0}%` }}
            />
          </div>
        </div>

        {/* Readability Score */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Readability</h3>
              <p className="text-xs text-gray-500">Text Clarity</p>
            </div>
          </div>
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(readability?.score || 0)}`}>
            {readability?.score || 0}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-500"
              style={{ width: `${readability?.score || 0}%` }}
            />
          </div>
        </div>

        {/* Attention Score */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Attention</h3>
              <p className="text-xs text-gray-500">Visual Hierarchy</p>
            </div>
          </div>
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(attention?.score || 0)}`}>
            {attention?.score || 0}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 transition-all duration-500"
              style={{ width: `${attention?.score || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Issues Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Issues Summary</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {accessibility?.issue_count && (
            <>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600">
                  {accessibility.issue_count.critical || 0}
                </div>
                <div className="text-sm text-red-700 font-medium">Critical</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-600">
                  {accessibility.issue_count.high || 0}
                </div>
                <div className="text-sm text-orange-700 font-medium">High</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-600">
                  {accessibility.issue_count.medium || 0}
                </div>
                <div className="text-sm text-yellow-700 font-medium">Medium</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">
                  {accessibility.issue_count.low || 0}
                </div>
                <div className="text-sm text-blue-700 font-medium">Low</div>
              </div>
            </>
          )}
        </div>

        {/* Detailed Issues */}
        {accessibility?.issues && accessibility.issues.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Accessibility Issues</h3>
            {accessibility.issues.map((issue, idx) => (
              <div 
                key={idx} 
                className="flex gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                {getSeverityIcon(issue.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{issue.type}</h4>
                    {issue.wcag_criterion && (
                      <span className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded">
                        WCAG {issue.wcag_criterion}
                      </span>
                    )}
                    {issue.wcag_level && (
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        issue.wcag_level === 'A' ? 'bg-red-100 text-red-700' :
                        issue.wcag_level === 'AA' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        Level {issue.wcag_level}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{issue.description}</p>
                  {issue.recommendation && (
                    <p className="text-blue-600 text-sm font-medium">
                      💡 {issue.recommendation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Readability Details */}
      {readability?.metrics && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-green-600" />
            Readability Metrics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {readability.metrics.flesch_reading_ease !== undefined && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Flesch Reading Ease</div>
                <div className="text-2xl font-bold text-green-700">
                  {readability.metrics.flesch_reading_ease.toFixed(1)}
                </div>
              </div>
            )}
            {readability.metrics.flesch_kincaid_grade !== undefined && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Grade Level</div>
                <div className="text-2xl font-bold text-green-700">
                  {readability.metrics.flesch_kincaid_grade.toFixed(1)}
                </div>
              </div>
            )}
            {readability.metrics.word_count !== undefined && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Word Count</div>
                <div className="text-2xl font-bold text-green-700">
                  {readability.metrics.word_count}
                </div>
              </div>
            )}
            {readability.metrics.avg_line_length !== undefined && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Avg Line Length</div>
                <div className="text-2xl font-bold text-green-700">
                  {readability.metrics.avg_line_length.toFixed(0)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attention Analysis */}
      {attention && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="h-6 w-6 text-purple-600" />
            Visual Attention Analysis
          </h2>
          
          {attention.attention_distribution && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Top Focus</div>
                <div className="text-2xl font-bold text-purple-700">
                  {(attention.attention_distribution.top * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Center Focus</div>
                <div className="text-2xl font-bold text-purple-700">
                  {(attention.attention_distribution.center * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Bottom Focus</div>
                <div className="text-2xl font-bold text-purple-700">
                  {(attention.attention_distribution.bottom * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}
          
          <p className="text-gray-700">
            {attention.analysis_summary || 'Visual attention analysis completed successfully.'}
          </p>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Recommendations
        </h2>
        
        <div className="space-y-3">
          {accessibility?.recommendations?.map((rec, idx) => (
            <div key={idx} className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-800">{rec}</p>
            </div>
          ))}
          
          {readability?.recommendations?.map((rec, idx) => (
            <div key={`read-${idx}`} className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-800">{rec}</p>
            </div>
          ))}
          
          {attention?.recommendations?.map((rec, idx) => (
            <div key={`att-${idx}`} className="flex gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-800">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
