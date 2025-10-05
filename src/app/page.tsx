export default function Landing() {
  return (
    <div className="min-h-screen bg-banyan-bg-base text-banyan-text-default">
      <main className="mx-auto max-w-4xl px-6 py-24">
        <div className="text-center py-[70px]">
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-banyan-text-default">
            From first draft to focused strategy
          </h1>

          {/* Subhead */}
          <p className="mt-4 max-w-2xl mx-auto text-lg text-banyan-text-subtle">
            From insight to action. Build plans that align your team and investors.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex justify-center">
            <a
              href="/new"
              className="btn-banyan-primary"
            >
              Create Your Brief
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3 mt-7">
          {/* Polished Drafts */}
          <div className="rounded-lg bg-banyan-bg-surface p-6 text-center border border-banyan-border-default">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-banyan-primary">
              {/* Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-banyan-primary-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-banyan-text-default">Polished Drafts</h3>
            <p className="mt-2 text-sm text-banyan-text-subtle">
              Refine rough notes into clear, structured documents that drive action.
            </p>
          </div>

          {/* Actionable Docs */}
          <div className="rounded-lg bg-banyan-bg-surface p-6 text-center border border-banyan-border-default">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-banyan-primary">
              {/* Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-banyan-primary-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-banyan-text-default">Actionable Docs</h3>
            <p className="mt-2 text-sm text-banyan-text-subtle">
              Turn your ideas into polished documents you can put to work right away.
            </p>
          </div>

          {/* Strategic Outputs */}
          <div className="rounded-lg bg-banyan-bg-surface p-6 text-center border border-banyan-border-default">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-banyan-primary">
              {/* Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-banyan-primary-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-banyan-text-default">Strategic Outputs</h3>
            <p className="mt-2 text-sm text-banyan-text-subtle">
              Generate documents designed to help you communicate, plan, and move forward.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
