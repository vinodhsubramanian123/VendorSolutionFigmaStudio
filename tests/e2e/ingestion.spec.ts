import { test, expect } from '@playwright/test';


test.describe('02 - Ingestion Hub E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-ingestion-hub').click();
    await expect(page.getByText('File Intake & Structural Splitting', { exact: false }).first()).toBeVisible();
  });

  test('should trigger dummy upload, see streaming UI, and split configs', async ({ page }) => {
    const processBtn = page.locator('#run-ingest-btn');
    await processBtn.click();

    const splitBtn = page.locator('#split-and-provision-btn');
    await splitBtn.waitFor({ state: 'visible', timeout: 30000 });
    await splitBtn.click();
    // We are now in BOM Compile step
    await expect(page.getByText('Step 2: Technical Matching', { exact: false }).first()).toBeVisible({ timeout: 10000 });
  });
});
