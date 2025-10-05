/**
 * Banyan Design System Tokens v1.0
 * 
 * Programmatic access to design tokens for TypeScript/JavaScript.
 * These tokens align with the Tailwind config and CSS custom properties.
 */

export const banyanTokens = {
  color: {
    brand: {
      primary: '#1B4D3E',
      primaryContrast: '#F9FAF9',
    },
    text: {
      default: '#1E1E1E',
      subtle: '#4A4A4A',
    },
    background: {
      base: '#F9FAF9',
      surface: '#FFFFFF',
    },
    border: {
      default: '#E2E2E2',
    },
    state: {
      success: '#2FB57C',
      warning: '#FFB64C',
      error: '#E45757',
      info: '#4B91F1',
    },
    accent: {
      sand: '#F4EDE2',
      mist: '#E5EEF5',
    },
  },
  
  typography: {
    family: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Publico, Georgia, serif',
    },
    size: {
      display: '64px',
      h1: '48px',
      h2: '32px',
      h3: '24px',
      body: '18px',
      caption: '14px',
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
    },
    lineHeight: {
      tight: '110%',
      normal: '130%',
      relaxed: '160%',
    },
  },
  
  spacing: {
    xxs: '4px',
    xs: '8px',
    s: '12px',
    m: '16px',
    l: '24px',
    xl: '48px',
    xxl: '96px',
  },
  
  radius: {
    s: '4px',
    m: '8px',
    l: '12px',
    xl: '20px',
  },
  
  shadow: {
    surfaceLow: '0 1px 2px rgba(0,0,0,0.06)',
    surfaceMid: '0 2px 4px rgba(0,0,0,0.08)',
    surfaceHigh: '0 4px 12px rgba(0,0,0,0.10)',
  },
  
  motion: {
    duration: {
      fast: '100ms',
      base: '200ms',
      slow: '300ms',
    },
    ease: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
} as const;

/**
 * Helper function to get CSS custom property value
 */
export function getBanyanCSSVar(property: string): string {
  return `var(--banyan-${property})`;
}

/**
 * Tailwind class name helpers for Banyan design system
 */
export const banyanClasses = {
  button: {
    primary: 'btn-banyan-primary',
    secondary: 'btn-banyan-secondary',
    ghost: 'btn-banyan-ghost',
  },
  card: 'card-banyan',
  input: 'input-banyan',
  alert: {
    base: 'alert-banyan',
    success: 'alert-banyan alert-banyan-success',
    warning: 'alert-banyan alert-banyan-warning',
    error: 'alert-banyan alert-banyan-error',
    info: 'alert-banyan alert-banyan-info',
  },
  container: 'container-banyan',
  motionSafe: 'motion-safe-banyan',
} as const;

/**
 * Type-safe color utilities
 */
export type BanyanColor = 
  | 'brand-primary'
  | 'text-default'
  | 'text-subtle'
  | 'bg-base'
  | 'bg-surface'
  | 'border-default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'sand'
  | 'mist';

export function getBanyanColor(color: BanyanColor): string {
  const colorMap: Record<BanyanColor, string> = {
    'brand-primary': banyanTokens.color.brand.primary,
    'text-default': banyanTokens.color.text.default,
    'text-subtle': banyanTokens.color.text.subtle,
    'bg-base': banyanTokens.color.background.base,
    'bg-surface': banyanTokens.color.background.surface,
    'border-default': banyanTokens.color.border.default,
    'success': banyanTokens.color.state.success,
    'warning': banyanTokens.color.state.warning,
    'error': banyanTokens.color.state.error,
    'info': banyanTokens.color.state.info,
    'sand': banyanTokens.color.accent.sand,
    'mist': banyanTokens.color.accent.mist,
  };
  return colorMap[color];
}

/**
 * Spacing utilities
 */
export type BanyanSpacing = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

export function getBanyanSpacing(size: BanyanSpacing): string {
  return banyanTokens.spacing[size];
}

