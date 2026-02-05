import { test, expect, request } from '@playwright/test';
test.describe('Hybrid UI + API Automation Strategy', () => {
  // Use API to create test data (fast & stable)
  test('Create user via API, authenticate via API, verify UI behavior', async ({ page }) => {
    // Create an APIRequestContext for API calls
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:3000'
    });
    // Create a user via API
    const createUserRes = await apiContext.post('/api/users', {
      data: {
        name: 'Test User',
        email: 'test.user@example.com'
      }
    });

    expect(createUserRes.status()).toBe(201);
    const createdUser = await createUserRes.json();
    console.log('User created:', createdUser);

    // Authenticate via API (no UI login needed)
    const loginRes = await apiContext.post('/api/auth/login', {
      data: {
        user: 'u',
        pass: 'p'
      }
    });

    expect(loginRes.status()).toBe(200);
    const { token } = await loginRes.json();
    // Inject authentication cookie into the browser
    await page.context().addCookies([
      {
        name: 'auth_token',
        value: token,
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Navigate to the UI — user should already be logged in
    await page.goto('http://localhost:3000/shop');

    // Validate UI state
    await expect(page.locator('.welcome-banner')).toContainText('Welcome');
    // Example: validate a product exists
    await expect(page.locator('.product-card')).toHaveCount(5);
    // Example teardown: delete the created user via API
    const deleteRes = await apiContext.delete(`/api/users/${createdUser.id}`);
    expect(deleteRes.status()).toBe(200);
  });
});