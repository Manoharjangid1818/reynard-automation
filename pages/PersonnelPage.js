// pages/PersonnelPage.js
const { BasePage } = require('./BasePage');

class PersonnelPage extends BasePage {
  constructor(page) {
    super(page);

    // Navigation
    this.personnelNavLink   = 'text=Personnel';
    this.path               = '/client/personnel';

    // Page header
    this.pageTitle          = 'h1, h2';
    this.newButton          = 'button:has-text("New"), button:has-text("+ New")';
    this.uploadCertBtn      = 'button:has-text("Upload Certificates")';
    this.refreshBtn         = 'button[title*="refresh" i], button svg[class*="refresh"]';

    // Filters
    this.searchInput        = 'input[placeholder*="search" i], input[placeholder="All"]';
    this.projectFilter      = 'select[name*="project" i], [placeholder*="project" i]';
    this.countryFilter      = 'select:nth-of-type(2)';
    this.nationalityFilter  = 'select:nth-of-type(3)';
    this.statusFilter       = '[class*="status"] select, select:has-option("Active")';
    this.profileFuncFilter  = 'select:has-option("All"):last-of-type';
    this.resetFilterBtn     = 'button:has-text("Reset Filter")';

    // Table
    this.tableRows          = 'table tbody tr';
    this.tableHeaders       = 'table thead th';
    this.eyeIcons           = 'button[title*="view" i], button svg[class*="eye"], [class*="action"] button:first-child';
    this.toggleSwitches     = 'input[type="checkbox"][role="switch"], [class*="toggle"] input, [class*="switch"] input';
    this.noResultsText      = 'text=No data, text=No records, text=No result';

    // New User Modal
    this.newUserModal       = '[class*="modal"], [role="dialog"]';
    this.roleNameDropdown   = '[class*="modal"] select:first-of-type, [class*="modal"] [class*="select"]:first-child';
    this.firstNameInput     = 'input[placeholder*="First Name" i]';
    this.lastNameInput      = 'input[placeholder*="Last Name" i]';
    this.emailInput         = '[class*="modal"] input[type="email"], [class*="modal"] input[placeholder*="email" i]';
    this.passwordInput      = '[class*="modal"] input[type="password"]';
    this.contactInput       = 'input[placeholder*="contact" i], input[placeholder*="phone" i]';
    this.profileFuncInput   = 'input[placeholder*="Profile Function" i]';
    this.resourceNumberInput= 'input[placeholder*="Resource" i]';
    this.projectInput       = 'input[placeholder*="Project Name" i]';
    this.submitBtn          = 'button:has-text("Submit")';
    this.closeModalBtn      = 'button[class*="close"], button:has-text("×"), [class*="modal"] button:has-text("Cancel")';

    // Upload Certificate Modal
    this.uploadModal        = '[class*="modal"]:has-text("Upload Certificates")';
    this.selectUserDropdown = '[class*="modal"] select:first-of-type';
    this.certTypeDropdown   = '[class*="modal"] select:nth-of-type(2)';
    this.chooseFileBtn      = 'input[type="file"]';
    this.startDateInput     = 'input[placeholder="DD-MM-YYYY"]:first-of-type, input[type="date"]:first-of-type';
    this.endDateInput       = 'input[placeholder="DD-MM-YYYY"]:last-of-type, input[type="date"]:last-of-type';
    this.internalCheckbox   = 'input[type="checkbox"][name*="internal" i], [class*="modal"] input[type="checkbox"]';
    this.addAnotherBtn      = 'button:has-text("Add Another")';
    this.saveCertBtn        = 'button:has-text("Save")';
    this.closeUploadModal   = '[class*="modal"] button[class*="close"], [class*="modal"] button:has-text("×")';
    this.certValidationMsg  = '[class*="error"], [class*="invalid"], text=Please first select a user';
  }

  async goto() {
    await this.navigate(this.path);
    await this.page.waitForSelector('table', { timeout: 15000 }).catch(() => {});
  }

  async isPageLoaded() {
    const title = await this.page.locator(this.pageTitle).first().textContent().catch(() => '');
    return title.toLowerCase().includes('personnel');
  }

  async getTableHeaders() {
    const headers = await this.page.locator(this.tableHeaders).allTextContents();
    return headers.map(h => h.trim()).filter(h => h !== '');
  }

  async getRowCount() {
    return await this.page.locator(this.tableRows).count();
  }

  async searchPersonnel(term) {
    const input = this.page.locator(this.searchInput).first();
    await input.clear();
    await input.fill(term);
    await this.page.waitForTimeout(1000);
  }

  async filterByStatus(status) {
    const allSelects = this.page.locator('select');
    const count = await allSelects.count();
    // Find select with "Active" option
    for (let i = 0; i < count; i++) {
      const options = await allSelects.nth(i).locator('option').allTextContents();
      if (options.some(o => o.includes('Active'))) {
        await allSelects.nth(i).selectOption({ label: status });
        await this.page.waitForTimeout(1000);
        return;
      }
    }
  }

