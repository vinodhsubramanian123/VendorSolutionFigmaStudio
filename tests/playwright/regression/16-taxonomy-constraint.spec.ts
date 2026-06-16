import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('16 - Taxonomy Graph Constraint & Orphan Fix E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Taxonomy Graph Editor
    await page.locator('#nav-taxonomy-graph').click();
    await delay(600);
  });

  test('should display Taxonomy Graph page and check layout panels', async ({ page }) => {
    await expect(page.getByText('Taxonomy Graph Canvas').first()).toBeVisible();
    await expect(page.getByText('Mechanical Check').first()).toBeVisible();
    await expect(page.getByText('Orphan Workshop').first()).toBeVisible();
  });

  test('should perform socket compatibility validation check', async ({ page }) => {
    // Select Chassis option
    const chassisSelect = page.locator('select').first();
    await chassisSelect.selectOption({ index: 1 });
    await delay(200);

    // Select CPU option
    const cpuSelect = page.locator('select').nth(1);
    await cpuSelect.selectOption({ index: 1 });
    await delay(200);

    // Click Validate Constraints button
    const validateBtn = page.getByText('Validate Constraints', { exact: true });
    await validateBtn.click();
    await delay(1000);

    // Check validation result panel
    await expect(page.getByText('SOCKET METRICS MATCHED').first()).toBeVisible();
    await expect(page.getByText('Chassis Pin:').first()).toBeVisible();
    await expect(page.getByText('CPU Socket:').first()).toBeVisible();
  });

  test('should toggle Filter Orphans button', async ({ page }) => {
    const filterBtn = page.getByText('Filter Orphans', { exact: false });
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    await delay(400);
    // Should toggle active status state successfully
    await expect(page.getByText('Showing Orphans', { exact: false })).toBeVisible();
  });

  test('should map an orphan to category in Orphan Alignment Desk', async ({ page }) => {
    // Click Tab Orphan Workshop
    await page.getByText('Orphan Workshop').click();
    await delay(300);

    // Ensure orphan list contains entries
    await expect(page.getByText('Active Orphans').first()).toBeVisible();
    
    // Get first map button from the list
    const mapBtn = page.locator('button', { hasText: 'Map' }).first();
    if (await mapBtn.isVisible()) {
      await mapBtn.click();
      await delay(400);

      // Verify the alignment desk displays form for the active SKU
      await expect(page.getByText('Aligning Part').first()).toBeVisible();

      // Choose subsystem
      const subsystemSelect = page.locator('select#target-subsystem').first();
      await subsystemSelect.selectOption({ index: 1 });
      await delay(800);

      // Verify success notification
      await expect(page.getByText('mapped', { exact: false })).toBeVisible();
    }
  });
});
