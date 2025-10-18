'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, FileText } from 'lucide-react'
import { PromptInput } from '@/lib/types'

type Props = {
  responses: Partial<PromptInput>
  focusMode: boolean
}

export default function LivePreviewPanel({ responses, focusMode }: Props) {
  // Generate live preview sections
  const sections = [
    {
      key: 'vision',
      title: 'Vision & Opportunity',
      icon: '🎯',
      content: responses.vision_audience_timing,
      show: !!responses.vision_audience_timing
    },
    {
      key: 'decisions',
      title: 'Strategic Tensions',
      icon: '⚖️',
      content: responses.hard_decisions,
      show: !!responses.hard_decisions
    },
    {
      key: 'success',
      title: 'Success Definition',
      icon: '📈',
      content: responses.success_definition,
      show: !!responses.success_definition
    },
    {
      key: 'principles',
      title: 'Core Principles',
      icon: '⚡',
      content: responses.core_principles,
      show: !!responses.core_principles
    },
    {
      key: 'capabilities',
      title: 'Required Capabilities',
      icon: '🔧',
      content: responses.required_capabilities,
      show: !!responses.required_capabilities
    },
    {
      key: 'state',
      title: 'Current State',
      icon: '📊',
      content: responses.current_state,
      show: !!responses.current_state
    },
    {
      key: 'vision_combined',
      title: 'Vision Statement',
      icon: '✨',
      content: responses.vision_combined,
      show: !!responses.vision_combined
    }
  ].filter(s => s.show)

  const hasContent = sections.length > 0

  return (
    <motion.aside
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`
        w-96 h-full flex flex-col border-l
        ${focusMode 
          ? 'bg-black border-[#4ade80]/30' 
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
        }
      `}
    >
      {/* Header */}
      <div className={`
        p-6 border-b border-inherit
        ${focusMode ? 'bg-black' : 'bg-neutral-50 dark:bg-neutral-800/50'}
      `}>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className={focusMode ? 'text-[#4ade80]' : 'text-banyan-primary'} size={24} />
          <h2 className={`
            text-lg font-semibold
            ${focusMode ? 'text-[#4ade80]' : 'text-neutral-900 dark:text-white'}
          `}>
            Live Preview
          </h2>
        </div>
        <p className={`
          text-xs
          ${focusMode ? 'text-[#4ade80]/70' : 'text-neutral-600 dark:text-neutral-400'}
        `}>
          Watch your framework take shape
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!hasContent ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <FileText 
              className={`mb-4 ${focusMode ? 'text-[#4ade80]/20' : 'text-neutral-300 dark:text-neutral-700'}`} 
              size={64} 
            />
            <p className={`
              text-sm
              ${focusMode ? 'text-[#4ade80]/70' : 'text-neutral-600 dark:text-neutral-400'}
            `}>
              Your document will build here as you answer…
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {sections.map((section, index) => (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  className={`
                    p-4 rounded-lg border
                    ${focusMode 
                      ? 'bg-[#4ade80]/5 border-[#4ade80]/30' 
                      : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{section.icon}</span>
                    <h3 className={`
                      text-sm font-semibold
                      ${focusMode ? 'text-[#4ade80]' : 'text-neutral-900 dark:text-white'}
                    `}>
                      {section.title}
                    </h3>
                  </div>
                  <div className={`
                    text-xs leading-relaxed whitespace-pre-wrap
                    ${focusMode ? 'text-[#4ade80]/70 font-mono' : 'text-neutral-600 dark:text-neutral-400'}
                  `}>
                    {section.content && section.content.length > 300 
                      ? section.content.substring(0, 300) + '...' 
                      : section.content
                    }
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`
        p-4 border-t border-inherit
        ${focusMode ? 'bg-black' : 'bg-neutral-50 dark:bg-neutral-800/50'}
      `}>
        <div className="flex items-center justify-between">
          <span className={`
            text-xs
            ${focusMode ? 'text-[#4ade80]/70' : 'text-neutral-600 dark:text-neutral-400'}
          `}>
            {sections.length} section{sections.length !== 1 ? 's' : ''} drafted
          </span>
          <div className={`
            px-2 py-1 rounded text-xs font-medium
            ${focusMode 
              ? 'bg-[#4ade80]/20 text-[#4ade80]' 
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }
          `}>
            Live
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

