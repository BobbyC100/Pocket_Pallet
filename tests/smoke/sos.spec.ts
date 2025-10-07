import { test, expect } from '@playwright/test';
import { SOSPage } from '../page-objects/SOS.page';

/**
 * @smoke
 * Strategic Operating System smoke tests - verify page loads and navigation
 */
test.describe('SOS Page - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up session storage with mock data
    await page.goto('/');
    await page.evaluate(() => {
      const vfMockData = {
        framework: {
          companyId: 'test-company',
          vision: 'Test vision',
          strategy: ['Strategic pillar 1'],
          operating_principles: ['Principle 1'],
          near_term_bets: [],
          metrics: [],
          tensions: []
        }
      };
      sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(vfMockData));

      const briefMockData = {
        founderBriefMd: '# Test Brief\n\nThis is a test brief.'
      };
      sessionStorage.setItem('lastGeneratedBrief', JSON.stringify(briefMockData));
    });
  });

  test('should load SOS page', async ({ page }) => {
    const sosPage = new SOSPage(page);
    
    await sosPage.goto();
    await sosPage.expectLoaded();
  });

  test('should display document sidebar', async ({ page }) => {
    const sosPage = new SOSPage(page);
    
    await sosPage.goto();
    
    await expect(sosPage.sidebar).toBeVisible();
    await expect(sosPage.visionFrameworkCard).toBeVisible();
    await expect(sosPage.founderBriefCard).toBeVisible();
  });

  test('should switch between documents', async ({ page }) => {
    const sosPage = new SOSPage(page);
    
    await sosPage.goto();
    
    // Default should be Vision Framework
    await expect(sosPage.visionFrameworkCard).toHaveClass(/bg-banyan-primary/);
    
    // Switch to Founder Brief
    await sosPage.selectFounderBrief();
    await expect(sosPage.founderBriefCard).toHaveClass(/bg-banyan-primary/);
  });

  test('should display export buttons', async ({ page }) => {
    const sosPage = new SOSPage(page);
    
    await sosPage.goto();
    
    await expect(sosPage.exportPdfButton).toBeVisible();
    await expect(sosPage.exportAllButton).toBeVisible();
  });
});

