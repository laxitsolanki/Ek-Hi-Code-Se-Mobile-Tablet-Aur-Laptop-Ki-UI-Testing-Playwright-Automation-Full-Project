const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  timeout: 60000,
  use: {
    headless: false, // Browser dikhega
    channel: 'chrome', // Uses installed Google Chrome (bypasses Windows Smart App Control / Code Integrity blocking)
    launchOptions: {
      slowMo: 1000, // Har step 1 second slow chalega
    },
    screenshot: 'on',
  },
});