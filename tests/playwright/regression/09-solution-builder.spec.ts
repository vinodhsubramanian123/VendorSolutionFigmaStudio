import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('09 - Solution Builder E2E (State Logic Check)', () => {
  test('should force BOQ Intake (Step 1) if no global state exists', async ({ page }) => {
    // Navigate straight to solution-builder with a clean state
    await page.goto('/solution-builder');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("sys_ucids", "[]");
    });
    await page.reload();
    await delay(500);

    await expect(page.getByText('Multi-Client Quote Compilation Desk')).toBeVisible();
    await page.screenshot({ path: 'debug.png', fullPage: true });
    
    // Validate we are at Step 1 because no data was ingested
    const proceedBtn = page.getByText('Proceed to Assignment Map (Step 2)');
    await expect(proceedBtn).toBeVisible();
    
    // We should NOT see the step 2 grid yet
    await expect(page.getByText('UCID Deployment Containers Grid')).toBeHidden();
  });

  test('should automatically bypass Step 1 if global data is injected', async ({ page }) => {
    await page.goto('/');
    await delay(500);

    // Ingest data in Hub
    await page.locator('#nav-ingestion-hub').click();
    await delay(500);
    const processBtn = page.getByText('Run Backend API Ingest', { exact: false }).first();
    await processBtn.click();
    const splitBtn = page.getByText('Split Configs into Active UCIDs', { exact: false }).first();
    await splitBtn.waitFor({ state: 'visible', timeout: 30000 });
    await splitBtn.click();
    await delay(1000);

    // Now navigate to solution-builder
    await page.locator('#nav-solution-builder').click();
    await delay(1000);

    // Validate we bypassed Step 1 completely
    await expect(page.getByText('Proceed to Assignment Map (Step 2)')).toBeHidden();
    
    // We should directly see Step 2
    await expect(page.getByText('UCID Deployment Containers Grid')).toBeVisible();
    await expect(page.locator('.font-mono', { hasText: 'UCID-' }).first()).toBeVisible();
    
    // Check for exact state enums like "pending", "automated" or lock status
    const statusText = await page.locator('text=/pending|automated|manual|Synced/i').first();
    await expect(statusText).toBeVisible();
  });
});
