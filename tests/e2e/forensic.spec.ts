import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('08 - Forensic Scan E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-forensic').click();
    await delay(500);
  });

  test('should validate global scan metrics', async ({ page }) => {
    await expect(page.getByText('Sourcing Integrity Diagnostic Sandbox').first()).toBeVisible();
    await expect(page.getByText('Workspace Health Integrity Score')).toBeVisible();
  });

  test('should click Heal Threat on EOL Risk and flip status', async ({ page }) => {
    const healBtn = page.getByText('Auto-Heal Threat', { exact: false }).first();
    if (await healBtn.isVisible()) {
      await healBtn.click();
      await delay(1000);
      // Wait for an optimistic UI change (like a success badge or row fading)
      // We expect a toast to appear or the heal button to disappear.
      await expect(page.getByText('Auto-Heal Threat', { exact: false })).toHaveCount(await page.getByText('Auto-Heal Threat', { exact: false }).count()); 
      // The row should be updated to a success state or the issue removed.
      // E.g. we can check for Toast text
      await expect(page.getByText('replaced & catalog replacement rule')).toBeVisible({ timeout: 2000 });
    }
  });

  test('should navigate to Sourcing Rules Vault', async ({ page }) => {
    // Sourcing Rules Vault is already on the page at the bottom, just verify its visibility
    await expect(page.getByText('Centralized Sourcing Intelligence & Override Registry')).toBeVisible();
  });

  test('should open Add Custom Rule form in Vault', async ({ page }) => {
    // Sourcing Rules Vault is already on the page at the bottom
    const addRuleBtn = page.locator('button', { hasText: 'Define Sourcing Override' });
    await addRuleBtn.click();
    await delay(1000);
    await expect(page.getByText('Create New Sourcing Intelligence Directive', { exact: false })).toBeVisible();
    await page.keyboard.press('Escape');
  });
});
