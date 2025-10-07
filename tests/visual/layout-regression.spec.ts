import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for layout changes
 * 
 * These tests capture screenshots and compare them against baseline images
 * to detect unintended visual changes.
 */
test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up mock data for consistent visuals
    await page.goto('/');
    await page.evaluate(() => {
      const vfMockData = {
        framework: {
          companyId: 'test-company',
          vision: 'Build products that empower teams',
          strategy: ['Focus on enterprise', 'Platform approach'],
          operating_principles: ['Customer first', 'Move fast'],
          near_term_bets: [
            { bet: 'Launch enterprise tier', owner: 'CEO', horizon: 'Q2', measure: '10 customers' }
          ],
          metrics: [
            { name: 'MRR', target: '$50K', cadence: 'monthly' }
          ],
          tensions: ['Speed vs quality']
        }
      };
      sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(vfMockData));
    });
  });

  test('Landing page layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('landing.png', {
      maxDiffPixels: 100
    });
  });

  test('Vision Framework layout', async ({ page }) => {
    await page.goto('/vision-framework-v2');
    await page.waitForLoadState('networkidle');
    
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('vision-framework.png', {
      maxDiffPixels: 200
    });
  });

  test('SOS page layout', async ({ page }) => {
    await page.goto('/sos');
    await page.waitForLoadState('networkidle');
    
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('sos.png', {
      maxDiffPixels: 200
    });
  });

  test('Vision Framework - Strategy section', async ({ page }) => {
    await page.goto('/vision-framework-v2');
    await page.waitForLoadState('networkidle');
    
    const strategySection = page.getByTestId('vf2-section-strategy');
    expect(await strategySection.screenshot()).toMatchSnapshot('strategy-section.png', {
      maxDiffPixels: 50
    });
  });

  test('Vision Framework - Near-term bets section', async ({ page }) => {
    await page.goto('/vision-framework-v2');
    await page.waitForLoadState('networkidle');
    
    const betsSection = page.getByTestId('vf2-section-near-term-bets');
    expect(await betsSection.screenshot()).toMatchSnapshot('bets-section.png', {
      maxDiffPixels: 50
    });
  });
});

