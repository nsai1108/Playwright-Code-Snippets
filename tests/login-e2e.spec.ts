import { test, expect } from '@playwright/test';


// Appendix A: Sample End-to-End Test
// Login flow (Positive + optional Negative)

test.describe('Login Flow (E2E)', () => {

  // Navigate to login page before every test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');  // stabilizes the page
  });

  // Successful Login Scenario
  test('successful login', async ({ page }) => {
    // Fill form fields
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('pass123');

    // Submit
    await page.getByRole('button', { name: 'Log in' }).click();

    // State-based waiting: Wait for navigation to dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Optional: Verify welcome message
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });

  // Optional: Negative Scenario (Invalid login)
  test('invalid login shows error message', async ({ page }) => {
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('badpass');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Auto-retry built into expect()
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

});