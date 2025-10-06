'use client'

interface StrategicToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: 'framework' | 'lens' | 'brief') => void;
}

export default function StrategicToolsModal({ isOpen, onClose, onSelectTool }: StrategicToolsModalProps) {
  if (!isOpen) return null;

  const tools = [
    {
      id: 'framework' as const,
      title: 'Vision Framework',
      description: 'Comprehensive strategic foundation with vision, strategy, culture, and metrics.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      features: [
        'Complete 7-section framework',
        'Research-backed insights',
        'Quality scoring',
        'Executive summary'
      ],
      recommended: true
    },
    {
      id: 'lens' as const,
      title: "Founder's Lens",
      description: 'Focused leadership view that distills your vision into actionable priorities.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      features: [
        'Leadership priorities',
        'Decision-making framework',
        'Team alignment focus',
        'Quarterly objectives'
      ],
      recommended: false
    },
    {
      id: 'brief' as const,
      title: 'Strategic Brief',
      description: 'Investor-ready summary that communicates your vision and traction clearly.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      features: [
        'One-page format',
        'Investor-optimized',
        'Key metrics highlighted',
        'PDF-ready export'
      ],
      recommended: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-banyan-bg-surface rounded-2xl border border-banyan-border-default shadow-banyan-high max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

        {/* Header */}
        <div className="p-8 border-b border-banyan-border-default">
          <h2 className="text-3xl font-bold text-banyan-text-default mb-3">
            Choose your strategic tool
          </h2>
          <p className="text-banyan-text-subtle text-lg">
            Each tool is generated from your Vision Statement. Select the one that fits your current needs.
          </p>
        </div>

        {/* Tool Cards */}
        <div className="p-8 grid gap-6 md:grid-cols-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                onSelectTool(tool.id);
                onClose();
              }}
              className="relative text-left bg-banyan-bg-base border-2 border-banyan-border-default rounded-xl p-6 hover:border-banyan-primary hover:shadow-banyan-mid transition-all duration-200 group"
            >
              {/* Recommended badge */}
              {tool.recommended && (
                <div className="absolute -top-3 -right-3 bg-banyan-primary text-banyan-primary-contrast text-xs font-bold px-3 py-1 rounded-full shadow-banyan-mid">
                  Recommended
                </div>
              )}

              {/* Icon */}
              <div className="mb-4 text-banyan-primary group-hover:scale-110 transition-transform duration-200">
                {tool.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-banyan-text-default mb-2">
                {tool.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-banyan-text-subtle mb-4">
                {tool.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {tool.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-banyan-text-subtle">
                    <svg className="w-4 h-4 text-banyan-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA arrow */}
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-banyan-primary group-hover:gap-3 transition-all duration-200">
                Generate
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-banyan-bg-base border-t border-banyan-border-default rounded-b-2xl">
          <p className="text-sm text-banyan-text-subtle text-center">
            💡 <strong>Tip:</strong> Start with Vision Framework for a complete strategic foundation, then generate additional tools as needed.
          </p>
        </div>
      </div>
    </div>
  );
}

