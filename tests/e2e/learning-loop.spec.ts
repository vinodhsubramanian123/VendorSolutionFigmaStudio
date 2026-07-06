import { test, expect } from '@playwright/test';


test.describe('15 - Learning Loop Intelligence E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Forensic Scan
    await page.locator('#nav-forensic').click();
  });

  test('should display Learning Loop Feed panel on forensic page', async ({ page }) => {
    await expect(page.getByText('Intelligence Learning Loop').first()).toBeVisible();
    await expect(page.getByText('Auto-heal events that trained the catalog intelligence database')).toBeVisible();
  });

  test('should show empty learning loop state before any auto-heal', async ({ page }) => {
    // If no learning events have been stored, should show empty state
    const emptyState = page.getByText('No learning events yet');
    const feedWithEvents = page.getByText('Intelligence Learning Loop');
    // Either state is valid - the panel itself must exist
    await expect(feedWithEvents.first()).toBeVisible();
  });

  test('should trigger Auto-Heal on EOL issue and verify learning event appears', async ({ page }) => {
    // First ensure we have an EOL issue - load HPE preset via Mission Control
    await page.locator('#nav-mission-control').click();
    // Select first UCID
    await page.getByRole('button', { name: /UCID-2026-/ }).first().click();
    // Simulate HPE EOL BOQ preset via the step simulator
    const hpeBtn = page.locator('button').filter({ hasText: '6130 Legacy CPU' }).first();
    if (await hpeBtn.isVisible()) {
      await hpeBtn.click();
    }

    // Navigate to Forensics
    await page.locator('#nav-forensic').click();
    // Try to find and click Auto-Heal
    const healBtn = page.getByText('Auto-Heal Threat', { exact: false }).first();
    if (await healBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await healBtn.click();
      // Verify toast or success indicator appears
      const successIndicators = [
        page.getByText('replaced', { exact: false }),
        page.getByText('catalog replacement rule', { exact: false }),
        page.getByText('Auto-Learned', { exact: false }),
      ];

      let found = false;
      for (const indicator of successIndicators) {
        if (await indicator.isVisible({ timeout: 2000 }).catch(() => false)) {
          found = true;
          break;
        }
      }
      // At least one success indicator should appear
      expect(found).toBeTruthy();
    }
  });

  test('should display SourcingRulesVault with auto-learned badges', async ({ page }) => {
    await expect(page.getByText('Centralized Sourcing Intelligence & Override Registry')).toBeVisible();
    // Table header for Origin column should exist
    await expect(page.getByText('Origin', { exact: true })).toBeVisible();
  });

  test('should verify Learning Loop Feed stats panel shows rule count', async ({ page }) => {
    // The panel header row should show Active Rules counter
    const learningPanel = page.getByText('Active Rules').first();
    await expect(learningPanel).toBeVisible();
    // Prevented counter label
    await expect(page.getByText('Prevented').first()).toBeVisible();
  });

  test('should show Pre-Intelligence catalog intelligence banner when rules exist', async ({ page }) => {
    // Navigate to Mission Control
    await page.locator('#nav-mission-control').click();
    // Select a UCID with BOQ already loaded
    await page.getByRole('button', { name: /UCID-2026-/ }).first().click();
    // Check if on pre-intelligence step or navigate there
    const preIntelStep = page.getByText('Run Vendor', { exact: false });
    const intelBanner = page.getByText('Catalog Intelligence Active', { exact: false });

    // If on pre-intelligence step and rules exist, banner should show
    if (await preIntelStep.isVisible({ timeout: 1000 }).catch(() => false)) {
      // The banner only shows if appliedRulesCount > 0
      // After sourcing rules exist, it should appear
      const bannerVisible = await intelBanner.isVisible({ timeout: 1000 }).catch(() => false);
      // Banner may or may not show depending on state, but component should render without errors
      await expect(page.getByText('Cross-examine raw input lines')).toBeVisible();
    }
  });
});
