import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/Landing.page';

/**
 * @smoke
 * Landing page smoke tests - verify critical functionality
 */
test.describe('Landing Page - Smoke Tests', () => {
  test('should load landing page successfully', async ({ page }) => {
    const landingPage = new LandingPage(page);
    
    await landingPage.goto();
    await landingPage.expectLoaded();
  });

  test('should navigate to /new when clicking Start Building', async ({ page }) => {
    const landingPage = new LandingPage(page);
    
    await landingPage.goto();
    await landingPage.clickStartBuilding();
    
    // Verify we're on the /new page
    await expect(page).toHaveURL(/.*\/new/);
  });

  test('should display feature cards', async ({ page }) => {
    const landingPage = new LandingPage(page);
    
    await landingPage.goto();
    
    // Check that feature cards are visible
    const featureCards = page.locator('.rounded-lg.bg-banyan-bg-surface');
    await expect(featureCards).toHaveCount(3);
  });
});

