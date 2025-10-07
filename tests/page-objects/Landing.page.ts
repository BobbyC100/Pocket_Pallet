import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object Model for Landing Page
 */
export class LandingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  get startBuildingButton(): Locator {
    return this.page.getByRole('link', { name: /start building/i });
  }

  get headline(): Locator {
    return this.page.getByRole('heading', { name: /from first draft to focused strategy/i });
  }

  // Navigation
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  // Actions
  async expectLoaded() {
    await expect(this.headline).toBeVisible();
    await expect(this.startBuildingButton).toBeVisible();
  }

  async clickStartBuilding() {
    await this.startBuildingButton.click();
    await this.page.waitForURL('**/new');
  }
}

