/**
 * Banyan UX v2 Analytics Tracking
 * 
 * Tracks conversion funnel metrics and user engagement.
 * Can be integrated with Google Analytics, Mixpanel, PostHog, etc.
 */

// Event types for type safety
export type AnalyticsEvent =
  | 'wizard_started'
  | 'wizard_step_completed'
  | 'wizard_completed'
  | 'wizard_state_restored'
  | 'wizard_back_clicked'
  | 'load_example_clicked'
  | 'soft_signup_shown'
  | 'soft_signup_accepted'
  | 'soft_signup_dismissed'
  | 'pre_generation_signup_shown'
  | 'pre_generation_signup_accepted'
  | 'pre_generation_signup_skipped'
  | 'vision_statement_generated'
  | 'vision_statement_partial_shown'
  | 'unlock_vision_statement_clicked'
  | 'unlock_strategic_tools_clicked'
  | 'strategic_tools_modal_shown'
  | 'strategic_tool_selected'
  | 'framework_generated'
  | 'pro_upgrade_modal_shown'
  | 'results_viewed_anonymous'
  | 'results_viewed_authenticated'
  | 'results_save_prompt_shown'
  | 'onepager_generate_clicked'
  | 'onepager_generated_success'
  | 'onepager_generated_error'
  | 'qa_run_clicked'
  | 'qa_completed'
  | 'qa_failed'
  | 'pro_upgrade_started'
  | 'pro_upgrade_dismissed'
  | 'signup_completed'
  | 'pdf_exported'
  | 'cloud_save_clicked';

interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Core analytics tracking function
 * 
 * In production, this would integrate with:
 * - Google Analytics (gtag)
 * - Mixpanel
 * - PostHog
 * - Segment
 * etc.
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
) {
  const timestamp = new Date().toISOString();
  const eventData = {
    event,
    timestamp,
    ...properties,
  };

  // Console logging for development
  console.log('📊 ANALYTICS:', eventData);

  // Store in localStorage for analysis (temporary solution)
  try {
    const storageKey = 'banyan_analytics_events';
    const existingEvents = JSON.parse(
      localStorage.getItem(storageKey) || '[]'
    );
    existingEvents.push(eventData);
    
    // Keep only last 100 events
    if (existingEvents.length > 100) {
      existingEvents.shift();
    }
    
    localStorage.setItem(storageKey, JSON.stringify(existingEvents));
  } catch (error) {
    console.error('Failed to store analytics event:', error);
  }

  // TODO: Integrate with production analytics service
  // Example for Google Analytics:
  // if (typeof window !== 'undefined' && window.gtag) {
  //   window.gtag('event', event, properties);
  // }

  // Example for Mixpanel:
  // if (typeof window !== 'undefined' && window.mixpanel) {
  //   window.mixpanel.track(event, properties);
  // }

  // Example for PostHog:
  // if (typeof window !== 'undefined' && window.posthog) {
  //   window.posthog.capture(event, properties);
  // }
}

/**
 * Track wizard progress
 */
export function trackWizardProgress(
  step: number,
  totalSteps: number,
  isComplete: boolean = false
) {
  if (isComplete) {
    trackEvent('wizard_completed', {
      total_steps: totalSteps,
      completion_time_seconds: getSessionDuration(),
    });
  } else {
    trackEvent('wizard_step_completed', {
      step,
      total_steps: totalSteps,
      progress_percent: Math.round((step / totalSteps) * 100),
    });
  }
}

/**
 * Track signup conversion touchpoints
 */
export function trackSignupTouchpoint(
  touchpoint: 'soft_wizard' | 'pre_generation' | 'unlock_results' | 'unlock_tools',
  action: 'shown' | 'accepted' | 'dismissed'
) {
  const eventMap = {
    soft_wizard: {
      shown: 'soft_signup_shown',
      accepted: 'soft_signup_accepted',
      dismissed: 'soft_signup_dismissed',
    },
    pre_generation: {
      shown: 'pre_generation_signup_shown',
      accepted: 'pre_generation_signup_accepted',
      dismissed: 'pre_generation_signup_skipped',
    },
    unlock_results: {
      shown: 'vision_statement_partial_shown',
      accepted: 'unlock_vision_statement_clicked',
      dismissed: 'unlock_vision_statement_clicked', // Same as accepted for now
    },
    unlock_tools: {
      shown: 'strategic_tools_modal_shown',
      accepted: 'unlock_strategic_tools_clicked',
      dismissed: 'unlock_strategic_tools_clicked',
    },
  };

  const event = eventMap[touchpoint]?.[action];
  if (event) {
    trackEvent(event as AnalyticsEvent, {
      touchpoint,
      action,
      session_duration_seconds: getSessionDuration(),
    });
  }
}

/**
 * Track generation events
 */
export function trackGeneration(
  type: 'vision_statement' | 'framework' | 'lens' | 'brief',
  isAnonymous: boolean,
  durationMs?: number
) {
  const eventMap = {
    vision_statement: 'vision_statement_generated',
    framework: 'framework_generated',
    lens: 'framework_generated', // Placeholder
    brief: 'framework_generated', // Placeholder
  };

  trackEvent(eventMap[type] as AnalyticsEvent, {
    generation_type: type,
    is_anonymous: isAnonymous,
    duration_ms: durationMs,
    session_duration_seconds: getSessionDuration(),
  });
}

