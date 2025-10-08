'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { PROMPT_STEPS } from '@/lib/templates'
import { PromptInput, BriefOutput } from '@/lib/types'
import GenerationProgressModal, { GenerationStep } from '@/components/GenerationProgressModal'
import SoftSignupModal from '@/components/SoftSignupModal'
import PreGenerationSignupModal from '@/components/PreGenerationSignupModal'
import { consumeSSEStream } from '@/lib/streaming-utils'
import { trackEvent, trackWizardProgress, trackSignupTouchpoint, trackGeneration, initAnalytics } from '@/lib/analytics'

interface PromptWizardProps {
  onGenerated?: (result: BriefOutput & { responses?: PromptInput }) => void; // Optional for backwards compat
}

// LocalStorage key for wizard state persistence
const WIZARD_STATE_KEY = 'banyan_wizard_state_v1';

interface WizardState {
  currentStep: number;
  responses: Partial<PromptInput>;
  softSignupShown: boolean;
  startTime: number;
  lastSaved: string;
}

export default function PromptWizard({ onGenerated }: PromptWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Partial<PromptInput>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSoftSignup, setShowSoftSignup] = useState(false)
  const [softSignupShown, setSoftSignupShown] = useState(false)
  const [showPreGenerationSignup, setShowPreGenerationSignup] = useState(false)
  const [startTime] = useState(Date.now())
  const [stateRestored, setStateRestored] = useState(false)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    { id: 'brief', label: 'Generating Vision Statement', status: 'pending' },
    { id: 'research', label: 'Retrieving research-backed insights', status: 'pending' },
    { id: 'framework', label: 'Building strategic framework', status: 'pending' },
    { id: 'validation', label: 'Validating framework structure', status: 'pending' }
    // Note: One-Pager, QA, and Scoring are now generated on-demand when user clicks the tabs
  ])
  const [activeGenerationStep, setActiveGenerationStep] = useState('')

  // Restore wizard state from localStorage and URL params on mount
  useEffect(() => {
    if (stateRestored) return;
    
    initAnalytics();
    
    // Check for step parameter in URL (from auth callback)
    const stepParam = searchParams.get('step');
    const targetStep = stepParam ? parseInt(stepParam, 10) : null;
    
    // Try to restore from localStorage
    try {
      const savedState = localStorage.getItem(WIZARD_STATE_KEY);
      if (savedState) {
        const parsed: WizardState = JSON.parse(savedState);
        
        // Restore responses
        setResponses(parsed.responses || {});
        setSoftSignupShown(parsed.softSignupShown || false);
        
        // Use URL param step if present, otherwise use saved step
        const restoredStep = targetStep !== null ? targetStep : (parsed.currentStep || 0);
        setCurrentStep(Math.min(restoredStep, PROMPT_STEPS.length - 1));
        
        console.log('✅ Wizard state restored from localStorage', {
          step: restoredStep,
          fromUrl: targetStep !== null,
          responseCount: Object.keys(parsed.responses || {}).length
        });
        
        trackEvent('wizard_state_restored', {
          step: restoredStep,
          from_url: targetStep !== null,
          has_responses: Object.keys(parsed.responses || {}).length > 0
        });
      } else if (targetStep !== null) {
        // URL param but no saved state - just set the step
        setCurrentStep(Math.min(targetStep, PROMPT_STEPS.length - 1));
        console.log('📍 Starting at step from URL:', targetStep);
      } else {
        // Fresh start
        trackEvent('wizard_started');
      }
    } catch (error) {
      console.error('Failed to restore wizard state:', error);
      trackEvent('wizard_started');
    }
    
    setStateRestored(true);
  }, [searchParams, stateRestored]);

  // Persist wizard state to localStorage whenever it changes
  useEffect(() => {
    if (!stateRestored) return;
    
    try {
      const state: WizardState = {
        currentStep,
        responses,
        softSignupShown,
        startTime,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(WIZARD_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save wizard state:', error);
    }
  }, [currentStep, responses, softSignupShown, startTime, stateRestored]);

  // DISABLED: Midpoint soft signup removed per Issue #5.2
  // Signup now only appears when user clicks Save or Generate Tools
  // Keeping this commented for reference in case we want to re-enable later
  /*
  useEffect(() => {
    if (isSignedIn || softSignupShown || !stateRestored) return;
    const stepTrigger = currentStep >= 3;
    const timeTrigger = (Date.now() - startTime) > 5 * 60 * 1000;
    if (stepTrigger || timeTrigger) {
      setShowSoftSignup(true);
      setSoftSignupShown(true);
      trackSignupTouchpoint('soft_wizard', 'shown');
    }
  }, [currentStep, isSignedIn, softSignupShown, startTime, stateRestored]);
  */

  const loadTestData = () => {
    trackEvent('load_example_clicked');
    // Test data that matches our research corpus (goal alignment, employee engagement)
    const testData = {
      stage: "early_traction" as const,
      vision_audience_timing: "We're building a performance management platform for mid-market companies (200-2000 employees) where employees lack clarity on how their work connects to company goals. Right now, engagement is at all-time lows and companies are desperate for tools that create genuine alignment, not just check boxes. Remote work has made goal visibility even more critical.",
      hard_decisions: "Should we focus on engagement metrics or performance metrics first? Do we build for HR leaders or team managers? How do we balance individual goal-setting with organizational objectives without adding bureaucracy?",
      success_definition: "Financially: Build a $50M+ ARR business with 80%+ retention and become the default alignment platform. Culturally: Build a team where everyone understands how their work matters, where transparency is the default, and where we measure what matters.",
      core_principles: "Clarity over complexity — every employee should understand their goals in 5 minutes. Alignment over activity — we measure outcomes, not busy work. Trust through transparency — everyone sees how their work connects to company goals.",
      required_capabilities: "Real-time goal tracking that shows individual → team → company connections. Simple UI that makes goal-setting feel natural, not forced. Analytics that surface misalignment before it becomes a problem. Integration with tools teams already use (Slack, Asana, Jira).",
      current_state: "2 co-founders: ex-HR tech PM (8 years at Culture Amp) and ex-performance management consultant (worked with 100+ companies). 5 beta customers (50-300 employees each). 400 active users, 75% weekly engagement, 85% report 'clearer understanding of goals'. $200K pre-seed, $15K monthly burn, 13 months runway.",
      vision_combined: "Purpose: Ensure every employee understands how their work contributes to organizational success.\n\nEnd State: A world where goal alignment is the norm, not the exception—where every employee wakes up knowing exactly how their work matters and feels genuinely connected to their company's mission."
    };
    setResponses(testData);
  }

  const handleResponseChange = (field: keyof PromptInput, value: string | number) => {
    setResponses(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < PROMPT_STEPS.length - 1) {
      trackWizardProgress(currentStep + 1, PROMPT_STEPS.length);
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      trackEvent('wizard_back_clicked', { from_step: currentStep, to_step: newStep });
      console.log('⬅️ Back navigation:', { from: currentStep, to: newStep });
    }
  }

  const updateStepStatus = (stepId: string, status: 'pending' | 'active' | 'complete' | 'error', message?: string, duration?: number) => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message, duration } : step
    ));
    if (status === 'active') {
      setActiveGenerationStep(stepId);
    }
  };

  const handleInitiateGeneration = () => {
    trackWizardProgress(PROMPT_STEPS.length, PROMPT_STEPS.length, true);
    // CHANGED: Allow anonymous users to complete wizard without auth gate
    // Auth gating happens later at Save/Generate Tools actions
    handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Reset all steps to pending
    setGenerationSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const, message: undefined, duration: undefined })));

    try {
      console.log('🚀 Starting generation with streaming...');
      
      // Parse vision_combined into vision_purpose and vision_endstate
      const processedResponses = { ...responses };
      if (processedResponses.vision_combined) {
        const combined = processedResponses.vision_combined as string;
        const purposeMatch = combined.match(/Purpose:\s*([\s\S]+?)(?:\n\n|End State:|$)/);
        const endStateMatch = combined.match(/End State:\s*([\s\S]+?)$/);
        
        if (purposeMatch) {
          processedResponses.vision_purpose = purposeMatch[1].trim();
        }
        if (endStateMatch) {
          processedResponses.vision_endstate = endStateMatch[1].trim();
        }
        
        // Remove combined field before sending to API
        delete processedResponses.vision_combined;
      }
      
      // Step 1: Generate Vision Statement (fast, no streaming needed)
      updateStepStatus('brief', 'active', 'Generating Vision Statement...');
      
      const briefResponse = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses: processedResponses }),
      });

      if (!briefResponse.ok) {
        const errorData = await briefResponse.json().catch(() => ({}));
        console.error('Vision Statement generation failed:', errorData);
        updateStepStatus('brief', 'error', errorData.error || 'Failed to generate Vision Statement');
        throw new Error(`Failed to generate Vision Statement: ${errorData.error || 'Unknown error'}`);
      }

      const briefResult = await briefResponse.json();
      updateStepStatus('brief', 'complete', 'Vision Statement generated successfully');
      
      // Track generation
      trackGeneration('vision_statement', !isSignedIn);
      
      // Store Vision Statement data for SOS page
      sessionStorage.setItem('lastGeneratedBrief', JSON.stringify(briefResult));
      console.log('✅ Vision Statement saved to session storage');
      
      // Save Vision Statement to database for signed-in users
      if (isSignedIn) {
        try {
          const saveResponse = await fetch('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'vision_statement',
              title: `Vision Statement - ${new Date().toLocaleDateString()}`,
              contentJson: {
                founderBriefMd: briefResult.founderBriefMd,
                vcSummaryMd: briefResult.vcSummaryMd,
                runwayMonths: briefResult.runwayMonths,
                responses: processedResponses
              },
              metadata: {
                generatedAt: new Date().toISOString()
              }
            })
          });
          
          if (saveResponse.ok) {
            const { document } = await saveResponse.json();
            console.log('✅ Vision Statement saved to database:', document.id);
            // Store document ID for later updates
            sessionStorage.setItem('currentDocumentId', document.id);
          }
        } catch (error) {
          console.error('⚠️ Failed to save to database:', error);
          // Don't block the flow if database save fails
        }
      }
      
      // Skip framework generation for anonymous users (freemium model)
      if (!isSignedIn) {
        console.log('⚠️ Anonymous user - skipping framework generation');
        
        // Mark remaining steps as skipped/locked
        updateStepStatus('research', 'complete', 'Sign up to unlock research insights');
        updateStepStatus('framework', 'complete', 'Sign up to unlock full framework');
        updateStepStatus('validation', 'complete', 'Sign up to unlock validation');
        updateStepStatus('onepager', 'complete', 'Sign up to unlock executive summary');
        updateStepStatus('qa', 'complete', 'Sign up to unlock quality checks');
        updateStepStatus('scoring', 'complete', 'Sign up to unlock scoring');
        
        // Return only Vision Statement for anonymous users
        const anonymousResult = {
          ...briefResult,
          responses: responses as PromptInput,
          isAnonymous: true, // Flag for results page
          visionFramework: null
        };
        
        // Store Vision Statement in session
        sessionStorage.setItem('lastGeneratedBrief', JSON.stringify(anonymousResult));
        
        // ADDED: Create basic Vision Framework draft for anonymous users
        // This allows them to access the Vision Framework page without full framework generation
        const visionPurpose = processedResponses.vision_purpose || '';
        const visionEndstate = processedResponses.vision_endstate || '';
        const combinedVision = visionPurpose && visionEndstate 
          ? `${visionPurpose}\n\n${visionEndstate}` 
          : visionPurpose || visionEndstate || 'Define your vision';
        
        // Extract structured data from wizard responses
        const strategyItems = [];
        if (processedResponses.vision_audience_timing) {
          strategyItems.push(`Focus: ${processedResponses.vision_audience_timing.substring(0, 250)}`);
        }
        if (processedResponses.required_capabilities) {
          strategyItems.push(`Build: ${processedResponses.required_capabilities.substring(0, 250)}`);
        }
        
        const operatingPrinciples = [];
        if (processedResponses.core_principles) {
          const principles = processedResponses.core_principles.split(/[.\n]/).filter((p: string) => p.trim().length > 10);
          operatingPrinciples.push(...principles.slice(0, 5).map((p: string) => p.trim()));
        }
        
        const nearTermBets = [];
        if (processedResponses.hard_decisions) {
          nearTermBets.push({
            bet: processedResponses.hard_decisions.substring(0, 200),
            owner: 'Team',
            horizon: 'Q2' as const,
            measure: 'Decision made and executed'
          });
        }
        
        const metrics = [];
        if (processedResponses.success_definition) {
          metrics.push({
            name: 'Success Criteria',
            target: processedResponses.success_definition.substring(0, 100),
            cadence: 'quarterly' as const
          });
        }
        
        const tensions = [];
        // Extract tensions from hard decisions (trade-offs and conflicts)
        if (processedResponses.hard_decisions) {
          const decisionsText = processedResponses.hard_decisions;
          // Look for question marks, "or", "vs", "but" - indicators of tensions
          const tensionIndicators = decisionsText.split(/[?.!]/).filter((s: string) => 
            s.length > 20 && (s.includes(' or ') || s.includes(' vs ') || s.includes(' but '))
          );
          if (tensionIndicators.length > 0) {
            tensions.push(...tensionIndicators.slice(0, 3).map((t: string) => t.trim()));
          }
        }
        // Add tension from current state vs. vision gap
        if (processedResponses.current_state && visionEndstate) {
          tensions.push('Gap: Current capabilities vs. vision execution requirements');
        }
        
        const basicFrameworkDraft = {
          framework: {
            companyId: 'demo-company',
            updatedAt: new Date().toISOString(),
            vision: combinedVision,
            strategy: strategyItems,
            operating_principles: operatingPrinciples.length > 0 ? operatingPrinciples : ['Define your operating principles'],
            near_term_bets: nearTermBets,
            metrics: metrics,
            tensions: tensions.length > 0 ? tensions : ['Run Quality Assessment to identify tensions']
          },
          originalResponses: processedResponses,
          metadata: {
            isAnonymous: true,
            createdAt: new Date().toISOString()
          }
        };
        sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(basicFrameworkDraft));
        console.log('✅ Structured Vision Framework draft created for anonymous user with', strategyItems.length, 'strategy items,', operatingPrinciples.length, 'principles');
        
        if (onGenerated) {
          onGenerated(anonymousResult);
        } else {
          // Navigate to results page
          router.push('/results');
        }
        return; // Exit early
      }
      
      // Step 2: Generate framework with streaming (signed-in users only)
      console.log('🚀 Starting framework generation with streaming...');
      
      const frameworkResponse = await fetch('/api/vision-framework-v2/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          companyId: 'demo-company',
          responses: processedResponses 
        }),
      });

      if (!frameworkResponse.ok) {
        const errorData = await frameworkResponse.json().catch(() => ({}));
        console.error('Framework generation failed:', errorData);
        updateStepStatus('framework', 'error', errorData.error || 'Failed to generate framework');
        throw new Error(`Failed to generate framework: ${errorData.error || 'Unknown error'}`);
      }

      // Consume the stream
      let frameworkResult: any = null;
      
      for await (const event of consumeSSEStream(frameworkResponse)) {
        console.log('📡 Stream event:', event);
        
        if (event.type === 'step_start') {
          updateStepStatus(event.step!, 'active', event.message);
        } else if (event.type === 'step_complete') {
          updateStepStatus(event.step!, 'complete', event.message, event.duration);
          
          // Store partial results
          if (event.step === 'framework' && event.data) {
            frameworkResult = { framework: event.data };
          } else if (event.step === 'onepager' && event.data) {
            frameworkResult = { ...frameworkResult, executiveOnePager: event.data };
          } else if (event.step === 'qa' && event.data) {
            if (!frameworkResult.metadata) frameworkResult.metadata = {};
            frameworkResult.metadata.qaChecks = event.data;
          } else if (event.step === 'scoring' && event.data) {
            if (!frameworkResult.metadata) frameworkResult.metadata = {};
            frameworkResult.metadata.qualityScores = event.data;
          }
        } else if (event.type === 'step_error') {
          updateStepStatus(event.step!, 'error', event.message);
          throw new Error(event.message || 'Unknown error during generation');
        } else if (event.type === 'complete') {
          // Final data with all results
          frameworkResult = event.data;
          console.log('✅ Framework generation complete!', frameworkResult);
        } else if (event.type === 'error') {
          throw new Error(event.message || 'Unknown error');
        }
      }

      if (!frameworkResult || !frameworkResult.framework) {
        throw new Error('No framework data received from stream');
      }

      // Store framework in session storage
      const qualityScores = frameworkResult.metadata?.qualityScores || {};
      
      const frameworkDraftData = {
        framework: frameworkResult.framework,
        executiveOnePager: frameworkResult.executiveOnePager,
        metadata: frameworkResult.metadata,
        qualityScores: qualityScores,
        fromBrief: true,
        autoFilledFields: Object.keys(frameworkResult.framework),
        originalResponses: responses,
        generatedAt: new Date().toISOString(),
        refinementHistory: []
      };
      sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(frameworkDraftData));
      console.log('✅ Framework saved to session storage');
      console.log('📚 Research citations in metadata:', frameworkResult.metadata?.researchCitations?.length || 0);
      
      // Save Vision Framework to database
      try {
        const saveResponse = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'vision_framework_v2',
            title: `Vision Framework - ${new Date().toLocaleDateString()}`,
            contentJson: {
              framework: frameworkResult.framework,
              executiveOnePager: frameworkResult.executiveOnePager,
              originalResponses: responses
            },
            metadata: {
              ...frameworkResult.metadata,
              qualityScores: qualityScores,
              generatedAt: new Date().toISOString()
            }
          })
        });
        
        if (saveResponse.ok) {
          const { document } = await saveResponse.json();
          console.log('✅ Vision Framework saved to database:', document.id);
          sessionStorage.setItem('currentFrameworkId', document.id);
        }
      } catch (error) {
        console.error('⚠️ Failed to save framework to database:', error);
      }
      
      // Analytics
      const qualityValues = Object.values(qualityScores);
      const avgQuality = qualityValues.length > 0
        ? qualityValues.reduce((sum: number, section: any) => sum + (section.overallScore || 0), 0) / qualityValues.length
        : 0;
      
      console.log('📊 ANALYTICS:', {
        event: 'framework_generated',
        avgQualityScore: avgQuality.toFixed(2),
        sectionsGenerated: Object.keys(frameworkResult.framework).length,
        sectionsWithScores: qualityValues.length,
        timestamp: new Date().toISOString()
      });
      
      // Combine both results (signed-in users)
      const combinedResult = {
        ...briefResult,
        visionFramework: frameworkResult.framework,
        responses: responses as PromptInput,
        isAnonymous: false
      }
      
      // Store in session and redirect
      sessionStorage.setItem('lastGeneratedBrief', JSON.stringify(combinedResult));
      
      if (onGenerated) {
        onGenerated(combinedResult);
      } else {
        // Navigate to vision framework page (signed-in users get full framework)
        router.push('/vision-framework-v2');
      }

    } catch (error) {
      console.error('Error generating content:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
      setActiveGenerationStep('');
    }
  }

  const currentPrompt = PROMPT_STEPS[currentStep]
  // Progress starts at 0% and fills as steps are completed
  const progress = (currentStep / PROMPT_STEPS.length) * 100

  return (
    <>
      <GenerationProgressModal 
        isOpen={isSubmitting}
        currentStep={activeGenerationStep}
        steps={generationSteps}
      />
      
      <SoftSignupModal
        isOpen={showSoftSignup}
        currentStep={currentStep}
        onClose={() => {
          setShowSoftSignup(false);
          trackSignupTouchpoint('soft_wizard', 'dismissed');
        }}
      />
      
      <PreGenerationSignupModal
        isOpen={showPreGenerationSignup}
        currentStep={currentStep}
        onClose={() => {
          setShowPreGenerationSignup(false);
          trackSignupTouchpoint('pre_generation', 'dismissed');
        }}
        onContinue={() => {
          handleSubmit();
          trackSignupTouchpoint('pre_generation', 'dismissed');
        }}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Onboarding Message (only show on step 0) */}
      {currentStep === 0 && (
        <div className="mb-6 rounded-xl border border-banyan-border-default p-4 bg-banyan-bg-surface/50">
          <h2 className="text-lg font-semibold text-banyan-text-default mb-2">Turn vision into structure.</h2>
          <p className="text-sm text-banyan-text-subtle">
            Answer a few guided prompts to generate a strategic brief that connects intent to action—vision, framework, and next steps in one place.
          </p>
        </div>
      )}

      {/* Autosave Banner */}
      <div className="mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-banyan-success/10 border border-banyan-success/30 rounded-lg">
        <svg className="w-4 h-4 text-banyan-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium text-banyan-text-default">
          Your answers are saved locally
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-banyan-text-default">
            Step {currentStep + 1} of {PROMPT_STEPS.length}
          </span>
          <span className="text-sm text-banyan-text-subtle">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-banyan-border-default rounded-full h-2">
          <div 
            className="bg-banyan-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Load Example Button (dev only) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-6 text-center">
          <button
            onClick={loadTestData}
            className="px-4 py-2 bg-banyan-success hover:bg-banyan-success/80 text-banyan-primary-contrast text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Load Example
          </button>
          <p className="text-xs text-banyan-text-subtle mt-1">
            Auto-fills all fields with sample data to see how it works
          </p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-banyan-bg-surface rounded-2xl border border-banyan-border-default p-8 mb-8 shadow-banyan-mid">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-banyan-text-default mb-3">
            {currentPrompt.title}
          </h2>
          <p className="text-banyan-text-subtle text-lg">
            {currentPrompt.description}
          </p>
        </div>

        <textarea
          value={responses[currentPrompt.field as keyof PromptInput] as string || ''}
          onChange={(e) => handleResponseChange(currentPrompt.field as keyof PromptInput, e.target.value)}
          placeholder={currentPrompt.placeholder}
          className="w-full px-6 py-4 bg-banyan-bg-base border border-banyan-border-default rounded-lg focus:ring-2 focus:ring-banyan-primary focus:border-banyan-primary transition-colors duration-200 resize-none h-96 text-banyan-text-default placeholder:text-banyan-text-subtle"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="btn-banyan-ghost disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {currentStep < PROMPT_STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            className="btn-banyan-primary"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleInitiateGeneration}
            disabled={isSubmitting}
            className="btn-banyan-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Generating Vision Statement...' : 'Generate Vision Statement'}
          </button>
        )}
      </div>
    </div>
    </>
  )
}

