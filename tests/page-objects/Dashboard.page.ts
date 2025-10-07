import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object Model for Dashboard Page
 */
export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  get pageTitle(): Locator {
    return this.page.getByRole('heading', { name: /my documents/i });
  }

  get documentCards(): Locator {
    return this.page.getByTestId('dashboard-document-card');
  }

  get createNewButton(): Locator {
    return this.page.getByRole('link', { name: /create new/i });
  }

  // Navigation
  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  // Actions
  async expectLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  async expectDocumentCount(count: number) {
    await expect(this.documentCards).toHaveCount(count);
  }

  async openDocument(title: string) {
    await this.page.getByRole('link', { name: new RegExp(title, 'i') }).click();
  }
}

