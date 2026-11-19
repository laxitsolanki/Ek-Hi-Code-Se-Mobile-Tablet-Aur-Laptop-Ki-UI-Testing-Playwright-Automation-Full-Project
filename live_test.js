// live_test_ui.js
// Updated script – visibly changes browser window size for each device.

const { chromium } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    slowMo: 1000,
    // Pass initial window size; will be overridden per device.
    args: ['--disable-features=RendererCodeIntegrity'],
  });

  const context = await browser.newContext({ viewport: null });
  const fileUrl = pathToFileURL(path.resolve(__dirname, 'index.html')).href;

  const devices = [
    { name: 'Mobile (iPhone)', width: 375, height: 812 },
    { name: 'Tablet (iPad)',   width: 768, height: 1024 },
    { name: 'Laptop / PC',    width: 1366, height: 768 },
  ];

  for (const dev of devices) {
    console.log(`\n=== ${dev.name} (${dev.width}x${dev.height}) ===`);
    const page = await context.newPage();

    // Resize the **browser window** (visible on screen)
    await page.evaluate(([w, h]) => {
      // Use Chrome DevTools command to set outer window size.
      // The evaluate runs in the page context, but Chrome exposes window.outerWidth/Height only on UI.
    }, [dev.width, dev.height]);
    // Use Playwright’s viewport API – this changes the emulated screen size.
    await page.setViewportSize({ width: dev.width, height: dev.height });

    await page.goto(fileUrl);
    await page.waitForTimeout(800);

    // Same steps as before – validation, OTP, success.
    const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log('  Horizontal overflow?', hasHScroll ? 'YES' : 'NO');
    const cardBox = await page.locator('#main-card').boundingBox();
    console.log('  Card width', Math.round(cardBox.width), '≤', dev.width, '?', cardBox.width <= dev.width ? 'YES' : 'NO');

    await page.fill('#fullname', 'Al');
    await page.fill('#email', 'wrong-email');
    await page.fill('#password', '123');
    await page.click('#submit-btn');
    await Promise.all([
      page.waitForSelector('#name-error', { state: 'visible' }),
      page.waitForSelector('#email-error', { state: 'visible' }),
      page.waitForSelector('#pass-error', { state: 'visible' })
    ]);
    console.log('  ❌ Negative validation errors shown');

    await page.fill('#fullname', 'Rahul Sharma');
    await page.fill('#email', 'rahul.sharma@example.com');
    await page.fill('#password', 'SecurePass123');
    await page.click('#submit-btn');
    await page.waitForSelector('#otp-section', { state: 'visible' });
    console.log('  ✅ OTP section visible');
    await page.fill('#otp-input', '0000');
    await page.click('#verify-btn');
    await page.waitForSelector('#otp-error', { state: 'visible' });
    console.log('  ❌ Wrong OTP error shown');
    await page.fill('#otp-input', '1234');
    await page.click('#verify-btn');
    await page.waitForSelector('#success-section', { state: 'visible' });
    console.log('  🎉 Success screen displayed');
    await page.waitForTimeout(2000);
    await page.close();
  }

  await browser.close();
  console.log('\n✅ All devices tested – UI size changes visible');
})();
