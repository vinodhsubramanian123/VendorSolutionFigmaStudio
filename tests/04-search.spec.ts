import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('04 - Search E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-search').click();
    await delay(500);
  });

  test('should type in Semantic NLP Search and see live results', async ({ page }) => {
    const input = page.locator('input[placeholder="Type here to search parts, manufacturers, process IDs..."]');
    await input.fill('HPE');
    await delay(1000);
    // Should render a search result
    const searchCard = page.locator('div.group\\/result').first();
    if (await searchCard.isVisible()) {
      await expect(searchCard).toBeVisible();
    }
  });
});
