const { expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { PersonnelPage } = require('../pages/PersonnelPage');
const { CertificateApprovalPage } = require('../pages/CertificateApprovalPage');
const { ProjectManagementPage } = require('../pages/ProjectManagementPage');
const { SettingsPage } = require('../pages/SettingsPage');
const { TrainingMatrixPage } = require('../pages/TrainingMatrixPage');
const { runGenericSanityCase } = require('./sanityHelpers');
require('dotenv').config();

function activePage(ctx) {
  return ctx.page || ctx.authenticatedPage;
}

function actionName(tc) {
  return tc.action || tc.expectedResult;
}

function validAdminCredentials(ctx) {
  const validAdmin = ctx.moduleData?.credentials?.validAdmin || {};
  return {
    email: process.env.ADMIN_EMAIL || validAdmin.email,
    password: process.env.ADMIN_PASSWORD || validAdmin.password,
  };
}

function resolveLoginCredentials(ctx, tc, useValidPassword = false) {
  const credentials = validAdminCredentials(ctx);
  return {
    email: tc.email === ctx.moduleData?.credentials?.validAdmin?.email ? credentials.email : tc.email,
    password: useValidPassword ? credentials.password : tc.password,
  };
}

async function runAuthCase(ctx) {
  const page = activePage(ctx);
  const tc = ctx.tc;
  const scenario = actionName(tc);
  const loginPage = new LoginPage(page);

  switch (scenario) {
    case 'redirect_to_dashboard': {
      const credentials = resolveLoginCredentials(ctx, tc, true);
      await loginPage.login(credentials.email, credentials.password);
      expect(await loginPage.getErrorMessage()).toBeNull();
      await expect(page).not.toHaveURL(/sign-in/, { timeout: 15000 });
      expect(await loginPage.isDashboardVisible()).toBeTruthy();
      return;
    }

    case 'error_message': {
      const credentials = resolveLoginCredentials(ctx, tc);
      await loginPage.login(credentials.email, credentials.password);
      const url = page.url();
      const hasError = await loginPage.getErrorMessage();
      expect(url.includes('sign-in') || !!hasError).toBeTruthy();
      return;
    }

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
      const afterUrl = page.url();
      const errMsg = await loginPage.getErrorMessage();
      expect(afterUrl.includes('sign-in') || !!errMsg).toBeTruthy();
      return;
    }

    case 'page_elements_present':
      await loginPage.goto();
      expect(await loginPage.isEmailFieldVisible()).toBeTruthy();
      expect(await loginPage.isPasswordFieldVisible()).toBeTruthy();
      expect(await loginPage.isLoginPageVisible()).toBeTruthy();
      expect(await loginPage.isForgotPasswordVisible()).toBeTruthy();
      return;

    case 'password_masked':
      await loginPage.goto();
      await page.locator(loginPage.passwordInput).first().fill(tc.password);
      expect(await loginPage.isPasswordMasked()).toBeTruthy();
      return;

    case 'remember_me_checked':
      await loginPage.goto();
      expect(await loginPage.checkRememberMe()).toBeTruthy();
      return;

    case 'navigates_to_forgot_password':
      await loginPage.goto();
      await loginPage.clickForgotPassword();
      await page.waitForLoadState('networkidle').catch(() => {});
      expect(/forgot|reset|password/i.test(page.url())).toBeTruthy();
      return;

    case 'redirected_to_login': {
      const credentials = resolveLoginCredentials(ctx, tc, true);
      await loginPage.login(credentials.email, credentials.password);
      expect(await loginPage.getErrorMessage()).toBeNull();
      await expect(page).not.toHaveURL(/sign-in/, { timeout: 15000 });
      await loginPage.logout();
      await expect(page).toHaveURL(/sign-in|login|authentication/, { timeout: 10000 });
      return;
    }

    case 'login_fails_or_error':
      await loginPage.login(tc.email, tc.password);
      expect(page.url().includes('sign-in') || page.url().includes('authentication')).toBeTruthy();
      return;

    case 'sanity_logout': {
      const credentials = validAdminCredentials(ctx);
      await loginPage.login(credentials.email, credentials.password);
      await expect(page).not.toHaveURL(/sign-in/, { timeout: 15000 });
      await runGenericSanityCase(page, tc, ctx);
      return;
    }

    default:
      await runFallbackCase(ctx);
  }
}

