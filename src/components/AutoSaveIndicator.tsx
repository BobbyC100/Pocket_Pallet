import React from 'react';
import { formatAutoSaveStatus } from '@/hooks/useAutoSave';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: string | null;
  className?: string;
}

export function AutoSaveIndicator({ status, lastSaved, error, className = '' }: AutoSaveIndicatorProps) {
  // Don't show anything when idle
  if (status === 'idle') {
    return null;
  }

  const statusText = formatAutoSaveStatus({ status, lastSaved, error });

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {status === 'saving' && (
        <>
          <svg 
            className="animate-spin h-4 w-4 text-banyan-text-subtle" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-banyan-text-subtle">{statusText}</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <svg 
            className="h-4 w-4 text-banyan-success" 
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
          <span className="text-banyan-success">{statusText}</span>
        </>
      )}

      {status === 'error' && (
        <>
          <svg 
            className="h-4 w-4 text-banyan-error" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="text-banyan-error">{statusText}</span>
        </>
      )}
    </div>
  );
}

/**
 * Compact version for tight spaces (like in headers)
 */
export function AutoSaveIndicatorCompact({ status, lastSaved, error }: AutoSaveIndicatorProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      {status === 'saving' && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-xs text-banyan-text-subtle">Saving</span>
        </div>
      )}

      {status === 'saved' && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-banyan-text-subtle">Saved</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs text-banyan-error">Error</span>
        </div>
      )}
    </div>
  );
}

