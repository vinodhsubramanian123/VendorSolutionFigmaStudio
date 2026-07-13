import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:3000/');
  
  // Wait for network idle or a specific element
  await page.waitForSelector('text=Dashboard');
  
  const content = await page.content();
  console.log(content);
  
  await browser.close();
})();
