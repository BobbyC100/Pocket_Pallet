"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ResultTabs from "@/components/ResultTabs";
import GenerationProgressModal, { GenerationStep } from "@/components/GenerationProgressModal";
import SaveModal from "@/components/SaveModal";
import StrategicToolsModal from "@/components/StrategicToolsModal";
import { SaveBar } from "@/components/SaveBar";
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import { exportBriefToPDF } from "@/lib/pdf-export-v2";
import { trackUserAction, trackSignupTouchpoint } from "@/lib/analytics";

export default function ResultsPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  
  const [result, setResult] = useState<null | {
    founderBriefMd: string; 
    vcSummaryMd: string; 
    runwayMonths: number | null;
    responses?: any;
    isAnonymous?: boolean;
  }>(null);
  
  const [isCreatingFramework, setIsCreatingFramework] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showStrategicToolsModal, setShowStrategicToolsModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [frameworkSteps, setFrameworkSteps] = useState<GenerationStep[]>([
    { id: 'research', label: 'Retrieve Research Insights', status: 'pending' },
    { id: 'framework', label: 'Generate Strategic Framework', status: 'pending' },
    { id: 'validation', label: 'Validate Framework Structure', status: 'pending' },
    { id: 'onepager', label: 'Create Executive Summary', status: 'pending' },
    { id: 'qa', label: 'Run Quality Checks', status: 'pending' },
    { id: 'scoring', label: 'Score Section Quality', status: 'pending' }
  ]);
  const [activeFrameworkStep, setActiveFrameworkStep] = useState('');

  // Load result from session storage
  useEffect(() => {
    const savedResult = sessionStorage.getItem('lastGeneratedBrief');
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setResult(parsed);
      } catch (error) {
        console.error('Failed to load result:', error);
        router.push('/new');
      }
    } else {
      // No result found, redirect to wizard
      router.push('/new');
    }
  }, [router]);

  const autoSave = useAutoSave(result, {
    debounceMs: 3000,
    enabled: true,
    onSave: () => setHasUnsavedChanges(true),
    onError: (error) => console.error('Auto-save failed:', error)
  });

  const handleExportPDF = () => {
    if (!result) return;
    trackUserAction('pdf_exported');
    
    try {
      const cleanText = (md: string) => {
        return md
          .replace(/#{1,6}\s/g, '')
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/\*(.+?)\*/g, '$1')
          .replace(/\[(.+?)\]\(.+?\)/g, '$1')
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
        name: 'Vision Statement',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleSave = () => {
    if (isSignedIn) {
      trackUserAction('cloud_saved');
      // TODO: Save to database
      alert('Saved to cloud!');
    } else {
      trackSignupTouchpoint('unlock_results', 'shown');
      setShowSaveModal(true);
    }
  };

  const handleUnlockStrategicTools = () => {
    if (!isSignedIn) {
      trackSignupTouchpoint('unlock_tools', 'shown');
      setShowSaveModal(true);
      return;
    }

    trackSignupTouchpoint('unlock_tools', 'accepted');
    setShowStrategicToolsModal(true);
  };

  const handleCreateVisionFramework = async () => {
    if (!result?.responses) {
      alert('No Vision Statement data available.');
      return;
    }

    if (!isSignedIn) {
      setShowSaveModal(true);
      return;
    }

    setIsCreatingFramework(true);

    try {
      // Store responses in session for framework generation
      sessionStorage.setItem('visionFrameworkV2Input', JSON.stringify({
        responses: result.responses,
        fromResults: true
      }));

      // Navigate to framework page which will pick up the data
      router.push('/vision-framework-v2');
    } catch (error) {
      console.error('Error navigating to framework:', error);
      alert('Failed to start framework generation. Please try again.');
      setIsCreatingFramework(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-banyan-primary mx-auto mb-4"></div>
          <p className="text-banyan-text-subtle">Loading your Vision Statement...</p>
        </div>
      </div>
    );
  }

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
        }}
      />

      <StrategicToolsModal
        isOpen={showStrategicToolsModal}
        onClose={() => setShowStrategicToolsModal(false)}
        onSelectTool={(tool) => {
          console.log('Selected tool:', tool);
          handleCreateVisionFramework();
        }}
      />
      
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/new')}
              className="btn-banyan-ghost flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Wizard
            </button>

            {isSignedIn && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-banyan-success rounded-full animate-pulse"></div>
                <span className="text-sm text-banyan-text-subtle">
                  Signed in as <span className="font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
                </span>
              </div>
            )}
          </div>

          {/* Save Status Bar */}
          <div className="bg-banyan-bg-surface rounded-lg border-2 border-banyan-border-default p-4 flex items-center justify-between shadow-banyan-mid">
            <AutoSaveIndicator 
              status={autoSave.status.status}
              lastSaved={autoSave.status.lastSaved}
              error={autoSave.status.error}
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                className="btn-banyan-ghost flex items-center gap-2"
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

          {/* Results */}
          <ResultTabs
            founderMd={result.founderBriefMd}
            vcMd={result.vcSummaryMd}
            isAnonymous={result.isAnonymous || false}
          />
          
          {/* Expand Your Vision into Strategy Section */}
          <section className="mt-16 border-t border-black/10 dark:border-white/10 pt-10 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
              Expand your Vision into Strategy.
            </h2>
            <p className="mt-3 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Generate your complete strategic toolkit — including Vision Frameworks, Founder's Lens, and One-Page Briefs.
            </p>
            <ul className="mt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <li>• Vision Framework – comprehensive strategic foundation</li>
              <li>• Founder's Lens – focused leadership view</li>
              <li>• Strategic Briefs – investor-ready summaries</li>
            </ul>
            <div className="mt-8">
              <button
                onClick={handleUnlockStrategicTools}
                disabled={isCreatingFramework || !result?.responses}
                className="inline-flex h-11 items-center justify-center rounded-2xl px-6 font-medium bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingFramework ? 'Generating Strategic Tools...' : 'Unlock Strategic Tools'}
              </button>
            </div>
          </section>
        </div>
      </main>
      
      <SaveBar 
        onSave={handleSave}
        hasUnsavedChanges={hasUnsavedChanges && result !== null}
      />
    </>
  );
}

