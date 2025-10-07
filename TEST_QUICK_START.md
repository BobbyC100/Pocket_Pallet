# Quick Start: Running Banyan UI Tests

Get started with UI testing in less than 5 minutes.

## 1. Install Playwright Browsers

```bash
npx playwright install
```

## 2. Run Your First Test

```bash
# Run smoke tests (fastest, ~1-2 minutes)
npm run test:smoke
```

You should see output like:

```
Running 9 tests using 1 worker

  ✓ [chromium] › smoke/landing.spec.ts:8:3 › Landing Page - Smoke Tests › should load landing page
  ✓ [chromium] › smoke/landing.spec.ts:15:3 › Landing Page - Smoke Tests › should navigate to /new
  ✓ [chromium] › smoke/vision-framework.spec.ts:26:3 › Vision Framework - Smoke Tests › should load
  ...

  9 passed (34.2s)
```

## 3. View Interactive Report

If any tests fail:

```bash
npm run test:report
```

This opens an HTML report showing:
- Which tests passed/failed
- Screenshots of failures
- Step-by-step traces

## 4. Try Interactive Mode

```bash
npm run test:ui
```

This opens Playwright's UI where you can:
- Run tests with a click
- Watch tests execute in real-time
- Debug failed tests
- Time-travel through test execution

## 5. Write Your First Test

Create `tests/smoke/my-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('my first test', async ({ page }) => {
  await page.goto('/');
  
  const heading = page.getByRole('heading', { 
    name: /from first draft to focused strategy/i 
  });
  
  await expect(heading).toBeVisible();
});
```

Run it:

```bash
npm run test:smoke
```

## Common Commands

```bash
# Quick smoke tests
npm run test:smoke

# Flow tests (user journeys)
npm run test:flow

# All tests
npm test

# Interactive mode
npm run test:ui

# Debug specific test
npm run test:debug tests/smoke/landing.spec.ts
```

## Next Steps

- Read [UI_TESTING_GUIDE.md](./UI_TESTING_GUIDE.md) for complete documentation
- Check out existing tests in `tests/smoke/` and `tests/flow/`
- Learn about Page Object Model in `tests/page-objects/`

## Troubleshooting

**Port 3000 in use?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Browser issues?**
```bash
npx playwright install --with-deps
```

**Need help?**
- View [UI_TESTING_GUIDE.md](./UI_TESTING_GUIDE.md)
- Check [Playwright docs](https://playwright.dev)
- Ask in team chat

---

That's it! You're ready to start testing. 🎭