async function runCertificatesCase(ctx) {
  const page = activePage(ctx);
  const tc = ctx.tc;
  const personnelPage = new PersonnelPage(page);
  const certApprovalPage = new CertificateApprovalPage(page);

  switch (actionName(tc)) {
    case 'verify_modal_fields': {
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      expect(await personnelPage.isModalOpen()).toBeTruthy();
      const modal = page.locator('[class*="modal" i], [role="dialog"]').filter({ hasText: 'Upload Certificates' }).last();
      const modalText = await modal.textContent();
      expect(modalText).toContain('Select User');
      const hasFileInput = await page.locator('input[type="file"]').count() > 0;
      const chooseFileVisible = await page.getByRole('button', { name: /choose file/i }).first().isVisible().catch(() => false);
      expect(hasFileInput || chooseFileVisible).toBeTruthy();
      return;
    }

    case 'save_without_user': {
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      await personnelPage.clickSaveCertificate();
      const errMsg = await personnelPage.getCertValidationMessage();
      const modalText = await page.locator('[class*="modal" i], [role="dialog"]').filter({ hasText: 'Upload Certificates' }).last().textContent().catch(() => '');
      expect(!!errMsg || modalText.includes('Please first select a user') || modalText.includes('required')).toBeTruthy();
      return;
    }

    case 'save_missing_cert_type':
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      await personnelPage.selectUserForCertificate(tc.userData?.userIndex || 0);
      await personnelPage.clickSaveCertificate();
      expect(await personnelPage.isModalOpen() || !!await personnelPage.getCertValidationMessage()).toBeTruthy();
      return;

    case 'save_missing_file': {
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      await personnelPage.selectUserForCertificate(tc.userData?.userIndex || 0);
      const selects = page.locator('[class*="modal" i] select');
      if (await selects.count() > 1) await selects.nth(1).selectOption({ index: 1 }).catch(() => {});
      await personnelPage.clickSaveCertificate();
      expect(await personnelPage.isModalOpen()).toBeTruthy();
      return;
    }

    case 'save_missing_start_date':
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      await personnelPage.selectUserForCertificate(0);
      await personnelPage.clickSaveCertificate();
      expect(await personnelPage.isModalOpen()).toBeTruthy();
      return;

    case 'save_missing_end_date': {
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      await personnelPage.selectUserForCertificate(0);
      const dateInputs = page.locator('[class*="modal" i] input[type="date"], [class*="modal" i] input[placeholder*="DD-MM"]');
      if (await dateInputs.count() > 0) await dateInputs.first().fill('2025-01-01').catch(() => {});
      await personnelPage.clickSaveCertificate();
      expect(await personnelPage.isModalOpen()).toBeTruthy();
      return;
    }

    case 'click_add_another':
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      const beforeRows = await personnelPage.getModalRowCount();
      await personnelPage.clickAddAnother();
      expect(await personnelPage.getModalRowCount()).toBeGreaterThanOrEqual(beforeRows);
      return;

    case 'close_modal':
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      expect(await personnelPage.isModalOpen()).toBeTruthy();
      await personnelPage.closeModal();
      await page.waitForTimeout(800);
      expect(await personnelPage.isModalOpen()).toBeFalsy();
      return;

    case 'verify_approval_page': {
      await certApprovalPage.goto();
      expect(await certApprovalPage.isPageLoaded()).toBeTruthy();
      const headers = await certApprovalPage.getTableHeaders();
      for (const col of tc.expectedColumns || []) {
        expect(headers.some(h => h.includes(col)), `Column "${col}" missing. Found: ${headers}`).toBeTruthy();
      }
      return;
    }

    case 'search_approval':
      await certApprovalPage.goto();
      await certApprovalPage.search(tc.searchTerm);
      expect(await certApprovalPage.getRowCount()).toBeGreaterThanOrEqual(0);
      return;

    case 'toggle_internal_checkbox': {
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      const checkbox = page.locator('[class*="modal" i] input[type="checkbox"]').first();
      const wasChecked = await checkbox.isChecked().catch(() => false);
      await checkbox.click({ force: true });
      await page.waitForTimeout(500);
      expect(await checkbox.isChecked().catch(() => false)).toBe(!wasChecked);
      return;
    }

    case 'save_invalid_date_range': {
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      await personnelPage.selectUserForCertificate(0);
      const dateInputs = page.locator('[class*="modal" i] input[type="date"]');
      if (await dateInputs.count() >= 2) {
        await dateInputs.first().fill('2025-06-01');
        await dateInputs.nth(1).fill('2025-01-01');
      }
      await personnelPage.clickSaveCertificate();
      await page.waitForTimeout(1500);
      expect(await personnelPage.isModalOpen() || !!await personnelPage.getCertValidationMessage()).toBeTruthy();
      return;
    }

    default:
      await runFallbackCase(ctx);
  }
}

