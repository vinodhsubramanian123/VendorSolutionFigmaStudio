import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('17 - Vendor Portal CLIC Error Resolution E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Vendor Portal
    await page.locator('#nav-vendor-portal').click();
    await delay(600);
  });

  test('should display Vendor Ingestion Desk with default credentials', async ({ page }) => {
    await expect(page.getByText('Playwright Automator Vault').first()).toBeVisible();
    await expect(page.getByText('Store Secret Config').first()).toBeVisible();
  });

  test('should run diagnostic test for Cisco CCW and trigger CLIC error loop', async ({ page }) => {
    // Select Cisco portal
    const ciscoBtn = page.getByRole('button', { name: 'Cisco CCW' });
    await ciscoBtn.click();
    await delay(300);

    // Verify MFA token or logs loaded for Cisco
    await expect(page.getByPlaceholder('e.g. partner_account_id')).toHaveValue('cisco_commerce_workspace_api');

    // Click Test Web-Automator
    const runBtn = page.getByRole('button', { name: 'Test Web-Automator' });
    await runBtn.click();
    
    // Scraper simulation takes ~800ms
    await delay(1200);

    // Verify error toast or console logs show error
    await expect(page.getByText('Generic Workbook Advice Resolution').first()).toBeVisible();
    await expect(page.getByText('UCS-CPU-I6430').first()).toBeVisible();
  });

  test('should suggest alternate SKU and resolve error successfully', async ({ page }) => {
    // Select Cisco portal
    const ciscoBtn = page.getByRole('button', { name: 'Cisco CCW' });
    await ciscoBtn.click();
    await delay(300);

    // Click Test Web-Automator
    const runBtn = page.getByRole('button', { name: 'Test Web-Automator' });
    await runBtn.click();
    await delay(1200);

    // Verify pre-validated suggestion box exists
    const suggestBox = page.getByText('Catalog Alternates', { exact: false });
    await expect(suggestBox).toBeVisible();

    // Click Apply Fix button
    const fixBtn = page.getByRole('button', { name: 'Splice SKU' }).first();
    await fixBtn.click();
    await delay(400);

    // Verify error is resolved and success toast appears
    await expect(page.getByText('error resolved & rule learned')).toBeVisible();
  });
});
