const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    await page.addInitScript(() => {
      window.PalmServiceBridge = function () {
        this.cancel = function () {};
        this.call = function (uri) {
          setTimeout(() => this.onservicecallback(JSON.stringify(uri.endsWith('/getAppLoadStatus')
            ? { returnValue: true, exist: true } : { returnValue: true })), 60);
        };
      };
    });
    await page.goto(pathToFileURL(path.join(__dirname, '../app/index.html')).href);
    await page.waitForFunction(() => !document.getElementById('refresh').hasAttribute('aria-busy'));
    assert(await page.locator('#connection, #mode-label, .intro p').count() === 0, 'Redundant status, app count, and subtitle removed');
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.tile img')).every(image => image.complete && image.naturalWidth));
    const check = await page.evaluate(() => {
      const issues = [];
      document.querySelectorAll('.tile img').forEach(image => {
        const bounds = image.getBoundingClientRect();
        const tile = image.parentElement.getBoundingClientRect();
        if (!image.src.startsWith('data:image/svg+xml') && image.naturalWidth >= 192 && bounds.width * devicePixelRatio > image.naturalWidth + 1) issues.push('High-resolution image unnecessarily upscaled');
        if (Math.abs(tile.width - tile.height) > 1) issues.push('Tile is not square');
        if (Math.abs(bounds.width - tile.width) > 1 || Math.abs(bounds.height - tile.height) > 1) issues.push('Blank padding around icon');
        if (bounds.left < tile.left || bounds.right > tile.right || bounds.top < tile.top || bounds.bottom > tile.bottom) issues.push('Image escapes tile');
        if (image.parentElement.querySelector('.fallback').hidden !== true) issues.push('Fallback overlaps icon');
      });
      window.savedTile = document.querySelector('.tile');
      window.savedImage = savedTile.querySelector('img');
      window.savedInput = document.querySelector('.input');
      return issues;
    });
    assert(check.length === 0, check.join(', '));
    await page.locator('#refresh').click();
    await page.waitForFunction(() => !document.getElementById('refresh').hasAttribute('aria-busy'));
    assert(await page.evaluate(() => savedTile === document.querySelector('.tile') && savedImage === savedTile.querySelector('img') && savedInput === document.querySelector('.input')), 'Refresh preserves tile, image and HDMI nodes');
    assert(await page.evaluate(() => document.activeElement.id === 'refresh'), 'Refresh preserves focus');
    await page.locator('#edit').click();
    await page.locator('[data-id="youtube.leanback.v4"]').focus();
    const before = await page.locator('[data-id="youtube.leanback.v4"]').boundingBox();
    await page.keyboard.press('Enter');
    const after = await page.locator('[data-id="youtube.leanback.v4"]').boundingBox();
    assert(JSON.stringify(before) === JSON.stringify(after), 'Favorite toggle leaves box fixed');
    assert(await page.evaluate(() => savedTile === document.querySelector('[data-id="youtube.leanback.v4"]') && savedImage === savedTile.querySelector('img')), 'Favorite toggle preserves original nodes');
    assert(await page.locator('[data-id="youtube.leanback.v4"]').getAttribute('aria-pressed') === 'true', 'OK picks up favorite');
    assert(await page.locator('[data-id="youtube.leanback.v4"] .pin').isHidden(), 'Picker badges stay out of inline editing');
    await page.keyboard.press('Enter');
    assert(await page.locator('[data-id="youtube.leanback.v4"]').getAttribute('aria-pressed') === 'false', 'OK places favorite');
    await page.keyboard.press('Escape');
    await page.locator('[data-id="netflix"]').focus();
    const launchBefore = await page.locator('[data-id="netflix"]').boundingBox();
    await page.keyboard.press('Enter');
    assert(JSON.stringify(launchBefore) === JSON.stringify(await page.locator('[data-id="netflix"]').boundingBox()), 'Launching keeps tile geometry fixed');
    assert(await page.locator('#notice').textContent() === 'Opening Netflix…', 'Launch feedback works');
    console.log('PASS: square edge-to-edge icons, 2x density, minimal copy, stable refresh/edit/launch');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
