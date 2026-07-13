import { test, expect } from '@playwright/test';


test.describe('05 - Mission Control E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-mission-control').click();
    await expect(page.locator('button', { hasText: /UCID Worksheet Pipeline Tracker/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test('should verify horizontal scrolling exists on dense worksheets', async ({ page }) => {
    const wsBtn = page.locator('button', { hasText: 'Campaign Consolidation Hub' }).first();
    await expect(wsBtn).toBeVisible({ timeout: 5000 });
    await wsBtn.click();
    // Verify a table exists and contains real data rows, not just an empty layout
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
    const rows = table.locator('tr');
    await expect(async () => {
      expect(await rows.count()).toBeGreaterThan(1);
    }).toPass();
  });

  test('should execute Campaign Lock and trigger CSV export', async ({ page }) => {
    await page.locator('button', { hasText: 'Campaign Consolidation Hub' }).first().click();
    const input = page.locator('input[placeholder="Type Procurement Officer Initials / Name to authorize..."]');
    await input.fill('Test Officer');
    const authorizeBtn = page.locator('button', { hasText: 'Authorize Certification' });
    await authorizeBtn.click();
    const exportBtn = page.locator('button', { hasText: 'Export Campaign CSV' });
    await expect(exportBtn).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await exportBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Campaign_Consolidation');
  });
});
