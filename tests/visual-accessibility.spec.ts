import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Visual Regression + Accessibility Suite', () => {

  test('Homepage Visual Regression & Accessibility Audit', async ({ page }) => {
    // Step 1: Navigate to page under test
    await page.goto('http://localhost:3000');

    // Wait for page to stabilize — important for visual snapshots
    await page.waitForLoadState('networkidle');

    // Step 2: Visual Regression Snapshot
    // Stores baseline on first run; compares diffs later
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100,     // adjust threshold if needed
      timeout: 5000
    });

    // Step 3: Accessibility Scan using Axe
    const accessibilityScan = await new AxeBuilder({ page })
      .withTags([
        'wcag2a',   // Level A
        'wcag2aa',  // Level AA
        'wcag21aa'  // WCAG 2.1 AA (common for enterprise)
      ])
      .analyze();

    // Log the violations (optional but useful)
    console.log('Accessibility Violations:', accessibilityScan.violations);

    // Step 4: Enforce Zero Violations
    expect(accessibilityScan.violations, 'No WCAG A/AA violations allowed')
      .toEqual([]);
  });
});