'use client';

type ToolItem = {
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  href?: string;
  commands?: string[];
};

type ToolCategory = {
  category: string;
  items: ToolItem[];
};

export default function DevToolsPage() {
  const tools: ToolCategory[] = [
    {
      category: 'Vision Framework Testing',
      items: [
        {
          title: 'Scoring Test Tool',
          description: 'Test vision framework scoring directly without generating full frameworks. 93% cost savings.',
          href: '/test-scoring.html',
          badge: 'New',
          badgeColor: 'bg-green-100 text-green-800'
        }
      ]
    },
    {
      category: 'Production Testing',
      items: [
        {
          title: 'Auto-Test Suite',
          description: 'Automated testing suite for end-to-end validation',
          href: '/auto-test.html'
        },
        {
          title: 'YardBird Injector',
          description: 'Session storage testing with sample construction startup data',
          href: '/yardbird-injector.html'
        },
        {
          title: 'Debug Vision Framework',
          description: 'Comprehensive debugging tools for vision framework generation',
          href: '/debug-vision-framework.html'
        },
        {
          title: 'Session Storage Test',
          description: 'Validation testing for session storage persistence',
          href: '/test-session-storage.html'
        }
      ]
    },
    {
      category: 'Application Pages',
      items: [
        {
          title: 'Landing Page',
          description: 'Main landing page with product overview',
          href: '/'
        },
        {
          title: 'Create Brief',
          description: 'Six-step wizard to generate investor briefs',
          href: '/new'
        },
        {
          title: 'Vision Framework V2',
          description: 'New vision framework editor with refinement',
          href: '/vision-framework-v2',
          badge: 'V2',
          badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
          title: 'Dashboard',
          description: 'View and manage your saved briefs',
          href: '/dashboard'
        },
        {
          title: 'Design System Demo',
          description: 'Component library and design token showcase',
          href: '/design-system-demo'
        }
      ]
    },
    {
      category: 'Command-Line Tools',
      items: [
        {
          title: '⚡ Quick Scoring Tests',
          description: 'Run from terminal for ultra-fast iteration',
          commands: [
            'npm run test:scoring       # Test high-quality framework',
            'npm run test:scoring:poor  # Test low-quality framework',
            'npm run test:scoring:mixed # Test mixed-quality framework'
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Developer Tools
          </h1>
          <p className="text-lg text-gray-600">
            Testing utilities, debug tools, and quick access to all application pages
          </p>
        </div>

        {/* Tool Categories */}
        <div className="space-y-10">
          {tools.map((category) => (
            <div key={category.category}>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {category.category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((tool) => (
                  <div
                    key={tool.title}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tool.title}
                      </h3>
                      {'badge' in tool && tool.badge && (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${tool.badgeColor || 'bg-gray-100 text-gray-800'}`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {tool.description}
                    </p>
                    
                    {'href' in tool && tool.href ? (
                      <a
                        href={tool.href}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Open Tool
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    ) : 'commands' in tool && tool.commands ? (
                      <div className="bg-gray-900 rounded p-3 mt-2">
                        {tool.commands.map((cmd: string, idx: number) => (
                          <div key={idx} className="font-mono text-xs text-green-400 mb-1 last:mb-0">
                            {cmd}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Quick Tips</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold mb-2">93%</div>
              <div className="text-blue-100">Cost savings with scoring test tool vs full generation</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">10-30s</div>
              <div className="text-blue-100">Average scoring test time (vs 5-10 min for full flow)</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$0.05</div>
              <div className="text-blue-100">Cost per scoring test (vs $0.75 for full generation)</div>
            </div>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📚 Documentation</h3>
          <ul className="space-y-2">
            <li>
              <a href="https://github.com/BobbyC100/Banyan/blob/main/SCORING_TEST_GUIDE.md" className="text-blue-600 hover:text-blue-700 text-sm">
                → Scoring Test Guide - Complete usage instructions
              </a>
            </li>
            <li>
              <a href="https://github.com/BobbyC100/Banyan/blob/main/README.md" className="text-blue-600 hover:text-blue-700 text-sm">
                → README - Full project documentation
              </a>
            </li>
            <li>
              <a href="https://github.com/BobbyC100/Banyan/blob/main/TESTING_GUIDE.md" className="text-blue-600 hover:text-blue-700 text-sm">
                → Testing Guide - QA and validation workflows
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

