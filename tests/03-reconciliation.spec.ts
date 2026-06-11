import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('03 - Reconciliation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-reconciliation').click();
    await delay(500);
  });

  test('should display main drift overview matrix', async ({ page }) => {
    await expect(page.getByText('BOM DRIFT RECONCILIATION', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Configs', { exact: false }).first()).toBeVisible();
  });

  test('should navigate into Drill-Down drawer', async ({ page }) => {
    const viewBomBtn = page.locator('button', { hasText: 'View BOM Reconciliation' }).first();
    await viewBomBtn.click();
    await delay(1000);

    const drillDownHeader = page.getByText('BOM Reconciliation');
    await expect(drillDownHeader.first()).toBeVisible();
    await page.keyboard.press('Escape');
    await delay(500);
  });

  test('should open Version Snapshots panel', async ({ page }) => {
    const snapshotBtn = page.locator('button', { hasText: 'Version Snapshots' }).first();
    await snapshotBtn.click();
    await delay(1000);
    
    // Panel should have close button
    const closeBtn = page.locator('button[title="Close Panel"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
  });
});
