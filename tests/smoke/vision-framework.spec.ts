import { test, expect } from '@playwright/test';
import { VisionFrameworkPage } from '../page-objects/VisionFramework.page';

/**
 * @smoke
 * Vision Framework smoke tests - verify page loads and basic navigation
 */
test.describe('Vision Framework - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up session storage with mock data
    await page.goto('/');
    await page.evaluate(() => {
      const mockData = {
        framework: {
          companyId: 'test-company',
          vision: 'Test vision statement',
          strategy: ['Strategic pillar 1', 'Strategic pillar 2'],
          operating_principles: ['Principle 1', 'Principle 2'],
          near_term_bets: [
            { bet: 'Test bet', owner: 'CEO', horizon: 'Q1', measure: 'Test measure' }
          ],
          metrics: [
            { name: 'Test metric', target: '100', cadence: 'monthly' }
          ],
          tensions: ['Test tension']
        }
      };
      sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(mockData));
    });
  });

  test('should load Vision Framework page', async ({ page }) => {
    const vfPage = new VisionFrameworkPage(page);
    
    await vfPage.goto();
    await vfPage.expectLoaded();
  });

  test('should display all framework sections', async ({ page }) => {
    const vfPage = new VisionFrameworkPage(page);
    
    await vfPage.goto();
    
    // Verify all major sections are visible
    await expect(vfPage.visionSection).toBeVisible();
    await expect(vfPage.strategySection).toBeVisible();
    await expect(vfPage.operatingPrinciplesSection).toBeVisible();
    await expect(vfPage.nearTermBetsSection).toBeVisible();
    await expect(vfPage.metricsSection).toBeVisible();
    await expect(vfPage.tensionsSection).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    const vfPage = new VisionFrameworkPage(page);
    
    await vfPage.goto();
    
    // Default tab should be edit
    await expect(vfPage.editTab).toHaveAttribute('aria-selected', 'true');
    
    // Switch to onepager tab
    await vfPage.onePagerTab.click();
    await expect(vfPage.onePagerTab).toHaveAttribute('aria-selected', 'true');
    
    // Switch to QA tab
    await vfPage.qaTab.click();
    await expect(vfPage.qaTab).toHaveAttribute('aria-selected', 'true');
  });
});

