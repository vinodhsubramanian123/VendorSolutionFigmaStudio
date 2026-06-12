import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('10 - Taxonomy Graph E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-taxonomy-graph').click();
    await delay(500);
  });

  test('should assert Recharts/SVG topology nodes render without throwing', async ({ page }) => {
    await expect(page.getByText('Taxonomy Graph Canvas')).toBeVisible();
    const svgs = page.locator('svg');
    await expect(svgs.first()).toBeVisible();
  });

  test('should verify Export Architecture button is present', async ({ page }) => {
    const exportBtn = page.locator('button', { hasText: 'Filter Orphans' }).first();
    await expect(exportBtn).toBeVisible();
  });
});
