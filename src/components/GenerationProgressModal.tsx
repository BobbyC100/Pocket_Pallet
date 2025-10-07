'use client';

import { useEffect } from 'react';

export interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

interface GenerationProgressModalProps {
  isOpen: boolean;
  currentStep: string;
  steps: GenerationStep[];
}

export default function GenerationProgressModal({ isOpen, currentStep, steps }: GenerationProgressModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-banyan-bg-surface rounded-2xl border border-banyan-border-default p-8 max-w-md w-full mx-4 shadow-banyan-high">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-banyan-primary/10 mb-4">
            <svg 
              className="w-8 h-8 text-banyan-primary animate-spin" 
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
          </div>
          <h2 className="text-2xl font-bold text-banyan-text-default mb-2">
            Creating Vision Statement
          </h2>
          <p className="text-banyan-text-subtle">
            This will take about 15-20 seconds
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isComplete = step.status === 'complete';
            const isError = step.status === 'error';

            return (
              <div 
                key={step.id} 
                className="flex items-center gap-3"
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  isComplete 
                    ? 'bg-banyan-success' 
                    : isError
                    ? 'bg-banyan-error'
                    : isActive 
                    ? 'bg-banyan-primary' 
                    : 'bg-banyan-border-default'
                }`}>
                  {isComplete && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isError && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {isActive && !isComplete && !isError && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </div>
                <span className={`text-sm ${
                  isActive 
                    ? 'text-banyan-text-default font-medium' 
                    : isComplete
                    ? 'text-banyan-text-subtle'
                    : isError
                    ? 'text-banyan-error'
                    : 'text-banyan-text-subtle'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

