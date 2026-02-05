import { test, expect } from '@playwright/test';
import { compareWithBaseline, writeBaselineIfNeeded, PerfBaseline } from '../utils/perf-baselines';

test.describe('Performance Baselines', () => {
  test('Homepage meets performance budgets', async ({ page }) => {
    const url = 'http://localhost:3000/';

    // Navigate and wait for network to become idle to stabilize numbers
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // ---- Collect core metrics from Navigation Timing L2 ----
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      // Commonly monitored metrics
      const ttfb = nav.responseStart - nav.requestStart;                  // Time to First Byte
      const domContentLoaded = nav.domContentLoadedEventEnd - nav.startTime;
      const load = nav.loadEventEnd - nav.startTime;                      // onload (classic "load time")
      const dns = nav.domainLookupEnd - nav.domainLookupStart;
      const tcp = nav.connectEnd - nav.connectStart;
      const tls = (nav.secureConnectionStart > 0) ? (nav.connectEnd - nav.secureConnectionStart) : 0;
      const redirect = nav.redirectCount > 0 ? nav.redirectEnd - nav.redirectStart : 0;
      const fetchToLoad = nav.loadEventEnd - nav.fetchStart;              // your original snippet baseline

      // Paint metrics (if available)
      const paintEntries = performance.getEntriesByType('paint') as PerformanceEntryList;
      let fcp = NaN;
      for (const e of paintEntries) {
        if (e.name === 'first-contentful-paint') {
          fcp = e.startTime;
        }
      }

      return {
        ttfb, domContentLoaded, load, dns, tcp, tls, redirect, fetchToLoad, fcp
      };
    });

    // ---- Define (or load) your baseline constraints ----
    // Set tight but realistic budgets (in ms). You can tune these over time.
    const expected: PerfBaseline = {
      route: 'homepage',
      budgets: {
        // Keep your original check:
        fetchToLoad: 3000,

        // Common sensible budgets (adjust as needed):
        ttfb: 600,
        domContentLoaded: 2000,
        load: 3000,
        fcp: 2000,

        // Network phase timings (optional):
        dns: 120,
        tcp: 300,
        tls: 350,
        redirect: 0
      },
      // optional tolerances to avoid flakiness (ms)
      tolerance: {
        // Allows minor variance without failing CI
        default: 100,
        // You can override per-metric if needed:
        // fcp: 150,
      }
    };

    // ---- Compare against stored baseline (if present), else use "expected" ----
    const comparison = await compareWithBaseline('perf-baselines/homepage.json', metrics, expected);

    // Log current metrics for visibility in CI
    console.log('Measured metrics (ms):', metrics);
    console.log('Applied budgets (ms):', comparison.appliedBudgets);
    if (comparison.diff && Object.keys(comparison.diff).length) {
      console.log('Diff vs stored baseline:', comparison.diff);
    }

    // ---- Enforce budgets ----
    for (const [metric, value] of Object.entries(metrics)) {
      const budget = comparison.appliedBudgets[metric as keyof PerfBaseline['budgets']];
      if (typeof budget === 'number' && Number.isFinite(budget)) {
        expect.soft(value as number, `${metric} should be < ${budget}ms`).toBeLessThanOrEqual(budget);
      }
    }

    // Example: keep the exact assertion from your snippet
    expect(metrics.fetchToLoad).toBeLessThan(3000);

    // ---- Optionally refresh the baseline on demand ----
    // Run `UPDATE_BASELINES=1 npx playwright test` to update JSON
    await writeBaselineIfNeeded('perf-baselines/homepage.json', metrics, expected);
  });
});