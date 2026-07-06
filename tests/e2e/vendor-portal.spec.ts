import { test, expect } from '@playwright/test';


test.describe('07 - Vendor Portal E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-vendor-portal').click();
  });

  test('should verify API Latency charts and vendor grids', async ({ page }) => {
    await expect(page.getByText('Authorized Manufacturer Inventory Endpoints')).toBeVisible();
    // Verify a known mock vendor is present
    await expect(page.getByText('Hewlett Packard Enterprise').first()).toBeVisible();
  });

  test('should assert connection statuses render badge', async ({ page }) => {
    // Badges like "Connected" or "Error" exist inside cards
    await expect(page.getByText('Connected').first()).toBeVisible();
  });

  test('should interact with Web-Automator Vault', async ({ page }) => {
    await expect(page.getByText('Playwright Automator Vault')).toBeVisible();
    const testBtn = page.locator('button', { hasText: 'Test Web-Automator' });
    await expect(testBtn).toBeVisible();
  });
});
