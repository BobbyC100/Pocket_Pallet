import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Banyan — Create Your Vision',
  description: 'Turn your vision into investor-ready clarity in minutes. Build strategic frameworks that align your team and stakeholders.',
};

/**
 * Homepage: Redirect directly to wizard for immediate action
 * Old marketing page preserved below for future reference
 */
export default function HomePage() {
  redirect('/new');
}

/* ============================================================================
 * MARKETING PAGE (Preserved for Reference)
 * Uncomment this and remove redirect() above to restore marketing homepage
 * ============================================================================

export default function Landing() {
  return (
    <div className="min-h-screen bg-banyan-bg-base text-banyan-text-default">
      <main className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance text-gray-900 dark:text-white">
            From first draft to focused strategy
          </h1>

          <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-balance">
            Build plans that align your team and investors.
          </p>

          <div className="mt-8 flex justify-center">
            <a href="/new" className="btn-banyan-primary">
              Start Building
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-7">
          <div className="rounded-lg bg-banyan-bg-surface pt-8 px-6 pb-6 text-center border border-banyan-border-default flex flex-col items-center justify-center min-h-[240px]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-banyan-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-banyan-primary-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-banyan-text-default">Polished Drafts</h3>
            <p className="mt-2 text-sm text-banyan-text-subtle text-balance">
              Refine rough notes into clear, structured documents that drive action.
            </p>
          </div>

          <div className="rounded-lg bg-banyan-bg-surface pt-8 px-6 pb-6 text-center border border-banyan-border-default flex flex-col items-center justify-center min-h-[240px]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-banyan-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-banyan-primary-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-banyan-text-default">Actionable Docs</h3>
            <p className="mt-2 text-sm text-banyan-text-subtle text-balance">
              Turn your ideas into polished documents you can put to work right away.
            </p>
          </div>

          <div className="rounded-lg bg-banyan-bg-surface pt-8 px-6 pb-6 text-center border border-banyan-border-default flex flex-col items-center justify-center min-h-[240px]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-banyan-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-banyan-primary-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-banyan-text-default">Strategic Outputs</h3>
            <p className="mt-2 text-sm text-banyan-text-subtle text-balance">
              Generate documents designed to help you communicate, plan, and move forward.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

============================================================================ */