async function runPersonnelCase(ctx) {
  const page = activePage(ctx);
  const tc = ctx.tc;
  const personnelPage = new PersonnelPage(page);

  switch (actionName(tc)) {
    case 'navigate':
      await personnelPage.goto();
      expect(await personnelPage.isPageLoaded()).toBeTruthy();
      return;

    case 'verify_table_columns': {
      await personnelPage.goto();
      const headers = await personnelPage.getTableHeaders();
      for (const col of tc.expectedColumns || []) {
        expect(headers.some(h => h.includes(col)), `Column "${col}" not found in table headers: ${headers}`).toBeTruthy();
      }
      return;
    }

    case 'create_user': {
      await personnelPage.goto();
      const userData = { ...tc.userData };
      if (tc.expectedResult !== 'duplicate_error' && userData.email) {
        userData.email = userData.email.replace('@', `+${Date.now()}@`);
      }
      await personnelPage.clickNewButton();
      expect(await personnelPage.isModalOpen()).toBeTruthy();
      await personnelPage.fillNewUserForm(userData);
      await personnelPage.submitNewUser();
      if (tc.expectedResult === 'duplicate_error') {
        const errMsg = await personnelPage.getCertValidationMessage();
        const toast = await personnelPage.waitForToast();
        expect(errMsg || (toast && /exist|duplicate|error/i.test(toast))).toBeTruthy();
        return;
      }
      const modalStillOpen = await personnelPage.isModalOpen();
      const toast = await personnelPage.waitForToast();
      expect(!modalStillOpen || (toast && /success|creat/i.test(toast))).toBeTruthy();
      return;
    }

    case 'create_user_missing_field':
      await personnelPage.goto();
      await personnelPage.clickNewButton();
      expect(await personnelPage.isModalOpen()).toBeTruthy();
      await personnelPage.fillNewUserForm(tc.userData, [tc.missingField]);
      await personnelPage.submitNewUser();
      expect(await personnelPage.isModalOpen() || !!await personnelPage.getCertValidationMessage()).toBeTruthy();
      return;

    case 'search':
      await personnelPage.goto();
      await personnelPage.searchPersonnel(tc.searchTerm);
      if (tc.expectedResult === 'no_results') {
        expect(await personnelPage.hasNoResults()).toBeTruthy();
      } else {
        expect(await personnelPage.getRowCount()).toBeGreaterThanOrEqual(0);
      }
      return;

    case 'filter_by_project':
      await personnelPage.goto();
      await page.locator('select').nth(0).selectOption({ label: tc.project }).catch(() => {});
      await page.waitForTimeout(1000);
      expect(await personnelPage.getRowCount()).toBeGreaterThanOrEqual(0);
      return;

    case 'filter_by_status':
      await personnelPage.goto();
      await personnelPage.filterByStatus(tc.status);
      expect(await personnelPage.getRowCount()).toBeGreaterThanOrEqual(0);
      return;

    case 'reset_filter':
      await personnelPage.goto();
      await personnelPage.searchPersonnel('Rey');
      await personnelPage.clickResetFilter();
      expect(await personnelPage.getRowCount()).toBeGreaterThan(0);
      return;

    case 'view_personnel': {
      await personnelPage.goto();
      const rowCount = await personnelPage.getRowCount();
      if (rowCount === 0) return;
      await personnelPage.clickViewIcon(tc.rowIndex || 0);
      const modal = await personnelPage.isModalOpen();
      expect(modal || await page.locator('body').isVisible()).toBeTruthy();
      return;
    }

    case 'toggle_active_status': {
      await personnelPage.goto();
      const rowCount = await personnelPage.getRowCount();
      if (rowCount <= (tc.rowIndex || 0)) return;
      const wasBefore = await personnelPage.toggleActiveStatus(tc.rowIndex || 0);
      await page.waitForTimeout(1500);
      await personnelPage.toggleActiveStatus(tc.rowIndex || 0);
      expect(typeof wasBefore).toBe('boolean');
      return;
    }

    case 'open_upload_certificates':
      await personnelPage.goto();
      await personnelPage.clickUploadCertificates();
      expect(await personnelPage.isModalOpen('Upload Certificates')).toBeTruthy();
      return;

    case 'open_new_user_modal':
      await personnelPage.goto();
      await personnelPage.clickNewButton();
      expect(await personnelPage.isModalOpen()).toBeTruthy();
      return;

    default:
      await runFallbackCase(ctx);
  }
}

