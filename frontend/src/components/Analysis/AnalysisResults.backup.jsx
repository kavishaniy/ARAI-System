import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SimpleAccessibilityCard from './SimpleAccessibilityCard';
import { 
  Shield, Eye, BookOpen, AlertTriangle, CheckCircle, 
  XCircle, Info, ChevronDown, ChevronUp, Target, 
  Zap, ExternalLink, FileText,
  Palette, Type, MousePointer, 
  Contrast, FileWarning
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
                <Zap className="h-4 w-4 text-gray-700" />
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
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm mb-1">
            {fix.title}
          </h4>
          <p className="text-sm text-gray-600 mb-2">{fix.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${
              fix.severity === 'critical' ? 'bg-red-100 text-red-700' :
              fix.severity === 'high' ? 'bg-orange-100 text-orange-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {fix.severity ? fix.severity.charAt(0).toUpperCase() + fix.severity.slice(1) : 'Info'}
            </span>
            {fix.wcag && (
              <span className="text-gray-600 font-mono">WCAG {fix.wcag}</span>
            )}
          </div>
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

  // Get grade badge color
  const getGradeBadgeColor = (grade) => {
    if (grade === 'A') return 'bg-green-600';
    if (grade === 'B') return 'bg-blue-600';
    if (grade === 'C') return 'bg-yellow-600';
    if (grade === 'D') return 'bg-orange-600';
    return 'bg-red-600';
  };

  // Get score status
  const getScoreStatus = (score) => {
    if (score >= 90) return { label: 'Excellent' };
    if (score >= 70) return { label: 'Good' };
    return { label: 'Needs Improvement' };
  };


  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Overall Score Dashboard - Minimal Design */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {results.design_name || 'Design Analysis Report'}
              </h1>
              <p className="text-gray-500 text-sm">
                AI-Powered Accessibility Analysis
              </p>
            </div>
            <div className="text-center bg-blue-50 rounded-lg p-6 min-w-max">
              <div className="text-xs text-gray-600 mb-2 font-semibold">Overall Score</div>
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {arai_score || 0}
              </div>
              <div className={`inline-block px-3 py-1 rounded text-sm font-semibold text-white ${getGradeBadgeColor(overall_grade)}`}>
                Grade {overall_grade}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          {/* Accessibility */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Accessibility</h3>
                <p className="text-xs text-gray-500">Can everyone use it?</p>
              </div>
            </div>
            <div className={`text-4xl font-bold mb-2 text-gray-900`}>
              {accessibility?.score || 0}<span className="text-xl text-gray-600">/100</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${accessibility?.score || 0}%` }}
                />
              </div>
            </div>
            {accessibility?.issue_count && (
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <div>
                  <div className="font-semibold text-gray-900">{accessibility.issue_count.critical || 0}</div>
                  <div className="text-gray-600 text-xs">Critical</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{accessibility.issue_count.high || 0}</div>
                  <div className="text-gray-600 text-xs">High</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">{accessibility.issue_count.medium || 0}</div>
                  <div className="text-gray-600 text-xs">Medium</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-600">{accessibility.issue_count.low || 0}</div>
                  <div className="text-gray-600 text-xs">Low</div>
                </div>
              </div>
            )}
          </div>

          {/* Readability */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Readability</h3>
                <p className="text-xs text-gray-500">Is text easy to read?</p>
              </div>
            </div>
            <div className={`text-4xl font-bold mb-2 text-gray-900`}>
              {readability?.score || 0}<span className="text-xl text-gray-600">/100</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${readability?.score || 0}%` }}
                />
              </div>
            </div>
            {readability?.issue_count && (
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <div>
                  <div className="font-semibold text-gray-900">{readability.issue_count.critical || 0}</div>
                  <div className="text-gray-600 text-xs">Critical</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{readability.issue_count.high || 0}</div>
                  <div className="text-gray-600 text-xs">High</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">{readability.issue_count.medium || 0}</div>
                  <div className="text-gray-600 text-xs">Medium</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-600">{readability.issue_count.low || 0}</div>
                  <div className="text-gray-600 text-xs">Low</div>
                </div>
              </div>
            )}
          </div>

          {/* Attention */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Attention</h3>
                <p className="text-xs text-gray-500">Does it guide eyes?</p>
              </div>
            </div>
            <div className={`text-4xl font-bold mb-2 text-gray-900`}>
              {attention?.score || 0}<span className="text-xl text-gray-600">/100</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${attention?.score || 0}%` }}
                />
              </div>
            </div>
            {attention?.issue_count && (
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <div>
                  <div className="font-semibold text-gray-900">{attention.issue_count.critical || 0}</div>
                  <div className="text-gray-600 text-xs">Critical</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{attention.issue_count.high || 0}</div>
                  <div className="text-gray-600 text-xs">High</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">{attention.issue_count.medium || 0}</div>
                  <div className="text-gray-600 text-xs">Medium</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-600">{attention.issue_count.low || 0}</div>
                  <div className="text-gray-600 text-xs">Low</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Summary */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="text-gray-600 mb-1">Overall Status</div>
              <div className={`text-lg font-semibold text-gray-900`}>
                {getScoreStatus(arai_score).label}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-600 mb-1">Total Issues</div>
              <div className="text-2xl font-bold text-gray-900">{totalIssues}</div>
            </div>
            {conformance_level && (
              <div className="text-right">
                <div className="text-gray-600 mb-1">WCAG Level</div>
                <div className="text-lg font-semibold text-gray-900">{conformance_level}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Priority Fixes */}
      {priorityFixes.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top 5 Priority Fixes</h2>
              <p className="text-sm text-gray-500">Start here for biggest impact</p>
            </div>
          </div>
          <div className="space-y-2">
            {priorityFixes.map((fix, idx) => (
              <PriorityFixCard key={idx} fix={fix} rank={idx + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-white">
          <div className="flex">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'summary'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-4 w-4" />
                Summary
              </div>
            </button>
            <button
              onClick={() => setActiveTab('accessibility')}
              className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'accessibility'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Accessibility
              </div>
            </button>
            <button
              onClick={() => setActiveTab('readability')}
              className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'readability'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                Readability
              </div>
            </button>
            <button
              onClick={() => setActiveTab('attention')}
              className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'attention'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                Attention
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Report Overview</h3>
                <p className="text-gray-600">
                  Your design was analyzed across three key areas: accessibility, readability, and visual attention.
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Accessibility
                  </h4>
                  <p className="text-sm text-gray-600">
                    Works for everyone, including people with disabilities
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    Readability
                  </h4>
                  <p className="text-sm text-gray-600">
                    Text is clear, simple, and easy to understand
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Visual Attention
                  </h4>
                  <p className="text-sm text-gray-600">
                    Design guides users to important content naturally
                  </p>
                </div>
              </div>

              {/* Score Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">How to Read Your Scores</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="font-semibold text-green-700 mb-1">80-100</div>
                    <div className="text-gray-600">Excellent</div>
                  </div>
                  <div>
                    <div className="font-semibold text-yellow-700 mb-1">60-79</div>
                    <div className="text-gray-600">Good</div>
                  </div>
                  <div>
                    <div className="font-semibold text-red-700 mb-1">Below 60</div>
                    <div className="text-gray-600">Needs Work</div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Next Steps</h4>
                <ol className="space-y-2 text-sm text-gray-600 ml-4 list-decimal">
                  <li>Address critical issues first</li>
                  <li>Review detailed tabs for specific recommendations</li>
                  <li>Test changes with real users</li>
                  <li>Track improvements over time</li>
                </ol>
              </div>
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Accessibility Details</h3>
                <p className="text-gray-600 text-sm">Making your design work for everyone</p>
                {accessibility?.conformance_level && (
                  <div className="mt-3 inline-block bg-blue-50 px-3 py-1 rounded text-sm font-semibold text-blue-700">
                    WCAG {accessibility.conformance_level}
                  </div>
                )}
              </div>

              {/* What We Checked */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">What we analyzed:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <Contrast className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Color Contrast</div>
                      <div className="text-gray-600 text-xs">Readability for low vision</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <Type className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Text Size</div>
                      <div className="text-gray-600 text-xs">Comfortable reading</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <Palette className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Color Independence</div>
                      <div className="text-gray-600 text-xs">Colorblind friendly</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <MousePointer className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Touch Targets</div>
                      <div className="text-gray-600 text-xs">Mobile-friendly size</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues Section */}
              {accessibility?.issues && accessibility.issues.length > 0 ? (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold text-gray-900">{accessibility.issues.length} issues found</h4>
                    </div>
                    {accessibility?.issue_count && (
                      <div className="grid grid-cols-4 gap-2 text-xs mb-4">
                        <div className="bg-red-50 p-2 rounded text-center border border-red-200">
                          <div className="font-bold text-red-700">{accessibility.issue_count.critical || 0}</div>
                          <div className="text-red-600">Critical</div>
                        </div>
                        <div className="bg-orange-50 p-2 rounded text-center border border-orange-200">
                          <div className="font-bold text-orange-700">{accessibility.issue_count.high || 0}</div>
                          <div className="text-orange-600">High</div>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded text-center border border-yellow-200">
                          <div className="font-bold text-yellow-700">{accessibility.issue_count.medium || 0}</div>
                          <div className="text-yellow-600">Medium</div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-center border border-blue-200">
                          <div className="font-bold text-blue-700">{accessibility.issue_count.low || 0}</div>
                          <div className="text-blue-600">Low</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Individual Issues */}
                  <div className="space-y-3">
                    {accessibility.issues.map((issue, idx) => (
                      <SimpleAccessibilityCard key={idx} issue={issue} index={idx} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h4 className="text-lg font-bold text-gray-900 mb-1">No issues found!</h4>
                  <p className="text-gray-600 text-sm">Your design is accessible to all users</p>
                </div>
              )}
            </div>
          )}

          {/* Readability Tab */}
          {activeTab === 'readability' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Readability Details</h3>
                <p className="text-gray-600 text-sm">How clear and easy to read is your text?</p>
              </div>

              {/* Readability Metrics - Simplified */}
              {readability?.metrics && (
                <div className="space-y-4">
                  {/* Reading Ease Score */}
                  {readability.metrics.flesch_reading_ease !== undefined && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">Text Difficulty</div>
                          <div className="text-xs text-gray-600">Easy to understand?</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                          {Math.min(100, readability.metrics.flesch_reading_ease)}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${Math.min(100, readability.metrics.flesch_reading_ease)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {readability.metrics.flesch_reading_ease >= 60 
                          ? 'Easy to read - Good!'
                          : readability.metrics.flesch_reading_ease >= 30 
                          ? 'Moderate - Consider simplifying'
                          : 'Difficult - Use simpler words'}
                      </p>
                    </div>
                  )}

                  {/* Education Level Required */}
                  {readability.metrics.flesch_kincaid_grade !== undefined && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">Reading Level</div>
                          <div className="text-xs text-gray-600">Required education level</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                          Grade {Math.round(readability.metrics.flesch_kincaid_grade)}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {readability.metrics.flesch_kincaid_grade <= 8 
                          ? 'Middle school level - Perfect for broad audience'
                          : readability.metrics.flesch_kincaid_grade <= 12 
                          ? 'High school level'
                          : 'College level - May be too complex'}
                      </p>
                    </div>
                  )}

                  {/* Text Statistics */}
                  {readability.metrics.word_count !== undefined && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">Words</div>
                          <div className="text-xs text-gray-600">Total content length</div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                          {readability.metrics.word_count}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Best Practices */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Readability tips:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="text-lg">✓</span>
                    <span className="text-gray-700">Use short sentences (15-20 words)</span>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="text-lg">✓</span>
                    <span className="text-gray-700">Use simple, common words</span>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="text-lg">✓</span>
                    <span className="text-gray-700">Break text into short paragraphs</span>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="text-lg">✓</span>
                    <span className="text-gray-700">Use active voice and clear language</span>
                  </div>
                </div>
              </div>

              {/* Issues Section */}
              {readability?.issues && readability.issues.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">{readability.issues.length} readability issues</h4>
                  </div>
                  <div className="space-y-3">
                    {readability.issues.map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} category="readability" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Great readability!</h4>
                  <p className="text-gray-600 text-sm">Your text is clear and easy to understand</p>
                </div>
              )}
            </div>
          )}

          {/* Attention Tab */}
          {activeTab === 'attention' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Visual Attention Details</h3>
                <p className="text-gray-600 text-sm">Where do users look and does it guide them well?</p>
              </div>

              {/* Attention Distribution */}
              {attention?.attention_distribution && (
                <div className="space-y-4">
                  {/* Top Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">Top of Page</div>
                        <div className="text-xs text-gray-600">Header & hero area</div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {(attention.attention_distribution.top * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${(attention.attention_distribution.top * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {attention.attention_distribution.top >= 0.6 
                        ? 'Excellent - Users see your most important content first'
                        : 'Could be stronger - Consider making header more prominent'}
                    </p>
                  </div>

                  {/* Center Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">Middle Area</div>
                        <div className="text-xs text-gray-600">Main content zone</div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {(attention.attention_distribution.center * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${(attention.attention_distribution.center * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Main content gets balanced attention</p>
                  </div>

                  {/* Bottom Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">Bottom Area</div>
                        <div className="text-xs text-gray-600">Footer & low-priority items</div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {(attention.attention_distribution.bottom * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${(attention.attention_distribution.bottom * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {attention.attention_distribution.bottom <= 0.1 
                        ? 'Expected - Footer gets less attention'
                        : 'Note: Bottom area has more attention than typical'}
                    </p>
                  </div>

                  {/* AI Summary */}
                  {attention.analysis_summary && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 mb-2 text-sm">AI Insight</div>
                      <p className="text-sm text-gray-700">{attention.analysis_summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Design Principles */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Key principles:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="text-lg">✓</span>
                    <span className="text-gray-700">F-pattern: Users scan left-to-right, then top-to-bottom</span>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="text-lg">✓</span>
                    <span className="text-gray-700">Size matters: Larger elements attract more attention</span>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="text-lg">✓</span>
                    <span className="text-gray-700">Contrast draws eyes: Use strategically for CTAs</span>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="text-lg">✓</span>
                    <span className="text-gray-700">White space helps: Let elements breathe</span>
                  </div>
                </div>
              </div>

              {/* Issues Section */}
              {attention?.issues && attention.issues.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">{attention.issues.length} attention issues</h4>
                  </div>
                  <div className="space-y-3">
                    {attention.issues.map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} category="attention" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Perfect visual hierarchy!</h4>
                  <p className="text-gray-600 text-sm">Users naturally focus on your important content</p>
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
