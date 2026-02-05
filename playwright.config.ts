import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  
testDir: './tests',
  timeout: 30 * 1000,

  // ---------------------------------------------
  // Retries → enable trace/screenshot on retry
  // ---------------------------------------------
  retries: 1,
  reporter: [['html'], ['list']],
  
use: {
    // ---------------------------------------------
    // Tracing (record traces when retrying)
    // ---------------------------------------------
    trace: 'on-first-retry',

    // ---------------------------------------------
    // Screenshots: only capture on failure
    // ---------------------------------------------
    screenshot: 'only-on-failure',

    // ---------------------------------------------
    // Video: store when a test fails
    // ---------------------------------------------
    video: 'retain-on-failure',

    // ---------------------------------------------
    // Execution settings
    // ---------------------------------------------
    actionTimeout: 10_000,
    navigationTimeout: 15_000,

    // Avoid test flakiness by auto‑waiting
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:3000',
  },

	
  // Parallelism & workers
  workers: process.env.CI ? 4 : undefined,

  // Browser configs
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});