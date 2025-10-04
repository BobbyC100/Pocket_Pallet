'use client';

import { VcSummary } from '@/lib/vc-summary-schema';

interface VcSummaryDisplayProps {
  summary: VcSummary;
}

export default function VcSummaryDisplay({ summary }: VcSummaryDisplayProps) {
  return (
    <div className="space-y-6">
      <Section title="What & Why Now">{summary.whatWhyNow}</Section>
      
      <Section title="Market">{summary.market}</Section>
      
      <Bullets title="Solution & Differentiation" items={summary.solutionDiff} />
      
      <Metrics title="Traction" items={summary.traction} />
      
      <Section title="Business Model">{summary.businessModel}</Section>
      
      <Section title="Go-to-Market">{summary.gtm}</Section>
      
      <Section title="Team">{summary.team}</Section>
      
      <Bullets 
        title={`Ask & Use of Funds — ${summary.ask.amount}`} 
        items={summary.ask.useOfFunds} 
      />
      
      <Pairs title="Risks & Mitigations" items={summary.risks} />
      
      <Bullets title="Near-Term KPIs / 6-Month Milestones" items={summary.kpis6mo} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-2">
        {title}
      </h3>
      <p className="text-gray-700 leading-relaxed">{children}</p>
    </section>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-2">
        {title}
      </h3>
      <ul className="list-disc pl-5 space-y-1 text-gray-700">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function Metrics({ title, items }: { 
  title: string; 
  items: { metric: string; value: string; timeframe: string }[] 
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-2">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((m, i) => (
          <div key={i} className="grid grid-cols-3 gap-3 text-sm">
            <span className="font-medium text-gray-900">{m.metric}</span>
            <span className="text-gray-700">{m.value}</span>
            <span className="text-gray-500">{m.timeframe}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pairs({ title, items }: { 
  title: string; 
  items: { risk: string; mitigation: string }[] 
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-2">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((p, i) => (
          <div key={i} className="pl-4 border-l-2 border-yellow-400">
            <div className="text-sm font-medium text-gray-900 mb-1">Risk:</div>
            <div className="text-sm text-gray-700 mb-2">{p.risk}</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Mitigation:</div>
            <div className="text-sm text-gray-700">{p.mitigation}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

