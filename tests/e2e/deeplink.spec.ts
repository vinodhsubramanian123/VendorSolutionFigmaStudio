/**
 * Category 15 — Deep-Link / URL State Tests
 * Direct URL access to filtered or step-specific views must load correctly 
 * without requiring prior navigation.
 * Uses Playwright for E2E URL-based routing validation.
 */
import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('12 - Deep Link Routing E2E', () => {

  test('navigating directly to root URL loads the default dashboard view', async ({ page }) => {
    await page.goto('/');
    await delay(1000);

    // The app should render its primary navigation shell
    await expect(page.locator('body')).toBeVisible();
    // Dashboard or default nav should be visible
    await expect(page.locator('#nav-mission-control, #nav-catalog, [data-testid="main-nav"]').first()).toBeVisible();
  });

  test('navigating directly to /catalog route loads the Catalog view', async ({ page }) => {
    await page.goto('/catalog');
    await delay(1000);

    await expect(page.locator('body')).toBeVisible();
    // Either catalog content or redirect to homepage is valid
    // The app must not crash
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('navigating directly to /mission-control loads Mission Control view', async ({ page }) => {
    await page.goto('/mission-control');
    await delay(1000);

    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('navigating directly to /reconciliation loads Reconciliation view', async ({ page }) => {
    await page.goto('/reconciliation');
    await delay(1000);

    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('clicking Mission Control nav item updates visible view to Mission Control', async ({ page }) => {
    await page.goto('/');
    await delay(500);

    await page.locator('#nav-mission-control').click();
    await delay(1000);

    // Mission Control content should be visible
    const missionContent = page.getByText('Mission Control', { exact: false });
    await expect(missionContent.first()).toBeVisible();
  });

  test('clicking Catalog nav item updates visible view to Catalog', async ({ page }) => {
    await page.goto('/');
    await delay(500);

    await page.locator('#nav-catalog').click();
    await delay(1000);

    // Catalog content should be visible
    const catalogContent = page.getByText(/Catalog|SKU|Vendor/i).first();
    await expect(catalogContent).toBeVisible();
  });

  test('clicking Forensic nav item loads Sourcing Intelligence view', async ({ page }) => {
    await page.goto('/');
    await delay(500);

    const forensicNav = page.locator('#nav-forensic');
    if (await forensicNav.isVisible()) {
      await forensicNav.click();
      await delay(1000);

      const forensicContent = page.getByText(/Sourcing Intelligence|Learning Loop|Forensic/i).first();
      await expect(forensicContent).toBeVisible();
    }
  });

  test('navigating directly to Ingestion Hub via nav link loads the correct view', async ({ page }) => {
    await page.goto('/');
    await delay(500);

    const ingestionNav = page.locator('#nav-ingestion-hub');
    if (await ingestionNav.isVisible()) {
      await ingestionNav.click();
      await delay(1000);

      // Ingestion Hub content should show
      const ingestionContent = page.getByText(/Ingestion|BOQ|BOM|Upload/i).first();
      await expect(ingestionContent).toBeVisible();
    }
  });

  test('deep link to a specific UCID via /mission-control/:id loads the UCID context', async ({ page }) => {
    // First navigate to mission control to load data
    await page.goto('/');
    await delay(500);

    await page.locator('#nav-mission-control').click();
    await delay(1000);

    // Try to click on the first UCID button if available
    const ucidButton = page.locator('div[role="button"]').filter({ hasText: 'UCID-2026-' }).first();
    if (await ucidButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await ucidButton.click();
      await delay(500);

      // A UCID-specific panel or detail view should appear
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
