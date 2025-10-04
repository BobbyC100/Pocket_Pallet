"use client";
import { useState } from "react";
import PromptWizard from "@/components/PromptWizard";
import ResultTabs from "@/components/ResultTabs";

export default function NewPage() {
  const [result, setResult] = useState<null | {
    founderBriefMd: string; 
    vcSummaryMd: string; 
    runwayMonths: number | null;
    responses?: any; // Store wizard responses for framework generation
  }>(null);
  const [isCreatingFramework, setIsCreatingFramework] = useState(false);

  const handleCreateVisionFramework = async (useV2: boolean = true) => {
    if (!result?.responses) {
      alert('No brief data available. Please complete the wizard first.');
      return;
    }

    setIsCreatingFramework(true);
    try {
      const apiEndpoint = useV2 ? '/api/vision-framework-v2/generate' : '/api/vision-framework/generate';
      const storageKey = useV2 ? 'visionFrameworkV2Draft' : 'visionFrameworkDraft';
      const targetPage = useV2 ? '/vision-framework-v2' : '/vision-framework';

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
        throw new Error(errorData.error || 'Failed to create vision framework');
      }

      const frameworkData = await response.json();
      
      // Store in session storage for the vision framework page
      sessionStorage.setItem(storageKey, JSON.stringify({
        framework: frameworkData.framework,
        executiveOnePager: frameworkData.executiveOnePager,
        metadata: frameworkData.metadata,
        fromBrief: true,
        autoFilledFields: ['all']
      }));

      // Navigate to vision framework page
      window.location.href = targetPage;
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
  );
}
