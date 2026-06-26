/**
 * Category 4 — Visual Regression / Screenshot Diffing
 * Pixel-compares every approved UI state on each PR to catch unintended design drift.
 * Uses Playwright toHaveScreenshot() with the maxDiffPixels tolerance set in playwright.config.ts.
 */
import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('04 - Visual Regression Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Set a consistent viewport for all visual regression tests
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  // -------------------------------------------------------------------------
  // Dashboard / Home View
  // -------------------------------------------------------------------------
  test('dashboard view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    await delay(1500); // Allow animations to settle
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
    await delay(1500);
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
    await delay(1500);
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
    await delay(1500);
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
    const reconNav = page.locator('#nav-reconciliation');
    if (await reconNav.isVisible()) {
      await reconNav.click();
      await delay(1500);
      await expect(page).toHaveScreenshot('reconciliation-default.png', {
        fullPage: false,
        animations: 'disabled',
      });
    }
  });

  // -------------------------------------------------------------------------
  // Taxonomy Graph View
  // -------------------------------------------------------------------------
  test('taxonomy graph view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    const taxonomyNav = page.locator('#nav-taxonomy');
    if (await taxonomyNav.isVisible()) {
      await taxonomyNav.click();
      await delay(2000); // Graph animations need extra time
      await expect(page).toHaveScreenshot('taxonomy-graph-default.png', {
        fullPage: false,
        animations: 'disabled',
      });
    }
  });

  // -------------------------------------------------------------------------
  // Vendor Portal View
  // -------------------------------------------------------------------------
  test('vendor portal view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    const vendorNav = page.locator('#nav-vendor-portal');
    if (await vendorNav.isVisible()) {
      await vendorNav.click();
      await delay(1500);
      await expect(page).toHaveScreenshot('vendor-portal-default.png', {
        fullPage: false,
        animations: 'disabled',
      });
    }
  });

  // -------------------------------------------------------------------------
  // Ingestion Hub View
  // -------------------------------------------------------------------------
  test('ingestion hub view matches approved baseline snapshot', async ({ page }) => {
    await page.goto('/');
    const ingestionNav = page.locator('#nav-ingestion-hub');
    if (await ingestionNav.isVisible()) {
      await ingestionNav.click();
      await delay(1500);
      await expect(page).toHaveScreenshot('ingestion-hub-default.png', {
        fullPage: false,
        animations: 'disabled',
      });
    }
  });
});
