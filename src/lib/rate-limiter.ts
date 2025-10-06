/**
 * Simple in-memory rate limiter
 * For production, consider Redis-backed solution (Upstash Rate Limit)
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

// In-memory store (will reset on server restart)
const rateLimits = new Map<string, number[]>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimits.entries());
  for (const [key, timestamps] of entries) {
    const recent = timestamps.filter((t: number) => now - t < 3600000); // Keep last hour
    if (recent.length === 0) {
      rateLimits.delete(key);
    } else {
      rateLimits.set(key, recent);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if request is within rate limit
 * @param identifier - User ID, anonymous ID, or IP address
 * @param config - Rate limit configuration
 * @returns RateLimitResult
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now();
  const userRequests = rateLimits.get(identifier) || [];
  
  // Remove requests outside the current window
  const recentRequests = userRequests.filter(
    time => now - time < config.windowMs
  );
  
  // Check if limit exceeded
  if (recentRequests.length >= config.maxRequests) {
    const oldestRequest = recentRequests[0];
    const retryAfter = config.windowMs - (now - oldestRequest);
    
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil(retryAfter / 1000) // Convert to seconds
    };
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimits.set(identifier, recentRequests);
  
  return {
    allowed: true,
    remaining: config.maxRequests - recentRequests.length
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // AI Generation - expensive operations
  AI_GENERATION: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000 // 10 per hour
  },
  
  // Refinements - cheaper but still costly
  AI_REFINEMENT: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000 // 30 per hour
  },
  
  // Document saves
  DOCUMENT_SAVE: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000 // 100 per hour
  },
  
  // General API calls
  API_DEFAULT: {
    maxRequests: 100,
    windowMs: 60 * 1000 // 100 per minute
  }
} as const;

/**
 * Get identifier from request (user ID, anonymous ID, or IP)
 */
export function getIdentifier(userId?: string, anonymousId?: string, ip?: string): string {
  return userId || anonymousId || ip || 'unknown';
}

/**
 * Helper to create rate limit response
 */
export function rateLimitResponse(result: RateLimitResult) {
  return {
    error: 'Rate limit exceeded',
    retryAfter: result.retryAfter,
    message: `Too many requests. Please try again in ${result.retryAfter} seconds.`
  };
}

