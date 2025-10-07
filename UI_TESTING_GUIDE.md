# Banyan UI Testing Guide

This guide provides everything you need to run and maintain UI tests for the Banyan application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Running Tests](#running-tests)
3. [Writing Tests](#writing-tests)
4. [Test Organization](#test-organization)
5. [Debugging Failed Tests](#debugging-failed-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Visual Regression Testing](#visual-regression-testing)
8. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

Tests are already configured. To install Playwright browsers:

```bash
npx playwright install
```

Or with system dependencies:

```bash
npx playwright install --with-deps
```

## Running Tests

### Quick Commands

```bash
# Run all tests
npm test

# Run smoke tests (fast, critical paths only)
npm run test:smoke

# Run flow tests (user journeys)
npm run test:flow

# Run visual regression tests
npm run test:visual

# Run all tests across all browsers
npm run test:all

# Interactive UI mode (great for debugging)
npm run test:ui

# Debug mode (step through tests)
npm run test:debug

# View last test report
npm run test:report
```

### Test Tiers

We organize tests into three tiers:

| Tier | Tag | When | Purpose | Run Time |
|------|-----|------|---------|----------|
| **Smoke** | `@smoke` | Every commit | Critical functionality | < 2 min |
| **Flow** | `@flow` | Pull requests | User journeys | < 10 min |
| **Full** | `@full` | Nightly/On-demand | Complete coverage | < 30 min |

## Test Organization

```
tests/
├── page-objects/          # Page Object Model classes
│   ├── Landing.page.ts
│   ├── VisionFramework.page.ts
│   ├── SOS.page.ts
│   └── Dashboard.page.ts
├── smoke/                 # Fast, critical path tests
│   ├── landing.spec.ts
│   ├── vision-framework.spec.ts
│   └── sos.spec.ts
├── flow/                  # End-to-end user journey tests
│   ├── vision-framework-editing.spec.ts
│   └── sos-document-switching.spec.ts
└── visual/                # Visual regression tests
    └── layout-regression.spec.ts
```

## Writing Tests

### Using Page Object Model

Always use Page Object Model for maintainability:

```typescript
import { test, expect } from '@playwright/test';
import { VisionFrameworkPage } from '../page-objects/VisionFramework.page';

test('should edit vision statement', async ({ page }) => {
  const vfPage = new VisionFrameworkPage(page);
  
  await vfPage.goto();
  await vfPage.editVision('New vision statement');
  await vfPage.expectVisionValue('New vision statement');
});
```

### Test ID Conventions

Use data-testid attributes for stable selectors:

| Prefix | Usage | Example |
|--------|-------|---------|
| `vf2-` | Vision Framework V2 | `vf2-save-button` |
| `sos-` | Strategic Operating System | `sos-export-pdf-button` |

### Setting Up Test Data

Use `beforeEach` to set up session storage with mock data:

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const mockData = {
      framework: {
        companyId: 'test-company',
        vision: 'Test vision',
        strategy: ['Pillar 1', 'Pillar 2'],
        // ... other fields
      }
    };
    sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(mockData));
  });
});
```

## Debugging Failed Tests

### 1. View HTML Report

```bash
npm run test:report
```

Opens an interactive HTML report showing:
- Test results
- Screenshots on failure
- Video recordings
- Traces

### 2. Use Debug Mode

```bash
npm run test:debug
```

Step through tests line-by-line with Playwright Inspector.

### 3. View Traces

Click "Show Trace" in the HTML report to see:
- Network requests
- Console logs
- DOM snapshots
- Action timeline

### 4. Common Issues

**Tests timing out:**
- Increase timeout in `playwright.config.ts`
- Check if server is starting properly
- Look for infinite loops or blocking operations

**Element not found:**
- Check data-testid exists in component
- Verify element is visible (not hidden by CSS)
- Wait for load state: `await page.waitForLoadState('networkidle')`

**Flaky tests:**
- Avoid fixed waits (`page.waitForTimeout`)
- Use `expect().toBeVisible()` instead
- Mock external API calls
- Check for race conditions

## CI/CD Integration

Tests run automatically on:

- **Pull Requests**: Smoke + Flow tests (Chromium + Firefox)
- **Main branch push**: All tests
- **Manual trigger**: Full suite (all browsers)

### GitHub Actions Workflow

See `.github/workflows/ui-tests.yml` for configuration.

### Viewing CI Results

1. Go to GitHub Actions tab
2. Click on the workflow run
3. Download artifacts for:
   - Test reports
   - Screenshots
   - Videos
   - Traces

## Visual Regression Testing

Visual tests capture screenshots and compare against baseline images.

### Update Baseline Images

When visual changes are intentional:

```bash
npm run test:update-snapshots
```

### Reviewing Visual Diffs

When a visual test fails:
1. Open HTML report
2. View "Expected" vs "Actual" images
3. Check diff highlighting
4. If change is correct, update snapshots

### Visual Test Best Practices

- Only snapshot stable, non-animated elements
- Set `maxDiffPixels` threshold (usually 50-200)
- Run on single browser (Chromium) for consistency
- Update snapshots after intentional design changes

## Best Practices

### DO ✅

- Use Page Object Model for all interactions
- Use `data-testid` for element selection
- Wait for elements with `expect().toBeVisible()`
- Mock external API calls to avoid flakiness
- Write descriptive test names
- Group related tests in `describe` blocks
- Clean up test data after tests
- Use `test.beforeEach` for common setup

### DON'T ❌

- Use CSS classes or XPath for selectors
- Use fixed timeouts (`page.waitForTimeout(5000)`)
- Test implementation details
- Make external API calls in tests
- Leave tests that occasionally fail
- Create dependencies between tests
- Commit failing tests

### Accessibility Testing

Consider adding accessibility checks:

```typescript
import { test, expect } from '@playwright/test';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/vision-framework-v2');
  
  // Check for basic accessibility
  await expect(page.locator('main')).toHaveAttribute('role', 'main');
  await expect(page.locator('h1')).toBeVisible();
});
```

## Troubleshooting

### Port Already in Use

If dev server fails to start:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or set different port
BASE_URL=http://localhost:3001 npm test
```

### Browser Installation Issues

```bash
# Reinstall browsers
npx playwright install --force

# With system dependencies
npx playwright install --with-deps --force
```

### Updating Playwright

```bash
npm install -D @playwright/test@latest
npx playwright install
```

## Getting Help

- **Playwright Docs**: https://playwright.dev
- **GitHub Issues**: Report bugs in this repository
- **Team Channel**: Post questions in #engineering

---

## Quick Reference

```bash
# Common commands
npm run test:smoke          # Fast smoke tests
npm run test:flow           # User journey tests
npm run test:ui             # Interactive mode
npm run test:debug          # Debug mode
npm run test:report         # View last report

# Updating tests
npm run test:update-snapshots  # Update visual baselines

# CI
# Tests run automatically on PRs and main branch pushes
```

