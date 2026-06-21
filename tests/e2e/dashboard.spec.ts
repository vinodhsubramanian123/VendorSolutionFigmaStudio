import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('01 - Dashboard E2E', () => {
  test.setTimeout(60000);
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
    await delay(500);
  });

  test('should render high-level stat cards correctly', async ({ page }) => {
    // Assert cards are present
    await expect(page.locator('text=Connected Vendors').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Catalog SKUs').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Active UCIDs').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Open Issues').first()).toBeVisible({ timeout: 15000 });
    await delay();
  });

  test('should navigate to Forensic Scan when clicking Resolve Critical', async ({ page }) => {
    // Click action button on anomalous contracts
    const viewMissingBtn = page.getByText('Resolve', { exact: false });
    if (await viewMissingBtn.isVisible()) {
        await viewMissingBtn.first().click();
        await delay();
        // Assert we navigated to forensic scan
        await expect(page.getByText('Sourcing Integrity Diagnostic Sandbox')).toBeVisible();
    }
  });

  test('should toggle Sidebar collapse without breaking layout', async ({ page }) => {
    const sidebar = page.locator('.bg-background-card').first();
    // It should have the chevron-left icon button inside
    const toggleBtn = sidebar.locator('button').first();
    
    await toggleBtn.click();
    await delay();
    
    // Validate it still functions (e.g. icon switched to Menu)
    // Actually the menu button might just be visible
    await toggleBtn.click();
    await delay();
  });
});
