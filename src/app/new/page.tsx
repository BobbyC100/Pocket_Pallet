"use client";
import { useState } from "react";
import PromptWizard from "@/components/PromptWizard";
import ResultTabs from "@/components/ResultTabs";
import VisionModal from "@/components/VisionModal";

export default function NewPage() {
  const [result, setResult] = useState<null | {
    founderBriefMd: string; 
    vcSummaryMd: string; 
    runwayMonths: number | null;
    responses?: any; // Store wizard responses for spine generation
  }>(null);
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [isCreatingFramework, setIsCreatingFramework] = useState(false);

  const handleCreateVisionFramework = async (visionPurpose: string, visionEndState: string) => {
    if (!result?.responses) {
      console.error('No responses available:', result);
      alert('No brief data available. Please complete the wizard first.');
      return;
    }

    console.log('Creating vision framework with:', { 
      briefData: result.responses, 
      visionPurpose, 
      visionEndState 
    });

    setIsCreatingFramework(true);
    try {
      console.log('Making API request to /api/vision-framework/from-brief');
      const response = await fetch('/api/vision-framework/from-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefData: result.responses,
          visionPurpose,
          visionEndState,
          companyId: 'demo-company'
        })
      });

      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error data:', errorData);
        throw new Error(errorData.error || 'Failed to create vision framework');
      }

      const frameworkData = await response.json();
      console.log('Framework data received:', frameworkData);
      
      // Store in session storage for the vision framework page to pick up
      sessionStorage.setItem('visionFrameworkDraft', JSON.stringify({
        framework: frameworkData.framework,
        fromBrief: true,
        autoFilledFields: frameworkData.autoFilledFields,
        frameworkId: frameworkData.frameworkId
      }));

      // Navigate to vision framework page
      window.location.href = '/vision-framework';
    } catch (error) {
      console.error('Error creating vision framework:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to create vision framework: ${errorMessage}`);
    } finally {
      setIsCreatingFramework(false);
    }
  };

  return (
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Ready for the Next Step?</h3>
                <p className="text-gray-300">
                  Transform your brief into a comprehensive Vision Framework - your company's strategic foundation.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-2">Auto-filled from your brief:</div>
                <div className="text-xs text-gray-500">
                  Mission • Objectives • Brand Brief • Success Signals
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (!result?.responses) {
                  alert('Please complete a brief first by going through the wizard steps above.');
                  return;
                }
                setShowVisionModal(true);
              }}
              disabled={isCreatingFramework || !result?.responses}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingFramework ? 'Creating Vision Framework...' : 'Create Vision Framework'}
            </button>
            
            <div className="mt-3 text-xs text-gray-400 text-center">
              We'll ask for 2 quick vision fields, then auto-fill everything else from your brief
            </div>
          </div>

          <div className="flex gap-3">
            <a href="/dashboard" className="rounded-lg border px-4 py-2">Back to Dashboard</a>
          </div>
        </div>
      )}

      <VisionModal
        isOpen={showVisionModal}
        onClose={() => setShowVisionModal(false)}
        onSubmit={handleCreateVisionFramework}
      />
    </main>
  );
}
