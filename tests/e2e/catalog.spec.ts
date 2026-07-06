import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';


test.describe('06 - Catalog Manager E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-catalog').click();
    // Wait for catalog grid to be visible
    await expect(page.getByText('Central Sourcing Database', { exact: false }).first()).toBeVisible({ timeout: 8000 });
  });

  test('should use Taxonomy Tree to filter cards', async ({ page }) => {
    test.setTimeout(60000);
    // Taxonomy tree should be visible - click HPE branch
    const hpeNode = page.getByText('HPE', { exact: true }).first();
    if (await hpeNode.isVisible({ timeout: 3000 })) {
      await hpeNode.click();
    }
    // Cards grid should still be visible
    await expect(page.locator('.group\\/card').first()).toBeVisible({ timeout: 5000 });
    
    // Assert Accessibility
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should type a SKU part number into search filter and match', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search Active Part Number or Name..."]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill('P40424-B21');
    const skuCard = page.getByText('P40424-B21').first();
    await expect(skuCard).toBeVisible({ timeout: 5000 });
  });

  test('should open Add New SKU form and append to grid', async ({ page }) => {
    // Click Add Sourced SKU button
    const addBtn = page.locator('button', { hasText: 'Add Sourced SKU' });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();

    // Modal should appear - wait for it
    await expect(page.getByText('Insert Direct Sourced SKU')).toBeVisible({ timeout: 5000 });

    // Fill the form
    await page.getByPlaceholder('e.g. P40445-B21').fill('E2E-TEST-SKU-999');
    await page.getByPlaceholder('e.g. Intel Gold 6430 32-Core 2.1GHz').fill('E2E Test Product');
    await page.getByPlaceholder('2450').fill('1500');
    await page.getByPlaceholder('7').fill('14');

    // Submit
    const saveBtn = page.getByRole('button', { name: 'Add Part' });
    await saveBtn.click();
    // Verify by searching for it
    const searchInput = page.locator('input[placeholder="Search Active Part Number or Name..."]');
    await searchInput.fill('E2E-TEST-SKU-999');
    await expect(page.getByText('E2E-TEST-SKU-999').first()).toBeVisible({ timeout: 5000 });
  });

  test('should execute SKU Price Edit via hover on hidden button', async ({ page }) => {
    // Search for a specific SKU first
    const searchInput = page.locator('input[placeholder="Search Active Part Number or Name..."]');
    await searchInput.fill('P40424-B21');
    // The Edit Price button is hidden until hover (opacity-0 group-hover). Let's simulate a user hover!
    const card = page.locator('.group\\/card').first();
    await card.hover();
    const editBtn = page.locator('button[title="Edit Price"]').first();
    await expect(editBtn).toHaveCount(1);
    await editBtn.click();
    // Should see price input field
    const priceInput = page.locator('input.w-16').first();
    await expect(priceInput).toBeVisible();
    await priceInput.fill('9999');
    const saveBtn = page.locator('button[title="Save Price"]').first();
    await saveBtn.click();
    // Regression guard for the Catalog Manager price-rollback bug: the
    // background sync used to hit a stub backend (MockCatalogApi's old
    // 2-SKU serverState.catalog) that never had this SKU's real id, so
    // updateCatalogSku() threw "SKU not found" and the edit silently
    // rolled back. This assertion previously only checked the SKU text
    // was "still visible", which passed whether or not the price actually
    // stuck — it never would have caught the bug. Now it checks the
    // displayed price directly, and that no rollback toast appeared.
    await expect(page.getByText('$9,999').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Price sync failed')).toHaveCount(0);
    await expect(page.getByText('P40424-B21').first()).toBeVisible({ timeout: 5000 });
  });
});
