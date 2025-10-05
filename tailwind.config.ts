import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Banyan Design System Colors
      colors: {
        banyan: {
          // Brand
          primary: '#1B4D3E',
          'primary-contrast': '#F9FAF9',
          
          // Text
          'text-default': '#1E1E1E',
          'text-subtle': '#4A4A4A',
          
          // Background
          'bg-base': '#F9FAF9',
          'bg-surface': '#FFFFFF',
          
          // Border
          'border-default': '#E2E2E2',
          
          // State
          success: '#2FB57C',
          warning: '#FFB64C',
          error: '#E45757',
          info: '#4B91F1',
          
          // Accent
          sand: '#F4EDE2',
          mist: '#E5EEF5',
        },
      },
      
      // Banyan Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Publico', 'Georgia', 'serif'],
      },
      fontSize: {
        'display': ['64px', { lineHeight: '110%', letterSpacing: '0%' }],
        'h1': ['48px', { lineHeight: '110%', letterSpacing: '0%' }],
        'h2': ['32px', { lineHeight: '130%', letterSpacing: '0%' }],
        'h3': ['24px', { lineHeight: '130%', letterSpacing: '0%' }],
        'body': ['18px', { lineHeight: '160%', letterSpacing: '0%' }],
        'caption': ['14px', { lineHeight: '160%', letterSpacing: '0%' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
      },
      
      // Banyan Spacing (8px rhythm)
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        's': '12px',
        'm': '16px',
        'l': '24px',
        'xl': '48px',
        'xxl': '96px',
      },
      
      // Banyan Border Radius
      borderRadius: {
        's': '4px',
        'm': '8px',
        'l': '12px',
        'xl': '20px',
      },
      
      // Banyan Shadows
      boxShadow: {
        'surface-low': '0 1px 2px rgba(0,0,0,0.06)',
        'surface-mid': '0 2px 4px rgba(0,0,0,0.08)',
        'surface-high': '0 4px 12px rgba(0,0,0,0.10)',
      },
      
      // Banyan Motion
      transitionDuration: {
        'fast': '100ms',
        'base': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'banyan': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'banyan-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'banyan-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
