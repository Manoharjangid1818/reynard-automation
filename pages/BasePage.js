// pages/BasePage.js
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  }

  async getTitle() {
    return await this.page.title();
  }

  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async clickElement(selector) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.click(selector);
  }

  async fillField(selector, value) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.fill(selector, value);
  }

  async getText(selector) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    return await this.page.textContent(selector);
  }

  async isVisible(selector) {
    try {
      return await this.page.isVisible(selector);
    } catch {
      return false;
    }
  }

  async selectDropdownByIndex(selector, index) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.click(selector);
    const options = await this.page.locator(`${selector} option`).all();
    if (options.length > index) {
      await this.page.selectOption(selector, { index });
    }
  }

  async selectDropdownOption(selector, value) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.selectOption(selector, { label: value });
  }

  async getTableRowCount() {
    const rows = await this.page.locator('table tbody tr').count();
    return rows;
  }

  async getTableColumnHeaders() {
    const headers = await this.page.locator('table thead th').allTextContents();
    return headers.map(h => h.trim()).filter(h => h !== '');
  }

  async waitForToast() {
    try {
      await this.page.waitForSelector('[class*="toast"], [class*="notification"], [class*="alert"], [class*="snack"]', { timeout: 5000 });
      return await this.page.textContent('[class*="toast"], [class*="notification"], [class*="alert"], [class*="snack"]');
    } catch {
      return null;
    }
  }

  async screenshot(name) {
    await this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }
}

module.exports = { BasePage };
