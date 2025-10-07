/**
 * Claim Validation Component
 * Validates framework claims against research corpus
 */

'use client';

import { useState } from 'react';
import type { ReferencePassage } from '@/app/api/references/route';
import type { QAClaimCheck } from '@/app/api/qa/run-claims/route';

export type QAClaim = {
  id: string;
  text: string;
  section: 'vision' | 'strategy' | 'risk' | 'metrics' | 'other';
};

type Props = {
  claims: QAClaim[];
  topK?: number;
  minSimilarity?: number;
  passThreshold?: number;
};

export function ClaimValidation({ 
  claims, 
  topK = 5,
  minSimilarity = 0.25,
  passThreshold = 0.25 
}: Props) {
  const [checks, setChecks] = useState<Record<string, QAClaimCheck>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runValidation() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/qa/run-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          claims,
          topK,
          minSimilarity,
          passThreshold 
        }),
      });

      if (!response.ok) {
        throw new Error(`QA validation failed: ${response.status}`);
      }

      const data = await response.json();
      const checksArray = data.checks as QAClaimCheck[];

      // Convert to map for easy lookup
      const checksMap: Record<string, QAClaimCheck> = {};
      checksArray.forEach((check) => {
        checksMap[check.claimId] = check;
      });

      setChecks(checksMap);
    } catch (err: any) {
      console.error('[ClaimValidation] Error:', err);
      setError(err.message ?? 'Failed to run claim validation');
    } finally {
      setLoading(false);
    }
  }

  // Empty state
  if (claims.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-banyan-text-subtle mb-4">
            No claims to validate. Complete your framework first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-banyan-border-default">
        <div>
          <h3 className="text-lg font-semibold text-banyan-text-default">Claim Validation</h3>
          <p className="text-sm text-banyan-text-subtle mt-1">
            Validate {claims.length} claim{claims.length !== 1 ? 's' : ''} against research corpus
          </p>
        </div>
        <button
          onClick={runValidation}
          disabled={loading}
          className="btn-banyan-primary text-sm"
          data-testid="run-claim-validation"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Checking...
            </span>
          ) : (
            'Find Supporting References'
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Claims list */}
      <ul className="space-y-4">
        {claims.map((claim) => {
          const check = checks[claim.id];
          return (
            <li
              key={claim.id}
              className="rounded-xl border border-banyan-border-default bg-banyan-bg-surface p-5"
            >
              {/* Claim header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-banyan-text-default">{claim.text}</p>
                  <p className="text-xs text-banyan-text-subtle mt-1">
                    Section: {claim.section}
                  </p>
                </div>
                {check && (
                  <span
                    className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-medium ${
                      check.pass
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {check.pass ? '✓ Evidence found' : '⚠ Needs support'}
                  </span>
                )}
              </div>

              {/* Issues */}
              {check?.issues && check.issues.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-amber-700 list-disc pl-5">
                  {check.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              )}

              {/* References */}
              {check?.references && check.references.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-banyan-text-subtle uppercase tracking-wide mb-3">
                    Supporting References
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {check.references.map((ref) => (
                      <article
                        key={ref.id}
                        className="rounded-lg border border-banyan-border-default bg-banyan-bg-base p-3"
                      >
                        {/* Reference header */}
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-sm font-semibold text-banyan-text-default line-clamp-1">
                            {ref.paperTitle}
                          </h5>
                          <span className="flex-shrink-0 text-xs text-banyan-text-subtle ml-2">
                            {(ref.score * 100).toFixed(0)}%
                          </span>
                        </div>

                        {/* Snippet */}
                        <p className="text-xs text-banyan-text-default mt-2 line-clamp-3">
                          {ref.snippet}
                        </p>

                        {/* Metadata */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                          {ref.section && (
                            <span className="text-banyan-text-subtle">{ref.section}</span>
                          )}
                          {ref.location && (
                            <span className="text-banyan-text-subtle">{ref.location}</span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full border text-xs ${
                              ref.stance === 'supports'
                                ? 'border-green-200 text-green-700 bg-green-50'
                                : ref.stance === 'conflicts'
                                ? 'border-red-200 text-red-700 bg-red-50'
                                : 'border-gray-200 text-gray-700 bg-gray-50'
                            }`}
                          >
                            {ref.stance}
                          </span>
                          {ref.url && (
                            <a
                              className="underline text-banyan-primary hover:opacity-80"
                              href={ref.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              open
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

