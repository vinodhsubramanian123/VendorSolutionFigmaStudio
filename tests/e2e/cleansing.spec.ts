import { test, expect } from '@playwright/test';


test.describe('18 - Cleansing Workshop E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Click on Cleansing Workshop in the sidebar
    await page.getByText('Cleansing Workshop', { exact: true }).click();
  });

  test('should load the Cleansing Workshop and display stats correctly', async ({ page }) => {
    await expect(page.getByText('Interactive Splicing & Mapping Workshop')).toBeVisible();
    await expect(page.getByRole('button', { name: /All \(\d+\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Exact Match \(\d+\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Fuzzy Match \(\d+\)/ })).toBeVisible();
  });

  test('should filter list by match status', async ({ page }) => {
    // Click the Quarantined filter
    await page.getByRole('button', { name: /Quarantined \(\d+\)/ }).click();
    // Verify a quarantined item is visible
    // "Quarantined" badge should be present
    const quarantinedBadge = page.getByText('Quarantined', { exact: true }).first();
    await expect(quarantinedBadge).toBeVisible();
    
    // There shouldn't be any "Exact Match" badge visible if we filtered properly
    // Note: The button itself says "Exact Match (n)", so we check the actual entries.
    // The entries use the label text in a span. We can just check that a specific quarantined text exists.
    await expect(page.getByText('No SKU pattern detected — manual mapping required').first()).toBeVisible();
  });

  test('should open mapping panel and manually map an entry', async ({ page }) => {
    // Click on an unmatched or quarantined entry to open the panel
    const entry = page.getByText('Quarantined', { exact: true }).first();
    await entry.click();
    // Verify mapping panel opens
    await expect(page.getByText('Mapping Panel', { exact: true })).toBeVisible();
    
    // Check search override is visible
    const searchInput = page.getByPlaceholder('Search catalog...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(''); // Clear search to ensure all suggestions appear
    // Select the first catalog suggestion to map it
    const suggestionBtn = page.getByTestId('catalog-suggestion').first();
    await suggestionBtn.click();
    // Verify toast appeared
    await expect(page.getByText('Mapped to')).toBeVisible();
    
    // Ensure the mapping panel is closed or the entry is updated to Mapped
    await expect(page.getByText('Mapping Panel', { exact: true })).not.toBeVisible();
  });

  test('should auto-map fuzzy entries successfully', async ({ page }) => {
    const autoMapBtn = page.getByRole('button', { name: 'Auto-Map', exact: true });
    await autoMapBtn.click();
    // Expect success toast
    await expect(page.getByText(/Auto-mapping complete!/)).toBeVisible();
  });
});
