import { test, expect } from '@playwright/test';


test.describe('10 - Data Persistence Gate E2E', () => {
  test('should boot successfully without throwing Session Corrupted error', async ({ page }) => {
    // Navigate to root
    await page.goto('/');
    
    // Wait for the app to settle
    // Assert that the DataPersistenceGate error screen is NOT visible
    const corruptedHeading = page.getByText('Session Data Corrupted');
    await expect(corruptedHeading).not.toBeVisible();

    // Assert that standard UI is visible
    const dashboardHeading = page.getByText('Intelligence Dashboard Overview');
    await expect(dashboardHeading).toBeVisible({ timeout: 5000 });
  });

  test('should persist state across navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Catalog
    await page.locator('#nav-catalog').click();
    await expect(page.getByText('Central Sourcing Database', { exact: false }).first()).toBeVisible({ timeout: 8000 });

    // Navigate to Dashboard
    await page.locator('#nav-dashboard').click();
    await expect(page.getByText('Intelligence Dashboard Overview').first()).toBeVisible({ timeout: 5000 });
  });
});
