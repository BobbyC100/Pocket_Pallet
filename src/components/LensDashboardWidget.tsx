'use client';

interface LensDashboardWidgetProps {
  visionLensScores?: any;
  vcLensScores?: any;
}

export default function LensDashboardWidget({ visionLensScores, vcLensScores }: LensDashboardWidgetProps) {
  // Don't render if no scores
  if (!visionLensScores && !vcLensScores) {
    return null;
  }

  const getAverageScore = () => {
    const scores: number[] = [];
    
    if (visionLensScores?.scores?.overall) {
      scores.push(visionLensScores.scores.overall);
    }
    if (vcLensScores?.scores?.overall) {
      scores.push(vcLensScores.scores.overall);
    }
    
    if (scores.length === 0) return null;
    
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  const getBadgeColor = (overall?: number) => {
    if (!overall) return { bg: 'bg-gray-400/20', border: 'border-gray-400', text: 'text-gray-400' };
    if (overall >= 8) return { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-500' };
    if (overall >= 7) return { bg: 'bg-gray-400/20', border: 'border-gray-400', text: 'text-gray-400' };
    return { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-500' };
  };

  const avgScore = getAverageScore();
  const colors = getBadgeColor(avgScore ? parseFloat(avgScore) : undefined);

  return (
    <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default pt-3 px-5 pb-5 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-banyan-text-default mb-1">Founder's Lens</h3>
          <p className="text-sm text-banyan-text-subtle mb-4">
            Base Lens scores for your strategic documents
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average Score */}
            {avgScore && (
              <div>
                <div className="text-xs text-banyan-text-subtle uppercase tracking-wide mb-1">Average Score</div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colors.bg} border ${colors.border}`}>
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {avgScore} / 10
                  </span>
                </div>
              </div>
            )}

            {/* Vision Framework */}
            {visionLensScores && (
              <div>
                <div className="text-xs text-banyan-text-subtle uppercase tracking-wide mb-1">Vision Framework</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-banyan-text-subtle">Clarity</span>
                    <span className="text-banyan-text-default font-medium">{visionLensScores.scores?.clarity?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-banyan-text-subtle">Alignment</span>
                    <span className="text-banyan-text-default font-medium">{visionLensScores.scores?.alignment?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-banyan-text-subtle">Actionability</span>
                    <span className="text-banyan-text-default font-medium">{visionLensScores.scores?.actionability?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* VC Summary */}
            {vcLensScores && (
              <div>
                <div className="text-xs text-banyan-text-subtle uppercase tracking-wide mb-1">VC Summary</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-banyan-text-subtle">Clarity</span>
                    <span className="text-banyan-text-default font-medium">{vcLensScores.scores?.clarity?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-banyan-text-subtle">Alignment</span>
                    <span className="text-banyan-text-default font-medium">{vcLensScores.scores?.alignment?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-banyan-text-subtle">Actionability</span>
                    <span className="text-banyan-text-default font-medium">{vcLensScores.scores?.actionability?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 pt-4 border-t border-banyan-border-default">
        <p className="text-xs text-banyan-text-subtle">
          <strong>Base Lens:</strong> Every document starts with clarity (plain language), alignment (consistency with your vision), 
          and actionability (concrete next steps). These scores will personalize as we learn your style.
        </p>
      </div>
    </div>
  );
}

