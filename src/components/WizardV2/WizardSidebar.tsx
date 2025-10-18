'use client'

import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import { PROMPT_STEPS } from '@/lib/templates'

type Props = {
  currentStep: number
  completedSteps: Set<number>
  onStepClick: (step: number) => void
  focusMode: boolean
}

export default function WizardSidebar({ 
  currentStep, 
  completedSteps, 
  onStepClick, 
  focusMode 
}: Props) {
  const progress = (completedSteps.size / PROMPT_STEPS.length) * 100

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`
        w-80 h-full flex flex-col border-r
        ${focusMode 
          ? 'bg-black border-[#4ade80]/30' 
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
        }
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-inherit">
        <h2 className={`
          text-sm font-semibold uppercase tracking-wider mb-4
          ${focusMode ? 'text-[#4ade80]' : 'text-neutral-900 dark:text-white'}
        `}>
          Your Journey
        </h2>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className={focusMode ? 'text-[#4ade80]/70' : 'text-neutral-600 dark:text-neutral-400'}>
              {completedSteps.size} of {PROMPT_STEPS.length}
            </span>
            <span className={focusMode ? 'text-[#4ade80]/70' : 'text-neutral-600 dark:text-neutral-400'}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className={`
            h-2 rounded-full overflow-hidden
            ${focusMode ? 'bg-[#4ade80]/20' : 'bg-neutral-200 dark:bg-neutral-800'}
          `}>
            <motion.div
              className={focusMode ? 'h-full bg-[#4ade80]' : 'h-full bg-banyan-primary'}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {PROMPT_STEPS.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = completedSteps.has(index)
          
          return (
            <motion.button
              key={step.id}
              onClick={() => onStepClick(index)}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full text-left p-4 rounded-lg transition-all duration-200 group
                ${isActive 
                  ? focusMode
                    ? 'bg-[#4ade80]/10 border-2 border-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                    : 'bg-banyan-primary/10 border-2 border-banyan-primary'
                  : isCompleted
                    ? focusMode
                      ? 'bg-[#4ade80]/5 border border-[#4ade80]/30'
                      : 'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700'
                    : focusMode
                      ? 'border border-[#4ade80]/20 hover:border-[#4ade80]/40 hover:bg-[#4ade80]/5'
                      : 'border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5
                  ${isCompleted
                    ? focusMode
                      ? 'bg-[#4ade80] text-black'
                      : 'bg-banyan-success text-white'
                    : isActive
                      ? focusMode
                        ? 'bg-[#4ade80] text-black'
                        : 'bg-banyan-primary text-white'
                      : focusMode
                        ? 'bg-[#4ade80]/20 text-[#4ade80]'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }
                `}>
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <Circle size={8} fill="currentColor" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`
                    text-xs font-medium mb-1
                    ${focusMode ? 'text-[#4ade80]/70' : 'text-neutral-500 dark:text-neutral-400'}
                  `}>
                    Step {index + 1}
                  </div>
                  <div className={`
                    text-sm font-medium leading-tight
                    ${isActive
                      ? focusMode
                        ? 'text-[#4ade80]'
                        : 'text-banyan-primary dark:text-white'
                      : isCompleted
                        ? focusMode
                          ? 'text-[#4ade80]/90'
                          : 'text-neutral-900 dark:text-neutral-100'
                        : focusMode
                          ? 'text-[#4ade80]/60'
                          : 'text-neutral-700 dark:text-neutral-300'
                    }
                  `}>
                    {step.title}
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </nav>

      {/* Footer Tip */}
      <div className={`
        p-4 border-t border-inherit
        ${focusMode ? 'bg-black' : 'bg-neutral-50 dark:bg-neutral-800/50'}
      `}>
        <p className={`
          text-xs
          ${focusMode ? 'text-[#4ade80]/70' : 'text-neutral-600 dark:text-neutral-400'}
        `}>
          💡 <span className="font-medium">Tip:</span> Jump between questions freely
        </p>
      </div>
    </motion.aside>
  )
}

