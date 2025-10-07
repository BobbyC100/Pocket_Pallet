import { test, expect } from '@playwright/test';
import { SOSPage } from '../page-objects/SOS.page';

/**
 * @flow
 * SOS document switching and export flow tests
 */
test.describe('SOS - Document Switching Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up session storage with complete mock data
    await page.goto('/');
    await page.evaluate(() => {
      const vfMockData = {
        framework: {
          companyId: 'test-company',
          vision: 'Build the future of work',
          strategy: ['Enterprise focus', 'Platform approach'],
          operating_principles: ['Customer obsession'],
          near_term_bets: [{ bet: 'Launch', owner: 'CEO', horizon: 'Q1', measure: 'Revenue' }],
          metrics: [{ name: 'MRR', target: '$50K', cadence: 'monthly' }],
          tensions: ['Speed vs quality']
        },
        executiveOnePager: '# Executive Summary\n\nCompany vision and strategy.',
        metadata: {
          qaChecks: {
            overallScore: 85,
            consistency: 9,
            measurability: 8,
            recommendations: ['Focus on key metrics']
          }
        }
      };
      sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(vfMockData));

      const briefMockData = {
        founderBriefMd: '# Vision Statement\n\n## Problem\n\nTeams struggle with collaboration\n\n## Solution\n\nOur platform enables seamless teamwork',
        vcSummaryMd: '# VC Summary\n\n## What & Why Now\n\nRevolutionizing team collaboration',
        vcSummaryStructured: {
          whatWhyNow: 'Revolutionizing team collaboration',
          market: '$5B TAM',
          solutionDiff: ['Unique AI approach'],
          traction: [{ metric: 'Users', value: '1000', timeframe: 'Last month' }],
          businessModel: 'SaaS subscription',
          gtm: 'Direct sales',
          team: 'Experienced founders',
          ask: { amount: '$2M', useOfFunds: ['Product', 'Sales'] },
          risks: [{ risk: 'Market timing', mitigation: 'Strong early traction' }],
          kpis6mo: ['10K users', '$100K MRR']
        }
      };
      sessionStorage.setItem('lastGeneratedBrief', JSON.stringify(briefMockData));
    });
  });

  test('should display all documents with correct status', async ({ page }) => {
    const sosPage = new SOSPage(page);
    
    await sosPage.goto();
    
    // All documents should show as complete
    await sosPage.expectDocumentStatus('vision-v2', 'complete');
    await sosPage.expectDocumentStatus('founder-brief', 'complete');
    await sosPage.expectDocumentStatus('executive-onepager', 'complete');
    await sosPage.expectDocumentStatus('qa-results', 'complete');
  });

  test('should switch between all documents', async ({ page }) => {
    const sosPage = new SOSPage(page);
    
    await sosPage.goto();
    
    // Vision Framework
    await sosPage.selectVisionFramework();
    await sosPage.expectContentLoaded('Vision Framework');
    
    // Founder Brief
    await sosPage.selectFounderBrief();
    await sosPage.expectContentLoaded('Vision Statement');
    
    // Executive One-Pager
    await sosPage.selectExecutiveOnePager();
    await sosPage.expectContentLoaded('Executive One-Pager');
    
    // QA Results
    await sosPage.selectQaResults();
    await sosPage.expectContentLoaded('QA Results');
    
    // VC Summary
    await sosPage.selectVcSummary();
    await sosPage.expectContentLoaded('VC Summary');
  });

  test('should display lens dashboard', async ({ page }) => {
    const sosPage = new SOSPage(page);
    
    await sosPage.goto();
    
    await sosPage.expectLensDashboardVisible();
  });

  test('should maintain selected document after page reload', async ({ page }) => {
    const sosPage = new SOSPage(page);
    
    await sosPage.goto();
    
    // Select VC Summary
    await sosPage.selectVcSummary();
    
    // Reload page
    await page.reload();
    
    // VC Summary should still be selected
    await expect(sosPage.vcSummaryCard).toHaveClass(/bg-banyan-primary/);
  });

  test('should show embedded vision framework correctly', async ({ page }) => {
    const sosPage = new SOSPage(page);
    
    await sosPage.goto();
    
    // Select Vision Framework
    await sosPage.selectVisionFramework();
    
    // Check that vision framework is embedded (not showing header)
    const backButton = page.getByTestId('vf2-back-button');
    await expect(backButton).not.toBeVisible();
    
    // But sections should be visible
    const visionSection = page.getByTestId('vf2-section-vision');
    await expect(visionSection).toBeVisible();
  });
});

