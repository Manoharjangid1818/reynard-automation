// utils/authFixture.js
const { test: base } = require('@playwright/test');
const { LoginPage }  = require('../pages/LoginPage');
require('dotenv').config();

/**
 * Extended test fixture that provides an already-authenticated page.
 * Usage:  const { test } = require('../utils/authFixture');
 */
const test = base.extend({
  /**
   * authenticatedPage — provides a page that is already logged in.
   * Playwright re-uses browser context state so login runs once per worker.
   */
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.ADMIN_EMAIL    || 'manan.hathi+2@kiwiqa.com',
      process.env.ADMIN_PASSWORD || 'Test@1234'
    );

    // Wait until we're past the login page
    await page.waitForFunction(() => !window.location.href.includes('sign-in'), { timeout: 15000 })
      .catch(() => {});

    await use(page);
  },
});

const expect = base.expect;

module.exports = { test, expect };
