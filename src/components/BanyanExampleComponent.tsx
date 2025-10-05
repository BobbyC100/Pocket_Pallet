/**
 * Banyan Design System - Example Component
 * 
 * This is a complete example component demonstrating best practices
 * for building with the Banyan Design System.
 * 
 * Key features:
 * - Uses Banyan design tokens (colors, spacing, typography)
 * - Follows accessibility guidelines
 * - Implements responsive design
 * - Supports reduced motion
 * - Type-safe with TypeScript
 */

'use client';

import { useState } from 'react';
import { banyanClasses } from '@/lib/design-tokens';

interface BanyanExampleComponentProps {
  title?: string;
  description?: string;
  onSubmit?: (data: { name: string; email: string; message: string }) => void;
}

export default function BanyanExampleComponent({
  title = 'Get in Touch',
  description = "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
  onSubmit
}: BanyanExampleComponentProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="container-banyan py-xl">
      <div className="max-w-2xl mx-auto">
        {/* Card using Banyan design system */}
        <div className="card-banyan">
          {/* Header Section */}
          <header className="mb-l">
            <h2 className="text-h2 font-semibold text-banyan-text-default mb-s">
              {title}
            </h2>
            <p className="text-body text-banyan-text-subtle">
              {description}
            </p>
          </header>

          {/* Success Alert */}
          {status === 'success' && (
            <div className="alert-banyan alert-banyan-success mb-m">
              <svg 
                className="w-5 h-5 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>Thank you! Your message has been sent successfully.</span>
            </div>
          )}

          {/* Error Alert */}
          {status === 'error' && (
            <div className="alert-banyan alert-banyan-error mb-m">
              <svg 
                className="w-5 h-5 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>Something went wrong. Please try again.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-m">
            {/* Name Field */}
            <div>
              <label 
                htmlFor="name"
                className="block text-body font-medium text-banyan-text-default mb-xs"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="input-banyan"
                aria-required="true"
              />
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email"
                className="block text-body font-medium text-banyan-text-default mb-xs"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className="input-banyan"
                aria-required="true"
              />
              <p className="text-caption text-banyan-text-subtle mt-xs">
                We'll never share your email with anyone else.
              </p>
            </div>

            {/* Message Field */}
            <div>
              <label 
                htmlFor="message"
                className="block text-body font-medium text-banyan-text-default mb-xs"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Tell us how we can help..."
                rows={5}
                className="input-banyan min-h-32"
                aria-required="true"
              />
            </div>

            {/* Button Group */}
            <div className="flex gap-s flex-wrap pt-m">
              <button
                type="submit"
                disabled={isSubmitting}
                className={banyanClasses.button.primary}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg 
                      className="w-5 h-5 animate-spin" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ name: '', email: '', message: '' })}
                disabled={isSubmitting}
                className={banyanClasses.button.ghost}
              >
                Clear Form
              </button>
            </div>
          </form>

          {/* Info Section */}
          <div className="mt-l pt-l border-t border-banyan-border-default">
            <div className="alert-banyan alert-banyan-info">
              <svg 
                className="w-5 h-5 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>We typically respond within 24 hours.</span>
            </div>
          </div>
        </div>

        {/* Additional Cards */}
        <div className="grid md:grid-cols-3 gap-m mt-l">
          <div className="card-banyan">
            <h3 className="text-h3 font-semibold text-banyan-text-default mb-s">
              Email
            </h3>
            <p className="text-body text-banyan-text-subtle">
              hello@banyan.com
            </p>
          </div>
          
          <div className="card-banyan">
            <h3 className="text-h3 font-semibold text-banyan-text-default mb-s">
              Phone
            </h3>
            <p className="text-body text-banyan-text-subtle">
              +1 (555) 123-4567
            </p>
          </div>
          
          <div className="card-banyan">
            <h3 className="text-h3 font-semibold text-banyan-text-default mb-s">
              Office
            </h3>
            <p className="text-body text-banyan-text-subtle">
              San Francisco, CA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

