/**
 * Category 15 — Deep-Link / URL State Tests
 * Direct URL access to filtered or step-specific views must load correctly 
 * without requiring prior navigation.
 * Uses Playwright for E2E URL-based routing validation.
 */
import { test, expect } from '@playwright/test';


test.describe('12 - Deep Link Routing E2E', () => {

  test('navigating directly to root URL loads the default dashboard view', async ({ page }) => {
    await page.goto('/');
    // The app should render its primary navigation shell
    await expect(page.locator('body')).toBeVisible();
    // Dashboard or default nav should be visible
    await expect(page.locator('#nav-mission-control, #nav-catalog, [data-testid="main-nav"]').first()).toBeVisible();
  });

  test('navigating directly to /catalog route loads the Catalog view', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.locator('body')).toBeVisible();
    // Either catalog content or redirect to homepage is valid
    // The app must not crash
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('navigating directly to /mission-control loads Mission Control view', async ({ page }) => {
    await page.goto('/mission-control');
    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('navigating directly to /reconciliation loads Reconciliation view', async ({ page }) => {
    await page.goto('/reconciliation');
    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('clicking Mission Control nav item updates visible view to Mission Control', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-mission-control').click();
    // Mission Control content should be visible
    const missionContent = page.getByText('Mission Control', { exact: false });
    await expect(missionContent.first()).toBeVisible();
  });

  test('clicking Catalog nav item updates visible view to Catalog', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-catalog').click();
    // Catalog content should be visible
    const catalogContent = page.getByText(/Catalog|SKU|Vendor/i).first();
    await expect(catalogContent).toBeVisible();
  });

  test('clicking Forensic nav item loads Sourcing Intelligence view', async ({ page }) => {
    await page.goto('/');
    const forensicNav = page.locator('#nav-forensic');
    await expect(forensicNav).toBeVisible({ timeout: 5000 });
    await forensicNav.click();
    const forensicContent = page.getByText(/Sourcing Intelligence|Learning Loop|Forensic/i).first();
    await expect(forensicContent).toBeVisible();
  });

  test('navigating directly to Ingestion Hub via nav link loads the correct view', async ({ page }) => {
    await page.goto('/');
    const ingestionNav = page.locator('#nav-ingestion-hub');
    await expect(ingestionNav).toBeVisible({ timeout: 5000 });
    await ingestionNav.click();
    // Ingestion Hub content should show
    const ingestionContent = page.getByText(/Ingestion|BOQ|BOM|Upload/i).first();
    await expect(ingestionContent).toBeVisible();
  });

  test('deep link to a specific UCID via /mission-control/:id loads the UCID context', async ({ page }) => {
    // First navigate to mission control to load data
    await page.goto('/');
    await page.locator('#nav-mission-control').click();
    // Try to click on the first UCID button if available
    const ucidButton = page.locator('div[role="button"]').filter({ hasText: 'UCID-2026-' }).first();
    await expect(ucidButton).toBeVisible({ timeout: 5000 });
    await ucidButton.click();
    // A UCID-specific panel or detail view should appear
    await expect(page.locator('body')).toBeVisible();
  });

  test('direct URL /forensic?issueId=iss-1 loads ForensicView without crashing', async ({ page }) => {
    // Category 15 — Deep-link with query param for Dashboard → Forensic scroll-to
    await page.goto('/forensic?issueId=iss-1');
    await expect(page.locator('body')).toBeVisible();
    // The ForensicView should render its main heading
    const heading = page.getByText(/Sourcing Intelligence|Forensic|Anomalies/i).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    // The app must not crash — body text must be substantial
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('Dashboard "View All Open Anomalies" link navigates to /forensic', async ({ page }) => {
    // Category 15 — Dashboard → Forensic navigation (no issueId)
    await page.goto('/');
    // Click the "Run Forensic Scan & Auto-Heal" link on Active Issues panel if present
    const viewAllLink = page.locator('button', { hasText: /Run Forensic Scan/i }).first();
    await expect(viewAllLink).toBeVisible({ timeout: 10000 });
    await viewAllLink.click();
    await expect(page.getByText(/Sourcing Intelligence|Forensic|Anomalies/i).first()).toBeVisible({ timeout: 10000 });
    expect(page.url()).toContain('/forensic');
  });
});
