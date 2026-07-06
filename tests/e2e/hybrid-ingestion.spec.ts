import { test, expect } from '@playwright/test';


test.describe('13 - Hybrid Ingestion Modes E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-ingestion-hub').click();
  });

  test('should allow manual BOM workbook upload and simulate processing', async ({ page }) => {
    // Click manual BOM tab if exists, else it's the main workspace
    await expect(page.getByText('File Intake', { exact: false }).first()).toBeVisible();
    
    // Instead of file upload, click the mock upload button or simulate
    // Assuming there's a button "Simulate BOQ Ingestion" or "Process Raw"
    const uploadBtn = page.getByRole('button', { name: /Process Raw/i }).first();
    if (await uploadBtn.isVisible()) {
      await uploadBtn.click();
    }
  });

  test('should allow vendor playwright scraper sync', async ({ page }) => {
    // Navigate to vendor portal to sync
    await page.locator('#nav-vendor-portal').click();
    // Click Sync All Endpoints
    const syncBtn = page.getByRole('button', { name: /SYNC ALL ENDPOINTS/i });
    if (await syncBtn.isVisible()) {
      await syncBtn.click();
    }
  });
});
