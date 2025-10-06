"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import PromptWizard from "@/components/PromptWizard";
import ResultTabs from "@/components/ResultTabs";
import GenerationProgressModal, { GenerationStep } from "@/components/GenerationProgressModal";
import SaveModal from "@/components/SaveModal";
import { SaveBar } from "@/components/SaveBar";
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator";
import { saveDraft, getAllDrafts, getAnonymousId } from "@/lib/anonymous-session";
import { useAutoSave } from "@/hooks/useAutoSave";
import { exportBriefToPDF } from "@/lib/pdf-export-v2";

// Removed local interface - now using the one from GenerationProgressModal

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
    { id: 'mapping', label: 'Mapping strategic questions to framework', status: 'pending' },
    { id: 'tensions', label: 'Detecting contradictions and tensions', status: 'pending' },
    { id: 'onepager', label: 'Generating executive one-pager', status: 'pending' },
    { id: 'qa', label: 'Running quality checks', status: 'pending' }
  ]);
  const [activeFrameworkStep, setActiveFrameworkStep] = useState('');

  const updateFrameworkStepStatus = (stepId: string, status: 'pending' | 'in_progress' | 'complete' | 'error') => {
    setFrameworkSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
    if (status === 'in_progress') {
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

  // Enhanced auto-save with debouncing
  const autoSave = useAutoSave(result, {
    debounceMs: 3000, // Save 3 seconds after last change
    enabled: true,
    onSave: (draftId) => {
      setCurrentDraftId(draftId);
      setHasUnsavedChanges(true);
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
    }
  });

  // Update draft ID when auto-save creates one
  useEffect(() => {
    if (autoSave.draftId && autoSave.draftId !== currentDraftId) {
      setCurrentDraftId(autoSave.draftId);
    }
  }, [autoSave.draftId]);

  // Keyboard shortcut: Cmd+S / Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        if (result) {
          autoSave.saveNow(); // Force immediate save
          console.log('💾 Manual save triggered via keyboard shortcut');
        }
      }
    };

    // Add listener in capture phase to intercept before browser
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [result, autoSave]);

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

  const handleExportPDF = () => {
    if (!result) return;
    
    console.log('📄 Exporting to PDF...');
    try {
      // Convert markdown to plain text for PDF (remove markdown syntax)
      const cleanText = (md: string) => {
        return md
          .replace(/#{1,6}\s/g, '') // Remove headers
          .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
          .replace(/\*(.+?)\*/g, '$1') // Remove italic
          .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
          .trim();
      };

      exportBriefToPDF({
        problem: cleanText(result.founderBriefMd.split('## Problem')[1]?.split('##')[0] || ''),
        solution: cleanText(result.founderBriefMd.split('## Solution')[1]?.split('##')[0] || ''),
        market: cleanText(result.founderBriefMd.split('## Market')[1]?.split('##')[0] || ''),
        uniqueValue: cleanText(result.founderBriefMd.split('## What Makes Us Different')[1]?.split('##')[0] || ''),
        targetCustomer: cleanText(result.founderBriefMd.split('## Target Customer')[1]?.split('##')[0] || ''),
        businessModel: cleanText(result.founderBriefMd.split('## Business Model')[1]?.split('##')[0] || ''),
        traction: cleanText(result.founderBriefMd.split('## Current Traction')[1]?.split('##')[0] || ''),
        team: cleanText(result.founderBriefMd.split('## Team')[1]?.split('##')[0] || ''),
        competition: cleanText(result.founderBriefMd.split('## Competition')[1]?.split('##')[0] || ''),
        name: 'Founder Brief',
        createdAt: new Date().toISOString()
      });
      console.log('✅ PDF exported successfully');
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
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
      { id: 'mapping', label: 'Mapping strategic questions to framework', status: 'pending' },
      { id: 'tensions', label: 'Detecting contradictions and tensions', status: 'pending' },
      { id: 'onepager', label: 'Generating executive one-pager', status: 'pending' },
      { id: 'qa', label: 'Running quality checks', status: 'pending' }
    ]);
    
    try {
      const apiEndpoint = useV2 ? '/api/vision-framework-v2/generate' : '/api/vision-framework/generate';
      const storageKey = useV2 ? 'visionFrameworkV2Draft' : 'visionFrameworkDraft';
      const targetPage = '/sos'; // Always redirect to SOS hub

      // Simulate progress through steps (since the API is a single call)
      updateFrameworkStepStatus('mapping', 'in_progress');
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
      updateFrameworkStepStatus('tensions', 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const frameworkData = await response.json();
      
      updateFrameworkStepStatus('tensions', 'complete');
      updateFrameworkStepStatus('onepager', 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateFrameworkStepStatus('onepager', 'complete');
      updateFrameworkStepStatus('qa', 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateFrameworkStepStatus('qa', 'complete');
      
      // Extract quality scores from metadata for easy access
      const qualityScores = frameworkData.metadata?.qualityScores || {};
      console.log('📊 Extracted quality scores:', qualityScores);
      console.log('📊 Quality scores keys:', Object.keys(qualityScores));
      
      // Store in session storage for the vision framework page
      sessionStorage.setItem(storageKey, JSON.stringify({
        framework: frameworkData.framework,
        executiveOnePager: frameworkData.executiveOnePager,
        metadata: frameworkData.metadata,
        qualityScores: qualityScores, // Store at top level for easy access
        originalResponses: result.responses, // Store for refinement
        fromBrief: true,
        autoFilledFields: ['all'],
        generatedAt: new Date().toISOString(),
        refinementHistory: [] // Initialize empty history
      }));
      
      console.log('✅ Framework saved to session storage with quality scores');
      console.log('✅ Quality scores available:', Object.keys(qualityScores).length > 0);

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
          <div className="bg-banyan-bg-surface rounded-lg border-2 border-banyan-border-default p-4 flex items-center justify-between shadow-banyan-mid">
            <div className="flex items-center gap-6">
              {isSignedIn && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-banyan-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-banyan-text-subtle font-medium">
                    Signed in as <span className="text-banyan-text-default font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
                  </span>
                </div>
              )}
              <AutoSaveIndicator 
                status={autoSave.status.status}
                lastSaved={autoSave.status.lastSaved}
                error={autoSave.status.error}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                className="btn-banyan-ghost flex items-center gap-2"
                title="Download as PDF"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
              </button>
              <button
                onClick={handleSave}
                className="btn-banyan-primary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {isSignedIn ? 'Save to Cloud' : 'Save Progress'}
              </button>
            </div>
          </div>

          <ResultTabs
            founderMd={result.founderBriefMd}
            vcMd={result.vcSummaryMd}
          />
          
          {/* Create Vision Framework Section */}
          <div className="bg-banyan-bg-surface rounded-xl border border-banyan-border-default p-6 shadow-banyan-mid">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-banyan-text-default mb-2">Ready for the Next Step?</h3>
              <p className="text-banyan-text-subtle">
                Transform your brief into a comprehensive Vision Framework - your company's strategic foundation.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-banyan-primary/20 border border-banyan-primary rounded-lg text-xs text-banyan-primary">
                <span className="font-semibold">✨ NEW:</span> AI-generated bets, metrics, and tension detection
              </div>
            </div>
            
            <button
              onClick={() => handleCreateVisionFramework(true)}
              disabled={isCreatingFramework || !result?.responses}
              className="w-full btn-banyan-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingFramework ? 'Creating Vision Framework...' : 'Create Vision Framework'}
            </button>
            
            <div className="mt-3 text-xs text-banyan-text-subtle text-center">
              {!isSignedIn && (
                <span className="text-banyan-warning">🔒 Free account required • </span>
              )}
              Auto-generates: Vision • Strategy • Principles • Bets • Metrics • Tensions
            </div>
          </div>

          <div className="flex gap-3">
            <a href="/dashboard" className="btn-banyan-ghost">Back to Dashboard</a>
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
