'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { PROMPT_STEPS } from '@/lib/templates'
import { PromptInput } from '@/lib/types'
import WizardSidebar from './WizardSidebar'
import LivePreviewPanel from './LivePreviewPanel'
import GenerationProgressModal from '../GenerationProgressModal'

const WIZARD_STATE_KEY = 'banyan_wizard_v2_state'

interface WizardState {
  currentStep: number
  responses: Partial<PromptInput>
  completedSteps: number[]
  focusMode: boolean
  lastSaved: string
}

export default function PromptWizardV2() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Partial<PromptInput>>({})
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [focusMode, setFocusMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stateRestored, setStateRestored] = useState(false)

  // Restore state from localStorage
  useEffect(() => {
    if (stateRestored) return
    
    try {
      const saved = localStorage.getItem(WIZARD_STATE_KEY)
      if (saved) {
        const state: WizardState = JSON.parse(saved)
        setCurrentStep(state.currentStep || 0)
        setResponses(state.responses || {})
        setCompletedSteps(new Set(state.completedSteps || []))
        setFocusMode(state.focusMode || false)
        console.log('✅ Wizard state restored')
      }
    } catch (error) {
      console.error('Failed to restore wizard state:', error)
    }
    
    setStateRestored(true)
  }, [stateRestored])

  // Auto-save state
  useEffect(() => {
    if (!stateRestored) return
    
    const state: WizardState = {
      currentStep,
      responses,
      completedSteps: Array.from(completedSteps),
      focusMode,
      lastSaved: new Date().toISOString()
    }
    
    localStorage.setItem(WIZARD_STATE_KEY, JSON.stringify(state))
  }, [currentStep, responses, completedSteps, focusMode, stateRestored])

  const currentPrompt = PROMPT_STEPS[currentStep]
  const currentValue = responses[currentPrompt.field as keyof PromptInput] as string || ''

  const handleResponseChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentPrompt.field]: value
    }))

    // Mark step as completed if there's content
    if (value.trim().length > 20) {
      setCompletedSteps(prev => new Set(prev).add(currentStep))
    }
  }

  const handleStepClick = (step: number) => {
    setCurrentStep(step)
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

  const handleGenerate = async () => {
    // Navigate to generation (keep existing logic from PromptWizard)
    router.push('/results')
  }

  const isLastStep = currentStep === PROMPT_STEPS.length - 1
  const canGenerate = completedSteps.size >= 5 // At least 5 questions answered

  return (
    <div className={`
      fixed inset-0 flex
      ${focusMode ? 'bg-black' : 'bg-neutral-50 dark:bg-neutral-900'}
    `}>
      {/* Left Panel - Navigation */}
      <WizardSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        focusMode={focusMode}
      />

      {/* Center Panel - Input Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header with Focus Mode Toggle */}
        <div className={`
          flex items-center justify-between px-8 py-4 border-b
          ${focusMode 
            ? 'bg-black border-[#4ade80]/30' 
            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
          }
        `}>
          <div className="flex items-center gap-3">
            <Sparkles className={focusMode ? 'text-[#4ade80]' : 'text-banyan-primary'} size={24} />
            <h1 className={`
              text-lg font-semibold
              ${focusMode ? 'text-[#4ade80]' : 'text-neutral-900 dark:text-white'}
            `}>
              Vision Framework Builder
            </h1>
          </div>

          {/* Focus Mode Toggle */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
              ${focusMode
                ? 'bg-[#4ade80] text-black hover:bg-[#4ade80]/90'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
              }
            `}
          >
            <Monitor size={16} />
            <span className="text-sm font-medium">
              {focusMode ? '🖥 Focus Mode' : 'Focus Mode'}
            </span>
          </button>
        </div>

        {/* Question Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Progress Indicator */}
                <div className={`
                  text-sm mb-4
                  ${focusMode ? 'text-[#4ade80]/70 font-mono' : 'text-neutral-600 dark:text-neutral-400'}
                `}>
                  Step {currentStep + 1} of {PROMPT_STEPS.length}
                </div>

                {/* Question */}
                <h2 className={`
                  text-3xl font-bold mb-4
                  ${focusMode ? 'text-[#4ade80]' : 'text-neutral-900 dark:text-white'}
                `}>
                  {currentPrompt.title}
                </h2>

                <p className={`
                  text-lg mb-8
                  ${focusMode ? 'text-[#4ade80]/70' : 'text-neutral-600 dark:text-neutral-400'}
                `}>
                  {currentPrompt.description}
                </p>

                {/* Textarea */}
                <textarea
                  value={currentValue}
                  onChange={(e) => handleResponseChange(e.target.value)}
                  placeholder={currentPrompt.placeholder}
                  className={`
                    w-full min-h-[400px] p-6 rounded-lg border-2 transition-all duration-200 resize-none
                    ${focusMode
                      ? 'bg-black border-[#4ade80]/30 text-[#4ade80] placeholder-[#4ade80]/30 font-mono focus:border-[#4ade80] focus:shadow-[0_0_20px_rgba(74,222,128,0.2)]'
                      : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-banyan-primary focus:ring-2 focus:ring-banyan-primary/20'
                    }
                  `}
                  autoFocus
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer - Navigation */}
        <div className={`
          flex items-center justify-between px-8 py-4 border-t
          ${focusMode 
            ? 'bg-black border-[#4ade80]/30' 
            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
          }
        `}>
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
              ${focusMode
                ? 'text-[#4ade80] hover:bg-[#4ade80]/10 disabled:text-[#4ade80]/30 disabled:hover:bg-transparent'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:text-neutral-400 disabled:hover:bg-transparent'
              }
              disabled:cursor-not-allowed
            `}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className={`
            text-sm
            ${focusMode ? 'text-[#4ade80]/70 font-mono' : 'text-neutral-600 dark:text-neutral-400'}
          `}>
            {Math.round((completedSteps.size / PROMPT_STEPS.length) * 100)}% Complete
          </div>

          {isLastStep && canGenerate ? (
            <button
              onClick={handleGenerate}
              disabled={isSubmitting}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200
                ${focusMode
                  ? 'bg-[#4ade80] text-black hover:bg-[#4ade80]/90 disabled:bg-[#4ade80]/30'
                  : 'bg-banyan-primary text-white hover:bg-banyan-primary/90 disabled:bg-neutral-300'
                }
                disabled:cursor-not-allowed
              `}
            >
              <Sparkles size={16} />
              <span>Generate Framework</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentStep === PROMPT_STEPS.length - 1}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                ${focusMode
                  ? 'text-[#4ade80] hover:bg-[#4ade80]/10 disabled:text-[#4ade80]/30 disabled:hover:bg-transparent'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:text-neutral-400 disabled:hover:bg-transparent'
                }
                disabled:cursor-not-allowed
              `}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </main>

      {/* Right Panel - Live Preview */}
      <LivePreviewPanel
        responses={responses}
        focusMode={focusMode}
      />
    </div>
  )
}

