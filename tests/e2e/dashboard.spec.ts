import { test, expect } from '@playwright/test';


test.describe('01 - Dashboard E2E', () => {
  test.setTimeout(60000);
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
    await expect(page.locator('text=Connected Vendors').first()).toBeVisible({ timeout: 15000 });
  });

  test('should render high-level stat cards correctly', async ({ page }) => {
    // Assert cards are present
    await expect(page.locator('text=Connected Vendors').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Catalog SKUs').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Active UCIDs').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Open Issues').first()).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to Forensic Scan when clicking Resolve Critical', async ({ page }) => {
    // Click action button on anomalous contracts
    const viewMissingBtn = page.locator('button[aria-label="Resolve Critical Issues"]').first();
    await expect(viewMissingBtn).toBeVisible({ timeout: 10000 });
    await viewMissingBtn.click();
    // Assert we navigated to forensic scan
    await expect(page.getByText('Sourcing Integrity Diagnostic Sandbox')).toBeVisible();
  });

  test('should toggle Sidebar collapse without breaking layout', async ({ page }) => {
    const sidebar = page.locator('.bg-background-card').first();
    await expect(sidebar).toBeVisible();
    const sidebarBoxExpanded = await sidebar.boundingBox();

    // It should have the chevron-left icon button inside
    const toggleBtn = sidebar.locator('button').first();
    await expect(toggleBtn).toBeVisible();

    await toggleBtn.click();
    const sidebarBoxCollapsed = await sidebar.boundingBox();
    // Collapsing should actually change the sidebar's width
    expect(sidebarBoxCollapsed?.width).not.toBe(sidebarBoxExpanded?.width);
    // The rest of the app shell must remain intact after collapse
    await expect(page.locator('body')).toBeVisible();

    await toggleBtn.click();
    const sidebarBoxRestored = await sidebar.boundingBox();
    // Expanding again should restore the original width
    expect(sidebarBoxRestored?.width).toBe(sidebarBoxExpanded?.width);
  });
});
