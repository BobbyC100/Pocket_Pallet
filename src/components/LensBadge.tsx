'use client';

import { useState } from 'react';

interface LensBadgeProps {
  clarity?: number;
  alignment?: number;
  actionability?: number;
  overall?: number;
  badge?: 'gold' | 'silver' | 'bronze';
  message?: string;
  feedback?: string | {
    clarity?: string;
    alignment?: string;
    actionability?: string;
  };
}

export default function LensBadge({
  clarity,
  alignment,
  actionability,
  overall,
  badge,
  message,
  feedback
}: LensBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no scores
  if (!clarity && !alignment && !actionability && !overall) {
    return null;
  }

  const getBadgeColor = () => {
    if (badge === 'gold') return { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-500' };
    if (badge === 'silver') return { bg: 'bg-gray-400/20', border: 'border-gray-400', text: 'text-gray-400' };
    return { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-500' };
  };

  const colors = getBadgeColor();

  return (
    <div className="w-full">
      <div className="inline-flex items-center gap-2 flex-wrap">
        {/* Overall Badge */}
        {overall && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colors.bg} border ${colors.border} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <span className={`text-xs font-semibold ${colors.text}`}>
              Lens Score {overall.toFixed(1)} • {badge?.toUpperCase()}
            </span>
            <svg 
              className={`w-3 h-3 ${colors.text} transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Quick Message */}
        {message && !isExpanded && (
          <span className="text-xs text-banyan-text-subtle">
            {message}
          </span>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 space-y-3 p-4 bg-banyan-bg-base rounded-lg border border-banyan-border-default">
          {/* Individual Scores */}
          <div className="grid grid-cols-3 gap-3">
            {/* Clarity */}
            {clarity !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold text-banyan-text-default">{clarity.toFixed(1)}</div>
                <div className="text-xs text-banyan-text-subtle uppercase tracking-wide mt-1">Clarity</div>
                {typeof feedback === 'object' && feedback?.clarity && (
                  <div className="text-xs text-banyan-text-default mt-2">{String(feedback.clarity)}</div>
                )}
              </div>
            )}

            {/* Alignment */}
            {alignment !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold text-banyan-text-default">{alignment.toFixed(1)}</div>
                <div className="text-xs text-banyan-text-subtle uppercase tracking-wide mt-1">Alignment</div>
                {typeof feedback === 'object' && feedback?.alignment && (
                  <div className="text-xs text-banyan-text-default mt-2">{String(feedback.alignment)}</div>
                )}
              </div>
            )}

            {/* Actionability */}
            {actionability !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold text-banyan-text-default">{actionability.toFixed(1)}</div>
                <div className="text-xs text-banyan-text-subtle uppercase tracking-wide mt-1">Actionability</div>
                {typeof feedback === 'object' && feedback?.actionability && (
                  <div className="text-xs text-banyan-text-default mt-2">{String(feedback.actionability)}</div>
                )}
              </div>
            )}
          </div>
          
          {/* General Feedback (if feedback is a string) */}
          {typeof feedback === 'string' && feedback && (
            <div className="pt-3 border-t border-banyan-border-default">
              <p className="text-sm text-banyan-text-default">{feedback}</p>
            </div>
          )}

          {/* Overall Message */}
          {message && (
            <div className="pt-3 border-t border-banyan-border-default">
              <p className="text-sm text-banyan-text-default">{message}</p>
            </div>
          )}

          {/* Base Lens Explanation */}
          <div className="pt-3 border-t border-banyan-border-default">
            <p className="text-xs text-banyan-text-subtle">
              <strong>Base Lens Scoring:</strong> Every document is scored on clarity (plain language), 
              alignment (consistency with your vision), and actionability (concrete next steps). 
              These scores adapt as we learn your style.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

