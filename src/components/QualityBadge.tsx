'use client';

interface QualityBadgeProps {
  score: number;
  issues?: string[];
  suggestions?: string[];
  strengths?: string[];
}

export default function QualityBadge({ score, issues = [], suggestions = [], strengths = [] }: QualityBadgeProps) {
  const getQualityLevel = () => {
    if (score >= 8) return { level: 'Excellent', color: 'bg-banyan-success', textColor: 'text-banyan-success', emoji: '✨' };
    if (score >= 6) return { level: 'Good', color: 'bg-banyan-warning', textColor: 'text-banyan-warning', emoji: '⚠️' };
    return { level: 'Needs Work', color: 'bg-banyan-error', textColor: 'text-banyan-error', emoji: '🔴' };
  };

  const quality = getQualityLevel();

  return (
    <div className="inline-flex items-center gap-2">
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

      {/* Needs Attention Badge */}
      {score < 6 && (
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
            💡 {suggestions.length} {suggestions.length === 1 ? 'suggestion' : 'suggestions'}
          </span>
        </div>
      )}
    </div>
  );
}

