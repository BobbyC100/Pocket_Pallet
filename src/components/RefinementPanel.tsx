'use client';

import { useState } from 'react';

interface RefinementPanelProps {
  section: string;
  content: any;
  onRefine: (feedback: string) => Promise<void>;
  quality?: {
    specificity: number;
    actionability: number;
    alignment: number;
  };
  isRefining?: boolean;
}

export default function RefinementPanel({
  section,
  content,
  onRefine,
  quality,
  isRefining = false
}: RefinementPanelProps) {
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleQuickAction = async (action: string) => {
    const feedbackMap: Record<string, string> = {
      more_specific: 'Make this more specific and concrete. Add details from my original responses.',
      more_concise: 'Make this more concise and punchy. Remove fluff.',
      different_angle: 'Try a different angle or perspective on this.',
      add_detail: 'Add more detail and examples.',
      regenerate: 'Completely regenerate this section with fresh thinking.'
    };

    await onRefine(feedbackMap[action]);
    setShowQuickActions(false);
  };

  const handleCustomFeedback = async () => {
    if (!feedback.trim()) return;
    await onRefine(feedback);
    setFeedback('');
    setShowFeedbackBox(false);
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-banyan-success';
    if (score >= 6) return 'text-banyan-warning';
    return 'text-banyan-error';
  };

  return (
    <div className="mt-4 border-t border-banyan-border-default pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-banyan-text-subtle uppercase tracking-wide">
            Refine This Section
          </span>
          
          {quality && (
            <div className="flex gap-2 text-xs">
              <span className={`${getQualityColor(quality.specificity)}`}>
                Specific: {quality.specificity}/10
              </span>
              <span className={`${getQualityColor(quality.actionability)}`}>
                Actionable: {quality.actionability}/10
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="text-sm text-banyan-primary hover:text-banyan-primary-hover transition-colors"
        >
          {showQuickActions ? 'Hide Options' : 'Quick Actions'}
        </button>
      </div>

      {/* Quick Action Buttons */}
      {showQuickActions && (
        <div className="mb-4 space-y-3">
          {/* Primary Refinement Actions */}
          <div>
            <p className="text-xs text-banyan-text-subtle mb-2 font-medium">QUICK REFINEMENTS</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickAction('more_specific')}
                disabled={isRefining}
                className="px-3 py-1.5 text-xs bg-banyan-bg-base hover:bg-banyan-mist text-banyan-text-default rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-banyan-border-default"
              >
                More Specific
              </button>
              <button
                onClick={() => handleQuickAction('more_concise')}
                disabled={isRefining}
                className="px-3 py-1.5 text-xs bg-banyan-bg-base hover:bg-banyan-mist text-banyan-text-default rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-banyan-border-default"
              >
                More Concise
              </button>
              <button
                onClick={() => handleQuickAction('different_angle')}
                disabled={isRefining}
                className="px-3 py-1.5 text-xs bg-banyan-bg-base hover:bg-banyan-mist text-banyan-text-default rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-banyan-border-default"
              >
                Different Angle
              </button>
              <button
                onClick={() => handleQuickAction('add_detail')}
                disabled={isRefining}
                className="px-3 py-1.5 text-xs bg-banyan-bg-base hover:bg-banyan-mist text-banyan-text-default rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-banyan-border-default"
              >
                Add Detail
              </button>
            </div>
          </div>

          {/* Nuclear Option - Visually Separated */}
          <div className="pt-3 border-t border-banyan-border-default">
            <p className="text-xs text-banyan-text-subtle mb-2 font-medium">NUCLEAR OPTION</p>
            <button
              onClick={() => handleQuickAction('regenerate')}
              disabled={isRefining}
              className="px-4 py-2 text-sm bg-banyan-warning/10 hover:bg-banyan-warning/20 text-banyan-warning rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-banyan-warning/40 hover:border-banyan-warning font-medium"
            >
              ⚠️ Regenerate from Scratch
            </button>
            <p className="text-xs text-banyan-text-subtle mt-1 italic">
              Completely rewrites this section. Use only if current version misses the mark.
            </p>
          </div>
        </div>
      )}

      {/* Custom Feedback Input */}
      <div className="space-y-2">
        {!showFeedbackBox ? (
          <button
            onClick={() => setShowFeedbackBox(true)}
            disabled={isRefining}
            className="text-sm text-banyan-text-subtle hover:text-banyan-text-default transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Custom feedback
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell the AI how to improve this section... (e.g., 'Make the vision more focused on construction', 'Add specific timelines to bets')"
              className="w-full px-3 py-2 bg-banyan-bg-base border border-banyan-border-default rounded-lg text-banyan-text-default placeholder:text-banyan-text-subtle focus:border-banyan-primary focus:ring-2 focus:ring-banyan-primary/20 transition-colors"
              rows={3}
              disabled={isRefining}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCustomFeedback}
                disabled={isRefining || !feedback.trim()}
                className="btn-banyan-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefining ? 'Refining...' : 'Refine Section'}
              </button>
              <button
                onClick={() => {
                  setShowFeedbackBox(false);
                  setFeedback('');
                }}
                disabled={isRefining}
                className="btn-banyan-ghost text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {isRefining && (
        <div className="mt-3 flex items-center gap-2 text-sm text-banyan-text-subtle">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-banyan-primary"></div>
          <span>AI is refining this section...</span>
        </div>
      )}
    </div>
  );
}

