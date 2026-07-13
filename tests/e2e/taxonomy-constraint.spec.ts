import { test, expect } from '@playwright/test';


test.describe('16 - Taxonomy Graph Constraint & Orphan Fix E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Taxonomy Graph Editor
    await page.locator('#nav-taxonomy-graph').click();
  });

  test('should display Taxonomy Graph page and check layout panels', async ({ page }) => {
    await expect(page.getByText('Taxonomy Graph Canvas').first()).toBeVisible();
    await expect(page.getByText('Mechanical Check').first()).toBeVisible();
    await expect(page.getByText('Orphan Workshop').first()).toBeVisible();
  });

  test('should perform socket compatibility validation check', async ({ page }) => {
    // Select Chassis option
    const chassisSelect = page.locator('#chassis-select');
    await chassisSelect.selectOption({ index: 1 });
    // Select CPU option
    const cpuSelect = page.locator('#cpu-select');
    await cpuSelect.selectOption({ index: 1 });
    // Click Validate Constraints button
    const validateBtn = page.getByText('Validate Constraints', { exact: true });
    await validateBtn.click();
    // Check validation result panel
    await expect(page.getByText('SOCKET METRICS MATCHED').first()).toBeVisible();
    await expect(page.getByText('Chassis Pin:').first()).toBeVisible();
    await expect(page.getByText('CPU Socket:').first()).toBeVisible();
  });

  test('should toggle Filter Orphans button', async ({ page }) => {
    const filterBtn = page.getByText('Filter Orphans', { exact: false });
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    // Should toggle active status state successfully
    await expect(page.getByText('Showing Orphans', { exact: false })).toBeVisible();
  });

  test('should map an orphan to category in Orphan Alignment Desk', async ({ page }) => {
    // Click Tab Orphan Workshop
    await page.getByText('Orphan Workshop').click();
    // Ensure orphan list contains entries
    await expect(page.getByText('Active Orphans').first()).toBeVisible();
    
    // Get first map button from the list
    const mapBtn = page.locator('button', { hasText: 'Map' }).first();
    await expect(mapBtn).toBeVisible({ timeout: 5000 });
    await mapBtn.click();
    // Verify the alignment desk displays form for the active SKU
    await expect(page.getByText('Aligning Part').first()).toBeVisible();

    // Choose subsystem
    const subsystemSelect = page.locator('select#target-subsystem').first();
    await subsystemSelect.selectOption({ index: 1 });
    // Verify success notification
    await expect(page.getByText('mapped', { exact: false })).toBeVisible();
  });
});
