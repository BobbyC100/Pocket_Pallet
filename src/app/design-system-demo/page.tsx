'use client';

import { banyanClasses } from '@/lib/design-tokens';
import ThemeToggle from '@/components/ThemeToggle';
import { useState } from 'react';

export default function DesignSystemDemo() {
  const [showAlert, setShowAlert] = useState<'success' | 'warning' | 'error' | 'info' | null>('success');

  return (
    <div className="min-h-screen bg-banyan-bg-base py-xxl">
      <div className="container-banyan">
        {/* Header with Theme Toggle */}
        <header className="mb-xxl">
          <div className="flex items-start justify-between gap-m mb-m">
            <div>
              <h1 className="text-display font-semibold text-banyan-text-default mb-m">
                Banyan Design System
              </h1>
              <p className="text-h3 text-banyan-text-subtle">
                v1.0 — Clarity, human potential, and meaningful progress
              </p>
            </div>
            <div className="flex flex-col items-end gap-xs">
              <ThemeToggle />
              <p className="text-caption text-banyan-text-subtle">
                Toggle theme
              </p>
            </div>
          </div>
          
          {/* Dark Mode Info */}
          <div className="alert-banyan alert-banyan-info mt-l">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              This design system supports both light and dark modes. Colors, shadows, and contrasts automatically adapt!
            </span>
          </div>
        </header>

        {/* Color Palette */}
        <section className="card-banyan mb-xl">
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-l">
            Color Palette
          </h2>
          
          <div className="space-y-l">
            {/* Brand Colors */}
            <div>
              <h3 className="text-h3 font-semibold text-banyan-text-default mb-m">
                Brand Colors
              </h3>
              <div className="grid grid-cols-2 gap-m">
                <div className="space-y-s">
                  <div className="h-24 bg-banyan-primary rounded-m flex items-center justify-center">
                    <span className="text-banyan-primary-contrast font-medium">Primary</span>
                  </div>
                  <p className="text-caption text-banyan-text-subtle">#1B4D3E</p>
                </div>
                <div className="space-y-s">
                  <div className="h-24 bg-banyan-primary-contrast border border-banyan-border-default rounded-m flex items-center justify-center">
                    <span className="text-banyan-text-default font-medium">Primary Contrast</span>
                  </div>
                  <p className="text-caption text-banyan-text-subtle">#F9FAF9</p>
                </div>
              </div>
            </div>

            {/* State Colors */}
            <div>
              <h3 className="text-h3 font-semibold text-banyan-text-default mb-m">
                State Colors
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-m">
                <div className="space-y-s">
                  <div className="h-20 bg-banyan-success rounded-m flex items-center justify-center">
                    <span className="text-white font-medium">Success</span>
                  </div>
                  <p className="text-caption text-banyan-text-subtle">#2FB57C</p>
                </div>
                <div className="space-y-s">
                  <div className="h-20 bg-banyan-warning rounded-m flex items-center justify-center">
                    <span className="text-white font-medium">Warning</span>
                  </div>
                  <p className="text-caption text-banyan-text-subtle">#FFB64C</p>
                </div>
                <div className="space-y-s">
                  <div className="h-20 bg-banyan-error rounded-m flex items-center justify-center">
                    <span className="text-white font-medium">Error</span>
                  </div>
                  <p className="text-caption text-banyan-text-subtle">#E45757</p>
                </div>
                <div className="space-y-s">
                  <div className="h-20 bg-banyan-info rounded-m flex items-center justify-center">
                    <span className="text-white font-medium">Info</span>
                  </div>
                  <p className="text-caption text-banyan-text-subtle">#4B91F1</p>
                </div>
              </div>
            </div>

            {/* Accent Colors */}
            <div>
              <h3 className="text-h3 font-semibold text-banyan-text-default mb-m">
                Accent Colors
              </h3>
              <div className="grid grid-cols-2 gap-m">
                <div className="space-y-s">
                  <div className="h-20 bg-banyan-sand rounded-m flex items-center justify-center">
                    <span className="text-banyan-text-default font-medium">Sand</span>
                  </div>
                  <p className="text-caption text-banyan-text-subtle">#F4EDE2</p>
                </div>
                <div className="space-y-s">
                  <div className="h-20 bg-banyan-mist rounded-m flex items-center justify-center">
                    <span className="text-banyan-text-default font-medium">Mist</span>
                  </div>
                  <p className="text-caption text-banyan-text-subtle">#E5EEF5</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="card-banyan mb-xl">
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-l">
            Typography
          </h2>
          
          <div className="space-y-l">
            <div>
              <p className="text-caption text-banyan-text-subtle mb-xs">Display (64px)</p>
              <h1 className="text-display font-semibold text-banyan-text-default">
                The quick brown fox
              </h1>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-xs">Heading 1 (48px)</p>
              <h1 className="text-h1 font-semibold text-banyan-text-default">
                The quick brown fox jumps
              </h1>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-xs">Heading 2 (32px)</p>
              <h2 className="text-h2 font-semibold text-banyan-text-default">
                The quick brown fox jumps over
              </h2>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-xs">Heading 3 (24px)</p>
              <h3 className="text-h3 font-semibold text-banyan-text-default">
                The quick brown fox jumps over the lazy dog
              </h3>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-xs">Body (18px)</p>
              <p className="text-body text-banyan-text-default">
                The quick brown fox jumps over the lazy dog. Typography centers on a modern humanist sans with a restrained grid system that keeps layouts calm and legible.
              </p>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-xs">Caption (14px)</p>
              <p className="text-caption text-banyan-text-subtle">
                The quick brown fox jumps over the lazy dog. This is helper text and small labels.
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="card-banyan mb-xl">
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-l">
            Buttons
          </h2>
          
          <div className="space-y-m">
            <div>
              <p className="text-caption text-banyan-text-subtle mb-s">Primary Button</p>
              <button className={banyanClasses.button.primary}>
                Primary Action
              </button>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-s">Secondary Button</p>
              <button className={banyanClasses.button.secondary}>
                Secondary Action
              </button>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-s">Ghost Button</p>
              <button className={banyanClasses.button.ghost}>
                Tertiary Action
              </button>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-s">Button Group</p>
              <div className="flex gap-s flex-wrap">
                <button className={banyanClasses.button.primary}>
                  Save Changes
                </button>
                <button className={banyanClasses.button.secondary}>
                  Cancel
                </button>
                <button className={banyanClasses.button.ghost}>
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="card-banyan mb-xl">
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-l">
            Form Inputs
          </h2>
          
          <div className="space-y-m max-w-md">
            <div>
              <label className="block text-body font-medium text-banyan-text-default mb-xs">
                Text Input
              </label>
              <input 
                type="text" 
                placeholder="Enter your name..."
                className="input-banyan"
              />
            </div>
            
            <div>
              <label className="block text-body font-medium text-banyan-text-default mb-xs">
                Email Input
              </label>
              <input 
                type="email" 
                placeholder="you@example.com"
                className="input-banyan"
              />
            </div>
            
            <div>
              <label className="block text-body font-medium text-banyan-text-default mb-xs">
                Textarea
              </label>
              <textarea 
                placeholder="Enter your message..."
                className="input-banyan min-h-32"
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className="card-banyan mb-xl">
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-l">
            Alerts
          </h2>
          
          <div className="space-y-m">
            <div>
              <p className="text-caption text-banyan-text-subtle mb-s">Success Alert</p>
              <div className="alert-banyan alert-banyan-success">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Your changes have been saved successfully!
              </div>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-s">Warning Alert</p>
              <div className="alert-banyan alert-banyan-warning">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                This action cannot be undone. Please proceed with caution.
              </div>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-s">Error Alert</p>
              <div className="alert-banyan alert-banyan-error">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Failed to save changes. Please try again.
              </div>
            </div>
            
            <div>
              <p className="text-caption text-banyan-text-subtle mb-s">Info Alert</p>
              <div className="alert-banyan alert-banyan-info">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                This feature is currently in beta. We appreciate your feedback!
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="card-banyan mb-xl">
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-l">
            Cards
          </h2>
          
          <div className="grid md:grid-cols-3 gap-m">
            <div className="card-banyan">
              <h3 className="text-h3 font-semibold text-banyan-text-default mb-s">
                Card Title
              </h3>
              <p className="text-body text-banyan-text-subtle">
                Cards provide elevation and separation for grouped content.
              </p>
            </div>
            
            <div className="card-banyan">
              <h3 className="text-h3 font-semibold text-banyan-text-default mb-s">
                Interactive Card
              </h3>
              <p className="text-body text-banyan-text-subtle mb-m">
                Hover over this card to see the elevation change.
              </p>
              <button className={banyanClasses.button.primary}>
                Action
              </button>
            </div>
            
            <div className="card-banyan">
              <h3 className="text-h3 font-semibold text-banyan-text-default mb-s">
                Another Card
              </h3>
              <p className="text-body text-banyan-text-subtle">
                Consistent spacing and shadows create visual harmony.
              </p>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="card-banyan mb-xl">
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-l">
            Spacing Scale (8px rhythm)
          </h2>
          
          <div className="space-y-m">
            {[
              { name: 'xxs', value: '4px' },
              { name: 'xs', value: '8px' },
              { name: 's', value: '12px' },
              { name: 'm', value: '16px' },
              { name: 'l', value: '24px' },
              { name: 'xl', value: '48px' },
              { name: 'xxl', value: '96px' },
            ].map(({ name, value }) => (
              <div key={name} className="flex items-center gap-m">
                <span className="text-body font-medium text-banyan-text-default w-16">
                  {name}
                </span>
                <div 
                  className="bg-banyan-primary h-8 rounded-s"
                  style={{ width: value }}
                />
                <span className="text-caption text-banyan-text-subtle">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-xl border-t border-banyan-border-default">
          <p className="text-body text-banyan-text-subtle">
            Built with precision. Designed for humans.
          </p>
          <p className="text-caption text-banyan-text-subtle mt-s">
            Banyan Design System v1.0 — October 2025
          </p>
        </footer>
      </div>
    </div>
  );
}

