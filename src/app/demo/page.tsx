import Link from 'next/link';

/**
 * Demo page - temporary placeholder
 * Will be replaced with an embedded video demo in the future
 */
export default function DemoPage() {
  return (
    <div className="min-h-screen bg-banyan-bg-base">
      <main className="mx-auto max-w-4xl px-6 py-24">
        <div className="text-center">
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-banyan-text-default sm:text-5xl">
            See Banyan in Action
          </h1>

          {/* Subhead */}
          <p className="mt-4 max-w-2xl mx-auto text-lg text-banyan-text-subtle">
            Watch how Banyan transforms your rough ideas into polished, strategic documents.
          </p>

          {/* Placeholder for video */}
          <div className="mt-12 aspect-video rounded-2xl bg-banyan-bg-surface border border-banyan-border-default flex items-center justify-center">
            <div className="text-center px-6">
              <svg 
                className="mx-auto h-12 w-12 text-banyan-text-subtle" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="mt-4 text-sm text-banyan-text-subtle">Video demo coming soon</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex gap-4 justify-center">
            <Link
              href="/signup"
              className="btn-banyan-primary"
            >
              Get started for free
            </Link>
            <Link
              href="/showcase"
              className="btn-banyan-ghost"
            >
              View examples
            </Link>
          </div>
        </div>

        {/* Features overview */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-banyan-text-default">Fast Setup</h3>
            <p className="mt-2 text-sm text-banyan-text-subtle">
              Answer a few questions and get a polished brief in minutes.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-banyan-text-default">Strategic Output</h3>
            <p className="mt-2 text-sm text-banyan-text-subtle">
              Get documents designed to align teams and communicate vision.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-banyan-text-default">Iterate Easily</h3>
            <p className="mt-2 text-sm text-banyan-text-subtle">
              Refine and update your documents as your strategy evolves.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

