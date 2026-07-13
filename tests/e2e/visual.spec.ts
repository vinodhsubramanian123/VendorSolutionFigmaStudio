/**
 * Category 4 — Visual Regression / Screenshot Diffing
 * Pixel-compares every approved UI state on each PR to catch unintended design drift.
 * Uses Playwright toHaveScreenshot() with the maxDiffPixels tolerance set in playwright.config.ts.
 */
import { test, expect, type Page } from '@playwright/test';

const VISUAL_NOW_ISO = '2026-06-28T19:38:42.000Z';

async function freezeVisualClock(page: Page) {
  await page.addInitScript((isoNow) => {
    const fixedTime = new Date(isoNow as string).getTime();
    const NativeDate = Date;

    class FrozenDate extends NativeDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(fixedTime);
          return;
        }
        super(...(args as []));
      }

      static now() {
        return fixedTime;
      }
    }

    FrozenDate.UTC = NativeDate.UTC;
    FrozenDate.parse = NativeDate.parse;
    FrozenDate.prototype = NativeDate.prototype;

    globalThis.Date = FrozenDate as DateConstructor;
  }, VISUAL_NOW_ISO);
}

async function settleVisualView(page: Page, visibleText: RegExp | string, timeout?: number) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });
  await expect(page.getByText(visibleText).first()).toBeVisible({ timeout: timeout || 15000 });
  await page.evaluate(() => document.fonts.ready);
  // Stabilize virtualized lists (e.g. Virtuoso) by flushing animation frames and giving ResizeObserver a beat to settle
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
  await page.waitForTimeout(100);
}

test.describe('04 - Visual Regression Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Set a consistent viewport for all visual regression tests
    await page.setViewportSize({ width: 1280, height: 900 });
    await freezeVisualClock(page);
  });

  // -------------------------------------------------------------------------
  // Dashboard / Home View
  // -------------------------------------------------------------------------
  test('dashboard view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await settleVisualView(page, 'Procurement Intelligence Hub');
    await expect(page).toHaveScreenshot('dashboard-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Catalog View
  // -------------------------------------------------------------------------
  test('catalog view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-catalog').click();
    await settleVisualView(page, 'Taxonomy & Sourcing Cardinality Clarity Tool');
    await expect(page).toHaveScreenshot('catalog-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Mission Control View
  // -------------------------------------------------------------------------
  test('mission control view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-mission-control').click();
    await settleVisualView(page, /Active Mission|No Active Missions|Campaign/i);
    await expect(page).toHaveScreenshot('mission-control-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Forensics / Sourcing Intelligence View
  // -------------------------------------------------------------------------
  test('forensic sourcing view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-forensic').click();
    await settleVisualView(page, 'Sourcing Integrity Diagnostic Sandbox');
    await expect(page).toHaveScreenshot('forensic-sourcing-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Reconciliation View
  // -------------------------------------------------------------------------
  test('reconciliation view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-reconciliation').click();
    await settleVisualView(page, 'BOM DRIFT RECONCILIATION');
    await expect(page).toHaveScreenshot('reconciliation-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Taxonomy Graph View
  // -------------------------------------------------------------------------
  test('taxonomy graph view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-taxonomy-graph').click();
    await settleVisualView(page, 'Filter Orphans');
    await expect(page).toHaveScreenshot('taxonomy-graph-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Vendor Portal View
  // -------------------------------------------------------------------------
  test('vendor portal view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-vendor-portal').click();
    await settleVisualView(page, 'Vendor API Integrations & Health');
    await expect(page).toHaveScreenshot('vendor-portal-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Ingestion Hub View
  // -------------------------------------------------------------------------
  test('ingestion hub view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-ingestion-hub').click();
    await settleVisualView(page, 'Run Backend API Ingest (Simulation Sandbox)');
    await expect(page).toHaveScreenshot('ingestion-hub-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Cleansing Workshop View
  // -------------------------------------------------------------------------
  test('cleansing workshop view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-cleansing').click();
    await settleVisualView(page, 'Interactive Splicing Workshop');
    await expect(page).toHaveScreenshot('cleansing-workshop-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Solution Configurator View
  // -------------------------------------------------------------------------
  test('solution configurator view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-solution-builder').click();
    await settleVisualView(page, 'Mission Builder', 15000);
    await expect(page).toHaveScreenshot('solution-configurator-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Solutions Portfolio View
  // -------------------------------------------------------------------------
  test('solutions portfolio view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-solutions').click();
    await settleVisualView(page, 'Solution Portfolio');
    await expect(page).toHaveScreenshot('solutions-portfolio-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Search View
  // -------------------------------------------------------------------------
  test('search view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-search').click();
    await settleVisualView(page, 'Cognitive Sourcing Knowledge Explorer');
    await expect(page).toHaveScreenshot('search-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  // -------------------------------------------------------------------------
  // Telemetry View
  // -------------------------------------------------------------------------
  test('telemetry view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-telemetry').click();
    await settleVisualView(page, /System Telemetry/);
    await expect(page).toHaveScreenshot('telemetry-default.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });
});
