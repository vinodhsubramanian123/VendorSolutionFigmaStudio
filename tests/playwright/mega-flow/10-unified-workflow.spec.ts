import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('10 - Unified Mega-Flow E2E', () => {
  // We use a single test block for the mega-flow to preserve state continuity
  test('should seamlessly flow data from Ingestion Hub to Solution Builder and Mission Control', async ({ page }) => {
    // Navigate to root
    await page.goto('/');
    await delay(500);

    // ==========================================
    // PHASE 1: INGESTION HUB
    // ==========================================
    await test.step('Phase 1: Ingest BOQ & Split Configs', async () => {
      await page.locator('#nav-ingestion-hub').click();
      await expect(page.getByText('Centralized BOQ & BOM Ingestion Hub', { exact: false }).first()).toBeVisible();

      // Trigger BOQ mock ingest
      const processBtn = page.getByText('Run Backend API Ingest', { exact: false }).first();
      await processBtn.click();

      // Wait for stream to finish and split button to appear
      const splitBtn = page.getByText('Split Configs into Active UCIDs', { exact: false }).first();
      await splitBtn.waitFor({ state: 'visible', timeout: 30000 });
      await splitBtn.click();
      await delay(1000);
      
      // Verify we transitioned to BOM mode (step 2 of ingestion hub)
      await expect(page.getByText('Global Multi-UCID Batch Reconciliation Control Board').first()).toBeVisible();
    });

    // ==========================================
    // PHASE 2: SOLUTION BUILDER (DATA CONTINUITY CHECK)
    // ==========================================
    await test.step('Phase 2: Solution Builder Auto-Bypass', async () => {
      // Navigate to Solution Builder
      await page.locator('#nav-solution-builder').click();
      await delay(1000);

      // Assert we are in Solution Builder
      await expect(page.getByText('Multi-Client Quote Compilation Desk').first()).toBeVisible();
      
      // CRITICAL ASSERTION: Since data was ingested in Phase 1, Step 1 (BOQ Intake) should be bypassed.
      // We should directly see Step 2 (UCID Assignment Map) and the deployed containers grid.
      await expect(page.getByText('UCID Assignment Map').first()).toBeVisible();
      await expect(page.getByText('UCID Deployment Containers Grid').first()).toBeVisible();
      
      // We should NOT see the Proceed button from Step 1, because we skipped it
      await expect(page.getByText('Proceed to Assignment Map (Step 2)')).toBeHidden();

      // Deploy the mapped configs to Mission Control
      const deployBtn = page.getByText('Deploy Solutions to Live Mission Control');
      await expect(deployBtn).toBeVisible();
      await deployBtn.click();
      await delay(1500);
    });

    // ==========================================
    // PHASE 3: MISSION CONTROL
    // ==========================================
    await test.step('Phase 3: Verify Deployment in Mission Control', async () => {
      // The application should have automatically navigated to Mission Control
      await expect(page).toHaveURL(/.*\/mission-control.*/);
      await expect(page.getByText('LIVE MISSION CONTROL', { exact: false }).first()).toBeVisible();

      const html = await page.content();
      console.log("DOM_DUMP:", html);
      await expect(page.getByText('ACTIVE SOLUTION MISSION', { exact: false }).first()).toBeVisible();
      
      // Verify the status is "solution-design" or "Configuring" based on the deploy output
      await expect(page.getByText('OPTIMAL SOURCING', { exact: false }).first()).toBeVisible();
    });

    // ==========================================
    // PHASE 4: RECONCILIATION
    // ==========================================
    await test.step('Phase 4: Compare & Snapshot', async () => {
      await page.locator('#nav-reconciliation').click();
      await delay(1000);

      // Assert Reconciliation Drift metrics appear
      await expect(page.getByText('BOM DRIFT RECONCILIATION', { exact: false }).first()).toBeVisible();

      // Go to Snapshots
      const snapshotsBtn = page.locator('button', { hasText: 'Version Snapshots' });
      await snapshotsBtn.click();
      await delay(1000);

      // Trigger a snapshot commit
      const captureBtn = page.getByText('Capture Snapshot', { exact: false }).first();
      await expect(captureBtn).toBeVisible();
      await captureBtn.click();
      await delay(500);

      const confirmBtn = page.getByText('Confirm Version Snapshot Block', { exact: false }).first();
      await expect(confirmBtn).toBeVisible();
      await confirmBtn.click();
      await delay(1000);

      // Assert the new snapshot was added to the history list
      await expect(page.getByText('Snapshot v', { exact: false }).first()).toBeVisible();

      // Close the snapshot drawer by clicking the close button
      await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first().click();
      await delay(1000);
    });
  });
});
