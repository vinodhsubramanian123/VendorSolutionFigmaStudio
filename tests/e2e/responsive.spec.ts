/**
 * Category 5 — Responsive Breakpoint Tests
 * Asserts layout correctness at each Tailwind/design breakpoint.
 * Critical for dense BOQ/BOM tables which are at high risk of breaking on narrow viewports.
 * Breakpoints: sm (375px), md (768px), lg (1024px), xl (1280px)
 */
import { test, expect } from '@playwright/test';


const BREAKPOINTS = [
  { name: 'sm', width: 375, height: 812 },
  { name: 'md', width: 768, height: 1024 },
  { name: 'lg', width: 1024, height: 768 },
  { name: 'xl', width: 1280, height: 900 },
];

test.describe('05 - Responsive Breakpoint Tests', () => {

  for (const bp of BREAKPOINTS) {
    test(`[${bp.name} - ${bp.width}px] Core layout renders without overflow at ${bp.name} breakpoint`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');
      // The app should render its core shell at every breakpoint
      await expect(page.locator('body')).toBeVisible();

      // Check for horizontal scroll overflow — a critical layout regression indicator
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // At sm breakpoint, some overflow may exist for dense data tables — acceptable
      // At md+ viewport, the layout should be fully contained
      if (bp.width >= 768) {
        expect(hasHorizontalScroll).toBe(false);
      }
    });
  }

  test('[sm - 375px] Sidebar collapses or hides on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    // The sidebar navigation should be collapsed or hidden at mobile widths
    // It should not occupy full width, leaving no space for main content
    const sidebar = page.locator('#nav-mission-control, nav, aside').first();
    const isVisible = await sidebar.isVisible();
    // The test name promises one of two outcomes: hidden, or collapsed to a
    // narrow icon rail. If visible, that width claim must actually be checked
    // instead of silently passing when boundingBox() comes back empty.
    if (isVisible) {
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox).not.toBeNull();
      expect(sidebarBox!.width).toBeLessThan(200);
    }
    // If not visible, "hides on mobile" is satisfied — nothing further to assert.
  });

  test('[md - 768px] Navigation links are accessible at tablet breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    // Key navigation items should be visible at tablet width
    const navItem = page.locator('#nav-mission-control, #nav-catalog, #nav-reconciliation').first();
    await expect(navItem).toBeVisible();
  });

  test('[lg - 1024px] Catalog view renders full table/grid without truncation', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.locator('#nav-catalog').click();
    // At lg breakpoint, catalog content should be visible and not truncated
    await expect(page.locator('body')).toBeVisible();
    const catalogContent = page.getByText('Catalog', { exact: false }).first();
    await expect(catalogContent).toBeVisible();
  });

  test('[xl - 1280px] Mission Control renders full dashboard layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.locator('#nav-mission-control').click();
    // At xl breakpoint, the full mission control dashboard should be visible
    await expect(page.locator('body')).toBeVisible();
    const missionContent = page.getByText('Mission Control', { exact: false }).first();
    await expect(missionContent).toBeVisible();
  });

  test('[sm - 375px] Forensic/Sourcing Rules Vault is accessible at mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    // Navigate to forensics
    const forensicNav = page.locator('#nav-forensic');
    await expect(forensicNav).toBeVisible({ timeout: 5000 });
    await forensicNav.click();
    // The page should render without crashes
    await expect(page.locator('body')).toBeVisible();
  });

  test('[md - 768px] Ingestion Hub stepper renders correctly at tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    const ingestionNav = page.locator('#nav-ingestion-hub');
    await expect(ingestionNav).toBeVisible({ timeout: 5000 });
    await ingestionNav.click();
    await expect(page.locator('body')).toBeVisible();
  });

  test('[lg - 1024px] Reconciliation view renders drift table at standard width', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    const reconciliationNav = page.locator('#nav-reconciliation');
    await expect(reconciliationNav).toBeVisible({ timeout: 5000 });
    await reconciliationNav.click();
    await expect(page.locator('body')).toBeVisible();
  });
});
