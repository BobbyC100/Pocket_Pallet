'use client';

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
  if (!isOpen) return null;
  
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const totalSteps = steps.length;
  const overallProgress = Math.min(100, Math.round((completedSteps / totalSteps) * 100));
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Documents</h2>
          <p className="text-gray-600">Please wait while we create your brief and vision framework</p>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
        
        {/* Step List */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                step.status === 'active' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : step.status === 'complete'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {/* Status Icon */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                step.status === 'complete'
                  ? 'bg-green-500'
                  : step.status === 'active'
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}>
                {step.status === 'complete' ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.status === 'active' ? (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                ) : (
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="flex-1">
                <p className={`font-medium ${
                  step.status === 'active' 
                    ? 'text-blue-900' 
                    : step.status === 'complete'
                    ? 'text-green-900'
                    : 'text-gray-600'
                }`}>
                  {step.label}
                </p>
              </div>
              
              {/* Active Spinner */}
              {step.status === 'active' && (
                <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer Note */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This process uses GPT-4 and Gemini 2.5 to generate high-quality documents. Please don't close this window.
          </p>
        </div>
      </div>
    </div>
  );
}

