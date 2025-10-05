'use client';

import { useEffect, useState } from 'react';

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
  estimatedSeconds: number;
}

interface GenerationProgressModalProps {
  isOpen: boolean;
  currentStep: string;
  steps: GenerationStep[];
}

export default function GenerationProgressModal({ 
  isOpen, 
  currentStep,
  steps 
}: GenerationProgressModalProps) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    if (!isOpen) {
      setStartTime(null);
      setElapsedTime(0);
      return;
    }
    
    // Set start time when modal opens
    const start = Date.now();
    setStartTime(start);
    
    // Update elapsed time every second
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setElapsedTime(elapsed);
    }, 100); // Update every 100ms for smoother display
    
    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const totalSteps = steps.length;
  const overallProgress = Math.min(100, Math.round((completedSteps / totalSteps) * 100));
  
  const totalEstimatedTime = steps.reduce((acc, step) => acc + step.estimatedSeconds, 0);
  const remainingTime = Math.max(0, totalEstimatedTime - elapsedTime);
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-banyan-bg-surface rounded-xl shadow-banyan-high border border-banyan-border-default p-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-l">
          <div className="w-16 h-16 bg-banyan-mist rounded-full flex items-center justify-center mx-auto mb-m">
            <svg className="w-8 h-8 text-banyan-primary animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-xs">Generating Your Documents</h2>
          <p className="text-body text-banyan-text-subtle">Please wait while we create your brief and vision framework</p>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="mb-l">
          <div className="flex justify-between text-caption text-banyan-text-subtle mb-xs">
            <span>Overall Progress</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-banyan-border-default rounded-full h-3">
            <div 
              className="bg-banyan-primary h-3 rounded-full transition-all duration-slow ease-banyan-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between text-caption text-banyan-text-subtle mb-l">
          <span>Elapsed: {elapsedTime}s</span>
          <span>Est. remaining: ~{remainingTime}s</span>
        </div>
        
        {/* Step List */}
        <div className="space-y-s">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-s p-s rounded-m transition-all duration-base ease-banyan ${
                step.status === 'active' 
                  ? 'bg-banyan-primary/10 border border-banyan-primary' 
                  : step.status === 'complete'
                  ? 'bg-banyan-success/10 border border-banyan-success'
                  : 'bg-banyan-bg-surface border border-banyan-border-default'
              }`}
            >
              {/* Status Icon */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-base ${
                step.status === 'complete'
                  ? 'bg-banyan-success'
                  : step.status === 'active'
                  ? 'bg-banyan-primary'
                  : 'bg-banyan-border-default'
              }`}>
                {step.status === 'complete' ? (
                  <svg className="w-4 h-4 text-banyan-primary-contrast" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.status === 'active' ? (
                  <div className="w-2 h-2 bg-banyan-primary-contrast rounded-full animate-pulse" />
                ) : (
                  <span className="text-banyan-text-default text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="flex-1">
                <p className={`font-medium text-body ${
                  step.status === 'active' 
                    ? 'text-banyan-primary' 
                    : step.status === 'complete'
                    ? 'text-banyan-success'
                    : 'text-banyan-text-subtle'
                }`}>
                  {step.label}
                </p>
              </div>
              
              {/* Active Spinner */}
              {step.status === 'active' && (
                <svg className="w-5 h-5 text-banyan-primary animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer Note */}
        <div className="mt-l pt-l border-t border-banyan-border-default">
          <p className="text-caption text-banyan-text-subtle text-center">
            This process uses GPT-4 and Gemini 2.5 to generate high-quality documents. Please don't close this window.
          </p>
        </div>
      </div>
    </div>
  );
}

