"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import PromptWizard from "@/components/PromptWizard";
import ResultTabs from "@/components/ResultTabs";
import GenerationProgressModal from "@/components/GenerationProgressModal";
import SaveModal from "@/components/SaveModal";
import { SaveBar } from "@/components/SaveBar";
import { saveDraft, getAllDrafts, getAnonymousId } from "@/lib/anonymous-session";

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
  estimatedSeconds: number;
}

export default function NewPage() {
  const { isSignedIn, user } = useUser();
  const [result, setResult] = useState<null | {
    founderBriefMd: string; 
    vcSummaryMd: string; 
    runwayMonths: number | null;
    responses?: any; // Store wizard responses for framework generation
  }>(null);
  const [isCreatingFramework, setIsCreatingFramework] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

  // Restore data from localStorage on mount (after login redirect)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const drafts = getAllDrafts();
    if (drafts.length > 0 && !result) {
      // Get the most recent draft
      const mostRecent = drafts.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      
      if (mostRecent.type === 'brief' && mostRecent.contentJson) {
        console.log('📥 Restoring draft after login:', mostRecent.id);
        setResult(mostRecent.contentJson);
        setCurrentDraftId(mostRecent.id);
      }
    }
  }, []);

  // Auto-save to localStorage when result changes
  useEffect(() => {
    if (result) {
      console.log('💾 Auto-saving draft to localStorage...');
      const draft = saveDraft({
        type: 'brief',
        title: 'Founder Brief',
        contentJson: result,
        metadata: { autoSaved: true, timestamp: new Date().toISOString() }
      });
      setCurrentDraftId(draft.id);
      setHasUnsavedChanges(true);
      console.log('✅ Draft saved:', draft.id);
    }
  }, [result]);

  // Handle save button click
  const handleSave = () => {
    if (isSignedIn) {
      // User is signed in, save to Supabase directly
      saveToDatabase();
    } else {
      // Show save modal for anonymous users
      setShowSaveModal(true);
    }
  };

  const saveToDatabase = async () => {
    if (!result) return;

    try {
      console.log('💾 Saving to database...');
      const response = await fetch('/api/documents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'brief',
          title: 'Founder Brief',
          contentJson: result,
          metadata: { savedAt: new Date().toISOString() }
        })
      });

      if (!response.ok) throw new Error('Failed to save');
      
      const data = await response.json();
      console.log('✅ Saved to database:', data);
      setHasUnsavedChanges(false);
      alert('Brief saved successfully!');
    } catch (error) {
      console.error('❌ Save failed:', error);
      alert('Failed to save brief. Please try again.');
    }
  };

  const handleCreateVisionFramework = async (useV2: boolean = true) => {
    if (!result?.responses) {
      alert('No brief data available. Please complete the wizard first.');
      return;
    }

    // Require authentication for Vision Framework generation
    if (!isSignedIn) {
      setShowSaveModal(true);
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
      
      <SaveModal 
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSaveComplete={() => {
          setShowSaveModal(false);
          // After sign-in, Clerk will redirect and we'll migrate data
        }}
      />
      
      <main className="mx-auto max-w-5xl px-6 py-12">
        {!result ? (
          <PromptWizard onGenerated={setResult} />
      ) : (
        <div className="space-y-6">
          {/* Save Status Bar */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    Signed in as <span className="text-gray-900 font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    💾 Draft auto-saved locally
                  </span>
                </>
              )}
            </div>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {isSignedIn ? 'Save to Cloud' : 'Save Progress'}
            </button>
          </div>

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
              {isCreatingFramework ? 'Creating Vision Framework...' : 'Create Vision Framework'}
            </button>
            
            <div className="mt-3 text-xs text-gray-400 text-center">
              {!isSignedIn && (
                <span className="text-yellow-400">🔒 Free account required • </span>
              )}
              Auto-generates: Vision • Strategy • Principles • Bets • Metrics • Tensions
            </div>
          </div>

          <div className="flex gap-3">
            <a href="/dashboard" className="rounded-lg border px-4 py-2">Back to Dashboard</a>
          </div>
        </div>
      )}
      </main>
      
      <SaveBar 
        onSave={handleSave}
        hasUnsavedChanges={hasUnsavedChanges && result !== null}
      />
    </>
  );
}
