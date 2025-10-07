import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object Model for Vision Framework V2
 * 
 * Provides methods for interacting with the Vision Framework page
 * and verifying its state in E2E tests.
 */
export class VisionFrameworkPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation
  async goto() {
    await this.page.goto('/vision-framework-v2');
    await this.page.waitForLoadState('networkidle');
  }

  // Locators - Header
  get backButton(): Locator {
    return this.page.getByTestId('vf2-back-button');
  }

  get pageTitle(): Locator {
    return this.page.getByTestId('vf2-page-title');
  }

  get saveButton(): Locator {
    return this.page.getByTestId('vf2-save-button');
  }

  get scoreLensButton(): Locator {
    return this.page.getByTestId('vf2-score-lens-button');
  }

  get saveIndicator(): Locator {
    return this.page.getByTestId('vf2-save-indicator');
  }

  // Locators - Tabs
  get editTab(): Locator {
    return this.page.getByTestId('vf2-tab-edit');
  }

  get onePagerTab(): Locator {
    return this.page.getByTestId('vf2-tab-onepager');
  }

  get qaTab(): Locator {
    return this.page.getByTestId('vf2-tab-qa');
  }

  // Locators - Vision Section
  get visionSection(): Locator {
    return this.page.getByTestId('vf2-section-vision');
  }

  get visionTextarea(): Locator {
    return this.page.getByTestId('vf2-vision-textarea');
  }

  get visionRefineButton(): Locator {
    return this.page.getByTestId('vf2-vision-refine-button');
  }

  // Locators - Strategy Section
  get strategySection(): Locator {
    return this.page.getByTestId('vf2-section-strategy');
  }

  get strategyInputs(): Locator {
    return this.page.getByTestId('vf2-strategy-input');
  }

  get addStrategyButton(): Locator {
    return this.page.getByTestId('vf2-add-strategy-button');
  }

  // Locators - Operating Principles Section
  get operatingPrinciplesSection(): Locator {
    return this.page.getByTestId('vf2-section-operating-principles');
  }

  get operatingPrinciplesInputs(): Locator {
    return this.page.getByTestId('vf2-operating-principle-input');
  }

  get addOperatingPrincipleButton(): Locator {
    return this.page.getByTestId('vf2-add-operating-principle-button');
  }

  // Locators - Near-term Bets Section
  get nearTermBetsSection(): Locator {
    return this.page.getByTestId('vf2-section-near-term-bets');
  }

  get betCards(): Locator {
    return this.page.getByTestId('vf2-bet-card');
  }

  get addBetButton(): Locator {
    return this.page.getByTestId('vf2-add-bet-button');
  }

  // Locators - Metrics Section
  get metricsSection(): Locator {
    return this.page.getByTestId('vf2-section-metrics');
  }

  get metricCards(): Locator {
    return this.page.getByTestId('vf2-metric-card');
  }

  get addMetricButton(): Locator {
    return this.page.getByTestId('vf2-add-metric-button');
  }

  // Locators - Tensions Section
  get tensionsSection(): Locator {
    return this.page.getByTestId('vf2-section-tensions');
  }

  get tensionInputs(): Locator {
    return this.page.getByTestId('vf2-tension-input');
  }

  get addTensionButton(): Locator {
    return this.page.getByTestId('vf2-add-tension-button');
  }

  // Locators - Lens Badge
  get lensBadge(): Locator {
    return this.page.getByTestId('vf2-lens-badge');
  }

  // Actions
  async expectLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.editTab).toBeVisible();
  }

  async openOnePagerTab() {
    await this.onePagerTab.click();
    await expect(this.page.getByTestId('vf2-onepager-content')).toBeVisible();
  }

  async openQaTab() {
    await this.qaTab.click();
    await expect(this.page.getByTestId('vf2-qa-content')).toBeVisible();
  }

  async editVision(text: string) {
    await this.visionTextarea.fill(text);
  }

  async addStrategy(text: string) {
    await this.addStrategyButton.click();
    const inputs = await this.strategyInputs.all();
    await inputs[inputs.length - 1].fill(text);
  }

  async addBet(bet: { bet: string; owner: string; horizon: string; measure: string }) {
    await this.addBetButton.click();
    const cards = await this.betCards.all();
    const lastCard = cards[cards.length - 1];
    
    await lastCard.getByTestId('vf2-bet-input').fill(bet.bet);
    await lastCard.getByTestId('vf2-bet-owner-input').fill(bet.owner);
    await lastCard.getByTestId('vf2-bet-horizon-select').selectOption(bet.horizon);
    await lastCard.getByTestId('vf2-bet-measure-input').fill(bet.measure);
  }

  async addMetric(metric: { name: string; target: string; cadence: string }) {
    await this.addMetricButton.click();
    const cards = await this.metricCards.all();
    const lastCard = cards[cards.length - 1];
    
    await lastCard.getByTestId('vf2-metric-name-input').fill(metric.name);
    await lastCard.getByTestId('vf2-metric-target-input').fill(metric.target);
    await lastCard.getByTestId('vf2-metric-cadence-select').selectOption(metric.cadence);
  }

  async save() {
    await this.saveButton.click();
    await expect(this.saveIndicator).toContainText('Saved');
  }

  async scoreLens() {
    await this.scoreLensButton.click();
    // Wait for scoring to complete
    await this.page.waitForTimeout(2000);
    await expect(this.lensBadge).toBeVisible();
  }

  // Assertions
  async expectVisionValue(text: string) {
    await expect(this.visionTextarea).toHaveValue(text);
  }

  async expectStrategyCount(count: number) {
    await expect(this.strategyInputs).toHaveCount(count);
  }

  async expectBetCount(count: number) {
    await expect(this.betCards).toHaveCount(count);
  }

  async expectMetricCount(count: number) {
    await expect(this.metricCards).toHaveCount(count);
  }
}

