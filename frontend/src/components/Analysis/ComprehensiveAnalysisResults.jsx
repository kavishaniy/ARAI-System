/**
 * Comprehensive Analysis Results Component
 * Displays all FR-009 to FR-027 requirements in an intuitive, beautiful layout
 */

import React, { useState } from 'react';
import { 
  Shield, Eye, BookOpen, AlertTriangle, CheckCircle, XCircle, Info,
  Download, FileText, Table, Award, Brain, Palette, Type, Target,
  TrendingUp, Users, Lightbulb, BookMarked, ExternalLink, ChevronDown,
  ChevronUp, AlertCircle, Check, X
} from 'lucide-react';

const ComprehensiveAnalysisResults = ({ results }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [expandedEducation, setExpandedEducation] = useState(null);

  if (!results) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">No analysis results to display</p>
      </div>
    );
  }

  const { 
    arai_score,
    arai_breakdown,
    overall_grade,
    accessibility,
    readability,
    attention,
    issues,
    issue_summary,
    education,
    recommendations
  } = results;

  // Helper Functions
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-gray-600 bg-gray-50 border-gray-300';
    if (score >= 80) return 'text-gray-600 bg-gray-50 border-gray-300';
    if (score >= 70) return 'text-gray-600 bg-gray-50 border-gray-300';
    if (score >= 60) return 'text-gray-600 bg-gray-50 border-gray-300';
    return 'text-gray-600 bg-gray-50 border-gray-300';
  };

  const getGradeBadgeColor = (grade) => {
    const colors = {
      'A': 'bg-gray-500 text-white',
      'B': 'bg-gray-500 text-white',
      'C': 'bg-gray-500 text-white',
      'D': 'bg-gray-500 text-white',
      'F': 'bg-gray-500 text-white'
    };
    return colors[grade] || 'bg-gray-500 text-white';
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      critical: 'bg-gray-100 text-gray-800 border-gray-300',
      high: 'bg-gray-100 text-gray-800 border-gray-300',
      medium: 'bg-gray-100 text-gray-800 border-gray-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300',
      info: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return styles[severity] || styles.info;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: <XCircle className="h-5 w-5 text-gray-500" />,
      high: <AlertTriangle className="h-5 w-5 text-gray-500" />,
      medium: <AlertCircle className="h-5 w-5 text-gray-500" />,
      low: <Info className="h-5 w-5 text-gray-500" />,
      info: <Info className="h-5 w-5 text-gray-500" />
    };
    return icons[severity] || icons.info;
  };

  // Export Functions
  const handleExportPDF = async () => {
    try {
      const response = await fetch(`/api/v1/analysis/export/pdf/${results.analysis_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ARAI_Report_${results.design_name}.pdf`;
      a.click();
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/v1/analysis/export/csv/${results.analysis_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ARAI_Issues_${results.design_name}.csv`;
      a.click();
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* FR-021: ARAI Score Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-8 w-8" />
              <h1 className="text-4xl font-bold">{results.design_name}</h1>
            </div>
            <p className="text-gray-100 text-lg">
              {arai_breakdown?.interpretation || 'AI-Powered Accessibility Analysis'}
            </p>
            
            {/* Score Breakdown */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Accessibility</span>
                </div>
                <div className="text-3xl font-bold">{arai_breakdown?.accessibility || 0}</div>
                <div className="text-xs text-gray-100 mt-1">40% weight</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm font-medium">Readability</span>
                </div>
                <div className="text-3xl font-bold">{arai_breakdown?.readability || 0}</div>
                <div className="text-xs text-gray-100 mt-1">30% weight</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5" />
                  <span className="text-sm font-medium">Attention</span>
                </div>
                <div className="text-3xl font-bold">{arai_breakdown?.attention || 0}</div>
                <div className="text-xs text-gray-100 mt-1">30% weight</div>
              </div>
            </div>
          </div>

          {/* Overall Score Circle */}
          <div className="text-center ml-8">
            <div className="relative">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-white/20"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - (arai_score || 0) / 100)}`}
                  className="text-white transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold">{arai_score || 0}</div>
                <div className="text-sm text-gray-100">ARAI Score</div>
              </div>
            </div>
            <div className={`mt-4 inline-block px-6 py-2 rounded-full text-2xl font-bold ${getGradeBadgeColor(overall_grade)}`}>
              Grade {overall_grade}
            </div>
          </div>
        </div>

        {/* FR-026 & FR-027: Export Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-white text-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5" />
            Export PDF Report
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white/10 backdrop-blur text-white border-2 border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
          >
            <Table className="h-5 w-5" />
            Export CSV Data
          </button>
        </div>
      </div>

      {/* FR-023: Issue Summary Dashboard */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Target className="h-6 w-6 text-gray-600" />
          Issue Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['critical', 'high', 'medium', 'low', 'info'].map(severity => {
            const count = issue_summary?.by_severity?.[severity] || 0;
            return (
              <div key={severity} className={`p-4 rounded-lg border-2 ${getSeverityBadge(severity)}`}>
                <div className="flex items-center justify-between mb-2">
                  {getSeverityIcon(severity)}
                  <span className="text-3xl font-bold">{count}</span>
                </div>
                <div className="text-sm font-medium capitalize">{severity}</div>
              </div>
            );
          })}
        </div>

        {/* Category Breakdown */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Accessibility</span>
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {issue_summary?.by_category?.Accessibility || 0} issues
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Readability</span>
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {issue_summary?.by_category?.Readability || 0} issues
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Attention</span>
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {issue_summary?.by_category?.Attention || 0} issues
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'issues', label: 'All Issues', icon: AlertTriangle },
              { id: 'accessibility', label: 'Accessibility', icon: Shield },
              { id: 'readability', label: 'Readability', icon: BookOpen },
              { id: 'attention', label: 'Attention', icon: Eye },
              { id: 'education', label: 'Learn More', icon: BookMarked },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-600 text-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Analysis Overview</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Accessibility Overview */}
                  <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gray-600 rounded-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">Accessibility</h4>
                        <p className="text-sm text-gray-600">WCAG 2.1 Compliance</p>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-gray-600 mb-2">
                      {accessibility?.score || 0}/100
                    </div>
                    <div className="text-sm text-gray-700 mb-4">
                      {accessibility?.wcag_level && (
                        <span className="inline-block px-3 py-1 bg-gray-600 text-white rounded-full font-semibold">
                          WCAG Level {accessibility.wcag_level}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Contrast Issues</span>
                        <span className="font-semibold">
                          {accessibility?.issues?.filter(i => i.subcategory === 'Contrast').length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Color Vision Issues</span>
                        <span className="font-semibold">
                          {accessibility?.issues?.filter(i => i.subcategory === 'Color Vision').length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Alt Text Needed</span>
                        <span className="font-semibold">
                          {accessibility?.issues?.filter(i => i.subcategory === 'Alternative Text').length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Readability Overview */}
                  <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gray-600 rounded-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">Readability</h4>
                        <p className="text-sm text-gray-600">Content Clarity</p>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-gray-600 mb-2">
                      {readability?.score || 0}/100
                    </div>
                    <div className="text-sm text-gray-700 mb-4">
                      {readability?.grade_level && (
                        <span className="text-gray-700">{readability.grade_level}</span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Word Count</span>
                        <span className="font-semibold">{readability?.word_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Flesch Reading Ease</span>
                        <span className="font-semibold">
                          {readability?.readability_scores?.flesch_reading_ease || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Inclusive Language Issues</span>
                        <span className="font-semibold">
                          {readability?.issues?.filter(i => i.subcategory === 'Inclusive Language').length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attention Overview */}
                  <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gray-600 rounded-lg">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">Visual Attention & Cognitive Load</h4>
                        <p className="text-sm text-gray-600">Eye-tracking prediction & complexity analysis</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-3xl font-bold text-gray-600 mb-1">
                          {attention?.score || 0}/100
                        </div>
                        <div className="text-sm text-gray-700">Attention Score</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-600 mb-1">
                          {attention?.cognitive_load?.cognitive_load_score || 0}
                        </div>
                        <div className="text-sm text-gray-700">Cognitive Load</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {attention?.cognitive_load?.level || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-600 mb-1">
                          {attention?.critical_elements?.length || 0}
                        </div>
                        <div className="text-sm text-gray-700">Critical Elements</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FR-023 & FR-024: All Issues Tab with Explainable AI */}
          {activeTab === 'issues' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  All Issues ({issues?.length || 0})
                </h3>
                <div className="text-sm text-gray-600">
                  Organized by severity • WCAG references included • AI confidence scores
                </div>
              </div>

              {issues && issues.length > 0 ? (
                issues.map((issue, index) => (
                  <div
                    key={issue.id || index}
                    className="border-2 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div
                      className={`p-4 cursor-pointer ${getSeverityBadge(issue.severity)}`}
                      onClick={() => setExpandedIssue(expandedIssue === index ? null : index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg">{issue.type}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${getSeverityBadge(issue.severity)}`}>
                                {issue.severity}
                              </span>
                              {issue.wcag_criterion && issue.wcag_criterion !== 'N/A' && (
                                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-semibold">
                                  {issue.wcag_criterion}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {issue.category} › {issue.subcategory}
                              </span>
                              {/* FR-024: Confidence Score */}
                              {issue.confidence && (
                                <span className="flex items-center gap-1">
                                  <Brain className="h-3 w-3" />
                                  Confidence: {(issue.confidence * 100).toFixed(0)}% ({issue.confidence_level || 'Moderate'})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {expandedIssue === index ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </div>

                    {/* FR-024: Explainable AI Feedback */}
                    {expandedIssue === index && (
                      <div className="p-4 bg-white border-t-2">
                        <div className="space-y-4">
                          {/* Explanation */}
                          {issue.explanation && (
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Why This Matters
                              </h5>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                {issue.explanation}
                              </p>
                            </div>
                          )}

                          {/* Fix Suggestion */}
                          {issue.fix_suggestion && (
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                How to Fix
                              </h5>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                {issue.fix_suggestion}
                              </p>
                            </div>
                          )}

                          {/* AI Reasoning */}
                          {issue.ai_reasoning && (
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                AI Analysis Method
                              </h5>
                              <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
                                {issue.ai_reasoning}
                              </p>
                            </div>
                          )}

                          {/* Additional Details */}
                          {issue.details && Object.keys(issue.details).length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-2">Technical Details</h5>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                  {JSON.stringify(issue.details, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-lg font-semibold">No issues found!</p>
                  <p className="text-sm">Your design meets all analyzed criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* FR-025: Educational Content Tab */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Learn About Accessibility</h3>
                <p className="text-gray-600 mb-6">
                  Understanding WCAG guidelines helps you create more inclusive designs
                </p>
              </div>

              {education && education.length > 0 ? (
                education.map((edu, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setExpandedEducation(expandedEducation === index ? null : index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-600 rounded-lg">
                            <BookMarked className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">{edu.title}</h4>
                            <span className="text-sm text-gray-600 font-semibold">
                              WCAG Level {edu.level}
                            </span>
                          </div>
                        </div>
                        {expandedEducation === index ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </div>

                    {expandedEducation === index && (
                      <div className="p-6 bg-white space-y-4">
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">What it means</h5>
                          <p className="text-gray-700">{edu.description || 'No description available'}</p>
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Why it's important</h5>
                          <p className="text-gray-700">{edu.why_important || 'Improves accessibility and user experience'}</p>
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">How to fix</h5>
                          <p className="text-gray-700">{edu.how_to_fix || 'Follow WCAG guidelines'}</p>
                        </div>

                        {edu.example && typeof edu.example === 'string' && (
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Example</h5>
                            <pre className="bg-gray-100 p-3 rounded-lg text-sm text-gray-800 overflow-x-auto">
                              {edu.example}
                            </pre>
                          </div>
                        )}

                        {edu.resources && Array.isArray(edu.resources) && edu.resources.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Learn More</h5>
                            <div className="space-y-2">
                              {edu.resources.map((resource, idx) => (
                                <a
                                  key={idx}
                                  href={typeof resource === 'string' ? resource : resource.url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  {typeof resource === 'string' ? resource : resource.title || 'Learn more'}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookMarked className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No educational content available for this analysis.</p>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Actionable Recommendations</h3>
                <p className="text-gray-600 mb-6">
                  Prioritized steps to improve your design's accessibility and usability
                </p>
              </div>

              {recommendations && recommendations.length > 0 ? (
                recommendations.map((rec, index) => {
                  const priorityColors = {
                    critical: 'border-gray-300 bg-gray-50',
                    high: 'border-gray-300 bg-gray-50',
                    medium: 'border-gray-300 bg-gray-50',
                    low: 'border-gray-300 bg-gray-50'
                  };
                  
                  return (
                    <div
                      key={index}
                      className={`border-2 rounded-lg p-6 ${priorityColors[rec.priority] || 'border-gray-300 bg-gray-50'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-lg shadow">
                          <Lightbulb className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-lg text-gray-800">{rec.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${
                              rec.priority === 'high' ? 'bg-gray-100 text-gray-800' :
                              rec.priority === 'medium' ? 'bg-gray-100 text-gray-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rec.priority} priority
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{rec.description}</p>
                          <div className="bg-white p-3 rounded-lg mb-3">
                            <p className="text-sm text-gray-800"><strong>Action:</strong> {rec.action}</p>
                          </div>
                          {rec.wcag_reference && typeof rec.wcag_reference === 'string' && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>WCAG Reference:</strong> {rec.wcag_reference}
                            </p>
                          )}
                          {rec.impact && typeof rec.impact === 'string' && (
                            <p className="text-sm text-gray-600 italic">
                              <strong>Impact:</strong> {rec.impact}
                            </p>
                          )}
                          {rec.resources && Array.isArray(rec.resources) && rec.resources.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {rec.resources.map((resource, idx) => (
                                <a
                                  key={idx}
                                  href={typeof resource === 'string' ? resource : resource.url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {typeof resource === 'string' ? 'Resource' : resource.title || 'Resource'}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p>No specific recommendations - your design looks great!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisResults;
