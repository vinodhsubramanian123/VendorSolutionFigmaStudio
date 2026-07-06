import { test, expect } from '@playwright/test';


test.describe('03 - Reconciliation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-reconciliation').click();
  });

  test('should display main drift overview matrix', async ({ page }) => {
    await expect(page.getByText('BOM DRIFT RECONCILIATION', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Configs', { exact: false }).first()).toBeVisible();
  });

  test('should navigate into Drill-Down drawer', async ({ page }) => {
    const viewBomBtn = page.locator('button', { hasText: 'View BOM Reconciliation' }).first();
    await viewBomBtn.click();
    const drillDownHeader = page.getByText('BOM Reconciliation');
    await expect(drillDownHeader.first()).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('should open Version Snapshots panel', async ({ page }) => {
    const snapshotBtn = page.locator('button', { hasText: 'Version Snapshots' }).first();
    await snapshotBtn.click();
    // Panel should have close button
    const closeBtn = page.locator('button[title="Close Panel"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
  });
});
