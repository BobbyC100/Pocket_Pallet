'use client'

import { useState, useEffect } from 'react'
import { PROMPT_STEPS } from '@/lib/templates'
import { PromptInput, BriefOutput } from '@/lib/types'
import GenerationProgressModal from '@/components/GenerationProgressModal'

interface PromptWizardProps {
  onGenerated: (result: BriefOutput & { responses?: PromptInput }) => void;
}

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
  estimatedSeconds: number;
}

export default function PromptWizard({ onGenerated }: PromptWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Partial<PromptInput>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    { id: 'framework', label: 'Generating Vision Framework', status: 'pending', estimatedSeconds: 2 },
    { id: 'brief', label: 'Generating Founder Brief & VC Summary', status: 'pending', estimatedSeconds: 18 }
  ])
  const [activeGenerationStep, setActiveGenerationStep] = useState('')

  const loadTestData = () => {
    const testData = {
      stage: "early_traction" as const,
      vision_audience_timing: "We're building a dynamic dispatch layer for mid-market construction contractors (50-500 employees in NYC, Chicago, LA) who lose 30% of crew time to delivery delays. Right now, cities are tightening curb access and contractors are moving to software-first scheduling. APIs and telematics are finally standardized, making real-time coordination possible.",
      hard_decisions: "Should we build horizontally across all construction trades or go deep with general contractors first? Do we hire a VP of Sales now or wait until we hit $500K ARR? And how do we balance driver compliance with vendor relationships — we can't control every truck.",
      success_definition: "Financially: Build a $100M+ revenue business with 70%+ gross margins and become the default logistics layer for construction. Culturally: Build a team where operators feel ownership, where safety is never compromised, and where we're radically transparent about delays with customers.",
      core_principles: "Safety first, always — no delivery is worth a workplace injury. Speed without shortcuts — we move fast but never cut corners on quality. Earn trust through transparency — if there's a delay, customers hear it from us first, with a plan.",
      required_capabilities: "Real-time routing algorithms that account for traffic, crane windows, and permit schedules. Mobile app for foremen to coordinate drops and confirm deliveries. API integrations with Procore, Autodesk, and major construction software. Sales team that understands operations, not just software.",
      current_state: "3 co-founders: ex-Procore PM (10 years in construction tech), ex-Uber Freight ops lead (scaled logistics from 10 to 100 cities), and CTO (MIT, built routing systems at scale). 2 paid pilot customers (GCs doing $200M+/year). 18 active sites, 1,240 drops coordinated, 27% reduction in idle crew hours. $500K cash, $25K monthly burn, 20 months runway.",
      vision_purpose: "Eliminate construction site delivery delays that waste time, money, and momentum",
      vision_endstate: "A world where every construction site receives materials exactly when and where needed, eliminating costly delays and improving project efficiency across the entire industry"
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
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateStepStatus = (stepId: string, status: 'pending' | 'active' | 'complete') => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
    if (status === 'active') {
      setActiveGenerationStep(stepId);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Reset steps - both run in parallel now
    setGenerationSteps([
      { id: 'brief', label: 'Generating Founder Brief & VC Summary', status: 'pending', estimatedSeconds: 12 },
      { id: 'framework', label: 'Generating Vision Framework', status: 'pending', estimatedSeconds: 30 }
    ]);

    try {
      // Start both generations in parallel
      updateStepStatus('framework', 'active');
      updateStepStatus('brief', 'active');
      
      console.log('🚀 Starting parallel generation of Brief + Vision Framework...');
      
      const [briefResponse, spineResponse] = await Promise.all([
        fetch('/api/generate-brief', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ responses }),
        }),
        fetch('/api/vision-framework/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            companyId: 'demo-company',
            responses 
          }),
        })
      ]);

      // Check responses
      if (!briefResponse.ok) {
        const errorData = await briefResponse.json().catch(() => ({}));
        console.error('Brief generation failed:', errorData);
        throw new Error(`Failed to generate brief: ${errorData.error || 'Unknown error'}`);
      }
      
      if (!spineResponse.ok) {
        const errorData = await spineResponse.json().catch(() => ({}));
        console.error('Vision framework generation failed:', errorData);
        throw new Error(`Failed to generate vision framework: ${errorData.error || 'Unknown error'}`);
      }

      // Parse results
      const briefResult = await briefResponse.json();
      const frameworkResult = await spineResponse.json();
      
      updateStepStatus('brief', 'complete');
      updateStepStatus('framework', 'complete');
      
      console.log('✅ Both brief and framework generated successfully!');
      console.log('📦 Full framework result:', frameworkResult);
      console.log('📊 Framework data:', frameworkResult.framework);
      console.log('🔍 Framework keys:', frameworkResult.framework ? Object.keys(frameworkResult.framework) : 'NO FRAMEWORK');
      
      // Store framework in session storage for VisionFrameworkPage
      if (frameworkResult.framework) {
        // Extract quality scores from metadata
        const qualityScores = frameworkResult.metadata?.qualityScores || {};
        
        console.log('📊 Extracted quality scores:', qualityScores);
        console.log('📊 Quality scores keys:', Object.keys(qualityScores));
        
        const frameworkDraftData = {
          framework: frameworkResult.framework,
          executiveOnePager: frameworkResult.executiveOnePager,
          metadata: frameworkResult.metadata,
          qualityScores: qualityScores, // Store at top level for easy access
          fromBrief: true,
          autoFilledFields: Object.keys(frameworkResult.framework),
          originalResponses: responses, // Store for refinement
          generatedAt: new Date().toISOString(),
          refinementHistory: [] // Initialize empty history
        };
        sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(frameworkDraftData));
        console.log('✅ Framework saved to session storage with quality scores');
        console.log('✅ Quality scores available:', Object.keys(qualityScores).length > 0);
        
        // Analytics: Track framework generation
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
      }
      
      // Store brief data for SOS page
      sessionStorage.setItem('lastGeneratedBrief', JSON.stringify(briefResult));
      console.log('✅ Brief saved to session storage');
      
      // Combine both results
      const combinedResult = {
        ...briefResult,
        visionFramework: frameworkResult.framework,
        responses: responses as PromptInput
      }
      
      onGenerated(combinedResult)
    } catch (error) {
      console.error('Error generating brief:', error)
      alert(`Error generating brief: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
      setActiveGenerationStep('');
    }
  }

  const currentPrompt = PROMPT_STEPS[currentStep]
  const progress = ((currentStep + 1) / PROMPT_STEPS.length) * 100

  return (
    <>
      <GenerationProgressModal 
        isOpen={isSubmitting}
        currentStep={activeGenerationStep}
        steps={generationSteps}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
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

      {/* Load Test Data Button */}
      <div className="mb-6 text-center">
        <button
          onClick={loadTestData}
          className="px-4 py-2 bg-banyan-success hover:bg-banyan-success/80 text-banyan-primary-contrast text-sm font-medium rounded-lg transition-colors duration-200"
        >
          Load Test Data (YardBird)
        </button>
        <p className="text-xs text-banyan-text-subtle mt-1">
          Auto-fills all fields with sample construction logistics startup data
        </p>
      </div>

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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-banyan-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Generating Brief...' : 'Generate Brief'}
          </button>
        )}
      </div>
    </div>
    </>
  )
}

