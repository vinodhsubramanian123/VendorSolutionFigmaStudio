import { test, expect } from '@playwright/test';


test.describe('13 - Hybrid Ingestion Modes E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-ingestion-hub').click();
  });

  test('should allow manual BOM workbook upload and simulate processing', async ({ page }) => {
    // Click manual BOM tab if exists, else it's the main workspace
    await expect(page.getByText('File Intake', { exact: false }).first()).toBeVisible();
    
    // The demonstration ingest trigger has a stable id (button label has changed
    // names before — locate by id, not text, to avoid this test silently
    // no-op'ing again on the next rename).
    const uploadBtn = page.locator('#run-ingest-btn');
    await expect(uploadBtn).toBeVisible({ timeout: 5000 });
    await uploadBtn.click();
    // A successful simulated ingest should surface the split-into-UCIDs action
    await expect(page.getByText('Split Configs into Active UCIDs', { exact: false }).first()).toBeVisible({ timeout: 15000 });
  });

  test('should allow vendor playwright scraper sync', async ({ page }) => {
    // Navigate to vendor portal to sync
    await page.locator('#nav-vendor-portal').click();
    // Click Sync All Endpoints
    const syncBtn = page.getByRole('button', { name: /SYNC ALL ENDPOINTS/i });
    await expect(syncBtn).toBeVisible({ timeout: 5000 });
    await syncBtn.click();
    await expect(page.getByText('All Direct APIS polled with latest contract pricing metrics.', { exact: false })).toBeVisible({ timeout: 10000 });
  });
});
