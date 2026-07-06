import { test, expect } from '@playwright/test';
import { assertUCIDPayloadIntegrity } from '../utils/assertPayload';


test.describe('09 - Solution Builder E2E (State Logic Check)', () => {
  test('should force BOQ Intake (Step 1) if no global state exists', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/solution-builder');
    // Dispatch the event to update React state directly, which also updates localStorage
    await page.evaluate(() => {
      window.localStorage.setItem('vsip-core-storage', JSON.stringify({ state: { ucids: [], vendors: [], catalogSkus: [], forensicIssues: [], sourcingRules: [], learningEvents: [], solutions: [] }, version: 3 }));
    });
    await page.reload();
    // Wait for state to settle
    await expect(page.getByText('Mission Builder')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'debug.png', fullPage: true });
    
    // Debug: print DOM
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log("DOM SNAPSHOT:", html);
    
    // Validate we are at Step 1 because no data was ingested
    const proceedBtn = page.getByRole('button', { name: /Proceed to Assignment Map/i });
    await expect(proceedBtn).toBeVisible({ timeout: 15000 });
    
    // We should NOT see the step 2 grid yet
    await expect(page.getByText('Deploy Solutions to Live Mission Control')).toBeHidden();
  });

  test('should automatically bypass Step 1 if global data is injected', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/');
    // Ingest data in Hub
    await page.locator('#nav-ingestion-hub').click();
    const processBtn = page.getByText('Run Backend API Ingest', { exact: false }).first();
    await processBtn.click();
    const splitBtn = page.getByText('Split Configs into Active UCIDs', { exact: false }).first();
    await splitBtn.waitFor({ state: 'visible', timeout: 30000 });
    await splitBtn.click();
    // Now navigate to solution-builder
    await page.locator('#nav-solution-builder').click();
    // Validate we bypassed Step 1 completely
    await expect(page.getByText('Proceed to Assignment Map (Step 2)')).toBeHidden();
    
    // We should directly see Step 2
    await expect(page.getByText('Deploy Solutions to Live Mission Control')).toBeVisible();
    await expect(page.locator('.font-mono', { hasText: 'UCID-' }).first()).toBeVisible();
    
    // Check for exact state enums like "pending", "automated" or lock status
    const statusBadge = page.getByText(/Pending|Automated|Manual|Synced|Out-of-Sync/i).first();
    await expect(statusBadge).toBeVisible();

    // [PAYLOAD INTEGRITY]
    await assertUCIDPayloadIntegrity(page);
  });
});
