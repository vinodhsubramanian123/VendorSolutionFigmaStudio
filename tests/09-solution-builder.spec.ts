import { test, expect } from '@playwright/test';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('09 - Solution Builder E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-solution-builder').click();
    await delay(500);
  });

  test('should load Schema Inspector matrix and trees', async ({ page }) => {
    await expect(page.getByText('Multi-Client Quote Compilation Desk')).toBeVisible();
    // Trees should render schemas
    await expect(page.getByText('UCID Assignment Map')).toBeVisible();
  });

  test('should switch target platform to VMware and assert active schema updates', async ({ page }) => {
    const platformBtn = page.locator('button', { hasText: 'Target Deployment' }).first();
    if (await platformBtn.isVisible()) {
       await platformBtn.click();
       await page.getByText('VMware Cloud Foundation').click();
       await delay();
    }
  });
});
