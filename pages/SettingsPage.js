// pages/SettingsPage.js
const { BasePage } = require('./BasePage');

class SettingsPage extends BasePage {
  constructor(page) {
    super(page);

    this.path               = '/client/setting';

    // Section cards
    this.sections = {
      Organization:       '[class*="card"]:has-text("Organization"), div:has-text("Organization"):has(h2,h3)',
      ProjectManagement:  '[class*="card"]:has-text("Project Management"), div:has-text("Project Management"):has(h2,h3)',
      Actions:            '[class*="card"]:has-text("Actions")',
      UserManagement:     '[class*="card"]:has-text("User Management")',
      QualityHealthSafety:'[class*="card"]:has-text("Quality, Health & Safety")',
      Equipment:          '[class*="card"]:has-text("Equipment")',
      PersonalSetting:    '[class*="card"]:has-text("Personal Setting")',
    };

    // Settings items
    this.syncDropdown       = 'select:has-option("15min"), select[name*="sync"]';
    this.projectStatusBadge = '[class*="badge"]:has-text("Open"), [class*="status"]:has-text("Open")';
    this.projectStatusDrop  = 'select:has-option("Open"), select:has-option("Completed")';
  }

  async goto() {
    await this.navigate(this.path);
    await this.page.locator('p').filter({ hasText: /^Settings$/ }).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await this.page.getByText('Project Management', { exact: true }).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  async isPageLoaded() {
    const url = this.page.url();
    const title = this.page.locator('p').filter({ hasText: /^Settings$/ }).first();
    await title.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const titleVisible = await title.isVisible().catch(() => false);
    return url.includes('/client/setting') && titleVisible;
  }

  async getSectionTitles() {
    // Look for section headings within cards
    const titles = await this.page.locator('[class*="card"] h2, [class*="card"] h3, [class*="section"] h2').allTextContents();
    return titles.map(t => t.trim()).filter(t => t !== '');
  }

  async isSectionVisible(sectionName) {
    const selector = this.sections[sectionName] || `text=${sectionName}`;
    return await this.page.locator(selector).first().isVisible().catch(() => false);
  }

  async getSectionLinks(sectionName) {
    const sectionSel = this.sections[sectionName];
    if (!sectionSel) return [];
    const links = await this.page.locator(`${sectionSel} a, ${sectionSel} [class*="link"], ${sectionSel} span`).allTextContents().catch(() => []);
    return links.map(l => l.trim()).filter(l => l.length > 2);
  }

  async clickSectionLink(sectionName, linkText) {
    const link = this.page.getByRole('link', { name: linkText }).first();
    const button = this.page.getByRole('button', { name: linkText }).first();

    if (await link.isVisible().catch(() => false)) {
      await link.click();
    } else if (await button.isVisible().catch(() => false)) {
      await button.click();
    } else {
      const section = this.page.locator(this.sections[sectionName] || `text=${sectionName}`).first();
      await section.locator(`text=${linkText}`).first().click();
    }

    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getSyncDropdownOptions() {
    const selects = this.page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const options = await selects.nth(i).locator('option').allTextContents();
      if (options.some(o => o.includes('min'))) {
        return options.map(o => o.trim());
      }
    }
    return [];
  }

  async getSyncDropdownValue() {
    const selects = this.page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const options = await selects.nth(i).locator('option').allTextContents();
      if (options.some(o => o.includes('min'))) {
        return await selects.nth(i).inputValue();
      }
    }
    return null;
  }

  async getProjectStatusValues() {
    const badges = await this.page.locator('[class*="badge"], [class*="tag"], [class*="chip"]').allTextContents();
    return badges.map(b => b.trim()).filter(b => b.length > 0);
  }

  async isSettingLinkVisible(text) {
    return await this.page.getByText(text, { exact: true }).first().isVisible().catch(() => false);
  }
}

module.exports = { SettingsPage };
