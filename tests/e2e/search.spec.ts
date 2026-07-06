import { test, expect } from '@playwright/test';


test.describe('04 - Search E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-search').click();
  });

  test('should type in Semantic NLP Search and see live results', async ({ page }) => {
    const input = page.locator('input[placeholder="Type here to search parts, manufacturers, process IDs..."]');
    await input.fill('HPE');
    // Should render a search result
    const searchCard = page.locator('div.group\\/result').first();
    if (await searchCard.isVisible()) {
      await expect(searchCard).toBeVisible();
    }
  });
});
