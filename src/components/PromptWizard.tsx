'use client'

import { useState, useEffect } from 'react'
import { PROMPT_STEPS } from '@/lib/templates'
import { PromptInput, BriefOutput } from '@/lib/types'

interface PromptWizardProps {
  onGenerated: (result: BriefOutput & { responses?: PromptInput }) => void;
}

export default function PromptWizard({ onGenerated }: PromptWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Partial<PromptInput>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadTestData = () => {
    const testData = {
      stage: "early_traction" as const,
      problem_now: "Material deliveries to urban job sites are late/misplaced ~30% of the time, stalling crews and burning budget.",
      why_now: "Cities are tightening curb access + contractors are moving to software-first scheduling. APIs + telematics are finally standardized.",
      solution: "A dynamic dispatch layer that ingests PO data, traffic, and crane/lift windows, then auto-routes box trucks and schedules curb permits. Mobile app for foremen to time-stamp drop zones; chargebacks auto-logged to vendors.",
      customer_gtm: "Mid-market GCs (50–500 employees) in NYC/Chicago/LA. Buyer = Ops Director; users = site supers + vendor drivers.",
      traction_proud: "2 paid pilots (GCs doing $200M/yr rev). 18 active sites; 1,240 drops coordinated; 27% fewer idle crew hours; NRR 118% on pilot add-ons.",
      milestone_6mo: "Scale to 50 active sites across 3 metros, achieve $500K ARR, and launch mobile app for foremen",
      cash_on_hand: 500000,
      monthly_burn: 25000,
      risky_assumption: "Contractors will adopt new scheduling software and vendors will comply with dynamic routing requirements."
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

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // First generate the vision framework
      const spineResponse = await fetch('/api/vision-framework/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          companyId: 'demo-company',
          responses 
        }),
      })

      if (!spineResponse.ok) {
        throw new Error('Failed to generate vision framework')
      }

      // Then generate the traditional briefs
      const briefResponse = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      })

      if (!briefResponse.ok) {
        throw new Error('Failed to generate brief')
      }

      const briefResult = await briefResponse.json()
      const frameworkResult = await spineResponse.json()
      
      // Combine both results
      const combinedResult = {
        ...briefResult,
        visionFramework: frameworkResult.framework,
        responses: responses as PromptInput
      }
      
      onGenerated(combinedResult)
    } catch (error) {
      console.error('Error generating brief:', error)
      setIsSubmitting(false)
    }
  }

  const currentPrompt = PROMPT_STEPS[currentStep]
  const progress = ((currentStep + 1) / PROMPT_STEPS.length) * 100

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">
            Step {currentStep + 1} of {PROMPT_STEPS.length}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Load Test Data Button */}
      <div className="mb-6 text-center">
        <button
          onClick={loadTestData}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          🚀 Load Test Data (YardBird)
        </button>
        <p className="text-xs text-gray-400 mt-1">
          Auto-fills all fields with sample construction logistics startup data
        </p>
      </div>

      {/* Step Content */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 mb-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">
            {currentPrompt.title}
          </h2>
          <p className="text-gray-300 text-lg">
            {currentPrompt.description}
          </p>
        </div>

        <textarea
          value={responses[currentPrompt.field as keyof PromptInput] as string || ''}
          onChange={(e) => handleResponseChange(currentPrompt.field as keyof PromptInput, e.target.value)}
          placeholder={currentPrompt.placeholder}
          className="w-full px-6 py-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none h-96 text-white placeholder-gray-400"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="rounded-lg border border-gray-600 px-6 py-3 text-gray-300 hover:text-white hover:border-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {currentStep < PROMPT_STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-medium transition-colors duration-200"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Generating Brief...' : 'Generate Brief'}
          </button>
        )}
      </div>
    </div>
  )
}

