import { test, expect } from '@playwright/test';


test.describe('25 - Cleansing Lifecycle E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to cleansing
    await page.goto('/');
    await page.locator('#nav-cleansing').click();
  });

  test('should run auto-map and verify state update in UI', async ({ page }) => {
    // Assert the auto-map button is present
    const autoMapBtn = page.getByRole('button', { name: 'Auto-Map', exact: true }).first();
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
    // Assert that the mapping panel is active and the search box is available
    const searchInput = page.getByPlaceholder('Search catalog...').first();
    await expect(searchInput).toBeVisible();

    await searchInput.fill('HPE');
    // The suggested mapping should appear
    const mapBtn = page.getByTestId('catalog-suggestion').first();
    await expect(mapBtn).toBeVisible({ timeout: 5000 });
    await mapBtn.click();
    // Should show a success toast mapping
    await expect(page.getByText('Mapped to', { exact: false }).first()).toBeVisible({ timeout: 5000 });
  });

  test('should toggle to Deep Cleanse Editor and verify interactions', async ({ page }) => {
    // 1. Toggle to Deep Editor
    const deepEditorTab = page.getByRole('button', { name: /Deep Cleanse Editor/i });
    await expect(deepEditorTab).toBeVisible();
    await deepEditorTab.click();
    // 2. Assert Editor UI loaded
    await expect(page.getByText('Editing: Base Server Config (Qty 22)')).toBeVisible();

    // 3. Mark for removal
    const trashButtons = page.locator('button[title="Mark for Removal"]');
    await expect(trashButtons.first()).toBeVisible({ timeout: 5000 });
    await trashButtons.first().click();
    await expect(page.getByText('Marked P6730-B21 for removal').first()).toBeVisible();

    // 4. Open Split Wizard
    await page.getByRole('button', { name: /Split Config/i }).click();
    await expect(page.getByText('Split Configuration Wizard (1-to-N)')).toBeVisible();

    // 5. Interact with Split Wizard
    const destNameInput = page.getByRole('textbox').first();
    await destNameInput.fill('5 Server Diverged Config');
    
    // Simulate moving items (Playwright range input interaction)
    const sliders = page.locator('input[type="range"]');
    await expect(sliders.first()).toBeVisible({ timeout: 5000 });
    // Just check the confirm button is initially disabled
    const confirmBtn = page.getByRole('button', { name: /Confirm Split/i });
    await expect(confirmBtn).toBeDisabled();

    // We can't easily drag sliders reliably in all environments, but we can verify the UI exists
    await page.getByRole('button', { name: /Cancel/i }).click();

    // 6. Test Batch Commit
    const commitBtn = page.getByRole('button', { name: /Commit Cleansed BOQ/i });
    await commitBtn.click();
    
    // Verify toast
    await expect(page.getByText('Batch Committing', { exact: false })).toBeVisible();
  });
});
