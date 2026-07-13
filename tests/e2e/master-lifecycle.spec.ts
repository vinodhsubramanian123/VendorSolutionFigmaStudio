import { test, expect } from '@playwright/test';
import { assertUCIDPayloadIntegrity, assertForensicIssuesIntegrity, assertSourcingRulesIntegrity } from '../utils/assertPayload';


test.describe('11 - Master E2E Lifecycle', () => {
  // Give this master test a generous timeout to complete the full circle
  test.setTimeout(180000); 

  test('should flawlessly execute the complete data lifecycle across all 6 platform stages', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    // Navigate to root to start the session
    await page.goto('/');
    // ==========================================
    // PHASE 1: CORE FOUNDATION (CATALOG & TAXONOMY)
    // ==========================================
    await test.step('Phase 1: Catalog & Taxonomy Setup', async () => {
      // Navigate to Catalog
      await page.locator('#nav-catalog').click();
      await expect(page.getByText('Central Sourcing Database & Inventory Rules').first()).toBeVisible();
      
      // Open Add New SKU form
      await page.getByRole('button', { name: 'Add Sourced SKU' }).click();
      // Fill in new SKU details
      await page.locator('form input').nth(0).fill('E2E-MASTER-SKU-001');
      await page.locator('form input').nth(1).fill('Master Validation Processor');
      await page.locator('form input').nth(2).fill('2500');
      await page.locator('form input').nth(3).fill('14');
      await page.getByRole('button', { name: 'Add Part' }).click();
      // Verify SKU is in the catalog
      await page.locator('input[placeholder="Search Active Part Number or Name..."]').fill('E2E-MASTER-SKU-001');
      await expect(page.getByText('E2E-MASTER-SKU-001').first()).toBeVisible();

      // Clear search
      await page.locator('input[placeholder="Search Active Part Number or Name..."]').fill('');

      // Navigate to Taxonomy Graph
      await page.locator('#nav-taxonomy-graph').click();
      await expect(page.getByText('Taxonomy Graph Canvas').first()).toBeVisible();
      
      // Click "Validate Constraints"
      const validationBtn = page.getByRole('button', { name: 'Validate Constraints' });
      await validationBtn.click();
      // Wait for toast to appear
      await expect(page.getByText('Please select a Chassis SKU and CPU SKU', { exact: false }).first()).toBeVisible();
    });

    // ==========================================
    // PHASE 2: INGESTION & PARSING
    // ==========================================
    await test.step('Phase 2: Ingestion & Parsing', async () => {
      await page.locator('#nav-ingestion-hub').click();
      await expect(page.getByText('Centralized BOQ & BOM Ingestion Hub').first()).toBeVisible();

      // Trigger BOQ mock ingest
      const processBtn = page.getByText('Run Backend API Ingest', { exact: false }).first();
      await processBtn.click();

      // Wait for stream to finish
      const splitBtn = page.getByText('Split Configs into Active UCIDs', { exact: false }).first();
      await splitBtn.waitFor({ state: 'visible', timeout: 30000 });
      await splitBtn.click();
      // Navigate to Cleansing Workshop
      await page.locator('#nav-cleansing').click();
      await expect(page.getByText('Interactive Splicing & Mapping Workshop').first()).toBeVisible();

      // Verify fuzzy entries exist
      await expect(page.getByText('Fuzzy Match').first()).toBeVisible();

      // Trigger Auto-Map
      const autoMapBtn = page.getByRole('button', { name: 'Auto-Map', exact: true });
      await expect(autoMapBtn).toBeVisible();
      await autoMapBtn.click();
      // Verify "Exact Match"
      await expect(page.getByText('Exact Match').first()).toBeVisible();

      // [STATE ASSERTION] Phase 2
      const ucidsPhase2 = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"ucids":[]}}').state.ucids);
      const activeUcid = ucidsPhase2.find((u: any) => u.displayId.startsWith('UCID-'));
      expect(activeUcid).toBeDefined();
      expect(activeUcid?.currentStep).toBe('boq-intake');
      
      await assertUCIDPayloadIntegrity(page, activeUcid.id);
    });

    // ==========================================
    // PHASE 3: SOLUTION ARCHITECTURE
    // ==========================================
    await test.step('Phase 3: Assign & Deploy Solutions', async () => {
      await page.locator('#nav-solution-builder').click();
      await expect(page.getByText('Mission Builder').first()).toBeVisible();

      // Deploy the mapped configs to Mission Control
      const deployBtn = page.getByTestId('btn-deploy-solutions');
      await expect(deployBtn).toBeVisible();
      await deployBtn.click();
       // Wait for transit navigation

      // [STATE ASSERTION] Phase 3
      const ucidsPhase3 = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"ucids":[]}}').state.ucids);
      const deployedUcid = ucidsPhase3.find((u: any) => u.displayId.startsWith('UCID-'));
      expect(deployedUcid?.currentStep).toBe('solution-design');
      expect(deployedUcid?.completedSteps).toContain('pre-intelligence');
      
      await assertUCIDPayloadIntegrity(page, deployedUcid.id);
    });

    // ==========================================
    // PHASE 4: SOURCING & MISSION CONTROL
    // ==========================================
    await test.step('Phase 4: Verify Deployment and Sync Vendor Portal', async () => {
      // Application automatically navigates to Mission Control
      await expect(page).toHaveURL(/.*\/mission-control.*/, { timeout: 15000 });
      await expect(page.getByText('ACTIVE SOLUTION MISSION', { exact: false }).first()).toBeVisible({ timeout: 15000 });

      // Switch to Vendor Portal
      await page.locator('#nav-vendor-portal').click();
      await expect(page.getByText('Authorized Manufacturer Inventory Endpoints').first()).toBeVisible();

      // Sync HPE Gateway
      const syncBtn = page.locator('button:has-text("Sync Sourcing Gateway")').first();
      await syncBtn.click();
       // Simulated delay
      await expect(page.getByText('Vendor system status altered successfully.').first()).toBeVisible();

      // [STATE ASSERTION] Phase 4 Sync Status
      const ucidsPhase4 = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"ucids":[]}}').state.ucids);
      const syncedUcid = ucidsPhase4.find((u: any) => u.displayId.startsWith('UCID-'));
      expect(syncedUcid?.syncStatus).toBe('Synced');
      
      await assertUCIDPayloadIntegrity(page, syncedUcid.id);
    });

    // ==========================================
    // PHASE 5: FORENSICS & LEARNING LOOP
    // ==========================================
    await test.step('Phase 5: Auto-Heal & Learn', async () => {
      await page.locator('#nav-forensic').click();
      await expect(page.getByText('Sourcing Integrity Diagnostic Sandbox', { exact: false }).first()).toBeVisible();

      // Trigger compliance scan
      const scanBtn = page.getByTestId('btn-execute-scan').first();
      await expect(scanBtn).toBeVisible({ timeout: 5000 });
      await scanBtn.click();

      // Find Auto-Heal button for the Mock EOL issue
      const autoHealBtn = page.getByTestId('btn-auto-align').first();
      await expect(autoHealBtn).toBeVisible({ timeout: 5000 });
      await autoHealBtn.click();
      // Confirm the Clarification Modal
      const lockBtn = page.getByTestId('btn-lock-intelligence-rule');
      await expect(lockBtn).toBeVisible({ timeout: 5000 });
      await lockBtn.click();
      await expect(page.getByText('Obsolete HPE Intel Xeon', { exact: false }).first()).toBeVisible();

      // [STATE ASSERTION] Phase 5 Auto-Heal & Learn Chain
      // Previously gated behind `if (learnedRule)`, which let this whole
      // block — the test's actual point — silently no-op if any step above
      // failed to produce a learned rule. Now unconditional: if the chain
      // didn't run, this must fail loudly instead of passing green.
      const issues = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"forensicIssues":[]}}').state.forensicIssues);
      const sourcingRules = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"sourcingRules":[]}}').state.sourcingRules);
      const learnedRule = sourcingRules.find((r: any) => r.isAutoLearned);
      expect(learnedRule).toBeDefined();

      const healed = issues.find((i: any) => i.id === learnedRule.sourceIssueId);
      expect(learnedRule.status).toBe('active');
      expect(healed?.status).toBe('resolved');

      await assertSourcingRulesIntegrity(page);
      await assertForensicIssuesIntegrity(page);
    });

    // ==========================================
    // PHASE 6: FINALIZATION & SNAPSHOTS
    // ==========================================
    await test.step('Phase 6: Reconcile and Capture Snapshot', async () => {
      await page.locator('#nav-reconciliation').click();
      await expect(page.getByText('BOM DRIFT RECONCILIATION', { exact: false }).first()).toBeVisible();

      // Go to Snapshots
      const snapshotsBtn = page.getByTestId('btn-version-snapshots');
      await snapshotsBtn.click();
      // Trigger a snapshot commit
      const captureBtn = page.getByTestId('btn-capture-snapshot').first();
      await expect(captureBtn).toBeVisible();
      await captureBtn.click();
      const confirmBtn = page.getByTestId('btn-confirm-snapshot').first();
      await expect(confirmBtn).toBeVisible();
      await confirmBtn.click();
      // Assert the new snapshot was added to the history list
      await expect(page.getByText('Snapshot v', { exact: false }).first()).toBeVisible();

      // Test Locking the Snapshot
      const lockBtn = page.locator('button[title="Unsecured Draft. Click to lock baseline"]').first();
      await expect(lockBtn).toBeVisible({ timeout: 5000 });
      await lockBtn.click();
      await expect(page.locator('button[title="Immutability Locked. Click to unlock"]').first()).toBeVisible();

      await expect(page.getByText('locked & archived in CRM register', { exact: false }).first()).toBeVisible();

      // [STATE ASSERTION] Phase 6 Lock status
      const ucidsPhase6 = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"ucids":[]}}').state.ucids);
      const ucidWithSnap = ucidsPhase6.find((u: any) => u.snapshots && u.snapshots.length > 0);
      const snap = ucidWithSnap?.snapshots?.at(-1);
      expect(snap).toBeDefined();
      expect(snap?.locked).toBe(true);
      
      await assertUCIDPayloadIntegrity(page, ucidWithSnap.id);
    });

    // End of Master E2E Lifecycle test. If we reach here, no UI components crashed, 
    // DataPersistenceGate stayed healthy, and all state propagated through the full application tree.
  });
});
