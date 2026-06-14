import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('09 - Solution Builder E2E (State Logic Check)', () => {
  test('should force BOQ Intake (Step 1) if no global state exists', async ({ page }) => {
    await page.goto('/solution-builder');
    await delay(1000);
    // Dispatch the event to update React state directly, which also updates localStorage
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('vsip_localstorage_update', { detail: { key: 'sys_ucids', value: [] } }));
      window.dispatchEvent(new CustomEvent('vsip_localstorage_update', { detail: { key: 'sys_vendors', value: [] } }));
    });
    // Wait for state to settle
    await delay(1000);
    await delay(500);

    await expect(page.getByText('Multi-Client Quote Compilation Desk')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'debug.png', fullPage: true });
    
    // Debug: print DOM
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log("DOM SNAPSHOT:", html);
    
    // Validate we are at Step 1 because no data was ingested
    const proceedBtn = page.getByRole('button', { name: /Proceed to Assignment Map/i });
    await expect(proceedBtn).toBeVisible({ timeout: 15000 });
    
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
    const statusBadge = page.getByText(/Pending|Automated|Manual|Synced|Out-of-Sync/i).first();
    await expect(statusBadge).toBeVisible();
  });
});
