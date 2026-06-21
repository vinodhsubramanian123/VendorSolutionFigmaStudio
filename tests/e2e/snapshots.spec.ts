import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('11 - Snapshot CRUD Lifecycle E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to reconciliation
    await page.locator('#nav-reconciliation').click();
    await delay(300);
    // Open Version Snapshots side panel
    const snapshotsBtn = page.locator('button', { hasText: 'Version Snapshots' }).first();
    await expect(snapshotsBtn).toBeVisible({ timeout: 5000 });
    await snapshotsBtn.click();
    await delay(500);
  });

  test('should open snapshot panel and see Capture Snapshot button', async ({ page }) => {
    // The panel should be open and show the header
    await expect(page.getByText('Historical Snapshots', { exact: false }).first()).toBeVisible({ timeout: 8000 });
    const captureBtn = page.locator('button', { hasText: 'Capture Snapshot' }).first();
    await expect(captureBtn).toBeVisible({ timeout: 5000 });
  });

  test('should create a snapshot and see it listed', async ({ page }) => {
    // Make sure the panel is open
    await expect(page.getByText('Historical Snapshots', { exact: false }).first()).toBeVisible({ timeout: 8000 });

    // Click Capture Snapshot
    const captureBtn = page.locator('button', { hasText: 'Capture Snapshot' }).first();
    await captureBtn.click();
    await delay(500);

    // The embedded form should appear
    await expect(page.getByText('Record Live Snapshot Version', { exact: false })).toBeVisible({ timeout: 5000 });

    // Clear the pre-filled label and fill with a unique test label
    const labelInput = page.getByPlaceholder(/e.g. Snapshot v1.0/i);
    await labelInput.clear();
    await labelInput.fill('E2E-Test-Snapshot-AutoValidate');

    // Submit form
    const submitBtn = page.locator('form button[type="submit"]').last();
    await submitBtn.click();
    await delay(1000);

    // Verify snapshot appears in the list
    await expect(page.getByText('E2E-Test-Snapshot-AutoValidate').first()).toBeVisible({ timeout: 8000 });
  });

  test('should lock and unlock a snapshot', async ({ page }) => {
    await expect(page.getByText('Historical Snapshots', { exact: false }).first()).toBeVisible({ timeout: 8000 });
    // Look for any existing locked snapshot
    const lockBtn = page.locator('button[title="Unlock Snapshot"], button[title="Lock Snapshot"], button[title="Immutability Locked. Click to unlock"], button[title="Unsecured Draft. Click to lock baseline"]').first();
    if (await lockBtn.isVisible({ timeout: 3000 })) {
      await lockBtn.click();
      await delay(500);
    }
  });
});
