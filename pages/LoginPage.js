// pages/LoginPage.js
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.notificationShimAdded = false;

    // Selectors
    this.emailInput       = 'input[type="email"], input[placeholder*="mail" i], input[name="email"]';
    this.passwordInput    = 'input[type="password"]';
    this.loginButton      = 'button:has-text("Log In"), button:has-text("Login"), button[type="submit"]';
    this.rememberMeCheck  = 'input[type="checkbox"]';
    this.forgotPassLink   = 'a[href*="forgot-password"], a:has-text("Forgot")';
    this.errorMessage     = '[class*="error"], [class*="alert"], [class*="danger"], [role="alert"]';
    this.logoImage        = 'img[alt*="reynard" i], img[src*="logo" i]';
  }

  async goto() {
    await this.addFirefoxNotificationShim();
    await this.navigate('/authentication/sign-in');
  }

  async addFirefoxNotificationShim() {
    const browserName = this.page.context().browser()?.browserType().name();
    if (browserName !== 'firefox' || this.notificationShimAdded) return;

    // Firefox headless can leave Notification.requestPermission() pending.
    // The app accepts a denied permission and continues login without an FCM token.
    await this.page.addInitScript(() => {
      if (!('Notification' in window)) return;

      const NotificationShim = function Notification() {};
      Object.defineProperty(NotificationShim, 'permission', { get: () => 'denied' });
      NotificationShim.requestPermission = () => Promise.resolve('denied');
      Object.defineProperty(window, 'Notification', { value: NotificationShim, configurable: true });
    });

    this.notificationShimAdded = true;
  }

  async login(email, password) {
    await this.goto();
    if (email !== null && email !== undefined) {
      await this.page.locator(this.emailInput).first().fill(email);
    }
    if (password !== null && password !== undefined) {
      await this.page.locator(this.passwordInput).first().fill(password);
    }
    await this.page.locator(this.loginButton).first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getErrorMessage() {
    try {
      await this.page.waitForSelector(this.errorMessage, { timeout: 5000 });
      return await this.page.locator(this.errorMessage).first().textContent();
    } catch {
      return null;
    }
  }

  async isLoginPageVisible() {
    return await this.page.locator(this.loginButton).first().isVisible().catch(() => false);
  }

  async isEmailFieldVisible() {
    return await this.page.locator(this.emailInput).first().isVisible().catch(() => false);
  }

  async isPasswordFieldVisible() {
    return await this.page.locator(this.passwordInput).first().isVisible().catch(() => false);
  }

  async isForgotPasswordVisible() {
    return await this.page.locator(this.forgotPassLink).first().isVisible().catch(() => false);
  }

  async isPasswordMasked() {
    const type = await this.page.locator(this.passwordInput).first().getAttribute('type');
    return type === 'password';
  }

  async checkRememberMe() {
    const checkbox = this.page.locator(this.rememberMeCheck).first();
    const isChecked = await checkbox.isChecked().catch(() => false);
    if (!isChecked) await checkbox.check();
    return await checkbox.isChecked();
  }

  async clickForgotPassword() {
    await this.page.locator(this.forgotPassLink).first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async logout() {
    const sideNavLogout = this.page.locator('li:has-text("Logout") > div').first();
    const logoutLink = this.page.locator('a:has-text("Logout"), button:has-text("Logout")').first();

    if (await sideNavLogout.isVisible().catch(() => false)) {
      await sideNavLogout.click();
    } else if (await logoutLink.isVisible().catch(() => false)) {
      await logoutLink.click();
    } else {
      // Try user menu
      await this.page.locator('[class*="avatar"], [class*="user-menu"]').first().click().catch(() => {});
      await this.page.getByText('Logout', { exact: true }).first().click().catch(() => {});
    }

    const confirmLogout = this.page.getByRole('button', { name: /^Yes$/ }).first();
    await confirmLogout.waitFor({ state: 'visible', timeout: 5000 }).then(() => confirmLogout.click()).catch(() => {});
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async isDashboardVisible() {
    const url = this.page.url();
    return url.includes('/client/') || url.includes('/dashboard') || url.includes('/project');
  }
}

module.exports = { LoginPage };
