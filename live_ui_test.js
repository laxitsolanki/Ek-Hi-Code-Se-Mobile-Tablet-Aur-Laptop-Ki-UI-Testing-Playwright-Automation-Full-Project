// live_ui_test.js
// Updated script – launches a new Chrome window for each device so you can SEE the window size change.

const { chromium } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, 'index.html')).href;

  const devices = [
    { name: 'Mobile (iPhone)', width: 375, height: 812 },
    { name: 'Tablet (iPad)',   width: 768, height: 1024 },
    { name: 'Laptop / PC',    width: 1366, height: 768 },
  ];

  for (const dev of devices) {
    console.log(`\n=== ${dev.name} – window size ${dev.width}×${dev.height} ===`);
    // Launch a **new browser** with the desired outer window size.
    const browser = await chromium.launch({
      headless: false,
      channel: 'chrome',               // use trusted Chrome binary
      slowMo: 1000,
      args: [`--window-size=${dev.width},${dev.height}`],
    });
    const context = await browser.newContext({ viewport: null }); // let page use the real window size
    const page = await context.newPage();

    await page.goto(fileUrl);
    await page.waitForTimeout(800);

    // Horizontal overflow check (visual)
    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    console.log('  Horizontal overflow?', hasHScroll ? 'YES' : 'NO');

    // Card fits?
    const cardBox = await page.locator('#main-card').boundingBox();
    console.log('  Card width', Math.round(cardBox.width), '≤', dev.width, '?',
                cardBox.width <= dev.width ? 'YES' : 'NO');

    // ----- Negative validation (wrong data) -----
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

    // ----- Positive validation (correct data) -----
    await page.fill('#fullname', 'Rahul Sharma');
    await page.fill('#email', 'rahul.sharma@example.com');
    await page.fill('#password', 'SecurePass123');
    await page.click('#submit-btn');

    await page.waitForSelector('#otp-section', { state: 'visible' });
    console.log('  ✅ OTP section visible');

    // Wrong OTP
    await page.fill('#otp-input', '0000');
    await page.click('#verify-btn');
    await page.waitForSelector('#otp-error', { state: 'visible' });
    console.log('  ❌ Wrong OTP error shown');

    // Correct OTP
    await page.fill('#otp-input', '1234');
    await page.click('#verify-btn');
    await page.waitForSelector('#success-section', { state: 'visible' });
    const welcome = await page.textContent('#welcome-msg');
    console.log('  🎉 Success screen –', welcome.trim());

    await page.waitForTimeout(2000);
    await browser.close();
  }

  console.log('\n✅ All devices tested – visible window‑size changes completed');
})();