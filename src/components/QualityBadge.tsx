'use client';

import { useState } from 'react';

interface QualityBadgeProps {
  score?: number;
  alignment?: number; // The alignment score specifically
  issues?: string[];
  suggestions?: string[];
  strengths?: string[];
}

export default function QualityBadge({ score, alignment, issues = [], suggestions = [], strengths = [] }: QualityBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Don't render if no score is available
  if (score === undefined || score === null) {
    return null;
  }

  const getQualityLevel = () => {
    if (score >= 8) return { level: 'Excellent', color: 'bg-banyan-success', textColor: 'text-banyan-success' };
    if (score >= 6) return { level: 'Good', color: 'bg-banyan-warning', textColor: 'text-banyan-warning' };
    return { level: 'Needs Work', color: 'bg-banyan-error', textColor: 'text-banyan-error' };
  };

  const quality = getQualityLevel();
  const hasLowAlignment = alignment !== undefined && alignment < 7;

  const hasDetails = issues.length > 0 || suggestions.length > 0 || strengths.length > 0;

  return (
    <div className="w-full">
      <div className="inline-flex items-center gap-2 flex-wrap">
        {/* Score Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${quality.color}/20 border border-${quality.color}`}>
          <span className={`text-xs font-semibold ${quality.textColor}`}>
            {score.toFixed(1)}/10
          </span>
          <span className={`text-xs ${quality.textColor}`}>
            {quality.level}
          </span>
        </div>

        {/* Voice Misalignment Badge - PRIORITY FLAG */}
        {hasLowAlignment && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-banyan-error/20 border-2 border-banyan-error animate-pulse">
            <span className="text-xs font-bold text-banyan-error">
              Voice Misalignment
            </span>
          </div>
        )}

        {/* Needs Attention Badge */}
        {score < 6 && !hasLowAlignment && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-banyan-warning/10 border border-banyan-warning">
            <span className="text-xs font-medium text-banyan-warning">
              Needs Attention
            </span>
          </div>
        )}

        {/* Issues Count - Clickable */}
        {issues.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-banyan-error/10 hover:bg-banyan-error/20 transition-colors cursor-pointer"
          >
            <span className="text-xs text-banyan-error">
              {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
            </span>
            <svg 
              className={`w-3 h-3 text-banyan-error transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Suggestions Available - Clickable */}
        {suggestions.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-banyan-primary/10 hover:bg-banyan-primary/20 transition-colors cursor-pointer"
          >
            <span className="text-xs text-banyan-primary">
              {suggestions.length} {suggestions.length === 1 ? 'suggestion' : 'suggestions'}
            </span>
            <svg 
              className={`w-3 h-3 text-banyan-primary transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Show Details Toggle for strengths */}
        {strengths.length > 0 && !issues.length && !suggestions.length && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-banyan-success/10 hover:bg-banyan-success/20 transition-colors cursor-pointer"
          >
            <span className="text-xs text-banyan-success">
              {strengths.length} {strengths.length === 1 ? 'strength' : 'strengths'}
            </span>
            <svg 
              className={`w-3 h-3 text-banyan-success transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && hasDetails && (
        <div className="mt-3 space-y-3 p-4 bg-banyan-bg-base rounded-lg border border-banyan-border-default">
          {/* Issues */}
          {issues.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-banyan-error mb-2">Issues</h4>
              <ul className="space-y-1.5">
                {issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-banyan-text-default flex items-start gap-2">
                    <span className="text-banyan-error mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-banyan-primary mb-2">Suggestions</h4>
              <ul className="space-y-1.5">
                {suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-banyan-text-default flex items-start gap-2">
                    <span className="text-banyan-primary mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-banyan-success mb-2">Strengths</h4>
              <ul className="space-y-1.5">
                {strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-banyan-text-default flex items-start gap-2">
                    <span className="text-banyan-success mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

