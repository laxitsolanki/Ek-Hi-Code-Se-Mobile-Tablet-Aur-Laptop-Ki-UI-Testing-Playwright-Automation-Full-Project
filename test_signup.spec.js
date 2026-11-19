const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const fileUrl = pathToFileURL(path.resolve(__dirname, 'index.html')).href;

// Alag-alag screen sizes
const devices = [
  { name: 'Mobile (iPhone)', width: 375, height: 812 },
  { name: 'Tablet (iPad)', width: 768, height: 1024 },
  { name: 'Laptop / PC', width: 1366, height: 768 },
];

for (const device of devices) {
  test(`Sign-Up Flow & UI Testing on ${device.name}`, async ({ page }) => {
    // 1. Screen size set karna
    await page.setViewportSize({ width: device.width, height: device.height });
    await page.goto(fileUrl);

    // 2. UI Bug Check: Horizontal overflow (kahin page kat toh nahi raha)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Card screen ke andar fit hai ya nahi check karna
    const cardBox = await page.locator('#main-card').boundingBox();
    expect(cardBox.width).toBeLessThanOrEqual(device.width);

    // 3. Negative Validation Testing (Galat data daalna)
    await page.fill('#fullname', 'Al'); // 3 se kam letters
    await page.fill('#email', 'wrong-email'); // Galat email format
    await page.fill('#password', '123'); // 6 se kam digits
    await page.click('#submit-btn');

    // Check karna ki error messages dikh rahe hain
    await expect(page.locator('#name-error')).toBeVisible();
    await expect(page.locator('#email-error')).toBeVisible();
    await expect(page.locator('#pass-error')).toBeVisible();

    // 4. Positive Validation Testing (Sahi data fill karna)
    await page.fill('#fullname', 'Rahul Sharma');
    await page.fill('#email', 'rahul.sharma@example.com');
    await page.fill('#password', 'SecurePass123');
    await page.click('#submit-btn');

    // 5. Email Verification (OTP Step) Testing
    await expect(page.locator('#otp-section')).toBeVisible();

    // Pehle galat OTP check karna
    await page.fill('#otp-input', '0000');
    await page.click('#verify-btn');
    await expect(page.locator('#otp-error')).toBeVisible();

    // Ab sahi OTP (1234) daalna
    await page.fill('#otp-input', '1234');
    await page.click('#verify-btn');

    // 6. Final Success Verification
    await expect(page.locator('#success-section')).toBeVisible();
    await expect(page.locator('#welcome-msg')).toContainText('verify ho gaya hai');
  });
}