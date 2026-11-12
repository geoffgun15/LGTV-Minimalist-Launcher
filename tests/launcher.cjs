const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    await page.goto(pathToFileURL(path.join(__dirname, '../app/index.html')).href);
    assert(await page.locator('.tile').count() === 6, 'Six default favorites');
    assert(await page.locator('.input').count() === 4, 'Four HDMI inputs');
    await page.keyboard.press('ArrowRight');
    assert(await page.evaluate(() => document.activeElement.dataset.id) === 'netflix', 'Right arrow moves focus');
    await page.keyboard.press('ArrowDown');
    assert((await page.evaluate(() => document.activeElement.dataset.id)).includes('hdmi'), 'Down arrow reaches inputs');
    await page.locator('#view').click();
    assert(await page.locator('.tile').count() === 17, 'All saved app shortcuts');
    await page.locator('#edit').click();
    await page.locator('[data-id="com.crunchyroll.webapp"]').click();
    assert(await page.locator('[data-id="com.crunchyroll.webapp"]').getAttribute('aria-pressed') === 'true', 'Favorite selected');
    await page.keyboard.press('Escape');
    await page.locator('#view').click();
    await page.reload();
    assert(await page.locator('.tile').count() === 7, 'Favorites persist after reload');
    for (const width of [1920, 960, 390]) {
      await page.setViewportSize({ width, height: 1080 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow at ' + width);
    }
    assert(errors.length === 0, 'No JavaScript errors: ' + errors.join(', '));
    console.log('PASS: app catalog, HDMI inputs, D-pad, favorites persistence, responsive layout');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
