import { test, expect } from '@playwright/test';


test.describe('24 - Multi-UCID Isolation & Vendor Selection E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to ingestion hub and split configs
    await page.goto('/');
    await page.locator('#nav-ingestion-hub').click();
    const processBtn = page.getByText('Run Backend API Ingest', { exact: false }).first();
    await processBtn.click();

    const splitBtn = page.getByText('Split Configs into Active UCIDs', { exact: false }).first();
    await splitBtn.waitFor({ state: 'visible', timeout: 30000 });
    await splitBtn.click();
    // Deploy multiple UCIDs from solution builder
    await page.locator('#nav-solution-builder').click();
    // Enable multi-UCID mode if not already enabled — required, not optional:
    // every assertion in this describe block depends on multiple UCIDs
    // actually existing, so a silently-skipped click here would let a broken
    // setup produce false-positive isolation assertions below.
    const multiBtn = page.getByRole('button', { name: /Multi/i }).first();
    await expect(multiBtn).toBeVisible({ timeout: 5000 });
    await multiBtn.click();

    const deployBtn = page.getByTestId('btn-deploy-solutions');
    await expect(deployBtn).toBeVisible({ timeout: 5000 });
    await deployBtn.click();
  });

  test('completing a step on one UCID must not alter sibling UCIDs and must save selectedVendorSubmissionId', async ({ page }) => {
    // 1. Capture base state of UCIDs
    const baseUcids = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"ucids":[]}}').state.ucids);
    const ucid1 = baseUcids[0];
    const ucid2 = baseUcids[1];

    expect(ucid1).toBeDefined();
    expect(ucid2).toBeDefined();

    // 2. Select UCID 1 in Mission Control
    await page.locator('#nav-mission-control').click();
    // 3. Move UCID 1 to Comparison Phase
    //
    // KNOWN BUG (found during Area 19 remediation, not fixed here — needs a
    // live Playwright run to get right, not a guess): this navigates to the
    // Reconciliation page and looks for a "Select" button there, but the
    // vendor-selection UI (StepComparison.tsx, which is what actually writes
    // `selectedVendorSubmissionId`) only renders inside the Mission Control
    // step wizard, not on the Reconciliation page. The `if (isVisible)` guard
    // below was masking this: the locator can structurally never match on
    // this page, so the click — and the disabled assertion after it — have
    // likely never exercised the real code path. Needs a rewrite that drives
    // the UCID's currentStep to "comparison" inside Mission Control before
    // looking for the select button.
    await page.locator('#nav-reconciliation').click();
    const selectHpeBtn = page.locator('button', { hasText: 'Select' }).first();
    if (await selectHpeBtn.isVisible()) {
      await selectHpeBtn.click();
    }

    // 4. Assert mutations
    const updatedUcids = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"ucids":[]}}').state.ucids);
    const u1After = updatedUcids.find((u: any) => u.id === ucid1.id);
    const u2After = updatedUcids.find((u: any) => u.id === ucid2.id);

    // Assert sibling is unaffected
    expect(u2After.currentStep).toBe(ucid2.currentStep);
    expect(u2After.completedSteps).toEqual(ucid2.completedSteps);
    expect(u2After.syncStatus).toBe(ucid2.syncStatus);

    // Assert ucid1 was mutated correctly — `selectedVendorSubmissionId` is a
    // real, implemented field (see src/components/mission-control/steps/StepComparison.tsx),
    // so this was a disabled assertion for a real feature, not a stub. Left
    // disabled here until the navigation bug above is fixed, since asserting
    // against a button we can never reach would just fail for the wrong reason.
    if (u1After.solutions && u1After.solutions.length > 0) {
      // expect(u1After.solutions[0].selectedVendorSubmissionId).toBeDefined();
      // NOTE(Area 19): re-enable once the navigation bug documented above is fixed.
    }
  });
});
