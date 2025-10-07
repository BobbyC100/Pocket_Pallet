import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Banyan UI testing
 * 
 * Test tiers:
 * - @smoke: Fast tests that run on every commit (login, navigation, basic load)
 * - @flow: End-to-end flows that run on PRs (Vision Framework, SOS generation)
 * - @full: Comprehensive tests that run nightly (all routes, edge cases)
 */
export default defineConfig({
  testDir: './tests',
  
  // Timeout for each test
  timeout: 60000,
  
  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,
  
  // Parallel execution
  workers: process.env.CI ? 2 : undefined,
  
  // Reporter config
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Global test configuration
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace on failure for debugging
    trace: 'retain-on-failure',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Action timeout
    actionTimeout: 15000,
  },
  
  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Start dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // Output directory for test artifacts
  outputDir: 'test-results',
});
