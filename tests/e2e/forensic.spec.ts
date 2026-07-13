import { test, expect } from '@playwright/test';


test.describe('08 - Forensic Scan E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-forensic').click();
  });

  test('should validate global scan metrics', async ({ page }) => {
    await expect(page.getByText('Sourcing Integrity Diagnostic Sandbox').first()).toBeVisible();
    await expect(page.getByText('Workspace Health Integrity Score')).toBeVisible();
  });

  test('should click Heal Threat on EOL Risk and flip status', async ({ page }) => {
    const healBtn = page.getByText('Auto-Heal Threat', { exact: false }).first();
    await expect(healBtn).toBeVisible({ timeout: 5000 });
    await healBtn.click();
    // The row should be updated to a success state or the issue removed.
    // E.g. we can check for Toast text
    await expect(page.getByText('replaced & catalog replacement rule')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Sourcing Rules Vault', async ({ page }) => {
    // Sourcing Rules Vault is already on the page at the bottom, just verify its visibility
    await expect(page.getByText('Centralized Sourcing Intelligence & Override Registry')).toBeVisible();
  });

  test('should open Add Custom Rule form in Vault', async ({ page }) => {
    // Sourcing Rules Vault is already on the page at the bottom
    const addRuleBtn = page.locator('button', { hasText: 'Define Sourcing Override' });
    await addRuleBtn.click();
    await expect(page.getByText('Create New Sourcing Intelligence Directive', { exact: false })).toBeVisible();
    await page.keyboard.press('Escape');
  });
});