  async clickResetFilter() {
    await this.page.locator(this.resetFilterBtn).click();
    await this.page.waitForTimeout(1000);
  }

  async clickNewButton() {
    await this.page.locator(this.newButton).first().click();
    await this.page.waitForSelector(this.newUserModal, { timeout: 8000 });
  }

  async clickUploadCertificates() {
    await this.page.locator(this.uploadCertBtn).first().click();
    await this.page.waitForSelector('[class*="modal"]', { timeout: 8000 });
  }

  async isModalOpen(titleText = null) {
    try {
      const modal = await this.page.locator('[class*="modal"], [role="dialog"]').first();
      const visible = await modal.isVisible();
      if (titleText && visible) {
        const text = await modal.textContent();
        return text.includes(titleText);
      }
      return visible;
    } catch {
      return false;
    }
  }

  async fillNewUserForm(userData, skipFields = []) {
    if (!skipFields.includes('roleName') && userData.roleNameIndex !== undefined) {
      const selects = this.page.locator('[class*="modal"] select, [class*="modal"] [class*="dropdown"]');
      await selects.first().selectOption({ index: userData.roleNameIndex }).catch(async () => {
        await this.page.locator('[placeholder*="Role Name" i]').first().click();
        await this.page.locator('[class*="option"]').nth(userData.roleNameIndex).click().catch(() => {});
      });
    }
    if (!skipFields.includes('firstName') && userData.firstName) {
      await this.page.locator(this.firstNameInput).first().fill(userData.firstName);
    }
    if (!skipFields.includes('lastName') && userData.lastName) {
      await this.page.locator(this.lastNameInput).first().fill(userData.lastName);
    }
    if (!skipFields.includes('email') && userData.email) {
      await this.page.locator(this.emailInput).first().fill(userData.email);
    }
    if (!skipFields.includes('password') && userData.password) {
      await this.page.locator(this.passwordInput).first().fill(userData.password);
    }
    if (!skipFields.includes('contactNumber') && userData.contactNumber) {
      await this.page.locator(this.contactInput).first().fill(userData.contactNumber);
    }
    if (!skipFields.includes('profileFunction') && userData.profileFunctionIndex !== undefined) {
      await this.page.locator('[placeholder*="Profile Function" i]').first().click().catch(() => {});
      await this.page.locator('[class*="option"]').nth(userData.profileFunctionIndex).click().catch(() => {});
    }
  }

  async submitNewUser() {
    await this.page.locator(this.submitBtn).click();
    await this.page.waitForTimeout(2000);
  }

  async closeModal() {
    await this.page.locator(this.closeModalBtn).first().click();
    await this.page.waitForTimeout(500);
  }

  async clickViewIcon(rowIndex = 0) {
    const eyeButtons = this.page.locator('table tbody tr').nth(rowIndex).locator('button, [class*="action"]');
    await eyeButtons.first().click();
    await this.page.waitForTimeout(1000);
  }

  async toggleActiveStatus(rowIndex = 0) {
    const row = this.page.locator(this.tableRows).nth(rowIndex);
    const toggle = row.locator('input[type="checkbox"], [class*="toggle"], [class*="switch"]').last();
    const wasChecked = await toggle.isChecked().catch(() => false);
    await toggle.click({ force: true });
    await this.page.waitForTimeout(1000);
    return wasChecked;
  }

  async hasNoResults() {
    const noData = await this.page.locator('text=No data, text=No records, text=No result, td:has-text("No")').first().isVisible().catch(() => false);
    const rowCount = await this.getRowCount();
    return noData || rowCount === 0;
  }

  // Upload Certificate modal actions
  async selectUserForCertificate(userIndex = 0) {
    const userDropdown = this.page.locator('[class*="modal"] select').first();
    await userDropdown.selectOption({ index: userIndex + 1 }); // 0 is placeholder
    await this.page.waitForTimeout(500);
  }

  async clickSaveCertificate() {
    await this.page.locator(this.saveCertBtn).click();
    await this.page.waitForTimeout(1500);
  }

  async clickAddAnother() {
    await this.page.locator(this.addAnotherBtn).click();
    await this.page.waitForTimeout(500);
  }

  async getCertValidationMessage() {
    try {
      await this.page.waitForSelector('[class*="error"], [class*="invalid"]', { timeout: 3000 });
      return await this.page.locator('[class*="error"], [class*="invalid"]').first().textContent();
    } catch {
      return null;
    }
  }

  async getModalRowCount() {
    return await this.page.locator('[class*="modal"] [class*="row"], [class*="modal"] tr').count();
  }
}

module.exports = { PersonnelPage };
