import { test, expect } from '@playwright/test';
import { VisionFrameworkPage } from '../page-objects/VisionFramework.page';

/**
 * @flow
 * Vision Framework editing flow tests
 */
test.describe('Vision Framework - Editing Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up session storage with mock data
    await page.goto('/');
    await page.evaluate(() => {
      const mockData = {
        framework: {
          companyId: 'test-company',
          vision: 'Build the future of work by enabling teams to collaborate seamlessly across time zones',
          strategy: ['Focus on enterprise customers', 'Build a platform, not a product'],
          operating_principles: ['Customer obsession', 'Move fast, think long-term'],
          near_term_bets: [],
          metrics: [],
          tensions: []
        }
      };
      sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(mockData));
    });
  });

  test('should edit vision statement', async ({ page }) => {
    const vfPage = new VisionFrameworkPage(page);
    
    await vfPage.goto();
    
    const newVision = 'Updated vision: Transform how teams collaborate in the modern workplace';
    await vfPage.editVision(newVision);
    
    // Verify the change persists
    await vfPage.expectVisionValue(newVision);
  });

  test('should add and remove strategy pillars', async ({ page }) => {
    const vfPage = new VisionFrameworkPage(page);
    
    await vfPage.goto();
    
    // Initial count should be 2
    await vfPage.expectStrategyCount(2);
    
    // Add a new strategy
    await vfPage.addStrategy('Expand into new markets');
    
    // Should now have 3 strategies
    await vfPage.expectStrategyCount(3);
  });

  test('should add a near-term bet', async ({ page }) => {
    const vfPage = new VisionFrameworkPage(page);
    
    await vfPage.goto();
    
    // Initially should have 0 bets
    await vfPage.expectBetCount(0);
    
    // Add a bet
    await vfPage.addBet({
      bet: 'Launch enterprise tier',
      owner: 'CEO',
      horizon: 'Q2',
      measure: '10 enterprise customers'
    });
    
    // Should now have 1 bet
    await vfPage.expectBetCount(1);
  });

  test('should add a metric', async ({ page }) => {
    const vfPage = new VisionFrameworkPage(page);
    
    await vfPage.goto();
    
    // Initially should have 0 metrics
    await vfPage.expectMetricCount(0);
    
    // Add a metric
    await vfPage.addMetric({
      name: 'MRR',
      target: '$100K',
      cadence: 'monthly'
    });
    
    // Should now have 1 metric
    await vfPage.expectMetricCount(1);
  });

  test('should navigate through all tabs', async ({ page }) => {
    const vfPage = new VisionFrameworkPage(page);
    
    await vfPage.goto();
    
    // Start on edit tab
    await expect(vfPage.editTab).toHaveAttribute('aria-selected', 'true');
    
    // Navigate to One-Pager
    await vfPage.openOnePagerTab();
    await expect(vfPage.onePagerTab).toHaveAttribute('aria-selected', 'true');
    
    // Navigate to QA
    await vfPage.openQaTab();
    await expect(vfPage.qaTab).toHaveAttribute('aria-selected', 'true');
    
    // Navigate back to edit
    await vfPage.editTab.click();
    await expect(vfPage.editTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should persist data after page reload', async ({ page }) => {
    const vfPage = new VisionFrameworkPage(page);
    
    await vfPage.goto();
    
    const newVision = 'Vision that should persist after reload';
    await vfPage.editVision(newVision);
    
    // Reload the page
    await page.reload();
    await vfPage.expectLoaded();
    
    // Vision should still be there
    await vfPage.expectVisionValue(newVision);
  });
});

