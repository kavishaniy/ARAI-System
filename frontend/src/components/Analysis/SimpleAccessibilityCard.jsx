import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

/**
 * SUPER SIMPLE Accessibility Issue Card
 * Makes accessibility issues easy to understand for anyone!
 */
const SimpleAccessibilityCard = ({ issue, index }) => {
  const [showMore, setShowMore] = useState(false);

  if (!issue) return null;

  // Convert technical terms to plain English
  const getSimpleTitle = () => {
    const type = (issue.type || '').toLowerCase();
    const desc = (issue.description || '').toLowerCase();
    
    if (type.includes('contrast') || desc.includes('contrast')) {
      return `${index + 1}. Text is hard to read`;
    }
    if (type.includes('text') && type.includes('size')) {
      return `${index + 1}. Text is too small`;
    }
    if (type.includes('touch') || type.includes('target')) {
      return `${index + 1}. Button is too small to tap`;
    }
    if (type.includes('alt') || type.includes('image')) {
      return `${index + 1}. Image needs description`;
    }
    if (type.includes('color') && type.includes('blind')) {
      return `${index + 1}. Colorblind users may struggle`;
    }
    
    return `${index + 1}. ${issue.type || 'Accessibility issue'}`;
  };

  // Get priority badge
  const getPriority = () => {
    const severity = (issue.severity || 'medium').toLowerCase();
    if (severity === 'critical' || severity === 'high') {
      return { text: 'FIX NOW', color: 'bg-gray-800 text-white' };
    }
    if (severity === 'medium') {
      return { text: 'IMPORTANT', color: 'bg-gray-600 text-white' };
    }
    return { text: 'OPTIONAL', color: 'bg-gray-400 text-white' };
  };

  const priority = getPriority();
  const title = getSimpleTitle();

  // Extract simple values
  const getLocationText = () => {
    if (!issue.location) return null;
    if (typeof issue.location === 'string') return issue.location;
    if (issue.location.x !== undefined) {
      return `Position: ${issue.location.x}, ${issue.location.y}`;
    }
    return 'Somewhere in your design';
  };

  const getCurrentValue = () => {
    return issue.current_value || issue.current_ratio || issue.current_color || 'N/A';
  };

  const getRequiredValue = () => {
    return issue.required_value || issue.required_ratio || '4.5:1';
  };

  const getFixSuggestion = () => {
    if (issue.fix_suggestion) return issue.fix_suggestion;
    if (issue.recommendation) return issue.recommendation;
    
    const type = (issue.type || '').toLowerCase();
    if (type.includes('contrast')) return 'Make text darker or background lighter';
    if (type.includes('size')) return 'Increase text or button size';
    if (type.includes('alt')) return 'Add a short description of the image';
    
    return 'Improve this for better accessibility';
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${priority.color}`}>
            {priority.text}
          </span>
        </div>
        <button
          onClick={() => setShowMore(!showMore)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={showMore ? "Show less" : "Show more"}
        >
          {showMore ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Simple Description */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-800">
            {issue.description || issue.explanation || 'This needs to be fixed for better accessibility'}
          </p>
        </div>
      </div>

      {/* Quick Fix */}
      <div className="bg-gray-800 text-white rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold mb-1">How to Fix:</div>
            <p className="text-sm text-gray-100">{getFixSuggestion()}</p>
          </div>
        </div>
      </div>

      {/* Detailed Info (Expandable) */}
      {showMore && (
        <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
          {/* Location */}
          {getLocationText() && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-semibold text-gray-700">Location:</span>
              <span className="text-sm text-gray-600">{getLocationText()}</span>
            </div>
          )}

          {/* Current vs Required */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-100 border-2 border-gray-400 rounded">
              <div className="text-xs text-gray-600 font-semibold mb-1">CURRENT</div>
              <div className="text-lg font-bold text-gray-800">{getCurrentValue()}</div>
            </div>
            <div className="p-3 bg-gray-50 border-2 border-gray-300 rounded">
              <div className="text-xs text-gray-600 font-semibold mb-1">NEEDED</div>
              <div className="text-lg font-bold text-gray-800">{getRequiredValue()}</div>
            </div>
          </div>

          {/* WCAG Info */}
          {issue.wcag_criterion && (
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">WCAG Standard:</div>
              <div className="text-sm font-semibold text-gray-800">
                {issue.wcag_criterion} - {issue.wcag_level || 'AA'}
              </div>
            </div>
          )}

          {/* Additional Explanation */}
          {issue.explanation && issue.explanation !== issue.description && (
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs text-gray-600 mb-1 font-semibold">WHY THIS MATTERS:</div>
              <p className="text-sm text-gray-700">{issue.explanation}</p>
            </div>
          )}

          {/* Who it affects */}
          {(issue.affected_percentage || issue.affects) && (
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs text-gray-600 mb-1 font-semibold">WHO THIS AFFECTS:</div>
              <p className="text-sm text-gray-800 font-semibold">
                {issue.affected_percentage || issue.affects}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Show More Button */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors text-sm"
      >
        {showMore ? 'Show Less' : 'Show Full Details'}
      </button>
    </div>
  );
};

export default SimpleAccessibilityCard;
