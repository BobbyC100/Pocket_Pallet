/**
 * QA Types for Vision Framework V2
 */

export type QaSeverity = 'low' | 'medium' | 'high';

export interface QaIssue {
  id: string;
  section: 'Vision' | 'Strategy' | 'Operating Principles' | 'Near-Term Bets' | 'Metrics' | 'Tensions';
  severity: QaSeverity;
  message: string;
  suggestion?: string;
}

export interface QaResults {
  overallScore: number;
  consistency: number;
  measurability: number;
  tensions: number;
  actionability: number;
  completeness: number;
  recommendations: string[];
  issues?: QaIssue[];
}

export interface QaApiResponse {
  qaResults: QaResults;
  qualityScores?: Record<string, any>;
}

