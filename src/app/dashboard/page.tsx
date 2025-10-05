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
          <h1 className="text-xl font-semibold">Your Briefs</h1>
          <p className="text-sm text-zinc-600">Update or create a new one anytime.</p>
        </div>
        <a href="/new" className="btn">New Brief</a>
      </div>

      {briefs.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center">
          <p>No briefs yet. Create your first one in 10 minutes.</p>
          <a href="/new" className="btn mt-3 inline-block">Create Your Brief</a>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {briefs.map(b => (
            <div key={b.id} className="rounded-2xl border p-5">
              <div className="font-medium">{b.name}</div>
              <div className="mt-1 text-sm text-zinc-600">
                Stage: {b.stage} • Updated: {new Date(b.updatedAt).toLocaleDateString()}
              </div>
              <div className="mt-4 flex gap-2">
                <a href={`/brief/${b.id}`} className="btn btn--ghost" style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>View</a>
                <a href={`/new?prefill=${b.id}`} className="btn btn--ghost" style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>Update</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

