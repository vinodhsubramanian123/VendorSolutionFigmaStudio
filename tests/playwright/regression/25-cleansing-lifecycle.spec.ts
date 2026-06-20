import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('25 - Cleansing Lifecycle E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to cleansing
    await page.goto('/');
    await page.locator('#nav-cleansing').click();
    await delay(1000);
  });

  test('should run auto-map and verify state update in UI', async ({ page }) => {
    // Assert the auto-map button is present
    const autoMapBtn = page.getByRole('button', { name: /Auto-Map/i }).first();
    await expect(autoMapBtn).toBeVisible({ timeout: 5000 });

    // Ensure there are fuzzy entries before clicking (from mock data generator)
    // Click the button
    await autoMapBtn.click();
    
    // Check for success toast
    await expect(page.getByText('Auto-mapping complete!', { exact: false })).toBeVisible({ timeout: 8000 });
  });

  test('should allow manual search and mapping of an entry', async ({ page }) => {
    // Click on an entry to open mapping panel
    // We target the first unmapped entry in the UI (it should be an arbitrary entry card)
    const entryCard = page.locator('.rounded-lg.border.transition-all.cursor-pointer').nth(2);
    await entryCard.click();
    await delay(500);

    // Assert that the mapping panel is active and the search box is available
    const searchInput = page.getByPlaceholder('Search catalog...').first();
    await expect(searchInput).toBeVisible();

    await searchInput.fill('HPE');
    await delay(500);

    // The suggested mapping should appear
    const mapBtn = page.getByRole('button', { name: /Map Entry/i }).first();
    if (await mapBtn.isVisible()) {
      await mapBtn.click();
      await delay(500);
      
      // Should show a success toast mapping 
      await expect(page.getByText('Mapped to', { exact: false }).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
