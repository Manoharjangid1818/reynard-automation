// Page Object for Settings > Project Setup.
// URL: /client/setting/project-setup

const { BasePage } = require('./BasePage');

class ProjectSetupPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.path = '/client/setting/project-setup';

    this.selectProjectInput = page.getByPlaceholder('Enter Project Name').first();
    this.clearProjectButton = page.locator('.select__clear-indicator, [aria-label="Clear"]').first();
    this.uploadProjectExcelButton = page.getByRole('button', { name: 'Upload Project (Excel)' });
    this.allProjectsListButton = page.getByRole('button', { name: 'All Projects List' });
    this.newProjectButton = page.getByRole('button', { name: 'New Project', exact: true });
    this.pageHeading = page.getByRole('heading', { name: 'Project', exact: true })
      .or(page.locator('p').filter({ hasText: /^Project$/ }))
      .first();

    this.cards = {
      location: 'Location',
      projectString: 'Project String',
      asset: 'Asset',
      team: 'Team',
      scopes: 'Scopes',
      activity: 'Activity',
      functions: 'Functions',
      member: 'Member',
      reportType: 'Report Type',
      projectCertificate: 'Project Certificate',
      projectDocument: 'Project Document',
      dprEquipment: 'DPR Equipment',
    };
  }

  async goto() {
    await this.navigate(this.path);
    await this.pageHeading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async selectProject(projectName) {
    const displayCandidates = [
      projectName,
      projectName.replace(/\s+-\s+/, ' \u2013 '),
    ];
    const searchTerms = [
      projectName,
      ...displayCandidates,
      projectName.split('-')[0]?.trim(),
      projectName.split('-').slice(1).join('-').trim(),
    ].filter(Boolean);

    for (const term of [...new Set(searchTerms)]) {
      await this.selectProjectInput.click();
      await this.selectProjectInput.press('Control+A').catch(() => {});
      await this.selectProjectInput.fill(term);
      await this.page.waitForTimeout(750);

      for (const display of [...new Set(displayCandidates)]) {
        const option = this.page.getByText(display, { exact: true }).last();
        await option.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
        if (await option.isVisible().catch(() => false)) {
          await option.click();
          await this.page.waitForLoadState('networkidle').catch(() => {});
          return;
        }
      }

      const firstOption = this.page.locator('[role="option"], .select__option, [id*="-option-"]').first();
      await firstOption.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      if (await firstOption.isVisible().catch(() => false)) {
        await firstOption.click();
        await this.page.waitForLoadState('networkidle').catch(() => {});
        return;
      }
    }

    throw new Error(`Project option not found: ${projectName}`);
  }

  async clearSelectedProject() {
    await this.clearProjectButton.click();
  }

  async isProjectSelected() {
    return this.clearProjectButton.isVisible().catch(() => false);
  }

  card(cardTitle) {
    return this.page
      .getByRole('heading', { name: cardTitle, exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space()="Add" or .//p[normalize-space()="Add"]]][1]');
  }

  addButton(cardTitle) {
    return this.card(cardTitle).getByRole('button', { name: 'Add', exact: true });
  }

  viewListButton(cardTitle) {
    return this.card(cardTitle).getByRole('button', { name: 'View List', exact: true });
  }

  async isAddButtonEnabled(cardTitle) {
    return this.addButton(cardTitle).isEnabled();
  }

  async isViewListButtonEnabled(cardTitle) {
    return this.viewListButton(cardTitle).isEnabled();
  }

  async openAddModal(cardTitle) {
    await this.addButton(cardTitle).click();
  }

  modalByTitle(title) {
    const byDialog = this.page.getByRole('dialog').filter({ hasText: title });
    const byModalText = this.page
      .locator('[class*="modal" i], [class*="dialog" i], [class*="popup" i], div')
      .filter({ hasText: title })
      .filter({ has: this.page.getByRole('button', { name: 'Submit' }) })
      .last();

    return byDialog.or(byModalText).first();
  }

  submitButton(modalTitle) {
    return this.modalByTitle(modalTitle).getByRole('button', { name: 'Submit' });
  }

  async closeModal(modalTitle) {
    const modal = this.modalByTitle(modalTitle);
    const closeIcon = modal.locator('svg, [class*="close" i]').first();
    await closeIcon.click();
    await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  async submit(modalTitle) {
    await this.submitButton(modalTitle).click();
  }

  async closeModalWithEscape() {
    await this.page.keyboard.press('Escape');
  }

  async openNewProjectModal() {
    await this.newProjectButton.click();
  }

  async fillNewProjectForm({ projectName, projectNumber, client, status }) {
    const modal = this.modalByTitle('New Project');
    if (projectName !== undefined) await modal.getByPlaceholder('Project Name*').fill(projectName);
    if (projectNumber !== undefined) await modal.getByPlaceholder('Project Number*').fill(projectNumber);
    if (client !== undefined) await modal.getByPlaceholder('Client*').fill(client);
    if (status) await modal.getByLabel(status).check();
  }

  async createNewProject(data) {
    await this.openNewProjectModal();
    await this.fillNewProjectForm(data);
    await this.submit('New Project');
  }

  async openNewLocationModal() {
    await this.openAddModal(this.cards.location);
  }

  async fillNewLocationForm({ name, latitude, longitude }) {
    const modal = this.modalByTitle('New Location');
    if (name !== undefined) await modal.getByPlaceholder('Name').fill(name);
    if (latitude !== undefined) await modal.getByPlaceholder('Latitude').fill(latitude);
    if (longitude !== undefined) await modal.getByPlaceholder('Longitude').fill(longitude);
  }

  async createNewLocation(data) {
    await this.openNewLocationModal();
    await this.fillNewLocationForm(data);
    await this.submit('New Location');
  }

  async openNewStringModal() {
    await this.openAddModal(this.cards.projectString);
  }

  async selectComboOption(modal, fieldLabel, optionText) {
    await this.openComboDropdown(modal, fieldLabel);

    const exactOption = this.page.getByText(optionText, { exact: true }).last();
    if (await exactOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await exactOption.click();
      return;
    }

    await this.page.getByText(optionText, { exact: false }).last().click();
  }

  async openComboDropdown(modal, fieldLabel) {
    const field = modal
      .getByText(fieldLabel, { exact: true })
      .locator('xpath=following-sibling::*[1]');
    await field.click();
  }

  async fillNewStringForm({ name, from, to, color }) {
    const modal = this.modalByTitle('New String');
    if (name !== undefined) await modal.getByPlaceholder('Name').fill(name);
    if (from) await this.selectComboOption(modal, 'From*', from);
    if (to) await this.selectComboOption(modal, 'To*', to);
    if (color) await this.chooseColor(modal, 'Color*', color);
  }

  async createNewString(data) {
    await this.openNewStringModal();
    await this.fillNewStringForm(data);
    await this.submit('New String');
  }

  async openNewAssetModal() {
    await this.openAddModal(this.cards.asset);
  }

  async fillNewAssetForm({ assetName, from, to, manufacturer, typeMm2, projectString }) {
    const modal = this.modalByTitle('New Asset');
    if (assetName !== undefined) await modal.getByPlaceholder('Asset Name*').fill(assetName);
    if (from) await this.selectComboOption(modal, 'From*', from);
    if (to) await this.selectComboOption(modal, 'To*', to);
    if (manufacturer !== undefined) await modal.getByPlaceholder('Manufacturer').fill(manufacturer);
    if (typeMm2 !== undefined) await modal.getByPlaceholder('Type mm2').fill(typeMm2);
    if (projectString) await this.selectComboOption(modal, 'Project String', projectString);
  }

  async createNewAsset(data) {
    await this.openNewAssetModal();
    await this.fillNewAssetForm(data);
    await this.submit('New Asset');
  }

  async openNewTeamModal() {
    await this.openAddModal(this.cards.team);
  }

  async fillNewTeamForm({ teamsWfmName, sortOrder, color }) {
    const modal = this.modalByTitle('New Team');
    if (teamsWfmName !== undefined) await modal.getByPlaceholder('Teams WFM Name').fill(teamsWfmName);
    if (sortOrder !== undefined) await modal.getByPlaceholder('Sort Order').fill(sortOrder);
    if (color) await this.chooseColor(modal, 'Color', color);
  }

  async createNewTeam(data) {
    await this.openNewTeamModal();
    await this.fillNewTeamForm(data);
    await this.submit('New Team');
  }

  async openNewScopeModal() {
    await this.openAddModal(this.cards.scopes);
  }

  async fillNewScopeForm({ scopeName, sortOrder, color }) {
    const modal = this.modalByTitle('New Scope');
    if (scopeName !== undefined) await modal.getByPlaceholder('Scope Name*').fill(scopeName);
    if (sortOrder !== undefined) await modal.getByPlaceholder('Sort Order*').fill(sortOrder);
    if (color) await this.chooseColor(modal, 'Color*', color);
  }

  async createNewScope(data) {
    await this.openNewScopeModal();
    await this.fillNewScopeForm(data);
    await this.submit('New Scope');
  }

  async openNewFunctionModal() {
    await this.openAddModal(this.cards.functions);
  }

  async fillNewFunctionForm({ projectFunctionName, sortOrder }) {
    const modal = this.modalByTitle('New Function');
    if (projectFunctionName !== undefined) await modal.getByPlaceholder('Project Function Name*').fill(projectFunctionName);
    if (sortOrder !== undefined) await modal.getByPlaceholder('Sort Order*').fill(sortOrder);
  }

  async createNewFunction(data) {
    await this.openNewFunctionModal();
    await this.fillNewFunctionForm(data);
    await this.submit('New Function');
  }

  async openNewMemberModal() {
    await this.openAddModal(this.cards.member);
  }

  async fillNewMemberForm({ memberName, function: fn, rotation, contactOnDpr }) {
    const modal = this.modalByTitle('New Member');
    if (memberName) {
      await modal.getByPlaceholder('Enter Member Name*').click();
      await modal.getByPlaceholder('Enter Member Name*').fill(memberName);
      await this.page.getByText(memberName, { exact: false }).last().click();
    }
    if (fn) await this.selectComboOption(modal, 'Select Function', fn);
    if (rotation) await this.selectComboOption(modal, 'Select Rotation', rotation);
    if (contactOnDpr) await modal.getByLabel('Contact On DPR').check();
  }

  async createNewMember(data) {
    await this.openNewMemberModal();
    await this.fillNewMemberForm(data);
    await this.submit('New Member');
  }

  async openColorPicker(modal, fieldLabel) {
    await modal
      .getByText(fieldLabel, { exact: true })
      .locator('xpath=following-sibling::*[1]')
      .click();
  }

  async chooseColor(modal, fieldLabel, color) {
    await this.openColorPicker(modal, fieldLabel);

    const normalized = color.toLowerCase();
    const exactColor = this.page.getByRole('button', { name: new RegExp(`Select color ${normalized}`, 'i') }).first();
    if (await exactColor.isVisible({ timeout: 1000 }).catch(() => false)) {
      await exactColor.click();
      return;
    }

    await this.page.getByRole('button', { name: /Select color/i }).first().click();
  }

  fieldError(modalTitle, fieldPlaceholder) {
    return this.modalByTitle(modalTitle)
      .getByPlaceholder(fieldPlaceholder)
      .locator('xpath=following-sibling::*[1]');
  }

  async isModalOpen(modalTitle) {
    return this.modalByTitle(modalTitle).isVisible();
  }

  async isModalClosed(modalTitle) {
    return this.modalByTitle(modalTitle).isHidden();
  }

  async getToastMessage() {
    const toast = this.page.locator('.Toastify__toast, [role="alert"]').last();
    await toast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return (await toast.isVisible().catch(() => false)) ? toast.innerText() : null;
  }
}

module.exports = { ProjectSetupPage };
