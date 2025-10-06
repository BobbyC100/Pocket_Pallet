import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'complete' | 'error';
  progress?: number; // 0-100
  message?: string;
  duration?: number; // in ms
}

interface GenerationProgressModalProps {
  isOpen: boolean;
  steps: GenerationStep[];
  currentStep?: string;
  onClose?: () => void;
}

export const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({
  isOpen,
  steps,
  currentStep,
  onClose
}) => {
  if (!isOpen) return null;

  const allComplete = steps.every(s => s.status === 'complete');
  const hasError = steps.some(s => s.status === 'error');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-high border border-banyan-border-default p-6 max-w-2xl w-full mx-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-banyan-text-default mb-2">
            {hasError ? 'Generation Failed' : allComplete ? 'Generation Complete!' : 'Generating Vision Framework'}
          </h2>
          <p className="text-sm text-banyan-text-subtle">
            {hasError 
              ? 'An error occurred during generation' 
              : allComplete 
              ? 'Your Vision Framework is ready' 
              : 'Please wait while we create your strategic documents'}
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {step.status === 'complete' ? (
                  <CheckCircle className="h-5 w-5 text-banyan-success" />
                ) : step.status === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-banyan-error" />
                ) : step.status === 'in_progress' ? (
                  <Loader2 className="h-5 w-5 text-banyan-primary animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-banyan-border-default" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-medium ${
                    step.status === 'complete' ? 'text-banyan-success' :
                    step.status === 'error' ? 'text-banyan-error' :
                    step.status === 'in_progress' ? 'text-banyan-primary' :
                    'text-banyan-text-subtle'
                  }`}>
                    {step.label}
                  </h3>
                  {step.duration && step.status === 'complete' && (
                    <span className="text-xs text-banyan-text-subtle">
                      {(step.duration / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>

                {step.message && (
                  <p className="text-xs text-banyan-text-subtle">{step.message}</p>
                )}

                {/* Progress bar for in-progress steps */}
                {step.status === 'in_progress' && step.progress !== undefined && (
                  <div className="mt-2 w-full bg-banyan-bg-base rounded-full h-1.5">
                    <div 
                      className="bg-banyan-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-3">
          {(allComplete || hasError) && onClose && (
            <button
              onClick={onClose}
              className="btn-banyan-primary"
            >
              {hasError ? 'Close' : 'View Framework'}
            </button>
          )}
        </div>

        {/* Overall progress indicator */}
        {!allComplete && !hasError && (
          <div className="mt-6 pt-4 border-t border-banyan-border-default">
            <div className="flex items-center justify-between text-sm">
              <span className="text-banyan-text-subtle">
                Step {steps.filter(s => s.status === 'complete').length + 1} of {steps.length}
              </span>
              <span className="text-banyan-text-subtle">
                {Math.round((steps.filter(s => s.status === 'complete').length / steps.length) * 100)}% complete
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerationProgressModal;
