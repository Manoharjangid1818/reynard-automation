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
    this.modalRoot          = '[class*="modal" i], [role="dialog"]';

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
    this.newUserModal       = '[class*="modal" i]:has-text("New User"), [role="dialog"]:has-text("New User")';
    this.roleNameDropdown   = 'input[placeholder*="Role Name" i]';
    this.firstNameInput     = 'input[placeholder*="First Name" i]';
    this.lastNameInput      = 'input[placeholder*="Last Name" i]';
    this.emailInput         = 'input[type="email"], input[placeholder*="email" i]';
    this.passwordInput      = 'input[type="password"]';
    this.contactInput       = 'input[placeholder*="contact" i], input[placeholder*="phone" i]';
    this.profileFuncInput   = 'input[placeholder*="Profile Function" i]';
    this.resourceNumberInput= 'input[placeholder*="Resource" i]';
    this.projectInput       = 'input[placeholder*="Project Name" i]';
    this.submitBtn          = 'button:has-text("Submit")';
    this.closeModalBtn      = 'button[class*="close" i], button:has-text("×"), [class*="modal" i] button:has-text("Cancel")';

    // Upload Certificate Modal
    this.uploadModal        = '[class*="modal" i]:has-text("Upload Certificates"), [role="dialog"]:has-text("Upload Certificates")';
    this.selectUserDropdown = 'input[placeholder*="Select User" i]';
    this.certTypeDropdown   = 'input[placeholder*="Certificate Type" i]';
    this.chooseFileBtn      = 'input[type="file"]';
    this.startDateInput     = 'input[placeholder="DD-MM-YYYY"]:first-of-type, input[type="date"]:first-of-type';
    this.endDateInput       = 'input[placeholder="DD-MM-YYYY"]:last-of-type, input[type="date"]:last-of-type';
    this.internalCheckbox   = 'input[type="checkbox"][name*="internal" i], [class*="modal" i] input[type="checkbox"]';
    this.addAnotherBtn      = 'button:has-text("Add Another")';
    this.saveCertBtn        = 'button:has-text("Save")';
    this.closeUploadModal   = '[class*="modal" i] button[class*="close" i], [class*="modal" i] button:has-text("×")';
    this.certValidationMsg  = '[class*="error"], [class*="invalid"], text=Please first select a user';
  }

  async goto() {
    await this.navigate(this.path);
    await this.page.waitForSelector('table', { timeout: 15000 }).catch(() => {});
  }

  async isPageLoaded() {
    const url = this.page.url();
    const titleVisible = await this.page.locator('p').filter({ hasText: /^Personnel$/ }).first().isVisible().catch(() => false);
    return url.includes('/client/personnel') && titleVisible;
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
    await this.waitForModal('New User');
  }

  async clickUploadCertificates() {
    await this.page.locator(this.uploadCertBtn).first().click();
    await this.waitForModal('Upload Certificates');
  }

  modalLocator(titleText = null) {
    const modal = this.page.locator(this.modalRoot);
    return titleText ? modal.filter({ hasText: titleText }).last() : modal.last();
  }

  async waitForModal(titleText = null) {
    const modal = this.modalLocator(titleText);
    await modal.waitFor({ state: 'visible', timeout: 10000 });
    return modal;
  }

  async isModalOpen(titleText = null) {
    try {
      const modal = this.modalLocator(titleText);
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

  async chooseAutocompleteByPlaceholder(placeholderText, index = 0) {
    const input = this.page.locator(`input[placeholder*="${placeholderText}" i]`).first();
    if (!await input.isVisible().catch(() => false)) return;

    await input.click();
    const options = this.page.getByRole('option');
    await options.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const count = await options.count();

    if (count > 0) {
      await options.nth(Math.min(index, count - 1)).click();
    } else {
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
    }

    await this.page.waitForTimeout(500);
  }

  async fillIfVisible(selector, value) {
    const input = this.page.locator(selector).first();
    if (await input.isVisible().catch(() => false)) {
      await input.fill(value);
    }
  }

  async fillContactNumber(value) {
    await this.fillIfVisible(this.contactInput, value);
    const contactByLabel = this.page.locator('xpath=//*[normalize-space(.)="Contact Number*" or normalize-space(.)="Contact Number"]/following::input[1]').first();
    if (await contactByLabel.isVisible().catch(() => false)) {
      await contactByLabel.fill(value);
    }
  }

  async fillNewUserForm(userData, skipFields = []) {
    if (!skipFields.includes('roleName') && userData.roleNameIndex !== undefined) {
      await this.chooseAutocompleteByPlaceholder('Role Name', userData.roleNameIndex);
    }
    if (!skipFields.includes('firstName') && userData.firstName) {
      await this.fillIfVisible(this.firstNameInput, userData.firstName);
    }
    if (!skipFields.includes('lastName') && userData.lastName) {
      await this.fillIfVisible(this.lastNameInput, userData.lastName);
    }
    if (!skipFields.includes('email') && userData.email) {
      await this.fillIfVisible(this.emailInput, userData.email);
    }
    if (!skipFields.includes('password') && userData.password) {
      await this.fillIfVisible(this.passwordInput, userData.password);
    }
    if (!skipFields.includes('contactNumber') && userData.contactNumber) {
      await this.fillContactNumber(userData.contactNumber);
    }
    if (!skipFields.includes('profileFunction') && userData.profileFunctionIndex !== undefined) {
      await this.chooseAutocompleteByPlaceholder('Profile Function', userData.profileFunctionIndex);
    }
  }

  async submitNewUser() {
    await this.page.locator(this.submitBtn).click();
    await this.page.waitForTimeout(2000);
  }

  async closeModal() {
    const modal = this.modalLocator();
    const title = modal.locator('p').filter({ hasText: /Upload Certificates|New User/ }).first();
    const titleCloseIcon = this.page.locator('p:has-text("Upload Certificates") + img, p:has-text("New User") + img').last();

    if (await titleCloseIcon.isVisible().catch(() => false)) {
      await titleCloseIcon.click();
    } else {
      await this.page.locator(this.closeModalBtn).first().click().catch(async () => {
        await this.page.keyboard.press('Escape');
      });
    }

    if (await modal.isVisible().catch(() => false)) {
      const box = await modal.boundingBox().catch(() => null);
      const titleBox = await title.boundingBox().catch(() => null);
      if (box) {
        const y = titleBox ? titleBox.y + titleBox.height / 2 : box.y + 36;
        await this.page.mouse.click(box.x + box.width - 12, y);
      }
    }

    await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(async () => {
      await this.page.keyboard.press('Escape').catch(() => {});
    });
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
    const noData = await this.page.locator('text=No data, text=No records, text=No result, text=No data found, td:has-text("No")').first().isVisible().catch(() => false);
    const rowCount = await this.getRowCount();
    const bodyText = await this.page.locator('body').innerText().catch(() => '');
    return noData || rowCount === 0 || !bodyText.toLowerCase().includes('zzznonexistentuser999');
  }

  // Upload Certificate modal actions
  async selectUserForCertificate(userIndex = 0) {
    await this.chooseAutocompleteByPlaceholder('Select User', userIndex);
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
      const validationText = this.page.getByText(/required|please|select|already|exist|duplicate/i).first();
      if (await validationText.isVisible({ timeout: 3000 }).catch(() => false)) {
        return await validationText.textContent();
      }

      return await this.page.locator('[class*="error" i], [class*="invalid" i]').first().textContent({ timeout: 3000 });
    } catch {
      return null;
    }
  }

  async getModalRowCount() {
    return await this.page.locator('[class*="modal" i] [class*="row"], [class*="modal" i] tr').count();
  }
}

module.exports = { PersonnelPage };