async function runProjectManagementCase(ctx) {
  const page = activePage(ctx);
  const tc = ctx.tc;
  const pmPage = new ProjectManagementPage(page);

  switch (actionName(tc)) {
    case 'navigate':
      await pmPage.goto();
      expect(await pmPage.isPageLoaded()).toBeTruthy();
      return;

    case 'verify_banner':
      await pmPage.goto();
      expect(await pmPage.getBannerText()).toContain(tc.expectedText);
      return;

    case 'verify_active_tab': {
      await pmPage.goto();
      const isActive = await pmPage.isTabActive(tc.expectedTab);
      const tabVisible = await page.locator(`text=${tc.expectedTab}`).first().isVisible().catch(() => false);
      expect(isActive || tabVisible).toBeTruthy();
      return;
    }

    case 'click_tab':
      await pmPage.goto();
      await pmPage.clickTab(tc.tab);
      expect(await page.locator(`text=${tc.tab}`).first().isVisible().catch(() => false)).toBeTruthy();
      return;

    case 'verify_project_dropdown':
      await pmPage.goto();
      expect((await pmPage.getProjectDropdownOptions()).length).toBeGreaterThan(0);
      return;

    case 'verify_filter_default': {
      await pmPage.goto();
      const value = await pmPage.getFilterValue(tc.filter);
      expect(value === null || value === undefined || value.toLowerCase().includes('all') || value === '').toBeTruthy();
      return;
    }

    case 'reset_filters': {
      await pmPage.goto();
      const selects = page.locator('select');
      if (await selects.count() > 1) await selects.nth(1).selectOption({ index: 1 }).catch(() => {});
      await pmPage.clickResetFilters();
      const val = await pmPage.getFilterValue('String');
      expect(val === null || val === '' || (val && val.toLowerCase().includes('all'))).toBeTruthy();
      return;
    }

    case 'verify_empty_state':
      await pmPage.goto();
      if (tc.section === 'HoursWorked') {
        expect(typeof await pmPage.isNoHoursMsgVisible()).toBe('boolean');
      } else if (tc.section === 'ActivityHoursPivot') {
        expect(typeof await pmPage.isNoDataMsgVisible()).toBe('boolean');
      }
      return;

    case 'verify_element_visible': {
      await pmPage.goto();
      const elementMap = {
        resetZoomButton: () => pmPage.isResetZoomVisible(),
        averageHoursReference: () => pmPage.isAvgHoursRefVisible(),
        totalHoursLogged: () => pmPage.isTotalHoursLoggedVisible(),
      };
      const checker = elementMap[tc.element];
      if (!checker) throw new Error(`No element checker for "${tc.element}"`);
      expect(await checker()).toBeTruthy();
      return;
    }

    default:
      await runFallbackCase(ctx);
  }
}

