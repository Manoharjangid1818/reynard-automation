// pages/TrainingMatrixPage.js
const { BasePage } = require('./BasePage');

class TrainingMatrixPage extends BasePage {
  constructor(page) {
    super(page);

    this.path               = '/client/training-matrix';

    // Filters
    this.projectFilter      = 'select:first-of-type';
    this.certStatusFilter   = 'select:nth-of-type(2)';
    this.nameFilter         = 'input[placeholder*="Name" i], [class*="name"] input';
    this.functionFilter     = 'select:nth-of-type(3), [placeholder*="Function" i]';
    this.rotationFilter     = 'select:nth-of-type(4), select:last-of-type';
    this.resetFilterBtn     = 'button:has-text("Reset Filter")';
    this.exportBtn          = 'button:has-text("Export")';

    // Table
    this.tableHeaders       = 'table thead th';
    this.tableRows          = 'table tbody tr';
    this.eyeIcons           = 'table tbody tr [class*="eye"], table tbody tr button:first-child';
    this.checkmarks         = 'table tbody td svg[class*="check"], table tbody td:has-text("✓")';
    this.naValues           = 'table tbody td:has-text("N/A")';
  }

  async goto() {
    await this.navigate(this.path);
    await this.page.waitForSelector('table', { timeout: 15000 }).catch(() => {});
  }

  async isPageLoaded() {
    const url = this.page.url();
    return url.includes('training');
  }

  async getTableHeaders() {
    const headers = await this.page.locator(this.tableHeaders).allTextContents();
    return headers.map(h => h.trim()).filter(h => h !== '');
  }

  async getRowCount() {
    return await this.page.locator(this.tableRows).count();
  }

  async filterByProject(index) {
    const selects = this.page.locator('select');
    await selects.first().selectOption({ index });
    await this.page.waitForTimeout(1200);
  }

  async filterByCertStatus(status) {
    const allSelects = this.page.locator('select');
    const count = await allSelects.count();
    for (let i = 0; i < count; i++) {
      const options = await allSelects.nth(i).locator('option').allTextContents();
      if (options.some(o => o.includes('Valid') || o.includes('Expired'))) {
        await allSelects.nth(i).selectOption({ label: status }).catch(() => {});
        await this.page.waitForTimeout(1000);
        return;
      }
    }
  }

  async filterByName(name) {
    const nameInput = this.page.locator('input[placeholder*="Name" i], [class*="name-filter"] input').first();
    await nameInput.fill(name).catch(async () => {
      // Try custom dropdown
      await this.page.locator('[class*="name"] [class*="select"], [placeholder*="Enter Name"]').first().click().catch(() => {});
    });
    await this.page.waitForTimeout(1000);
  }

  async filterByRotation(rotation) {
    const allSelects = this.page.locator('select');
    const count = await allSelects.count();
    for (let i = count - 1; i >= 0; i--) {
      const options = await allSelects.nth(i).locator('option').allTextContents();
      if (options.some(o => o.includes('R1') || o.includes('Rotation') || o.includes('All'))) {
        await allSelects.nth(i).selectOption({ label: rotation }).catch(() => {});
        await this.page.waitForTimeout(1000);
        return;
      }
    }
  }

  async clickResetFilter() {
    await this.page.locator(this.resetFilterBtn).click();
    await this.page.waitForTimeout(1200);
  }

  async clickExport() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
      this.page.locator(this.exportBtn).click(),
    ]);
    return download;
  }

  async clickViewIcon(rowIndex = 0) {
    const row = this.page.locator(this.tableRows).nth(rowIndex);
    await row.locator('button, [class*="eye"]').first().click();
    await this.page.waitForTimeout(1000);
  }

  async hasCheckmarks() {
    return await this.page.locator(this.checkmarks).first().isVisible().catch(() => false);
  }

  async hasNaValues() {
    return await this.page.locator(this.naValues).first().isVisible().catch(() => false);
  }
}

module.exports = { TrainingMatrixPage };
