/**
 * QA Results Normalization Utility
 * Converts various API response formats into a safe, render-ready structure
 */

import { QaResults, QaIssue } from '@/types/qa';

/**
 * Normalizes raw QA API response into a safe, typed structure
 * Handles both new format {pass, issues} and legacy format {overallScore, ...}
 */
export function normalizeQaResults(raw: any): QaResults {
  // Handle null/undefined
  if (!raw || typeof raw !== 'object') {
    return getDefaultQaResults();
  }

  // New format: {pass: boolean, issues: [...]}
  if ('pass' in raw && 'issues' in raw) {
    const issues: QaIssue[] = Array.isArray(raw.issues)
      ? raw.issues.map((issue: any, idx: number) => ({
          id: issue.id ?? `issue-${idx}`,
          section: issue.section ?? 'Vision',
          severity: issue.severity ?? 'medium',
          message: String(issue.message ?? 'No description'),
          suggestion: issue.suggestion ? String(issue.suggestion) : undefined,
        }))
      : [];

    // Calculate scores based on issues
    const overallScore = raw.pass ? 8 : Math.max(4, 10 - issues.length);
    
    return {
      overallScore,
      consistency: calculateCategoryScore(issues, 'consistency'),
      measurability: calculateCategoryScore(issues, 'measurability'),
      tensions: calculateCategoryScore(issues, 'tensions'),
      actionability: calculateCategoryScore(issues, 'actionability'),
      completeness: calculateCategoryScore(issues, 'completeness'),
      recommendations: issues
        .filter(i => i.suggestion)
        .map(i => i.suggestion!)
        .slice(0, 5),
      issues,
    };
  }

  // Legacy format: {overallScore, consistency, ...}
  return {
    overallScore: safeNumber(raw.overallScore, 7),
    consistency: safeNumber(raw.consistency, 7),
    measurability: safeNumber(raw.measurability, 7),
    tensions: safeNumber(raw.tensions, 7),
    actionability: safeNumber(raw.actionability, 7),
    completeness: safeNumber(raw.completeness, 7),
    recommendations: Array.isArray(raw.recommendations)
      ? raw.recommendations.map(String).filter(Boolean)
      : [],
    issues: Array.isArray(raw.issues) ? raw.issues : [],
  };
}

/**
 * Safe number extraction with fallback
 */
function safeNumber(value: any, fallback: number): number {
  const num = Number(value);
  return isNaN(num) ? fallback : Math.max(0, Math.min(10, num));
}

/**
 * Calculate category score based on issues
 */
function calculateCategoryScore(issues: QaIssue[], category: string): number {
  const categoryIssues = issues.filter(i => 
    i.message.toLowerCase().includes(category) ||
    i.section.toLowerCase().includes(category)
  );
  
  const highCount = categoryIssues.filter(i => i.severity === 'high').length;
  const medCount = categoryIssues.filter(i => i.severity === 'medium').length;
  
  // Start at 10, deduct points for issues
  return Math.max(0, 10 - (highCount * 3) - (medCount * 1.5));
}

/**
 * Default QA results when no data is available
 */
function getDefaultQaResults(): QaResults {
  return {
    overallScore: 7,
    consistency: 7,
    measurability: 7,
    tensions: 7,
    actionability: 7,
    completeness: 7,
    recommendations: ['Complete your Vision Framework to get detailed recommendations'],
    issues: [],
  };
}