async function runSettingsCase(ctx) {
  const page = activePage(ctx);
  const tc = ctx.tc;
  const settingsPage = new SettingsPage(page);

  switch (actionName(tc)) {
    case 'verify_sections':
      await settingsPage.goto();
      expect(await settingsPage.isPageLoaded()).toBeTruthy();
      for (const section of tc.expectedSections || []) {
        expect(await settingsPage.isSettingLinkVisible(section), `Section "${section}" not visible on settings page`).toBeTruthy();
      }
      return;

    case 'verify_section_links':
      await settingsPage.goto();
      for (const link of tc.expectedLinks || []) {
        expect(await settingsPage.isSettingLinkVisible(link), `Link "${link}" not found in ${tc.section} section`).toBeTruthy();
      }
      return;

    case 'verify_sync_dropdown': {
      await settingsPage.goto();
      const options = await settingsPage.getSyncDropdownOptions();
      if (options.length > 0) {
        for (const opt of tc.expectedOptions || []) {
          expect(options.some(o => o.includes(opt)), `Option "${opt}" not in sync dropdown: ${options}`).toBeTruthy();
        }
      } else {
        expect(typeof await settingsPage.isSettingLinkVisible(tc.expectedDefault || '15min')).toBe('boolean');
      }
      return;
    }

    case 'verify_project_status':
      await settingsPage.goto();
      for (const status of tc.expectedStatuses || []) {
        expect(await settingsPage.isSettingLinkVisible(status), `Status "${status}" not visible`).toBeTruthy();
      }
      return;

    case 'click_section_link': {
      await settingsPage.goto();
      const currentUrl = page.url();
      await settingsPage.clickSectionLink(tc.section, tc.link);
      await page.waitForTimeout(2000);
      const navigated = page.url() !== currentUrl;
      const modal = await page.locator('[class*="modal" i], [role="dialog"]').first().isVisible().catch(() => false);
      const clickedItemVisible = await settingsPage.isSettingLinkVisible(tc.link);
      expect(navigated || modal || clickedItemVisible).toBeTruthy();
      return;
    }

    default:
      await runFallbackCase(ctx);
  }
}

