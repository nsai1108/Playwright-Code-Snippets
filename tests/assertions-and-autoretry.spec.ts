import { test, expect } from '@playwright/test';

test.describe('Assertions & Auto-Retry Demo', () => {
  test('Navigate & verify content with auto-retry', async ({ page }) => {

    // Navigate to page — Playwright waits for DOM ready state
    await page.goto('https://playwright.dev');

    // 1. Title Assertions (Auto-retry built in)
    // Playwright retries until the title matches or timeout occurs
    await expect(page).toHaveTitle(/Playwright/);

    // 2. Locator-based click (auto-wait for: visible, stable, enabled)
    await page.getByRole('link', { name: 'Get started' }).click();

    // 3. URL Assertions (auto-retry)
    await expect(page).toHaveURL(/.*intro/);

    // 4. Element Assertions with auto-retry
    // Expect the sidebar navigation to appear
    const introHeading = page.getByRole('heading', { name: 'Installation' });
    await expect(introHeading).toBeVisible();

    // 5. Soft Assertions (non-blocking)
    // Failure here will NOT stop the test
    await expect.soft(page.getByText('Optional')).toBeVisible();

    // 6. Multiple soft checks
    // Useful for reporting multiple failures together
    await expect.soft(page.getByRole('link', { name: 'Docs' })).toBeVisible();
    await expect.soft(page.getByRole('link', { name: 'API' })).toBeVisible();

    // 7. Example of combined hard + soft expectations
    await expect(page.locator('.navbar__inner')).toBeVisible();  // Hard assertion
    await expect.soft(page.locator('.non-existent-element')).toHaveCount(1); // Soft (won't fail test)
  });
});