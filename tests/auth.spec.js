// tests/auth.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../pages/LoginPage');
const { loadTestData, getEnabledTests, tcTitle } = require('../utils/testHelpers');
require('dotenv').config();

const data = loadTestData('auth');
const validAdmin = data.credentials?.validAdmin || {};

function validAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || validAdmin.email,
    password: process.env.ADMIN_PASSWORD || validAdmin.password,
  };
}

function resolveLoginCredentials(tc, useValidPassword = false) {
  const credentials = validAdminCredentials();
  return {
    email: tc.email === validAdmin.email ? credentials.email : tc.email,
    password: useValidPassword ? credentials.password : tc.password,
  };
}

test.describe('Authentication', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ─── Dynamically generate tests from data file ──────────────────────────
  for (const tc of getEnabledTests(data)) {
    test(tcTitle(tc), async ({ page }) => {
      loginPage = new LoginPage(page);

      switch (tc.expectedResult) {

        // ── Positive: successful login ─────────────────────────────────────
        case 'redirect_to_dashboard': {
          const credentials = resolveLoginCredentials(tc, true);
          await loginPage.login(credentials.email, credentials.password);
          expect(await loginPage.getErrorMessage()).toBeNull();
          await expect(page).not.toHaveURL(/sign-in/, { timeout: 15000 });
          expect(await loginPage.isDashboardVisible()).toBeTruthy();
          break;
        }

        // ── Negative: wrong credentials ────────────────────────────────────
        case 'error_message': {
          const credentials = resolveLoginCredentials(tc);
          await loginPage.login(credentials.email, credentials.password);
          // Should stay on login page OR show an error
          const url = page.url();
          const hasError = await loginPage.getErrorMessage();
          const stayedOnLogin = url.includes('sign-in');
          expect(stayedOnLogin || !!hasError).toBeTruthy();
          break;
        }

        // ── Negative: HTML5 / client-side validation ───────────────────────
        case 'validation_error': {
          await loginPage.goto();
          if (tc.email !== undefined && tc.email !== null) {
            await page.locator(loginPage.emailInput).first().fill(tc.email);
          }
          if (tc.password !== undefined && tc.password !== null) {
            await page.locator(loginPage.passwordInput).first().fill(tc.password);
          }
          await page.locator(loginPage.loginButton).first().click();
          await page.waitForTimeout(1500);
          // Either stays on the login page or shows an error
          const afterUrl  = page.url();
          const errMsg    = await loginPage.getErrorMessage();
          expect(afterUrl.includes('sign-in') || !!errMsg).toBeTruthy();
          break;
        }

        // ── UI: all page elements are present ─────────────────────────────
        case 'page_elements_present': {
          expect(await loginPage.isEmailFieldVisible()).toBeTruthy();
          expect(await loginPage.isPasswordFieldVisible()).toBeTruthy();
          expect(await loginPage.isLoginPageVisible()).toBeTruthy();
          expect(await loginPage.isForgotPasswordVisible()).toBeTruthy();
          break;
        }

        // ── UI: password field is masked ───────────────────────────────────
        case 'password_masked': {
          await page.locator(loginPage.passwordInput).first().fill(tc.password);
          expect(await loginPage.isPasswordMasked()).toBeTruthy();
          break;
        }

        // ── UI: remember-me checkbox ───────────────────────────────────────
        case 'remember_me_checked': {
          await loginPage.goto();
          const checked = await loginPage.checkRememberMe();
          expect(checked).toBeTruthy();
          break;
        }

        // ── Navigation: forgot password ────────────────────────────────────
        case 'navigates_to_forgot_password': {
          await loginPage.clickForgotPassword();
          await page.waitForLoadState('networkidle').catch(() => {});
          const url = page.url();
          expect(
            url.includes('forgot') || url.includes('reset') || url.includes('password')
          ).toBeTruthy();
          break;
        }

        // ── Flow: login then logout ────────────────────────────────────────
        case 'redirected_to_login': {
          const credentials = resolveLoginCredentials(tc, true);
          await loginPage.login(credentials.email, credentials.password);
          expect(await loginPage.getErrorMessage()).toBeNull();
          await expect(page).not.toHaveURL(/sign-in/, { timeout: 15000 });
          await loginPage.logout();
          await expect(page).toHaveURL(/sign-in|login|authentication/, { timeout: 10000 });
          break;
        }

        // ── Security: SQL injection should not log in ─────────────────────
        case 'login_fails_or_error': {
          await loginPage.login(tc.email, tc.password);
          const url = page.url();
          expect(url.includes('sign-in') || url.includes('authentication')).toBeTruthy();
          break;
        }

        default:
          test.skip(true, `Handler for "${tc.expectedResult}" not implemented yet`);
      }
    });
  }
});
