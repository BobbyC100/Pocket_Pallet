"use client";
import { useEffect, useState } from "react";
import { listLocalBriefs } from "@/lib/storage";

export default function Dashboard() {
  const [briefs, setBriefs] = useState<{id:string; name:string; stage:string; updatedAt:string;}[]>([]);
  useEffect(() => setBriefs(listLocalBriefs()), []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-banyan-text-default">Your Vision Statements</h1>
          <p className="text-sm text-banyan-text-subtle">Update or create a new one anytime.</p>
        </div>
        <a href="/new" className="btn-banyan-primary">New Vision Statement</a>
      </div>

      {briefs.length === 0 ? (
        <div className="rounded-2xl border border-banyan-border-default bg-banyan-bg-surface p-6 text-center shadow-banyan-mid">
          <p className="text-banyan-text-default">No Vision Statements yet. Create your first one in 10 minutes.</p>
          <a href="/new" className="btn-banyan-primary mt-3 inline-block">Start Building</a>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {briefs.map(b => (
            <div key={b.id} className="rounded-2xl border border-banyan-border-default bg-banyan-bg-surface p-5 shadow-banyan-mid">
              <div className="font-medium text-banyan-text-default">{b.name}</div>
              <div className="mt-1 text-sm text-banyan-text-subtle">
                Stage: {b.stage} • Updated: {new Date(b.updatedAt).toLocaleDateString()}
              </div>
              <div className="mt-4 flex gap-2">
                <a href={`/brief/${b.id}`} className="btn-banyan-ghost" style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>View</a>
                <a href={`/new?prefill=${b.id}`} className="btn-banyan-ghost" style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>Update</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

