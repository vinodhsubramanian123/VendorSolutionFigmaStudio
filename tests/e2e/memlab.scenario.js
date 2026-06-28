module.exports = {
  scenario: {
    url: () => 'http://localhost:5173/dashboard/taxonomy',
    setup: async (page) => {
      // Allow app to boot
      await page.waitForTimeout(2000);
    },
    action: async (page) => {
      // Simulate heavy clicking and interacting with the knowledge graph
      console.log('Action: Clicking graph nodes...');
      const graphContainer = page.locator('.force-graph-container canvas');
      if (await graphContainer.isVisible()) {
        await graphContainer.click({ position: { x: 100, y: 100 } });
        await page.waitForTimeout(500);
        await graphContainer.click({ position: { x: 200, y: 200 } });
        await page.waitForTimeout(500);
        await graphContainer.click({ position: { x: 300, y: 300 } });
      }
      
      console.log('Action: Navigating to Catalog...');
      await page.goto('http://localhost:5173/dashboard/catalog');
      await page.waitForTimeout(1000);
      
      const searchInput = page.getByPlaceholder('Search part numbers...');
      if (await searchInput.isVisible()) {
        await searchInput.fill('CPU');
        await page.waitForTimeout(1000);
        await searchInput.fill('');
      }
    },
    back: async (page) => {
      // Return to baseline view to see what memory was retained
      console.log('Back: Returning to home...');
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(2000);
    },
  },
};
