'use client';

interface QualityBadgeProps {
  score?: number;
  alignment?: number; // The alignment score specifically
  issues?: string[];
  suggestions?: string[];
  strengths?: string[];
}

export default function QualityBadge({ score, alignment, issues = [], suggestions = [], strengths = [] }: QualityBadgeProps) {
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

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      {/* Score Badge */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${quality.color}/20 border border-${quality.color}`}>
        <span className="text-sm">{quality.emoji}</span>
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
          <span className="text-sm">🚨</span>
          <span className="text-xs font-bold text-banyan-error">
            Voice Misalignment
          </span>
        </div>
      )}

      {/* Needs Attention Badge */}
      {score < 6 && !hasLowAlignment && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-banyan-warning/10 border border-banyan-warning">
          <span className="text-xs font-medium text-banyan-warning">
            👀 Needs Attention
          </span>
        </div>
      )}

      {/* Issues Count */}
      {issues.length > 0 && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-banyan-error/10">
          <span className="text-xs text-banyan-error">
            {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
          </span>
        </div>
      )}

      {/* Suggestions Available */}
      {suggestions.length > 0 && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-banyan-primary/10">
          <span className="text-xs text-banyan-primary">
            {suggestions.length} {suggestions.length === 1 ? 'suggestion' : 'suggestions'}
          </span>
        </div>
      )}
    </div>
  );
}

