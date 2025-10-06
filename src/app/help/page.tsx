import Link from 'next/link';

/**
 * Help / Knowledge center page
 * Resources and support for Banyan users
 */
export default function HelpPage() {
  return (
    <div className="min-h-screen bg-banyan-bg-base">
      <main className="mx-auto max-w-4xl px-6 py-24">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-banyan-text-default sm:text-5xl">
            How can we help?
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-banyan-text-subtle">
            Find answers, guides, and resources to make the most of Banyan.
          </p>
        </div>

        {/* Quick links */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <HelpCard
            title="Getting Started"
            description="New to Banyan? Learn the basics and create your first brief."
            href="/demo"
          />
          <HelpCard
            title="Best Practices"
            description="Tips and strategies for creating effective briefs and strategic documents."
            href="/showcase"
          />
          <HelpCard
            title="Pricing & Plans"
            description="Learn about our pricing tiers and what's included in each plan."
            href="/pricing"
          />
          <HelpCard
            title="Account Settings"
            description="Manage your profile, preferences, and security settings."
            href="/settings"
          />
        </div>

        {/* FAQ section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-banyan-text-default mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQItem
              question="How long does it take to create a brief?"
              answer="Most users complete their first brief in 10-15 minutes. The wizard guides you through each step, making it quick and straightforward."
            />
            <FAQItem
              question="Can I edit my brief after creating it?"
              answer="Yes! You can always return to your briefs, make changes, and regenerate outputs. Your work is automatically saved."
            />
            <FAQItem
              question="What formats can I export to?"
              answer="Currently, you can export your briefs as PDF documents. Additional export formats are coming soon."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Absolutely. We use industry-standard encryption and security practices to protect your information. Your briefs and documents are private to you."
            />
          </div>
        </div>

        {/* Contact section */}
        <div className="mt-20 rounded-2xl bg-banyan-bg-surface border border-banyan-border-default p-8 text-center shadow-banyan-mid">
          <h3 className="text-xl font-semibold text-banyan-text-default">Still have questions?</h3>
          <p className="mt-2 text-sm text-banyan-text-subtle">
            We're here to help. Reach out to our support team.
          </p>
          <div className="mt-6">
            <a
              href="mailto:support@banyan.com"
              className="btn-banyan-primary"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function HelpCard({ 
  title, 
  description, 
  href 
}: { 
  title: string; 
  description: string; 
  href: string 
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-banyan-border-default bg-banyan-bg-surface p-6 hover:shadow-banyan-mid transition-all duration-150 ease-in-out"
    >
      <h3 className="text-lg font-semibold text-banyan-text-default">{title}</h3>
      <p className="mt-2 text-sm text-banyan-text-subtle">{description}</p>
      <div className="mt-4 text-sm text-banyan-primary flex items-center gap-1">
        Learn more
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </div>
    </Link>
  );
}

function FAQItem({ 
  question, 
  answer 
}: { 
  question: string; 
  answer: string 
}) {
  return (
    <div className="border-b border-banyan-border-default pb-6">
      <h4 className="text-base font-semibold text-banyan-text-default">{question}</h4>
      <p className="mt-2 text-sm text-banyan-text-subtle">{answer}</p>
    </div>
  );
}

