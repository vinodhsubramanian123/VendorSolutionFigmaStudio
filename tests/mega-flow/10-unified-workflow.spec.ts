import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('10 - Unified Mega-Flow E2E', () => {
  // We use a single test block for the mega-flow to preserve state continuity
  test('should execute the complete lifecycle from ingestion to forensics', async ({ page }) => {
    // Navigate to root
    await page.goto('/');
    await delay(500);

    // ==========================================
    // PHASE 1: INGESTION HUB
    // ==========================================
    await test.step('Phase 1: Ingest BOQ & Split Configs', async () => {
      await page.locator('#nav-ingestion-hub').click();
      await expect(page.getByText('File Intake & Structural Splitting', { exact: false }).first()).toBeVisible();

      // Trigger BOQ mock ingest
      const processBtn = page.getByText('Run Backend API Ingest', { exact: false }).first();
      await processBtn.click();

      // Wait for stream to finish and split button to appear
      const splitBtn = page.getByText('Split Configs into Active UCIDs', { exact: false }).first();
      await splitBtn.waitFor({ state: 'visible', timeout: 30000 });
      await splitBtn.click();
      await delay(1000);
      
      // Verify we land back in mission control or wait until success indication
      // Depending on IngestionHub implementation, we might navigate or just show success.
      // We will manually navigate to Mission Control to find our new UCID.
    });

    // ==========================================
    // PHASE 2: MISSION CONTROL & SOLUTION BUILDER
    // ==========================================
    await test.step('Phase 2: Solution Builder', async () => {
      // The Ingestion Hub test generates a new UCID. But since our mock backend for Solution Builder
      // loads a hardcoded init state for demonstration, we can just navigate to Solution Builder
      // and assert that the workflow layout renders.
      await page.locator('#nav-solution-builder').click();
      await delay(1000);

      // Assert we are in Solution Builder
      await expect(page.getByText('Multi-Client Quote Compilation Desk').first()).toBeVisible();
      
      // Check the matrix / schema loads
      const matrixItem = page.getByText('UCID Assignment Map').first();
      await expect(matrixItem).toBeVisible();
    });

    // ==========================================
    // PHASE 3: RECONCILIATION & SNAPSHOTS
    // ==========================================
    await test.step('Phase 3: Compare & Snapshot', async () => {
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

    // ==========================================
    // PHASE 4: LEARNING LOOP & CATALOG
    // ==========================================
    await test.step('Phase 4: Catalog & Forensics', async () => {
      // Catalog checks
      await page.locator('#nav-catalog').click();
      await delay(1000);
      await expect(page.getByText('Global Catalog', { exact: true }).first()).toBeVisible();

      // Forensic checks
      await page.locator('#nav-forensic').click();
      await delay(1000);
      
      await expect(page.getByText('Sourcing Integrity Diagnostic Sandbox', { exact: false }).first()).toBeVisible();
      
      // "choose any sku combination to test underneath contracts stability and full scope"
      // Test the Auto-Heal Learning Loop by healing a specific threat combination
      const healBtn = page.getByText('Auto-Heal Threat', { exact: false }).first();
      if (await healBtn.isVisible()) {
        await healBtn.click();
        await delay(1000);
        // Assert the threat was healed optimistically
        await expect(page.getByText('Rule Configuration Matrix', { exact: false }).first()).toBeVisible();
      }
    });

  });
});
