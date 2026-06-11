import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('14 - Gap UI/UX Resolution E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-mission-control').click();
    await delay(500);
  });

  test('should validate New UCID Modal inline error prevention', async ({ page }) => {
    // Open the direct ingest modal
    await page.getByRole('button', { name: 'Direct Ingest' }).click();
    await delay(300);

    // Get input fields by stable indexes scoped inside the form
    const nameInput = page.locator('form input').first();
    const refInput = page.locator('form input').nth(1);

    // Try submitting empty name field
    await nameInput.fill('');
    await refInput.fill('');

    await page.getByRole('button', { name: 'Initialize Parallel Workflow' }).click();
    await delay(300);

    // Verify crimson error messages are displayed
    await expect(page.getByText('Workspace Title / Brief Target is required.')).toBeVisible();
    await expect(page.getByText('Project Code Ref is required.')).toBeVisible();

    // Fill the inputs correctly
    await nameInput.fill('E2E Ingestion Test Cluster');
    await refInput.fill('PRJ-2026-E2E');
    
    // Submit
    await page.getByRole('button', { name: 'Initialize Parallel Workflow' }).click();
    await delay(500);

    // Verify the new UCID appears in the sidebar
    await expect(page.locator('input[placeholder="Search by ID, name, or project..."]')).toBeVisible();
    await expect(page.getByText('E2E Ingestion Test Cluster').first()).toBeVisible();
  });

  test('should filter the sidebar list by search term', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search by ID, name, or project..."]');
    
    // Search for non-existent pipeline
    await searchInput.fill('xyz-non-existent-pipeline');
    await delay(300);
    
    // Count should be 0
    await expect(page.getByText('Parallel Pipelines (0)')).toBeVisible();

    // Clear search
    await searchInput.fill('');
    await delay(300);

    // Search for a common pipeline name
    await searchInput.fill('Virtualisation');
    await delay(300);
    
    // Should display matching items
    await expect(page.locator('div[role="button"]').filter({ hasText: 'Virtualisation' }).first()).toBeVisible();
  });

  test('should trigger kebab menu duplicate, edit, and delete actions', async ({ page }) => {
    // Find Actions trigger on the first UCID card
    const actionBtn = page.getByTitle('Actions').first();
    await expect(actionBtn).toBeVisible();
    
    // Click actions kebab trigger
    await actionBtn.click();
    await delay(300);

    // Duplicate the pipeline
    await page.locator('.nested-action button:has-text("Duplicate")').click();
    await delay(500);

    // Verify clone name is present
    await expect(page.getByText('(Copy)').first()).toBeVisible();

    // Now edit the copy
    const copyActionBtn = page.getByTitle('Actions').last();
    await copyActionBtn.click();
    await delay(300);

    await page.locator('.nested-action button:has-text("Edit")').click();
    await delay(300);

    const editInput = page.locator('form input').first();
    await editInput.fill('Renamed E2E Flow');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await delay(500);

    // Verify name changed
    await expect(page.getByText('Renamed E2E Flow')).toBeVisible();

    // Delete the renamed copy
    const renamedActionBtn = page.getByTitle('Actions').last();
    await renamedActionBtn.click();
    await delay(300);

    await page.locator('.nested-action button:has-text("Delete")').click();
    await delay(300);

    // Confirm deletion in warning modal
    await page.getByRole('button', { name: 'Permanently Delete' }).click();
    await delay(500);

    // Renamed flow should be gone
    await expect(page.getByText('Renamed E2E Flow')).not.toBeVisible();
  });

  test('should clear and filter logs in the event ledger', async ({ page }) => {
    // Select first individual UCID card to display its ledger
    await page.locator('div[role="button"]').filter({ hasText: 'UCID-2026-' }).first().click();
    await delay(300);

    const ledgerCard = page.locator('span:has-text("Live Verification Event Ledger")');
    await expect(ledgerCard).toBeVisible();

    // Click OK filter chip
    await page.getByRole('button', { name: 'OK' }).click();
    await delay(300);

    // Click Clear button
    await page.getByRole('button', { name: 'Clear' }).click();
    await delay(300);

    // Verify it is empty
    await expect(page.getByText('No events match the selected filter.')).toBeVisible();
  });
});
