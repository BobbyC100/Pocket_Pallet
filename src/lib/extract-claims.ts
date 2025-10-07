/**
 * Extract Claims from Vision Framework
 * Converts framework content into testable claims
 */

import type { QAClaim } from '@/components/qa/ClaimValidation';

export function extractClaimsFromFramework(framework: any): QAClaim[] {
  if (!framework) return [];

  const claims: QAClaim[] = [];

  // Extract from Vision
  if (framework.vision && typeof framework.vision === 'string' && framework.vision.length > 20) {
    // Split vision into sentences
    const visionSentences = framework.vision
      .split(/[.!?]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 20);
    
    visionSentences.slice(0, 3).forEach((sentence: string, idx: number) => {
      claims.push({
        id: `vision-${idx}`,
        text: sentence,
        section: 'vision',
      });
    });
  }

  // Extract from Strategy
  if (Array.isArray(framework.strategy)) {
    framework.strategy.slice(0, 3).forEach((item: string, idx: number) => {
      if (item && item.length > 20) {
        claims.push({
          id: `strategy-${idx}`,
          text: item,
          section: 'strategy',
        });
      }
    });
  }

  // Extract from Metrics
  if (Array.isArray(framework.metrics)) {
    framework.metrics.slice(0, 3).forEach((metric: any, idx: number) => {
      if (metric && metric.name && metric.target) {
        claims.push({
          id: `metrics-${idx}`,
          text: `${metric.name}: ${metric.target}`,
          section: 'metrics',
        });
      }
    });
  }

  // Extract from Near-Term Bets
  if (Array.isArray(framework.near_term_bets)) {
    framework.near_term_bets.slice(0, 2).forEach((bet: any, idx: number) => {
      if (bet && bet.bet && bet.bet.length > 20) {
        claims.push({
          id: `bet-${idx}`,
          text: bet.bet,
          section: 'risk',
        });
      }
    });
  }

  // Extract from Tensions
  if (Array.isArray(framework.tensions)) {
    framework.tensions.slice(0, 2).forEach((tension: string, idx: number) => {
      if (tension && tension.length > 20) {
        claims.push({
          id: `tension-${idx}`,
          text: tension,
          section: 'risk',
        });
      }
    });
  }

  return claims;
}

