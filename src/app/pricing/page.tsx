import Link from 'next/link';

/**
 * Pricing page - Plans and cost information
 */
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-banyan-bg-base">
      <main className="mx-auto max-w-5xl px-6 py-24">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-banyan-text-default sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-banyan-text-subtle">
            Choose the plan that works for you. Start free, upgrade when you need more.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Free plan */}
          <div className="rounded-2xl border border-banyan-border-default p-8 bg-banyan-bg-surface shadow-banyan-mid">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-banyan-text-default">Free</h3>
              <span className="text-sm text-banyan-text-subtle">Forever</span>
            </div>
            <p className="mt-2 text-sm text-banyan-text-subtle">
              Perfect for trying out Banyan and creating your first briefs.
            </p>
            
            <div className="mt-6">
              <Link
                href="/signup"
                className="btn-banyan-ghost block w-full text-center"
              >
                Get started
              </Link>
            </div>

            <ul className="mt-8 space-y-3">
              <Feature>3 briefs per month</Feature>
              <Feature>Basic templates</Feature>
              <Feature>Export to PDF</Feature>
              <Feature>Community support</Feature>
            </ul>
          </div>

          {/* Pro plan */}
          <div className="rounded-2xl border-2 border-banyan-primary p-8 bg-banyan-bg-surface shadow-banyan-mid relative">
            <div className="absolute -top-4 right-8">
              <span className="inline-flex items-center rounded-full bg-banyan-primary px-3 py-1 text-xs font-medium text-banyan-primary-contrast">
                Most popular
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-banyan-text-default">Pro</h3>
              <span className="text-sm text-banyan-text-subtle">Coming soon</span>
            </div>
            <p className="mt-2 text-sm text-banyan-text-subtle">
              For teams building strategic documents regularly.
            </p>
            
            <div className="mt-6">
              <button
                disabled
                className="btn-banyan-primary block w-full text-center opacity-50 cursor-not-allowed"
              >
                Coming soon
              </button>
            </div>

            <ul className="mt-8 space-y-3">
              <Feature>Unlimited briefs</Feature>
              <Feature>Advanced templates</Feature>
              <Feature>Priority support</Feature>
              <Feature>Team collaboration</Feature>
              <Feature>Custom branding</Feature>
            </ul>
          </div>
        </div>

        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-banyan-text-subtle">
            Have questions?{' '}
            <Link href="/help" className="text-banyan-primary underline hover:no-underline">
              Visit our help center
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <svg 
        className="h-5 w-5 text-banyan-primary flex-shrink-0" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 13l4 4L19 7" 
        />
      </svg>
      <span className="text-sm text-banyan-text-default">{children}</span>
    </li>
  );
}

