import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('19 - System Telemetry E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Click on System Telemetry in the sidebar
    await page.getByText('System Telemetry', { exact: true }).click();
    await delay(500);
  });

  test('should load the Telemetry dashboard and stats', async ({ page }) => {
    await expect(page.getByText('System Telemetry & Intelligence Pipeline')).toBeVisible();
    await expect(page.getByText('TELEMETRY LIVE')).toBeVisible();
    
    // Pipeline stats should be visible
    await expect(page.getByText('Queued', { exact: true })).toBeVisible();
    await expect(page.getByText('Rules Extracted', { exact: true })).toBeVisible();
  });

  test('should switch to API Logs tab and display matrix', async ({ page }) => {
    await page.getByRole('button', { name: 'API Logs' }).click();
    await delay(300);

    await expect(page.getByText('API Request Log')).toBeVisible();
    await expect(page.getByRole('cell', { name: '/api/boq/ingest' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'POST' }).first()).toBeVisible();
  });

  test('should switch to Webhook Monitor tab and test HMAC dispatch', async ({ page }) => {
    await page.getByRole('button', { name: 'Webhook Monitor' }).click();
    await delay(300);

    await expect(page.getByText('HMAC Webhook Signing Secret')).toBeVisible();
    
    const testDispatchBtn = page.getByRole('button', { name: 'Test Dispatch' });
    await testDispatchBtn.click();
    await delay(300);

    // Toast should appear
    await expect(page.getByText('HMAC test webhook dispatched')).toBeVisible();
    
    // Verify an HMAC FAIL or SIGNED badge exists
    await expect(page.getByText('✓ SIGNED').first()).toBeVisible();
  });

  test('should trigger dummy file drop logic via input', async ({ page }) => {
    // The drop-zone div triggers the hidden file input via programmatic .click().
    // Playwright's filechooser interceptor does NOT fire for programmatic activations,
    // so we target the hidden <input type="file"> directly with setInputFiles().
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'dummy_bom.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('id,partNumber,qty\n1,P40424-B21,10\n')
    });
    await delay(1000);

    // Verify it was queued
    await expect(page.getByText('dummy_bom.csv')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Processing Queue')).toBeVisible({ timeout: 10000 });
  });
});
