"use client";
import { useState } from "react";
import PromptWizard from "@/components/PromptWizard";
import ResultTabs from "@/components/ResultTabs";
import GenerationProgressModal from "@/components/GenerationProgressModal";

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
  estimatedSeconds: number;
}

export default function NewPage() {
  const [result, setResult] = useState<null | {
    founderBriefMd: string; 
    vcSummaryMd: string; 
    runwayMonths: number | null;
    responses?: any; // Store wizard responses for framework generation
  }>(null);
  const [isCreatingFramework, setIsCreatingFramework] = useState(false);
  const [frameworkSteps, setFrameworkSteps] = useState<GenerationStep[]>([
    { id: 'mapping', label: 'Mapping strategic questions to framework', status: 'pending', estimatedSeconds: 10 },
    { id: 'tensions', label: 'Detecting contradictions and tensions', status: 'pending', estimatedSeconds: 8 },
    { id: 'onepager', label: 'Generating executive one-pager', status: 'pending', estimatedSeconds: 6 },
    { id: 'qa', label: 'Running quality checks', status: 'pending', estimatedSeconds: 6 }
  ]);
  const [activeFrameworkStep, setActiveFrameworkStep] = useState('');

  const updateFrameworkStepStatus = (stepId: string, status: 'pending' | 'active' | 'complete') => {
    setFrameworkSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
    if (status === 'active') {
      setActiveFrameworkStep(stepId);
    }
  };

  const handleCreateVisionFramework = async (useV2: boolean = true) => {
    if (!result?.responses) {
      alert('No brief data available. Please complete the wizard first.');
      return;
    }

    setIsCreatingFramework(true);
    
    // Reset steps
    setFrameworkSteps([
      { id: 'mapping', label: 'Mapping strategic questions to framework', status: 'pending', estimatedSeconds: 10 },
      { id: 'tensions', label: 'Detecting contradictions and tensions', status: 'pending', estimatedSeconds: 8 },
      { id: 'onepager', label: 'Generating executive one-pager', status: 'pending', estimatedSeconds: 6 },
      { id: 'qa', label: 'Running quality checks', status: 'pending', estimatedSeconds: 6 }
    ]);
    
    try {
      const apiEndpoint = useV2 ? '/api/vision-framework-v2/generate' : '/api/vision-framework/generate';
      const storageKey = useV2 ? 'visionFrameworkV2Draft' : 'visionFrameworkDraft';
      const targetPage = '/sos'; // Always redirect to SOS hub

      // Simulate progress through steps (since the API is a single call)
      updateFrameworkStepStatus('mapping', 'active');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      
      // Call the generation API with wizard responses
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'demo-company',
          responses: result.responses
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Vision Framework V2 generation error:', errorData);
        const errorDetails = errorData.details ? `\n\nDetails:\n${JSON.stringify(errorData.details, null, 2)}` : '';
        throw new Error(errorData.error + errorDetails || 'Failed to create vision framework');
      }

      // Update progress as we process the response
      updateFrameworkStepStatus('mapping', 'complete');
      updateFrameworkStepStatus('tensions', 'active');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const frameworkData = await response.json();
      
      updateFrameworkStepStatus('tensions', 'complete');
      updateFrameworkStepStatus('onepager', 'active');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateFrameworkStepStatus('onepager', 'complete');
      updateFrameworkStepStatus('qa', 'active');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateFrameworkStepStatus('qa', 'complete');
      
      // Store in session storage for the vision framework page
      sessionStorage.setItem(storageKey, JSON.stringify({
        framework: frameworkData.framework,
        executiveOnePager: frameworkData.executiveOnePager,
        metadata: frameworkData.metadata,
        fromBrief: true,
        autoFilledFields: ['all']
      }));

      // Navigate to vision framework page
      console.log('🚀 Navigating to:', targetPage);
      window.location.href = targetPage;
    } catch (error) {
      console.error('Error creating vision framework:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to create vision framework: ${errorMessage}`);
    } finally {
      setIsCreatingFramework(false);
      setActiveFrameworkStep('');
    }
  };

  return (
    <>
      <GenerationProgressModal 
        isOpen={isCreatingFramework}
        currentStep={activeFrameworkStep}
        steps={frameworkSteps}
      />
      
      <main className="mx-auto max-w-5xl px-6 py-12">
        {!result ? (
          <PromptWizard onGenerated={setResult} />
      ) : (
        <div className="space-y-6">
          <ResultTabs
            founderMd={result.founderBriefMd}
            vcMd={result.vcSummaryMd}
          />
          
          {/* Create Vision Framework Section */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Ready for the Next Step?</h3>
              <p className="text-gray-300">
                Transform your brief into a comprehensive Vision Framework - your company's strategic foundation.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-900/30 border border-blue-700 rounded-lg text-xs text-blue-200">
                <span className="font-semibold">✨ NEW:</span> AI-generated bets, metrics, and tension detection
              </div>
            </div>
            
            <button
              onClick={() => handleCreateVisionFramework(true)}
              disabled={isCreatingFramework || !result?.responses}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingFramework ? 'Creating Vision Framework...' : 'Create Vision Framework (Gemini-Powered)'}
            </button>
            
            <div className="mt-3 text-xs text-gray-400 text-center">
              Auto-generates: Vision • Strategy • Principles • Bets • Metrics • Tensions
            </div>
          </div>

          <div className="flex gap-3">
            <a href="/dashboard" className="rounded-lg border px-4 py-2">Back to Dashboard</a>
          </div>
        </div>
      )}
      </main>
    </>
  );
}
