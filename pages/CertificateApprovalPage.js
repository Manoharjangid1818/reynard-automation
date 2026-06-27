// pages/CertificateApprovalPage.js
const { BasePage } = require('./BasePage');

class CertificateApprovalPage extends BasePage {
  constructor(page) {
    super(page);

    this.path           = '/client/certificate-approval';

    this.pageTitle      = 'h1, h2';
    this.searchInput    = 'input[placeholder*="search" i], input[placeholder="All"]';
    this.resetFilterBtn = 'button:has-text("Reset Filter")';
    this.tableHeaders   = 'table thead th';
    this.tableRows      = 'table tbody tr';
    this.noDataMessage  = 'text=No data found, td:has-text("No data")';
    this.refreshBtn     = 'button[title*="refresh" i]';
  }

  async goto() {
    await this.navigate(this.path);
    await this.page.waitForLoadState('networkidle');
  }

  async isPageLoaded() {
    const title = await this.page.locator(this.pageTitle).first().textContent().catch(() => '');
    return title.toLowerCase().includes('certificate');
  }

  async getTableHeaders() {
    const headers = await this.page.locator(this.tableHeaders).allTextContents();
    return headers.map(h => h.trim()).filter(h => h !== '');
  }

  async search(term) {
    const input = this.page.locator(this.searchInput).first();
    await input.clear();
    await input.fill(term);
    await this.page.waitForTimeout(1000);
  }

  async clickResetFilter() {
    await this.page.locator(this.resetFilterBtn).click();
    await this.page.waitForTimeout(800);
  }

  async isNoDataVisible() {
    return await this.page.locator(this.noDataMessage).first().isVisible().catch(() => false);
  }

  async getRowCount() {
    return await this.page.locator(this.tableRows).count();
  }
}

module.exports = { CertificateApprovalPage };
