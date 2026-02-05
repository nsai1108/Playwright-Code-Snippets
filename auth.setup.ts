import { test as setup } from '@playwright/test';
const authFile = 'playwright/.auth/user.json';
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('SecurePass123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: authFile });
});