/**
 * Track Pro upgrade funnel
 */
export function trackProUpgrade(
  action: 'shown' | 'started' | 'completed' | 'dismissed',
  source?: string
) {
  const eventMap = {
    shown: 'pro_upgrade_modal_shown',
    started: 'pro_upgrade_started',
    completed: 'signup_completed', // Would track actual payment completion
    dismissed: 'pro_upgrade_dismissed',
  };

  trackEvent(eventMap[action] as AnalyticsEvent, {
    action,
    source,
    session_duration_seconds: getSessionDuration(),
  });
}

/**
 * Track user actions
 */
export function trackUserAction(
  action: 'pdf_exported' | 'cloud_saved' | 'tool_selected' | 'results_viewed_anonymous' | 'results_viewed_authenticated' | 'results_save_prompt_shown' | 'onepager_generate_clicked' | 'onepager_generated_success' | 'onepager_generated_error' | 'qa_run_clicked' | 'qa_completed' | 'qa_failed',
  properties?: AnalyticsProperties
) {
  const eventMap = {
    pdf_exported: 'pdf_exported',
    cloud_saved: 'cloud_save_clicked',
    tool_selected: 'strategic_tool_selected',
    results_viewed_anonymous: 'results_viewed_anonymous',
    results_viewed_authenticated: 'results_viewed_authenticated',
    results_save_prompt_shown: 'results_save_prompt_shown',
    onepager_generate_clicked: 'onepager_generate_clicked',
    onepager_generated_success: 'onepager_generated_success',
    onepager_generated_error: 'onepager_generated_error',
    qa_run_clicked: 'qa_run_clicked',
    qa_completed: 'qa_completed',
    qa_failed: 'qa_failed',
  };

  trackEvent(eventMap[action] as AnalyticsEvent, properties);
}

/**
 * Get session duration in seconds
 */
function getSessionDuration(): number {
  try {
    const sessionStart = sessionStorage.getItem('banyan_session_start');
    if (!sessionStart) {
      const now = Date.now();
      sessionStorage.setItem('banyan_session_start', now.toString());
      return 0;
    }
    return Math.round((Date.now() - parseInt(sessionStart)) / 1000);
  } catch {
    return 0;
  }
}

/**
 * Initialize analytics session
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return;

  try {
    const sessionStart = sessionStorage.getItem('banyan_session_start');
    if (!sessionStart) {
      sessionStorage.setItem('banyan_session_start', Date.now().toString());
    }
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
}

/**
 * Get all tracked events (for debugging/analysis)
 */
export function getAnalyticsEvents(): any[] {
  try {
    const storageKey = 'banyan_analytics_events';
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear analytics events (for testing)
 */
export function clearAnalyticsEvents() {
  try {
    localStorage.removeItem('banyan_analytics_events');
    sessionStorage.removeItem('banyan_session_start');
  } catch (error) {
    console.error('Failed to clear analytics:', error);
  }
}

/**
 * Calculate conversion metrics (for admin dashboard)
 */
export function calculateConversionMetrics() {
  const events = getAnalyticsEvents();
  
  const metrics = {
    wizard_started: events.filter(e => e.event === 'wizard_started').length,
    wizard_completed: events.filter(e => e.event === 'wizard_completed').length,
    soft_signup_shown: events.filter(e => e.event === 'soft_signup_shown').length,
    soft_signup_accepted: events.filter(e => e.event === 'soft_signup_accepted').length,
    pre_gen_signup_shown: events.filter(e => e.event === 'pre_generation_signup_shown').length,
    pre_gen_signup_accepted: events.filter(e => e.event === 'pre_generation_signup_accepted').length,
    vision_statement_generated: events.filter(e => e.event === 'vision_statement_generated').length,
    unlock_clicked: events.filter(e => e.event === 'unlock_vision_statement_clicked').length,
    signups_completed: events.filter(e => e.event === 'signup_completed').length,
    pro_upgrade_started: events.filter(e => e.event === 'pro_upgrade_started').length,
  };

  // Calculate conversion rates
  const conversionRates = {
    wizard_completion_rate: metrics.wizard_started > 0
      ? ((metrics.wizard_completed / metrics.wizard_started) * 100).toFixed(1)
      : '0.0',
    soft_signup_conversion: metrics.soft_signup_shown > 0
      ? ((metrics.soft_signup_accepted / metrics.soft_signup_shown) * 100).toFixed(1)
      : '0.0',
    pre_gen_signup_conversion: metrics.pre_gen_signup_shown > 0
      ? ((metrics.pre_gen_signup_accepted / metrics.pre_gen_signup_shown) * 100).toFixed(1)
      : '0.0',
    overall_signup_rate: metrics.wizard_completed > 0
      ? ((metrics.signups_completed / metrics.wizard_completed) * 100).toFixed(1)
      : '0.0',
  };

  return {
    counts: metrics,
    rates: conversionRates,
  };
}

