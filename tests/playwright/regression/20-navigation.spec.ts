import { test, expect } from '@playwright/test';

test.describe('Navigation History (Back and Forward)', () => {
  test('should correctly step through history using browser back and forward', async ({ page }) => {
    // Navigate to dashboard first
    await page.goto('/');
    
    // Verify we are on the dashboard
    await expect(page.locator('text=Intelligence Dashboard Overview')).toBeVisible();

    // Click on Ingestion Hub from Sidebar
    await page.click('button#nav-ingestion-hub');
    await expect(page.locator('text=Centralized BOQ & BOM Ingestion Hub').first()).toBeVisible();
    await expect(page).toHaveURL(/.*\/ingestion-hub/);

    // Click on Catalog SKU Manager from Sidebar
    await page.click('button#nav-catalog');
    await expect(page.locator('text=Unified Vendor Catalog SKU Manager').first()).toBeVisible();
    await expect(page).toHaveURL(/.*\/catalog/);

    // Test Browser Back (Catalog -> Ingestion Hub)
    await page.goBack();
    await expect(page.locator('text=Centralized BOQ & BOM Ingestion Hub').first()).toBeVisible();
    await expect(page).toHaveURL(/.*\/ingestion-hub/);

    // Test Browser Back (Ingestion Hub -> Dashboard)
    await page.goBack();
    await expect(page.locator('text=Intelligence Dashboard Overview')).toBeVisible();
    await expect(page).toHaveURL(/.*\//);

    // Test Browser Forward (Dashboard -> Ingestion Hub)
    await page.goForward();
    await expect(page.locator('text=Centralized BOQ & BOM Ingestion Hub').first()).toBeVisible();
    await expect(page).toHaveURL(/.*\/ingestion-hub/);

    // Test Browser Forward (Ingestion Hub -> Catalog)
    await page.goForward();
    await expect(page.locator('text=Unified Vendor Catalog SKU Manager').first()).toBeVisible();
    await expect(page).toHaveURL(/.*\/catalog/);
  });
});
