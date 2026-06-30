// utils/authFixture.js
const { test: base } = require('@playwright/test');
const { LoginPage }  = require('../pages/LoginPage');
const fs             = require('fs');
const path           = require('path');
require('dotenv').config();

const AUTH_DIR = path.join(__dirname, '..', 'reports', '.auth');

function authCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || 'manan.hathi+2@kiwiqa.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  };
}

function resolveBaseURL(baseURL) {
  return baseURL || process.env.BASE_URL || 'https://reynard-qa-m7xqu.ondigitalocean.app';
}

async function getSessionStorage(page) {
  return await page.evaluate(() => {
    const values = {};
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      values[key] = window.sessionStorage.getItem(key);
    }
    return values;
  });
}

/**
 * Extended test fixture that provides an already-authenticated page.
 * Usage:  const { test } = require('../utils/authFixture');
 */
const test = base.extend({
  /**
   * authenticatedState — logs in once per worker and stores browser/session state.
   */
  authenticatedState: [async ({ browser }, use, workerInfo) => {
    const resolvedBaseURL = resolveBaseURL(workerInfo.project.use.baseURL);
    const projectName = workerInfo.project.name.replace(/[^\w.-]+/g, '-');
    const storageStatePath = path.join(AUTH_DIR, `admin-${projectName}-worker-${workerInfo.workerIndex}.json`);

    fs.mkdirSync(AUTH_DIR, { recursive: true });

    const context = await browser.newContext({ baseURL: resolvedBaseURL });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    const credentials = authCredentials();

    await loginPage.login(credentials.email, credentials.password);
    await page.waitForFunction(() => !window.location.href.includes('sign-in'), { timeout: 20000 });

    const sessionStorage = await getSessionStorage(page);
    await context.storageState({ path: storageStatePath });
    await context.close();

    await use({
      baseURL: resolvedBaseURL,
      origin: new URL(resolvedBaseURL).origin,
      sessionStorage,
      storageStatePath,
    });
  }, { scope: 'worker' }],

  /**
   * authenticatedPage — fresh page per test, restored from the worker auth state.
   */
  authenticatedPage: async ({ browser, authenticatedState }, use) => {
    const context = await browser.newContext({
      baseURL: authenticatedState.baseURL,
      storageState: authenticatedState.storageStatePath,
    });

    await context.addInitScript(({ origin, values }) => {
      if (window.location.origin !== origin) return;

      for (const [key, value] of Object.entries(values)) {
        window.sessionStorage.setItem(key, value);
      }
    }, {
      origin: authenticatedState.origin,
      values: authenticatedState.sessionStorage,
    });

    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

const expect = base.expect;

module.exports = { test, expect };
