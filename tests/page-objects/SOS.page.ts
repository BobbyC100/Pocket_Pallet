import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object Model for Strategic Operating System (SOS)
 * 
 * Provides methods for interacting with the SOS page
 * and verifying its state in E2E tests.
 */
export class SOSPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation
  async goto() {
    await this.page.goto('/sos');
    await this.page.waitForLoadState('networkidle');
  }

  // Locators - Header
  get pageTitle(): Locator {
    return this.page.getByTestId('sos-page-title');
  }

  get exportPdfButton(): Locator {
    return this.page.getByTestId('sos-export-pdf-button');
  }

  get exportAllButton(): Locator {
    return this.page.getByTestId('sos-export-all-button');
  }

  // Locators - Sidebar
  get sidebar(): Locator {
    return this.page.getByTestId('sos-sidebar');
  }

  get visionFrameworkCard(): Locator {
    return this.page.getByTestId('sos-doc-vision-v2');
  }

  get executiveOnePagerCard(): Locator {
    return this.page.getByTestId('sos-doc-executive-onepager');
  }

  get founderBriefCard(): Locator {
    return this.page.getByTestId('sos-doc-founder-brief');
  }

  get vcSummaryCard(): Locator {
    return this.page.getByTestId('sos-doc-vc-summary');
  }

  get qaResultsCard(): Locator {
    return this.page.getByTestId('sos-doc-qa-results');
  }

  // Locators - Content Area
  get contentArea(): Locator {
    return this.page.getByTestId('sos-content-area');
  }

  get lensDashboard(): Locator {
    return this.page.getByTestId('sos-lens-dashboard');
  }

  // Actions
  async expectLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toContainText('Strategic Operating System');
    await expect(this.sidebar).toBeVisible();
  }

  async selectVisionFramework() {
    await this.visionFrameworkCard.click();
    await expect(this.contentArea).toContainText('Vision Framework');
  }

  async selectExecutiveOnePager() {
    await this.executiveOnePagerCard.click();
    await expect(this.contentArea).toContainText('Executive One-Pager');
  }

  async selectFounderBrief() {
    await this.founderBriefCard.click();
    await expect(this.contentArea).toContainText('Vision Statement');
  }

  async selectVcSummary() {
    await this.vcSummaryCard.click();
    await expect(this.contentArea).toContainText('VC Summary');
  }

  async selectQaResults() {
    await this.qaResultsCard.click();
    await expect(this.contentArea).toContainText('QA Results');
  }

  async exportPdf() {
    // Listen for download
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportPdfButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    return download;
  }

  async exportAll() {
    await this.exportAllButton.click();
    // Wait for downloads to complete
    await this.page.waitForTimeout(2000);
  }

  // Assertions
  async expectDocumentStatus(docId: string, status: 'complete' | 'draft' | 'empty') {
    const docCard = this.page.getByTestId(`sos-doc-${docId}`);
    const statusBadge = docCard.getByTestId('sos-doc-status');
    await expect(statusBadge).toContainText(status);
  }

  async expectLensDashboardVisible() {
    await expect(this.lensDashboard).toBeVisible();
  }

  async expectContentLoaded(documentTitle: string) {
    await expect(this.contentArea).toContainText(documentTitle);
  }
}

