'use client'

/**
 * Research Citations Component
 * Displays research-backed citations with confidence scores
 */

import React from 'react';

export interface Citation {
  authors?: string;
  title: string;
  section?: string;
  url?: string;
  confidence: number;
}

interface ResearchCitationsProps {
  citations: Citation[];
  className?: string;
}

export const ResearchCitations: React.FC<ResearchCitationsProps> = ({ citations, className = '' }) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className={`bg-banyan-bg-surface rounded-lg border-2 border-banyan-border-default p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-banyan-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-lg font-bold text-banyan-text-default">
          Research-Backed Insights
        </h3>
        <span className="px-2 py-1 text-xs font-semibold bg-banyan-primary/10 text-banyan-primary rounded-full">
          {citations.length} {citations.length === 1 ? 'Source' : 'Sources'}
        </span>
      </div>
      
      <p className="text-sm text-banyan-text-subtle mb-4">
        This framework incorporates insights from peer-reviewed organizational science research.
      </p>

      <div className="space-y-3">
        {citations.map((citation, idx) => (
          <div 
            key={idx}
            className="flex items-start gap-3 p-3 bg-banyan-bg-base rounded-lg border border-banyan-border-subtle hover:border-banyan-primary/30 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-banyan-primary/10 text-banyan-primary rounded-full text-sm font-bold">
              {idx + 1}
            </div>
            
            <div className="flex-grow">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-banyan-text-default text-sm leading-snug">
                  {citation.title}
                </h4>
                <div 
                  className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded"
                  style={{
                    backgroundColor: getConfidenceColor(citation.confidence).bg,
                    color: getConfidenceColor(citation.confidence).text
                  }}
                >
                  {Math.round(citation.confidence * 100)}%
                </div>
              </div>
              
              {citation.authors && (
                <p className="text-xs text-banyan-text-subtle mb-1">
                  {citation.authors}
                </p>
              )}
              
              {citation.section && (
                <p className="text-xs text-banyan-text-muted">
                  Section: {citation.section}
                </p>
              )}
              
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-banyan-primary hover:underline mt-1 inline-flex items-center gap-1"
                >
                  View source
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-banyan-border-subtle">
        <p className="text-xs text-banyan-text-muted">
          <span className="font-semibold">Confidence scores</span> indicate similarity between your vision and research findings. Higher scores suggest stronger alignment with documented best practices.
        </p>
      </div>
    </div>
  );
};

function getConfidenceColor(confidence: number): { bg: string; text: string } {
  if (confidence >= 0.8) {
    return { bg: 'rgba(34, 197, 94, 0.15)', text: 'rgb(21, 128, 61)' }; // Green
  } else if (confidence >= 0.6) {
    return { bg: 'rgba(59, 130, 246, 0.15)', text: 'rgb(29, 78, 216)' }; // Blue
  } else {
    return { bg: 'rgba(156, 163, 175, 0.15)', text: 'rgb(75, 85, 99)' }; // Gray
  }
}

export default ResearchCitations;