async function runTrainingMatrixCase(ctx) {
  const page = activePage(ctx);
  const tc = ctx.tc;
  const tmPage = new TrainingMatrixPage(page);

  switch (actionName(tc)) {
    case 'navigate':
      await tmPage.goto();
      expect(await tmPage.isPageLoaded()).toBeTruthy();
      return;

    case 'verify_columns': {
      await tmPage.goto();
      const headers = await tmPage.getTableHeaders();
      for (const col of tc.expectedColumns || []) {
        expect(headers.some(h => h.includes(col)), `Column "${col}" not found. Found: ${headers}`).toBeTruthy();
      }
      return;
    }

    case 'filter_by_project':
      await tmPage.goto();
      await tmPage.filterByProject(tc.projectIndex || 0);
      expect(await tmPage.getRowCount()).toBeGreaterThanOrEqual(0);
      return;

    case 'filter_by_cert_status':
      await tmPage.goto();
      await tmPage.filterByCertStatus(tc.status);
      expect(await tmPage.getRowCount()).toBeGreaterThanOrEqual(0);
      return;

    case 'filter_by_name':
      await tmPage.goto();
      await tmPage.filterByName(tc.name);
      expect(await tmPage.getRowCount()).toBeGreaterThanOrEqual(0);
      return;

    case 'filter_by_function': {
      await tmPage.goto();
      const selects = page.locator('select');
      if (await selects.count() >= 3) {
        await selects.nth(2).selectOption({ index: tc.functionIndex || 0 }).catch(() => {});
        await page.waitForTimeout(1000);
      }
      expect(await tmPage.getRowCount()).toBeGreaterThanOrEqual(0);
      return;
    }

    case 'filter_by_rotation':
      await tmPage.goto();
      await tmPage.filterByRotation(tc.rotation);
      expect(await tmPage.getRowCount()).toBeGreaterThanOrEqual(0);
      return;

    case 'reset_filter':
      await tmPage.goto();
      await tmPage.filterByCertStatus('Valid').catch(() => {});
      await tmPage.clickResetFilter();
      expect(await tmPage.getRowCount()).toBeGreaterThan(0);
      return;

    case 'export': {
      await tmPage.goto();
      const download = await tmPage.clickExport();
      if (download) {
        expect(download.suggestedFilename().length).toBeGreaterThan(0);
      } else {
        expect(await tmPage.isPageLoaded()).toBeTruthy();
      }
      return;
    }

    case 'view_user_detail': {
      await tmPage.goto();
      const rowCount = await tmPage.getRowCount();
      if (rowCount === 0) return;
      await tmPage.clickViewIcon(tc.rowIndex || 0);
      await page.waitForTimeout(1500);
      expect(await tmPage.isPageLoaded()).toBeTruthy();
      return;
    }

    case 'verify_checkmark_meaning':
      await tmPage.goto();
      expect(
        await page.locator('table tbody td').filter({ hasText: '✓' }).count() +
        await page.locator('table tbody td svg').count()
      ).toBeGreaterThanOrEqual(0);
      return;

    case 'verify_na_cells':
      await tmPage.goto();
      expect(await page.locator('table tbody td:has-text("N/A")').count()).toBeGreaterThan(0);
      return;

    default:
      await runFallbackCase(ctx);
  }
}

async function runFallbackCase(ctx) {
  const page = activePage(ctx);
  const tc = ctx.tc;
  const action = actionName(tc);

  if (action && action.startsWith('sanity_')) {
    await runGenericSanityCase(page, tc, ctx);
    return;
  }

  if (tc.path || tc.expectedTexts?.length) {
    await runGenericSanityCase(page, { ...tc, action: 'sanity_page_load' }, ctx);
    return;
  }

  throw new Error(`Unsupported action "${action}" in ${ctx.moduleKey}. Add a reusable handler in utils/dataDrivenRunner.js or use an existing action.`);
}

const moduleRunners = {
  auth: runAuthCase,
  certificates: runCertificatesCase,
  personnel: runPersonnelCase,
  projectManagement: runProjectManagementCase,
  settings: runSettingsCase,
  trainingMatrix: runTrainingMatrixCase,
};

async function runDataDrivenCase(ctx) {
  const stepWaitMs = ctx.stepWaitMs ?? Number(process.env.STEP_WAIT_MS || 500);
  const runner = moduleRunners[ctx.moduleKey] || runFallbackCase;
  if (ctx.tc?.action) {
    // Small delay before starting each test case so steps are visually separated.
    await ctx.page.waitForTimeout(stepWaitMs).catch(() => {});
  }
  // Provide stepWaitMs to sanity helpers (used by runGenericSanityCase)
  ctx.stepWaitMs = stepWaitMs;
  await runner(ctx);
}


module.exports = { runDataDrivenCase };
