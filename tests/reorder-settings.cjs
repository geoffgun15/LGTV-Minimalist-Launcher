const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    await page.addInitScript(() => {
      window.launches = [];
      window.PalmServiceBridge = function () {
        this.cancel = function () {};
        this.call = function (uri, json) {
          if (uri.endsWith('/launch')) window.launches.push(JSON.parse(json).id);
          setTimeout(() => this.onservicecallback(JSON.stringify({ returnValue: true, exist: true })), 20);
        };
      };
    });
    const order = () => page.locator('#apps .tile').evaluateAll(tiles => tiles.map(tile => tile.dataset.id));
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('favorites')));
    await page.goto(pathToFileURL(path.join(__dirname, '../app/index.html')).href);
    await page.waitForFunction(() => !document.getElementById('refresh').hasAttribute('aria-busy'));
    const initial = await order();
    assert(await page.locator('#reorder').isHidden(), 'Reorder is hidden outside favorite editing');
    if (await page.locator('#reorder').isHidden()) await page.locator('#edit').click();
    await page.locator('#reorder').click();
    assert(await page.evaluate(() => document.activeElement.dataset.id) === initial[0], 'Reorder starts on first favorite');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowLeft');
    assert(JSON.stringify(await order()) === JSON.stringify(initial), 'First app cannot move before start');
    await page.keyboard.press('ArrowRight');
    assert((await order())[1] === initial[0], 'Arrow moves picked app');
    assert(await page.evaluate(() => document.activeElement.dataset.id) === initial[0], 'Focus follows picked app');
    await page.keyboard.press('Enter');
    assert((await saved())[1] === initial[0], 'OK persists new order');
    const committed = await order();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    assert(JSON.stringify(await order()) === JSON.stringify(committed), 'Back cancels only current move');
    await page.keyboard.press('Escape');
    assert(await page.locator('#section-title').textContent() === 'Choose your favorites', 'Second Back returns to editing');
    await page.reload();
    await page.waitForFunction(() => !document.getElementById('refresh').hasAttribute('aria-busy'));
    assert(JSON.stringify(await order()) === JSON.stringify(committed), 'Order survives reload');
    if (await page.locator('#reorder').isHidden()) await page.locator('#edit').click();
    await page.locator('#reorder').click();
    await page.keyboard.press('Enter');
    await page.locator('#move-right').click();
    assert((await order())[1] === committed[0], 'Pointer move control works');
    await page.locator('#cancel-move').click();
    assert(JSON.stringify(await order()) === JSON.stringify(committed), 'Pointer cancel restores order');
    await page.keyboard.press('Enter');
    await page.locator('#move-right').click();
    await page.locator('#place').click();
    assert((await saved())[1] === committed[0], 'Pointer place persists order');
    if (await page.locator('#reorder').isHidden()) await page.locator('#edit').click();
    await page.locator('#reorder').click();
    await page.evaluate(() => localStorage.setItem('favorites', JSON.stringify(window.C4_CATALOG.apps.slice(0, 10).map(app => app.id))));
    await page.reload();
    await page.waitForFunction(() => !document.getElementById('refresh').hasAttribute('aria-busy'));
    const multirow = await order();
    if (await page.locator('#reorder').isHidden()) await page.locator('#edit').click();
    await page.locator('#reorder').click();
    await page.keyboard.press('Enter');
    for (let step = 0; step < 7; step++) await page.keyboard.press('ArrowRight');
    assert((await order())[7] === multirow[0], 'Move crosses a wrapped row');
    assert(await page.evaluate(() => document.activeElement.dataset.id) === multirow[0], 'Focus follows across rows');
    await page.keyboard.press('Enter');
    assert((await saved())[7] === multirow[0], 'Wrapped-row order persists');
    await page.keyboard.press('Escape');
    await page.locator('#settings').click();
    assert(await page.evaluate(() => launches.includes('com.palm.app.settings')), 'Settings launches native TV settings');
    assert(await page.evaluate(() => launches.length) === 1, 'Reorder never launches apps');
    console.log('PASS: remote/pointer reordering, bounds, focus, persistence, cancellation, native TV settings launch');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
