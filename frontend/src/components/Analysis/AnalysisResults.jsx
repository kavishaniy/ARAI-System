import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SimpleAccessibilityCard from './SimpleAccessibilityCard';
import { 
  Shield, Eye, BookOpen, AlertTriangle, CheckCircle, 
  XCircle, Info, ChevronDown, ChevronUp, Target, 
  Zap, TrendingUp, ExternalLink, Download, FileText,
  Palette, Type, MousePointer, 
  Contrast, FileWarning, AlignLeft, Layers
} from 'lucide-react';

// Helper function to format location (handles both strings and objects)
const formatLocation = (location) => {
  if (!location) return 'Element';
  
  // If it's a string, return as is
  if (typeof location === 'string') {
    return location;
  }
  
  // If it's an object with coordinates, format it
  if (typeof location === 'object') {
    if (location.x !== undefined && location.y !== undefined) {
      return `Position: (x: ${location.x}, y: ${location.y})${location.width ? `, Size: ${location.width}×${location.height}` : ''}`;
    }
    // If it's some other object, try to stringify it
    return JSON.stringify(location);
  }
  
  return 'Element';
};

// Note: AccessibilityIssueCard has been replaced with SimpleAccessibilityCard (see separate file)

// Generic Issue Card for Readability and Attention
const IssueCard = ({ issue, category }) => {
  const [expanded, setExpanded] = useState(false);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'accessibility':
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          iconBg: 'bg-gray-100'
        };
      case 'readability':
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          iconBg: 'bg-gray-100'
        };
      case 'attention':
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          iconBg: 'bg-gray-100'
        };
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          iconBg: 'bg-gray-100'
        };
    }
  };

  const getSeverityInfo = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: <XCircle className="h-5 w-5" />,
          color: 'text-gray-800',
          bg: 'bg-gray-200',
          border: 'border-gray-500',
          label: 'Critical',
          emoji: ''
        };
      case 'high':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          color: 'text-gray-800',
          bg: 'bg-gray-200',
          border: 'border-gray-300',
          label: 'High',
          emoji: ''
        };
      case 'medium':
        return {
          icon: <Info className="h-5 w-5" />,
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          label: 'Medium',
          emoji: ''
        };
      case 'low':
        return {
          icon: <Info className="h-5 w-5" />,
          color: 'text-gray-800',
          bg: 'bg-gray-100',
          border: 'border-gray-400',
          label: 'Low',
          emoji: ''
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          label: 'Info',
          emoji: ''
        };
    }
  };

  const colors = getCategoryColor(category);
  const severity = getSeverityInfo(issue.severity);

  return (
    <div className={`border-2 ${colors.border} rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className={`${colors.bg} p-4 border-b ${colors.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${severity.bg} ${severity.color} ${severity.border} border`}>
                {severity.icon}
                {severity.label}
              </span>
              {issue.wcag_criterion && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-white border border-gray-300 text-gray-700">
                  <Shield className="h-3 w-3" />
                  WCAG {issue.wcag_criterion}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-800">{issue.type || issue.title}</h3>
            <p className="text-sm text-gray-600 mt-1 capitalize">
              Category: {category}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-2 rounded-lg ${colors.iconBg} ${colors.text} hover:opacity-80 transition-opacity`}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Collapsed Preview */}
      {!expanded && (
        <div className="p-4">
          <p className="text-sm text-gray-700 line-clamp-2">{issue.description}</p>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Location */}
          {issue.location && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-gray-500" />
                <h4 className="font-semibold text-sm text-gray-800">📍 Location</h4>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 font-mono">
                {formatLocation(issue.location)}
              </p>
            </div>
          )}

          {/* Current State */}
          {issue.current_state && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileWarning className="h-4 w-4 text-gray-500" />
                <h4 className="font-semibold text-sm text-gray-800"> Current State</h4>
              </div>
              <div className="bg-gray-100 border border-gray-400 p-3 rounded">
                <p className="text-sm text-gray-700">{issue.current_state}</p>
                {issue.current_value && (
                  <div className="mt-2 font-mono text-sm">
                    <span className="text-gray-600">Value: </span>
                    <span className="text-gray-800 font-semibold">{issue.current_value}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Problem */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <h4 className="font-semibold text-sm text-gray-800"> Problem</h4>
            </div>
            <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded border border-gray-400">
              {issue.description}
            </p>
          </div>

          {/* Solution */}
          {issue.recommendation && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-gray-800" />
                <h4 className="font-semibold text-sm text-gray-800"> Solution</h4>
              </div>
              <div className="bg-gray-50 border border-gray-300 p-3 rounded">
                <p className="text-sm text-gray-700">{issue.recommendation}</p>
              </div>
            </div>
          )}

          {/* Before/After Preview */}
          {(issue.before_value || issue.after_value) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-gray-700" />
                <h4 className="font-semibold text-sm text-gray-800"> Before/After Preview</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {issue.before_value && (
                  <div className="bg-gray-100 border border-gray-400 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1 font-semibold">Before</div>
                    <div className="font-mono text-sm text-gray-800">{issue.before_value}</div>
                  </div>
                )}
                {issue.after_value && (
                  <div className="bg-gray-50 border border-gray-300 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1 font-semibold">After</div>
                    <div className="font-mono text-sm text-gray-800">{issue.after_value}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Impact */}
          {issue.impact && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-gray-800" />
                <h4 className="font-semibold text-sm text-gray-800"> Impact</h4>
              </div>
              <div className="bg-gray-50 border border-gray-300 p-3 rounded space-y-2">
                {issue.impact.affects_percentage && (
                  <p className="text-sm">
                    <span className="text-gray-600">Affects: </span>
                    <span className="text-gray-800 font-semibold">{issue.impact.affects_percentage}% of users</span>
                  </p>
                )}
                {issue.impact.improvement && (
                  <p className="text-sm">
                    <span className="text-gray-600">Improvement: </span>
                    <span className="text-gray-800 font-semibold">{issue.impact.improvement}</span>
                  </p>
                )}
                {issue.impact.description && (
                  <p className="text-sm text-gray-700">{issue.impact.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Effort */}
          {issue.effort && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
              <span className="text-sm text-gray-600 font-medium">⏱️ Effort Required:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                issue.effort === 'low' ? 'bg-gray-100 text-gray-800' :
                issue.effort === 'medium' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {issue.effort.charAt(0).toUpperCase() + issue.effort.slice(1)}
              </span>
            </div>
          )}

          {/* Learn More */}
          {issue.learn_more_url && (
            <div>
              <a
                href={issue.learn_more_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-800 hover:text-gray-800 font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                🔗 Learn More
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Priority Fix Card Component
const PriorityFixCard = ({ fix, rank }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-gray-200', border: 'border-gray-500', text: 'text-gray-800', emoji: '' };
      case 'high':
        return { bg: 'bg-gray-200', border: 'border-gray-300', text: 'text-gray-800', emoji: '' };
      case 'medium':
        return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800', emoji: '' };
      default:
        return { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-800', emoji: '' };
    }
  };

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'low':
        return 'text-gray-800';
      case 'medium':
        return 'text-gray-700';
      case 'high':
        return 'text-gray-800';
      default:
        return 'text-gray-600';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'text-gray-800';
      case 'medium':
        return 'text-gray-800';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const colors = getSeverityColor(fix.severity);

  return (
    <div className={`border-2 ${colors.border} rounded-lg p-4 ${colors.bg} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 ${colors.border} flex items-center justify-center font-bold ${colors.text}`}>
          {rank}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              {fix.title}
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
            <span className={`font-semibold ${getImpactColor(fix.impact)}`}>
              Impact: {fix.impact ? fix.impact.charAt(0).toUpperCase() + fix.impact.slice(1) : 'Unknown'}
            </span>
            <span className="text-gray-400">|</span>
            <span className={`font-semibold ${getEffortColor(fix.effort)}`}>
              Effort: {fix.effort ? fix.effort.charAt(0).toUpperCase() + fix.effort.slice(1) : 'Unknown'}
            </span>
            {fix.wcag && (
              <>
                <span className="text-gray-400">|</span>
                <span className="font-mono text-gray-700">{fix.wcag}</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-700">{fix.description}</p>
        </div>
      </div>
    </div>
  );
};

const AnalysisResults = ({ results }) => {
  const [activeTab, setActiveTab] = useState('summary');

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

  // Calculate total issues
  const getTotalIssues = (analysis) => {
    if (!analysis?.issue_count) return 0;
    return (
      (analysis.issue_count.critical || 0) +
      (analysis.issue_count.high || 0) +
      (analysis.issue_count.medium || 0) +
      (analysis.issue_count.low || 0)
    );
  };

  const totalIssues = 
    getTotalIssues(accessibility) +
    getTotalIssues(readability) +
    getTotalIssues(attention);

  // Generate priority fixes from all issues
  const generatePriorityFixes = () => {
    const allIssues = [];

    // Add accessibility issues
    if (accessibility?.issues) {
      accessibility.issues.forEach(issue => {
        allIssues.push({
          ...issue,
          category: 'accessibility',
          impact: issue.severity === 'critical' ? 'high' : issue.severity === 'high' ? 'high' : 'medium',
          effort: 'low',
          wcag: issue.wcag_criterion
        });
      });
    }

    // Add readability issues
    if (readability?.issues) {
      readability.issues.forEach(issue => {
        allIssues.push({
          ...issue,
          category: 'readability',
          impact: issue.severity === 'critical' ? 'high' : 'medium',
          effort: 'medium'
        });
      });
    }

    // Add attention issues
    if (attention?.issues) {
      attention.issues.forEach(issue => {
        allIssues.push({
          ...issue,
          category: 'attention',
          impact: 'high',
          effort: 'low'
        });
      });
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return allIssues.slice(0, 5).map(issue => ({
      title: issue.type || issue.title,
      description: issue.description,
      severity: issue.severity,
      impact: issue.impact,
      effort: issue.effort,
      wcag: issue.wcag
    }));
  };

  const priorityFixes = generatePriorityFixes();

  // Get score color - Grayscale
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-gray-800';
    if (score >= 80) return 'text-gray-800';
    if (score >= 70) return 'text-gray-700';
    if (score >= 60) return 'text-gray-600';
    return 'text-gray-500';
  };

  // Get score status - Grayscale
  const getScoreStatus = (score) => {
    if (score >= 90) return { emoji: '', label: 'Excellent', color: 'text-gray-800' };
    if (score >= 70) return { emoji: '', label: 'Needs Improvement', color: 'text-gray-700' };
    return { emoji: '', label: 'Critical Issues', color: 'text-gray-600' };
  };

  // Get grade badge color - Grayscale
  const getGradeBadgeColor = (grade) => {
    if (grade === 'A') return 'bg-gray-800 text-white border-gray-700';
    if (grade === 'B') return 'bg-gray-700 text-white border-gray-700';
    if (grade === 'C') return 'bg-gray-600 text-white border-gray-600';
    if (grade === 'D') return 'bg-gray-500 text-white border-gray-500';
    return 'bg-gray-400 text-white border-gray-400';
  };


  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Overall Score Dashboard */}
      <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-800 p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {results.design_name || 'Design Analysis Report'}
              </h1>
              <p className="text-gray-300 text-sm">
                Comprehensive AI-Powered Accessibility Analysis
              </p>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-sm text-gray-300 mb-1">Overall Score</div>
              <div className="text-6xl font-bold mb-2">
                {arai_score || 0}
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-xl font-bold border-2 ${getGradeBadgeColor(overall_grade)}`}>
                Grade {overall_grade}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Accessibility */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800"> Accessibility</h3>
                <p className="text-xs text-gray-600">Can everyone use your design?</p>
              </div>
            </div>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(accessibility?.score || 0)}`}>
              {accessibility?.score || 0}<span className="text-2xl">/100</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-gray-400">
                <div 
                  className="h-full bg-gray-800 transition-all duration-500"
                  style={{ width: `${accessibility?.score || 0}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              {accessibility?.score >= 80 
                ? ' Excellent! Your design works for people with disabilities.'
                : accessibility?.score >= 60 
                ? ' Good, but some users might struggle to use your design.'
                : ' Needs improvement! Many users with disabilities cannot use this.'}
            </p>
            {accessibility?.issue_count && (
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <div>
                  <div className="font-bold text-gray-800">{accessibility.issue_count.critical || 0}</div>
                  <div className="text-gray-600">Critical</div>
                </div>
                <div>
                  <div className="font-bold text-gray-800">{accessibility.issue_count.high || 0}</div>
                  <div className="text-gray-600">High</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700">{accessibility.issue_count.medium || 0}</div>
                  <div className="text-gray-600">Medium</div>
                </div>
                <div>
                  <div className="font-bold text-gray-600">{accessibility.issue_count.low || 0}</div>
                  <div className="text-gray-600">Low</div>
                </div>
              </div>
            )}
          </div>

          {/* Readability */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800"> Readability</h3>
                <p className="text-xs text-gray-600">Is your text easy to read?</p>
              </div>
            </div>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(readability?.score || 0)}`}>
              {readability?.score || 0}<span className="text-2xl">/100</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-gray-400">
                <div 
                  className="h-full bg-gray-800 transition-all duration-500"
                  style={{ width: `${readability?.score || 0}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              {readability?.score >= 80 
                ? ' Great! Your text is clear and easy to understand.'
                : readability?.score >= 60 
                ? ' Decent, but some text might confuse readers.'
                : ' Hard to read! Users will struggle to understand your content.'}
            </p>
            {readability?.issue_count && (
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <div>
                  <div className="font-bold text-gray-800">{readability.issue_count.critical || 0}</div>
                  <div className="text-gray-600">Critical</div>
                </div>
                <div>
                  <div className="font-bold text-gray-800">{readability.issue_count.high || 0}</div>
                  <div className="text-gray-600">High</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700">{readability.issue_count.medium || 0}</div>
                  <div className="text-gray-600">Medium</div>
                </div>
                <div>
                  <div className="font-bold text-gray-600">{readability.issue_count.low || 0}</div>
                  <div className="text-gray-600">Low</div>
                </div>
              </div>
            )}
          </div>

          {/* Attention */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800"> Attention</h3>
                <p className="text-xs text-gray-600">Does it guide user's eyes?</p>
              </div>
            </div>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(attention?.score || 0)}`}>
              {attention?.score || 0}<span className="text-2xl">/100</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-gray-400">
                <div 
                  className="h-full bg-gray-800 transition-all duration-500"
                  style={{ width: `${attention?.score || 0}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              {attention?.score >= 80 
                ? ' Perfect! Your design guides users to important content.'
                : attention?.score >= 60 
                ? ' Good structure, but could be more focused.'
                : ' Confusing! Users won\'t know where to look first.'}
            </p>
            {attention?.issue_count && (
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <div>
                  <div className="font-bold text-gray-800">{attention.issue_count.critical || 0}</div>
                  <div className="text-gray-600">Critical</div>
                </div>
                <div>
                  <div className="font-bold text-gray-800">{attention.issue_count.high || 0}</div>
                  <div className="text-gray-600">High</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700">{attention.issue_count.medium || 0}</div>
                  <div className="text-gray-600">Medium</div>
                </div>
                <div>
                  <div className="font-bold text-gray-600">{attention.issue_count.low || 0}</div>
                  <div className="text-gray-600">Low</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Summary */}
        <div className="border-t-2 border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Overall Status</div>
              <div className={`text-2xl font-bold ${getScoreStatus(arai_score).color}`}>
                {getScoreStatus(arai_score).label}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Total Issues Found</div>
              <div className="text-3xl font-bold text-gray-800">{totalIssues}</div>
            </div>
            {conformance_level && (
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">WCAG Level</div>
                <div className="text-2xl font-bold text-gray-800">{conformance_level}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Priority Fixes */}
      {priorityFixes.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-8 w-8 text-gray-800" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800"> Top 5 Priority Fixes</h2>
              <p className="text-sm text-gray-600">Address these issues first for maximum impact</p>
            </div>
          </div>
          <div className="space-y-3">
            {priorityFixes.map((fix, idx) => (
              <PriorityFixCard key={idx} fix={fix} rank={idx + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="border-b-2 border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
                activeTab === 'summary'
                  ? 'bg-white text-gray-800 border-b-4 border-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5" />
                Summary View
              </div>
            </button>
            <button
              onClick={() => setActiveTab('accessibility')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
                activeTab === 'accessibility'
                  ? 'bg-white text-gray-800 border-b-4 border-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5" />
                Accessibility Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('readability')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
                activeTab === 'readability'
                  ? 'bg-white text-gray-800 border-b-4 border-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="h-5 w-5" />
                Readability Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('attention')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
                activeTab === 'attention'
                  ? 'bg-white text-gray-800 border-b-4 border-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Eye className="h-5 w-5" />
                Attention Details
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold text-gray-800 mb-4"> Your Design Report - Easy to Understand</h3>
                <p className="text-gray-700 text-lg">
                  We checked your design in <strong>3 important ways</strong> to make sure it works well for everyone.
                  Think of this as a health checkup for your design! 🏥
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg"> Accessibility</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 font-medium">
                    Can <strong>everyone</strong> use your design? Including people with disabilities.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Contrast className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                      <span>Can colorblind people see everything?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Type className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                      <span>Is text readable for people with low vision?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Palette className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                      <span>Does it work without relying only on colors?</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg"> Readability</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 font-medium">
                    Is your text <strong>easy to read</strong> and understand?
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                      <span>Are sentences simple (not too long)?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Type className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                      <span>Do you use easy words (not too technical)?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlignLeft className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                      <span>Is text comfortable to read on screen?</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg"> Visual Attention</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 font-medium">
                    Where do users <strong>look first</strong> and does it make sense?
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                      <span>Do important things catch attention first?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Eye className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                      <span>Is there a clear order to follow?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Layers className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                      <span>Is it too cluttered or confusing?</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Score Interpretation Guide */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-gray-800" />
                  How to Read Your Scores
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-300">
                    <div className="text-4xl"></div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">80-100</div>
                      <div className="text-sm text-gray-800 font-semibold">Excellent!</div>
                      <div className="text-sm text-gray-600">Keep it up! This area is great.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-300">
                    <div className="text-4xl"></div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">60-79</div>
                      <div className="text-sm text-gray-800 font-semibold">Pretty Good</div>
                      <div className="text-sm text-gray-600">Some tweaks will make it better.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-400">
                    <div className="text-4xl"></div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">Below 60</div>
                      <div className="text-sm text-gray-800 font-semibold">Needs Fixing</div>
                      <div className="text-sm text-gray-600">Users might struggle here.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-gray-400 rounded-lg p-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-gray-800" />
                  Recommended Next Steps
                </h4>
                <ol className="space-y-2 ml-6 list-decimal text-gray-700">
                  <li>Review and address all <span className="font-semibold text-gray-800">Critical</span> issues first</li>
                  <li>Focus on high-impact, low-effort fixes for quick wins</li>
                  <li>Test changes with actual users, especially those with disabilities</li>
                  <li>Use the detailed tabs below to explore each category</li>
                  <li>Export this report and share with your team</li>
                </ol>
              </div>

              {/* Export Options */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                  <Download className="h-5 w-5" />
                  Export as PDF
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  <FileText className="h-5 w-5" />
                  View Detailed Report
                </button>
              </div>
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-800 text-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold mb-2"> Accessibility Deep Dive</h3>
                    <p className="text-gray-300">Making your design work for everyone - including people with disabilities</p>
                  </div>
                  {accessibility?.conformance_level && (
                    <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-300 mb-1">WCAG Level</div>
                      <div className="text-4xl font-bold">{accessibility.conformance_level}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* What We Checked */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-gray-800" />
                  What We Analyzed
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Contrast className="h-6 w-6 text-gray-800 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800">Color Contrast</div>
                      <div className="text-sm text-gray-600">Can people with low vision read your text? We check if colors have enough contrast.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Type className="h-6 w-6 text-gray-800 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800">Text Size</div>
                      <div className="text-sm text-gray-600">Is your text large enough for everyone to read comfortably?</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Palette className="h-6 w-6 text-gray-800 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800">Color Independence</div>
                      <div className="text-sm text-gray-600">Can colorblind users understand your design without relying only on colors?</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <MousePointer className="h-6 w-6 text-gray-800 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800">Touch Targets</div>
                      <div className="text-sm text-gray-600">Are buttons and links large enough to tap easily on mobile?</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues Section */}
              {accessibility?.issues && accessibility.issues.length > 0 ? (
                <>
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-gray-800" />
                      Issues Found: {accessibility.issues.length}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      We found {accessibility.issues.length} accessibility issue{accessibility.issues.length !== 1 ? 's' : ''} that could make your design harder to use for people with disabilities.
                    </p>
                    
                    {/* Issue Breakdown */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-lg border-2 border-gray-400 text-center">
                        <div className="text-2xl font-bold text-gray-800">{accessibility.issue_count?.critical || 0}</div>
                        <div className="text-xs text-gray-600 font-semibold">CRITICAL</div>
                        <div className="text-xs text-gray-500 mt-1">Must fix now</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border-2 border-gray-400 text-center">
                        <div className="text-2xl font-bold text-gray-800">{accessibility.issue_count?.high || 0}</div>
                        <div className="text-xs text-gray-600 font-semibold">HIGH</div>
                        <div className="text-xs text-gray-500 mt-1">Fix soon</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border-2 border-gray-300 text-center">
                        <div className="text-2xl font-bold text-gray-700">{accessibility.issue_count?.medium || 0}</div>
                        <div className="text-xs text-gray-600 font-semibold">MEDIUM</div>
                        <div className="text-xs text-gray-500 mt-1">Important</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border-2 border-gray-200 text-center">
                        <div className="text-2xl font-bold text-gray-600">{accessibility.issue_count?.low || 0}</div>
                        <div className="text-xs text-gray-600 font-semibold">LOW</div>
                        <div className="text-xs text-gray-500 mt-1">Nice to fix</div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Issues */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">Detailed Issues:</h4>
                    {accessibility.issues.map((issue, idx) => (
                      <SimpleAccessibilityCard key={idx} issue={issue} index={idx} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-gray-50 border-2 border-gray-300 rounded-xl">
                  <CheckCircle className="h-20 w-20 mx-auto mb-4 text-gray-800" />
                  <h4 className="text-2xl font-bold text-gray-800 mb-3"> Excellent Work!</h4>
                  <p className="text-lg text-gray-600 mb-2">No accessibility issues found in this design.</p>
                  <p className="text-sm text-gray-500">Your design is accessible to people with disabilities!</p>
                </div>
              )}
            </div>
          )}

          {/* Readability Tab */}
          {activeTab === 'readability' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-800 text-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold mb-2"> Readability Deep Dive</h3>
                    <p className="text-gray-300">How easy is your text to read and understand?</p>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-300 mb-1">Score</div>
                    <div className="text-4xl font-bold">{readability?.score || 0}/100</div>
                  </div>
                </div>
              </div>

              {/* Readability Metrics - User-Friendly */}
              {readability?.metrics && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-3 text-xl flex items-center gap-2">
                    <BookOpen className="h-6 w-6" />
                     Text Analysis Results
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">We analyzed your text to see how readable it is for users</p>
                  
                  <div className="space-y-6">
                    {/* Reading Ease Score - Simplified */}
                    {readability.metrics.flesch_reading_ease !== undefined && (
                      <div className="bg-white p-5 rounded-lg border border-gray-400">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-lg font-bold text-gray-800"> Text Difficulty Level</div>
                            <div className="text-sm text-gray-600">How easy is it for people to understand?</div>
                          </div>
                          <div className={`text-4xl font-bold ${
                            readability.metrics.flesch_reading_ease >= 60 ? 'text-gray-800' :
                            readability.metrics.flesch_reading_ease >= 30 ? 'text-gray-700' : 'text-gray-800'
                          }`}>
                            {readability.metrics.flesch_reading_ease >= 60 ? '' :
                             readability.metrics.flesch_reading_ease >= 30 ? '' : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                readability.metrics.flesch_reading_ease >= 60 ? 'bg-gray-500' :
                                readability.metrics.flesch_reading_ease >= 30 ? 'bg-gray-500' : 'bg-gray-1000'
                              }`}
                              style={{ width: `${Math.min(100, readability.metrics.flesch_reading_ease)}%` }}
                            />
                          </div>
                          <span className={`font-bold text-lg ${
                            readability.metrics.flesch_reading_ease >= 60 ? 'text-gray-800' :
                            readability.metrics.flesch_reading_ease >= 30 ? 'text-gray-700' : 'text-gray-800'
                          }`}>
                            {readability.metrics.flesch_reading_ease >= 60 ? 'Easy to Read ' :
                             readability.metrics.flesch_reading_ease >= 30 ? 'Moderately Easy' : 'Hard to Read'}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {readability.metrics.flesch_reading_ease >= 60 
                            ? ' Great! Most people can easily understand your text.'
                            : readability.metrics.flesch_reading_ease >= 30 
                            ? ' Your text is somewhat complex. Consider simplifying for better understanding.'
                            : ' Your text is quite difficult to read. Try using simpler words and shorter sentences.'}
                        </p>
                      </div>
                    )}

                    {/* Education Level Required */}
                    {readability.metrics.flesch_kincaid_grade !== undefined && (
                      <div className="bg-white p-5 rounded-lg border border-gray-400">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-lg font-bold text-gray-800"> Education Level Needed</div>
                            <div className="text-sm text-gray-600">What reading level is required to understand your text?</div>
                          </div>
                          <div className={`px-4 py-2 rounded-full font-bold text-lg ${
                            readability.metrics.flesch_kincaid_grade <= 8 ? 'bg-gray-100 text-gray-800' :
                            readability.metrics.flesch_kincaid_grade <= 12 ? 'bg-gray-100 text-gray-800' : 
                            'bg-gray-200 text-gray-800'
                          }`}>
                            Grade {Math.round(readability.metrics.flesch_kincaid_grade)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {readability.metrics.flesch_kincaid_grade <= 8 
                            ? ' Perfect! Your text can be understood by most people (Middle school level).'
                            : readability.metrics.flesch_kincaid_grade <= 12 
                            ? ' Your text requires high school level education to understand.'
                            : ' Your text requires college-level education. Consider simplifying for broader accessibility.'}
                        </p>
                      </div>
                    )}

                    {/* Text Statistics */}
                    <div className="grid grid-cols-2 gap-4">
                      {readability.metrics.word_count !== undefined && (
                        <div className="bg-white p-4 rounded-lg border border-gray-400">
                          <div className="flex items-center gap-2 mb-2">
                            <div>
                              <div className="text-sm text-gray-600">Total Words</div>
                              <div className="text-2xl font-bold text-gray-800">
                                {readability.metrics.word_count}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">
                            {readability.metrics.word_count < 50 ? 'Very brief content' :
                             readability.metrics.word_count < 200 ? 'Brief content' :
                             readability.metrics.word_count < 500 ? 'Moderate content' : 'Extensive content'}
                          </p>
                        </div>
                      )}
                      {readability.metrics.avg_line_length !== undefined && (
                        <div className="bg-white p-4 rounded-lg border border-gray-400">
                          <div className="flex items-center gap-2 mb-2">
                            <div>
                              <div className="text-sm text-gray-600">Line Length</div>
                              <div className="text-2xl font-bold text-gray-800">
                                {readability.metrics.avg_line_length.toFixed(0)} chars
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">
                            {readability.metrics.avg_line_length <= 75 ? ' Good line length' : ' Lines are too long'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Writing Best Practices Section */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-800 mb-4 text-xl"> Readability Best Practices</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="font-bold text-gray-800 mb-1">Keep Sentences Short</div>
                        <p className="text-sm text-gray-600">Aim for 15-20 words per sentence. Short sentences are easier to understand and remember.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="font-bold text-gray-800 mb-1">Use Simple Words</div>
                        <p className="text-sm text-gray-600">Choose common words over complex jargon. "Use" is better than "utilize", "help" better than "facilitate".</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="font-bold text-gray-800 mb-1">Break Up Text</div>
                        <p className="text-sm text-gray-600">Use short paragraphs, bullet points, and headings. Large blocks of text are intimidating and hard to scan.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="font-bold text-gray-800 mb-1">Active Voice</div>
                        <p className="text-sm text-gray-600">Write in active voice for clarity. "We tested the design" is clearer than "The design was tested".</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues Section */}
              {readability?.issues && readability.issues.length > 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-4 text-xl flex items-center gap-2">
                     Readability Issues Found
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">Issues that may make your text harder to understand</p>
                  <div className="space-y-4">
                    {readability.issues.map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} category="readability" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 border-2 border-gray-300 rounded-xl">
                  <CheckCircle className="h-20 w-20 mx-auto mb-4 text-gray-800" />
                  <h4 className="text-2xl font-bold text-gray-800 mb-3"> Excellent Readability!</h4>
                  <p className="text-lg text-gray-600 mb-2">Your text content is clear and easy to read.</p>
                  <p className="text-sm text-gray-500">Users can understand your message without effort!</p>
                </div>
              )}
            </div>
          )}

          {/* Attention Tab */}
          {activeTab === 'attention' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-800 text-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold mb-2"> Visual Attention Deep Dive</h3>
                    <p className="text-gray-300">Understanding where users look and why</p>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-300 mb-1">Score</div>
                    <div className="text-4xl font-bold">{attention?.score || 0}/100</div>
                  </div>
                </div>
              </div>

              {/* What We Analyzed Section */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-800 mb-4 text-xl flex items-center gap-2">
                  <Eye className="h-6 w-6" />
                   What We Analyzed
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="font-bold text-gray-800 mb-2">Visual Hierarchy</div>
                    <p className="text-sm text-gray-600">Does your design guide users to the most important content first?</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="font-bold text-gray-800 mb-2">Eye Flow Pattern</div>
                    <p className="text-sm text-gray-600">How naturally do users' eyes move across your design?</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="font-bold text-gray-800 mb-2">Cognitive Load</div>
                    <p className="text-sm text-gray-600">Is there too much visual information competing for attention?</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="font-bold text-gray-800 mb-2">Hot Spots</div>
                    <p className="text-sm text-gray-600">Which areas naturally attract the most visual attention?</p>
                  </div>
                </div>
              </div>

              {/* Attention Distribution - Visual & Intuitive */}
              {attention?.attention_distribution && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-3 text-xl flex items-center gap-2">
                    <Eye className="h-6 w-6" />
                     Where Do Users Look First?
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">We predict where users' eyes naturally go when viewing your design</p>
                  
                  {/* Visual Page Representation */}
                  <div className="space-y-4">
                    {/* Top Section - Enhanced */}
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                            attention.attention_distribution.top >= 0.6 ? 'bg-gray-800' :
                            attention.attention_distribution.top >= 0.3 ? 'bg-gray-700' :
                            'bg-gray-500'
                          }`}>
                            
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                              Top of Page
                              {attention.attention_distribution.top >= 0.6 && <span className="text-gray-800 text-xl"></span>}
                            </div>
                            <div className="text-sm text-gray-600">Header & Hero Section</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-gray-800">
                            {(attention.attention_distribution.top * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-600">of attention</div>
                        </div>
                      </div>
                      
                      {/* Visual Bar */}
                      <div className="mb-3">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              attention.attention_distribution.top >= 0.6 ? 'bg-gray-800' :
                              attention.attention_distribution.top >= 0.3 ? 'bg-gray-700' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${(attention.attention_distribution.top * 100).toFixed(0)}%` }}
                          />
                        </div>
                      </div>

                      <div className={`text-sm p-4 rounded-lg ${
                        attention.attention_distribution.top >= 0.6 ? 'bg-white border-2 border-gray-700' :
                        attention.attention_distribution.top >= 0.3 ? 'bg-white border border-gray-500' :
                        'bg-white border border-gray-400'
                      }`}>
                        <div className="font-semibold text-gray-800 mb-1">
                          {attention.attention_distribution.top >= 0.6 
                            ? ' Excellent Visual Hierarchy'
                            : attention.attention_distribution.top >= 0.3 
                            ? ' Moderate Attention'
                            : ' Low Top-Section Focus'}
                        </div>
                        <p className="text-gray-700">
                          {attention.attention_distribution.top >= 0.6 
                            ? 'Users will immediately notice your most important content at the top. This is ideal for key messages, headlines, and calls-to-action.'
                            : attention.attention_distribution.top >= 0.3 
                            ? 'Your header gets some attention, but consider making it more prominent. Use larger headlines, stronger contrasts, or more compelling visuals.'
                            : 'Users might miss critical top content. Try increasing visual weight with larger text, brighter colors, or more prominent imagery.'}
                        </p>
                      </div>
                    </div>

                    {/* Center Section - Enhanced */}
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                            
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-lg">Middle Area</div>
                            <div className="text-sm text-gray-600">Main Content Zone</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-gray-800">
                            {(attention.attention_distribution.center * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-600">of attention</div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-700 transition-all"
                            style={{ width: `${(attention.attention_distribution.center * 100).toFixed(0)}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-sm bg-white p-4 rounded-lg border border-gray-400">
                        <div className="font-semibold text-gray-800 mb-1"> Content Balance</div>
                        <p className="text-gray-700">
                          This is where your main content lives. The center area should support your top section, providing detail and context without overwhelming users.
                        </p>
                      </div>
                    </div>

                    {/* Bottom Section - Enhanced */}
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                            attention.attention_distribution.bottom <= 0.1 ? 'bg-gray-500' :
                            attention.attention_distribution.bottom <= 0.2 ? 'bg-gray-700' :
                            'bg-gray-800'
                          }`}>
                            
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                              Bottom Section
                              {attention.attention_distribution.bottom <= 0.1 && <span className="text-gray-800 text-xl"></span>}
                            </div>
                            <div className="text-sm text-gray-600">Footer Area</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-gray-700">
                            {(attention.attention_distribution.bottom * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-600">of attention</div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              attention.attention_distribution.bottom <= 0.1 ? 'bg-gray-500' :
                              attention.attention_distribution.bottom <= 0.2 ? 'bg-gray-700' :
                              'bg-gray-800'
                            }`}
                            style={{ width: `${(attention.attention_distribution.bottom * 100).toFixed(0)}%` }}
                          />
                        </div>
                      </div>

                      <div className={`text-sm p-4 rounded-lg ${
                        attention.attention_distribution.bottom <= 0.1 ? 'bg-white border-2 border-gray-700' :
                        attention.attention_distribution.bottom <= 0.2 ? 'bg-white border border-gray-500' :
                        'bg-white border border-gray-400'
                      }`}>
                        <div className="font-semibold text-gray-800 mb-1">
                          {attention.attention_distribution.bottom <= 0.1 
                            ? ' Normal Pattern'
                            : attention.attention_distribution.bottom <= 0.2 
                            ? ' Elevated Bottom Attention'
                            : ' Unusual Footer Focus'}
                        </div>
                        <p className="text-gray-700">
                          {attention.attention_distribution.bottom <= 0.1 
                            ? 'Perfect! Bottom areas naturally get less attention. This is the expected pattern for effective designs.'
                            : attention.attention_distribution.bottom <= 0.2 
                            ? 'Footer area is getting more attention than typical. Check if something is drawing eyes away from your main content.'
                            : 'High bottom attention is unusual and may indicate confusion. Users might be searching for something they can\'t find, or footer elements are too distracting.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Insight */}
                  {attention.analysis_summary && (
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-xl border-2 border-gray-400 mt-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-white rounded-full p-3">
                          <span className="text-4xl"></span>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 mb-2 text-lg">AI-Powered Insight:</div>
                          <p className="text-gray-800 leading-relaxed">{attention.analysis_summary}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Design Principles Section */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-800 mb-4 text-xl"> Visual Attention Best Practices</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="font-bold text-gray-800 mb-1">F-Pattern Reading</div>
                        <p className="text-sm text-gray-600">Users typically scan in an F-shape: top-left to top-right, then down the left side. Place key content along this path.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="font-bold text-gray-800 mb-1">Size & Scale</div>
                        <p className="text-sm text-gray-600">Larger elements naturally draw more attention. Make important content physically bigger to increase its visual weight.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="font-bold text-gray-800 mb-1">Contrast</div>
                        <p className="text-sm text-gray-600">High contrast between elements creates visual interest and guides attention. Use contrast strategically for CTAs.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="font-bold text-gray-800 mb-1">White Space</div>
                        <p className="text-sm text-gray-600">Empty space around elements makes them stand out. Don't be afraid of white space—it helps reduce cognitive load.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues Section */}
              {attention?.issues && attention.issues.length > 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-4 text-xl flex items-center gap-2">
                     Attention Issues Found
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">Issues that may distract users or create confusion</p>
                  <div className="space-y-4">
                    {attention.issues.map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} category="attention" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 border-2 border-gray-300 rounded-xl">
                  <CheckCircle className="h-20 w-20 mx-auto mb-4 text-gray-800" />
                  <h4 className="text-2xl font-bold text-gray-800 mb-3"> Perfect Visual Hierarchy!</h4>
                  <p className="text-lg text-gray-600 mb-2">Your design effectively guides user attention.</p>
                  <p className="text-sm text-gray-500">Users will naturally focus on your most important content!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Note: AccessibilityIssueCard PropTypes removed - now using SimpleAccessibilityCard

IssueCard.propTypes = {
  issue: PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    severity: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    current_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    required_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    recommendation: PropTypes.string,
    wcag_criterion: PropTypes.string,
    current_state: PropTypes.string,
    before_value: PropTypes.string,
    after_value: PropTypes.string,
    impact: PropTypes.shape({
      affects_percentage: PropTypes.number,
      improvement: PropTypes.string,
      description: PropTypes.string
    }),
    effort: PropTypes.string,
    learn_more_url: PropTypes.string
  }),
  category: PropTypes.oneOf(['accessibility', 'readability', 'attention'])
};

PriorityFixCard.propTypes = {
  fix: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    severity: PropTypes.string,
    impact: PropTypes.string,
    effort: PropTypes.string,
    wcag: PropTypes.string
  }).isRequired,
  rank: PropTypes.number.isRequired
};

AnalysisResults.propTypes = {
  results: PropTypes.shape({
    design_name: PropTypes.string,
    arai_score: PropTypes.number,
    overall_grade: PropTypes.string,
    conformance_level: PropTypes.string,
    accessibility: PropTypes.shape({
      score: PropTypes.number,
      conformance_level: PropTypes.string,
      issue_count: PropTypes.shape({
        critical: PropTypes.number,
        high: PropTypes.number,
        medium: PropTypes.number,
        low: PropTypes.number
      }),
      issues: PropTypes.arrayOf(PropTypes.object)
    }),
    readability: PropTypes.shape({
      score: PropTypes.number,
      issue_count: PropTypes.shape({
        critical: PropTypes.number,
        high: PropTypes.number,
        medium: PropTypes.number,
        low: PropTypes.number
      }),
      metrics: PropTypes.shape({
        flesch_reading_ease: PropTypes.number,
        flesch_kincaid_grade: PropTypes.number,
        word_count: PropTypes.number,
        avg_line_length: PropTypes.number
      }),
      issues: PropTypes.arrayOf(PropTypes.object)
    }),
    attention: PropTypes.shape({
      score: PropTypes.number,
      issue_count: PropTypes.shape({
        critical: PropTypes.number,
        high: PropTypes.number,
        medium: PropTypes.number,
        low: PropTypes.number
      }),
      attention_distribution: PropTypes.shape({
        top: PropTypes.number,
        center: PropTypes.number,
        bottom: PropTypes.number
      }),
      analysis_summary: PropTypes.string,
      issues: PropTypes.arrayOf(PropTypes.object)
    })
  })
};

export default AnalysisResults;
