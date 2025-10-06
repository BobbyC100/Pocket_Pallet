'use client'

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function ProUpgradeModal({ isOpen, onClose, onUpgrade }: ProUpgradeModalProps) {
  if (!isOpen) return null;

  const proFeatures = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Unlimited Strategic Tools',
      description: "Generate unlimited Vision Frameworks, Founder's Lens, and Strategic Briefs"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Advanced Quality & Alignment Scoring',
      description: 'Get detailed clarity, specificity, and actionability scores for every section'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Collaborative Editing',
      description: 'Share and co-create frameworks with your team in real-time'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      title: 'Persistent Cloud Storage',
      description: 'All your strategic documents saved securely and accessible from anywhere'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      title: 'Priority Support',
      description: 'Get direct access to our team for questions and feature requests'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Early Access to New Features',
      description: 'Be the first to try new strategic tools and research-backed insights'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-banyan-bg-surface rounded-2xl border border-banyan-border-default shadow-banyan-high max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-banyan-text-subtle hover:text-banyan-text-default transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with gradient */}
        <div className="relative p-8 bg-gradient-to-br from-banyan-primary/10 via-banyan-bg-surface to-banyan-bg-surface border-b border-banyan-border-default overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-banyan-primary/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="relative z-10">
            {/* Pro badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-banyan-primary text-banyan-primary-contrast text-xs font-bold rounded-full mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              PRO
            </div>

            <h2 className="text-3xl font-bold text-banyan-text-default mb-3">
              Unlock unlimited strategic tools and advanced clarity scoring
            </h2>
            <p className="text-lg text-banyan-text-subtle">
              Take your strategic planning to the next level with Banyan Pro
            </p>
          </div>
        </div>

        {/* Features grid */}
        <div className="p-8">
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {proFeatures.map((feature, idx) => (
              <div key={idx} className="flex gap-3 p-4 bg-banyan-bg-base rounded-lg border border-banyan-border-default">
                <div className="flex-shrink-0 text-banyan-primary mt-1">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-banyan-text-default mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-banyan-text-subtle">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-banyan-primary/10 to-transparent rounded-xl p-6 border border-banyan-primary/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-banyan-text-default">$29</span>
                  <span className="text-banyan-text-subtle">/month</span>
                </div>
                <p className="text-sm text-banyan-text-subtle mt-1">
                  or $290/year (save 17%)
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-banyan-success">14-day free trial</div>
                <div className="text-xs text-banyan-text-subtle">No credit card required</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                console.log('Starting Pro upgrade...');
                if (onUpgrade) onUpgrade();
                // In production, this would open Stripe checkout or similar
              }}
              className="btn-banyan-primary flex-1"
            >
              Start 14-day free trial
            </button>
            <button
              onClick={onClose}
              className="btn-banyan-ghost flex-1"
            >
              Maybe later
            </button>
          </div>

          {/* Trust signals */}
          <div className="mt-6 pt-6 border-t border-banyan-border-default">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-banyan-text-subtle">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-banyan-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure payment
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-banyan-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-banyan-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Money-back guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

