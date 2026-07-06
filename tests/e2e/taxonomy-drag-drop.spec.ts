import { test, expect } from '@playwright/test';


test.describe('26 - Taxonomy Graph Sync E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to taxonomy graph
    await page.goto('/');
    await page.locator('#nav-taxonomy-graph').click();
  });

  test('should render the graph workspace and open panels', async ({ page }) => {
    // Assert the tab buttons are present
    const orphansTab = page.getByRole('button', { name: /Orphans Tab/i }).first();
    await expect(orphansTab).toBeVisible({ timeout: 5000 });

    // Open orphan alignment desk
    await orphansTab.click();
    // Verify orphan node mapping can be initiated
    const activeOrphansList = page.getByText(/Active Orphans/i).first();
    await expect(activeOrphansList).toBeVisible();

    const mapButton = page.locator('button:has-text("Map")').first();
    if (await mapButton.isVisible()) {
      await mapButton.click();
      // Verify the target subsystem select appears
      const selectTarget = page.getByRole('combobox').first();
      await expect(selectTarget).toBeVisible();

      // Check the path orchestrator tab
      const pathTab = page.getByLabel('Paths Tab').first();
      await pathTab.click();
      const pathHelp = page.getByText(/Click on any primary Category Hub node/i).first();
      await expect(pathHelp).toBeVisible();
    }
  });
});
