'use client';

import { VcSummary } from '@/lib/vc-summary-schema';
import QualityBadge from './QualityBadge';

interface VcSummaryDisplayProps {
  summary: VcSummary;
  scores?: Record<string, any>;
}

export default function VcSummaryDisplay({ summary, scores }: VcSummaryDisplayProps) {
  return (
    <div className="space-y-6">
      <Section 
        title="What & Why Now" 
        score={scores?.whatWhyNow}
      >
        {summary.whatWhyNow}
      </Section>
      
      <Section 
        title="Market" 
        score={scores?.market}
      >
        {summary.market}
      </Section>
      
      <Bullets 
        title="Solution & Differentiation" 
        items={summary.solutionDiff}
        score={scores?.solutionDiff}
      />
      
      <Metrics 
        title="Traction" 
        items={summary.traction}
        score={scores?.traction}
      />
      
      <Section 
        title="Business Model" 
        score={scores?.businessModel}
      >
        {summary.businessModel}
      </Section>
      
      <Section 
        title="Go-to-Market" 
        score={scores?.gtm}
      >
        {summary.gtm}
      </Section>
      
      <Section 
        title="Team" 
        score={scores?.team}
      >
        {summary.team}
      </Section>
      
      <Bullets 
        title={`Ask & Use of Funds — ${summary.ask.amount}`} 
        items={summary.ask.useOfFunds}
        score={scores?.ask}
      />
      
      <Pairs 
        title="Risks & Mitigations" 
        items={summary.risks}
        score={scores?.risks}
      />
      
      <Bullets 
        title="Near-Term KPIs / 6-Month Milestones" 
        items={summary.kpis6mo}
      />
    </div>
  );
}

function Section({ title, children, score }: { title: string; children: React.ReactNode; score?: any }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold tracking-wide text-banyan-text-subtle uppercase">
          {title}
        </h3>
        {score && (
          <QualityBadge 
            score={score.overallScore}
            issues={score.issues}
            suggestions={score.suggestions}
            strengths={score.strengths}
          />
        )}
      </div>
      <p className="text-banyan-text-default leading-relaxed">{children}</p>
    </section>
  );
}

function Bullets({ title, items, score }: { title: string; items: string[]; score?: any }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold tracking-wide text-banyan-text-subtle uppercase">
          {title}
        </h3>
        {score && (
          <QualityBadge 
            score={score.overallScore}
            issues={score.issues}
            suggestions={score.suggestions}
            strengths={score.strengths}
          />
        )}
      </div>
      <ul className="list-disc pl-5 space-y-1 text-banyan-text-default">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function Metrics({ title, items, score }: { 
  title: string; 
  items: { metric: string; value: string; timeframe: string }[];
  score?: any;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold tracking-wide text-banyan-text-subtle uppercase">
          {title}
        </h3>
        {score && (
          <QualityBadge 
            score={score.overallScore}
            issues={score.issues}
            suggestions={score.suggestions}
            strengths={score.strengths}
          />
        )}
      </div>
      <div className="space-y-2">
        {items.map((m, i) => (
          <div key={i} className="grid grid-cols-3 gap-3 text-sm">
            <span className="font-medium text-banyan-text-default">{m.metric}</span>
            <span className="text-banyan-text-default">{m.value}</span>
            <span className="text-banyan-text-subtle">{m.timeframe}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pairs({ title, items, score }: { 
  title: string; 
  items: { risk: string; mitigation: string }[];
  score?: any;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold tracking-wide text-banyan-text-subtle uppercase">
          {title}
        </h3>
        {score && (
          <QualityBadge 
            score={score.overallScore}
            issues={score.issues}
            suggestions={score.suggestions}
            strengths={score.strengths}
          />
        )}
      </div>
      <div className="space-y-3">
        {items.map((p, i) => (
          <div key={i} className="pl-4 border-l-2 border-banyan-warning">
            <div className="text-sm font-medium text-banyan-text-default mb-1">Risk:</div>
            <div className="text-sm text-banyan-text-default mb-2">{p.risk}</div>
            <div className="text-sm font-medium text-banyan-text-default mb-1">Mitigation:</div>
            <div className="text-sm text-banyan-text-default">{p.mitigation}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

