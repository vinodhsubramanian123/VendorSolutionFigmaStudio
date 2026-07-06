import { test, expect } from '@playwright/test';
import { assertUCIDPayloadIntegrity } from '../utils/assertPayload';


test.describe('23 - Snapshot Integrity & Version Control E2E', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    await page.goto('/');
    
    // Ingest data first to ensure we have a rich UCID state to snapshot
    await page.locator('#nav-ingestion-hub').click();
    await page.getByText('Run Backend API Ingest', { exact: false }).first().click();
    const splitBtn = page.getByText('Split Configs into Active UCIDs', { exact: false }).first();
    await splitBtn.waitFor({ state: 'visible', timeout: 30000 });
    await splitBtn.click();
    // Deploy to get solutions in the UCID
    await page.locator('#nav-solution-builder').click();
    const deployBtn = page.getByText('Deploy Solutions to Live Mission Control');
    await deployBtn.waitFor({ state: 'visible', timeout: 15000 });
    await deployBtn.click();
    // Navigate to reconciliation
    await page.locator('#nav-reconciliation').click();
    // Open Version Snapshots side panel
    const snapshotsBtn = page.getByTestId('btn-version-snapshots').first();
    await expect(snapshotsBtn).toBeVisible({ timeout: 5000 });
    await snapshotsBtn.click();
  });

  test('should commit multiple snapshots and verify payload integrity, iso dates, and version incrementing', async ({ page }) => {
    // ------------------------------------
    // Create Snapshot 1
    // ------------------------------------
    // OPEN SNAPSHOT MODAL
    const commitBtn = page.getByTestId('btn-capture-snapshot').first();
    await commitBtn.click();
    let labelInput = page.getByPlaceholder(/e.g. Snapshot v1.0/i);
    await labelInput.clear();
    await labelInput.fill('Integrity-Snap-v1');

    let submitBtn = page.getByTestId('btn-confirm-snapshot').first();
    await submitBtn.click();
    const ucidState = await page.evaluate(() => localStorage.getItem('vsip-core-storage'));
    console.log("sys_ucids after snapshot:", ucidState);

    await expect(page.getByText('Integrity-Snap-v1').first()).toBeVisible({ timeout: 8000 });

    // VERIFY SNAPSHOT 1 INTEGRITY
    let ucids = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"ucids":[]}}').state.ucids);
    let ucidWithSnap = ucids.find((u: any) => u.snapshots?.some((s: any) => s.label === 'Integrity-Snap-v1'));
    
    expect(ucidWithSnap).toBeDefined();
    let snap1 = ucidWithSnap.snapshots.find((s: any) => s.label === 'Integrity-Snap-v1');
    
    expect(snap1.version).toBe(1);
    expect(snap1.locked).toBe(true);
    expect(Array.isArray(snap1.payload)).toBe(true);
    expect(snap1.payload.length).toBeGreaterThan(0);
    expect(Array.isArray(snap1.bomSnapshot)).toBe(true);
    expect(snap1.committedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO-8601 regex

    // ------------------------------------
    // Create Snapshot 2
    // ------------------------------------
    await commitBtn.click();
    labelInput = page.getByPlaceholder(/e.g. Snapshot v1.0/i);
    await labelInput.clear();
    await labelInput.fill('Integrity-Snap-v2');

    submitBtn = page.getByTestId('btn-confirm-snapshot');
    await submitBtn.click();
    await expect(page.getByText('Integrity-Snap-v2').first()).toBeVisible({ timeout: 8000 });

    // VERIFY SNAPSHOT 2 INTEGRITY
    ucids = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"ucids":[]}}').state.ucids);
    ucidWithSnap = ucids.find((u: any) => u.id === ucidWithSnap.id);
    
    expect(ucidWithSnap.snapshots.length).toBeGreaterThanOrEqual(2);
    let snap2 = ucidWithSnap.snapshots.find((s: any) => s.label === 'Integrity-Snap-v2');
    
    expect(snap2.version).toBeGreaterThanOrEqual(2); // Should auto-increment
    expect(snap2.locked).toBe(false);
    expect(new Date(snap2.committedAt).getTime()).toBeGreaterThanOrEqual(new Date(snap1.committedAt).getTime());

    // ------------------------------------
    // Test Locking
    // ------------------------------------
    const lockBtn = page.locator('button[title="Unsecured Draft. Click to lock baseline"]').first();
    await lockBtn.click();
    ucids = await page.evaluate(() => JSON.parse(localStorage.getItem('vsip-core-storage') || '{"state":{"ucids":[]}}').state.ucids);
    ucidWithSnap = ucids.find((u: any) => u.id === ucidWithSnap.id);
    snap2 = ucidWithSnap.snapshots.find((s: any) => s.label === 'Integrity-Snap-v2');
    
    // The UI should have toggled the lock flag in the payload
    expect(snap2.locked).toBe(true);

    await assertUCIDPayloadIntegrity(page, ucidWithSnap.id);
  });
});
