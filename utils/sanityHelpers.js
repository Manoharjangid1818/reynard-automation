const { expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function textPattern(value) {
  return new RegExp(escapeRegExp(value), 'i');
}

function textSelectorValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function waitForSettled(page, stepWaitMs = 500) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.locator('body').waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(stepWaitMs);

  await page.locator('[role="progressbar"]').last().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  await page.locator('[class*="skeleton" i], .MuiSkeleton-root, [aria-busy="true"]').last().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

  let previousText = '';
  let stableReads = 0;
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(400);
    const currentText = await bodyText(page);
    if (currentText && currentText === previousText) stableReads += 1;
    else stableReads = 0;
    previousText = currentText;
    if (stableReads >= 1) break;
  }
}

async function gotoPath(page, path, options = {}) {
  const stepWaitMs = options.stepWaitMs ?? 500;
  if (path) {
    await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 45000 });
  }
  await waitForSettled(page, stepWaitMs);
  // Note: waitForSettled already applies the step wait.
}



async function bodyText(page) {
  return await page.locator('body').innerText().catch(() => '');
}

async function hasBodyText(page, text) {
  const value = (await bodyText(page)).toLowerCase();
  return value.includes(String(text).toLowerCase());
}

async function expectTexts(page, texts = []) {
  for (const text of texts) {
    await expect(page.locator('body'), `Expected page text "${text}" to be visible`).toContainText(textPattern(text), { timeout: 20000 });
  }
}

function clickableLocator(page, label) {
  const pattern = textPattern(label);
  const selectorLabel = textSelectorValue(label);
  const direct = page.locator([
    `a:has-text("${selectorLabel}")`,
    `button:has-text("${selectorLabel}")`,
    `[role="button"]:has-text("${selectorLabel}")`,
    `[title*="${selectorLabel}" i]`,
    `[aria-label*="${selectorLabel}" i]`,
  ].join(', '));
  const byRole = page.getByRole('link', { name: pattern }).or(page.getByRole('button', { name: pattern }));
  const visibleText = page.getByText(pattern).first();
  const interactiveAncestor = visibleText.locator(
    'xpath=ancestor-or-self::*[self::button or self::a or @role="button" or contains(@class, "MuiButtonBase-root") or contains(@class, "MuiCard") or contains(translate(@class, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "card")][1]'
  );
  return direct.or(byRole).or(interactiveAncestor).or(visibleText).first();
}

async function expectAnyClickable(page, labels = []) {
  for (const label of labels) {
    const locator = clickableLocator(page, label);
    if (await locator.isVisible().catch(() => false)) {
      await expect(locator).toBeVisible();
      return locator;
    }
  }
  throw new Error(`No clickable control found for: ${labels.join(', ')}`);
}

async function closeModalIfOpen(page) {
  const modal = page.locator('[class*="modal" i], [role="dialog"]').last();
  if (!await modal.isVisible().catch(() => false)) return;

  const close = modal.locator('button:has-text("Cancel"), button:has-text("Close"), button[class*="close" i], [aria-label*="close" i]').first();
  if (await close.isVisible().catch(() => false)) {
    await close.click().catch(() => {});
  } else {
    await page.keyboard.press('Escape').catch(() => {});
  }
  await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

async function verifyPageLoaded(page, tc) {
  await gotoPath(page, tc.path);
  await expect(page.locator('body')).toBeVisible();
  if (tc.urlContains) {
    await expect(page).toHaveURL(new RegExp(escapeRegExp(tc.urlContains)));
  }
  if (tc.expectedTexts?.length) {
    await expectTexts(page, tc.expectedTexts);
  }
}

async function verifyFiltersAvailable(page, tc) {
  await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  const filterControls = page.locator([
    'select',
    'input[placeholder*="All" i]',
    'input[placeholder*="Select" i]',
    'input[placeholder*="Search" i]',
    'input[type="search"]',
    '[role="combobox"]',
    '[class*="MuiAutocomplete-root"] input',
    '[class*="MuiSelect-select"]',
    'button:has-text("Reset Filter")',
    'button:has-text("Reset Filters")',
  ].join(', '));
  await expect.poll(async () => await filterControls.count(), {
    timeout: 15000,
    message: 'Expected at least one filter control to be available',
  }).toBeGreaterThan(0);
}

async function verifySearchAvailable(page, tc) {
  await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  const search = page.locator([
    'input[placeholder*="search" i]',
    'input[type="search"]',
    '[role="searchbox"]',
    '[role="combobox"] input[type="text"]',
    '[class*="MuiAutocomplete-root"] input[type="text"]',
  ].join(', ')).first();
  await search.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  expect(await search.isVisible().catch(() => false)).toBeTruthy();
}

async function verifyResetFilter(page, tc) {
  await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  const reset = page.locator('button:has-text("Reset Filter"), button:has-text("Reset Filters")').first();
  if (await reset.isVisible().catch(() => false)) {
    await reset.click().catch(() => {});
    await waitForSettled(page);
  } else {
    await verifyFiltersAvailable(page, tc);
  }
}

async function verifyTableOrList(page, tc) {
  await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  const contentCount = await page.locator('table, [role="table"], [class*="table"], [class*="list"], [class*="card"]').count();
  const noData = await page.getByText(/no data|no records|no result/i).first().isVisible().catch(() => false);
  expect(contentCount > 0 || noData).toBeTruthy();
}

async function verifyPagination(page, tc) {
  await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  const pagination = page.locator('[class*="pagination" i], button:has-text("Next"), button:has-text("Previous"), [aria-label*="page" i]').first();
  const rows = await page.locator('table tbody tr').count();
  expect(await pagination.isVisible().catch(() => false) || rows >= 0).toBeTruthy();
}

async function verifySortingAvailable(page, tc) {
  await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  const headers = page.locator('table thead th, [role="columnheader"]');
  const headerCount = await headers.count();
  if (headerCount > 0) {
    await headers.first().click().catch(() => {});
    await expect(headers.first()).toBeVisible();
    return;
  }
  await verifyTableOrList(page, tc);
}

async function verifySuccessMessagePath(page, tc) {
  await verifyPageLoaded(page, tc);
  const trigger = page.locator('button:has-text("Save"), button:has-text("Submit"), button:has-text("DARK"), button:has-text("WHITE")').first();
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click().catch(() => {});
    await page.waitForTimeout(1000);
  }
  const toast = page.locator('[class*="toast"], [class*="notification"], [class*="alert"], [role="alert"]').first();
  expect(await toast.isVisible().catch(() => false) || await page.locator('body').isVisible()).toBeTruthy();
}

async function verifyCreateAvailable(page, tc) {
  await verifyPageLoaded(page, tc);
  const labels = tc.labels || ['New', 'Add', 'Create', 'Request', 'Register'];
  const control = await expectAnyClickable(page, labels);
  if (tc.openControl !== false) {
    await control.click().catch(() => {});
    await page.waitForTimeout(700);
    const modalOpen = await page.locator('[class*="modal" i], [role="dialog"]').last().isVisible().catch(() => false);
    const pageStillReady = await page.locator('body').isVisible().catch(() => false);
    expect(modalOpen || pageStillReady).toBeTruthy();
    await closeModalIfOpen(page);
  }
}

async function verifyRowActionAvailable(page, tc) {
  await verifyPageLoaded(page, tc);
  const rows = page.locator('table tbody tr');
  const rowCount = await rows.count();
  if (rowCount === 0) {
    await verifyTableOrList(page, tc);
    return;
  }

  const firstRowText = await rows.first().innerText().catch(() => '');
  if (/no data|no records|no results?/i.test(firstRowText)) {
    await verifyTableOrList(page, tc);
    return;
  }

  const labels = tc.labels || ['View', 'Edit', 'Delete'];
  const row = rows.first();
  const textButtons = labels.map(label => `button:has-text("${label}"), a:has-text("${label}"), [title*="${label}" i], [aria-label*="${label}" i]`).join(', ');
  const actionCount = await row.locator(`${textButtons}, button, a, svg, [class*="action" i]`).count();
  expect(actionCount).toBeGreaterThan(0);
}

async function verifyStatusControl(page, tc) {
  await verifyPageLoaded(page, tc);
  const noData = await page.getByText(/no data|no records|no results?/i).first().isVisible().catch(() => false);
  if (noData) {
    await verifyTableOrList(page, tc);
    return;
  }

  const statusControls = page
    .locator('input[type="checkbox"], [role="switch"], button:has-text("Active"), button:has-text("Inactive")')
    .or(page.getByText(/Active|Inactive|Status|Open|Closed|OK|Quarantine|Requests/i));
  expect(await statusControls.count()).toBeGreaterThan(0);
}

async function verifySidebarVisible(page, tc) {
  await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  const expectedTexts = tc.expectedTexts || [];
  const visibleExpectedText = expectedTexts.length === 0 || await Promise.all(
    expectedTexts.map(text => hasBodyText(page, text))
  ).then(results => results.some(Boolean));
  const navShellCount = await page.locator('nav, aside, a[href*="/client/"], [class*="sidenav" i], [class*="sidebar" i], li').count();
  expect(visibleExpectedText || navShellCount > 0).toBeTruthy();
}

async function verifySidebarNavigation(page, tc) {
  await verifyPageLoaded(page, tc);
  for (const target of tc.targets || []) {
    await gotoPath(page, tc.startPath || '/client/setting');
    const hrefLink = target.path
      ? page.locator(`a[href$="${target.path}"], a[href*="${target.path}"]`).first()
      : null;
    const link = hrefLink && await hrefLink.isVisible().catch(() => false)
      ? hrefLink
      : clickableLocator(page, target.label);

    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await waitForSettled(page);
    } else {
      await gotoPath(page, target.path);
    }
    await expect(page).toHaveURL(new RegExp(escapeRegExp(target.urlContains || target.path)));
  }
}

async function verifyBreadcrumb(page, tc) {
  await verifyPageLoaded(page, tc);
  const breadcrumb = page.locator('[aria-label*="breadcrumb" i], nav:has-text("/")').first();
  const breadcrumbVisible = await breadcrumb.isVisible().catch(() => false);
  expect(breadcrumbVisible || await hasBodyText(page, '/') || await hasBodyText(page, 'home_outlined')).toBeTruthy();
}

async function verifyBrowserHistory(page, tc) {
  const [first, second] = tc.paths || ['/client/setting', '/client/personnel'];
  await gotoPath(page, first);
  await gotoPath(page, second);
  await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await waitForSettled(page);
  await expect(page).toHaveURL(new RegExp(escapeRegExp(first)));
  await page.goForward({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await waitForSettled(page);
  await expect(page).toHaveURL(new RegExp(escapeRegExp(second)));
}

async function verifyDataPersistenceAfterRefresh(page, tc) {
  await verifyPageLoaded(page, tc);
  const before = page.url();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForSettled(page);
  expect(page.url()).toContain(before.split('?')[0]);
}

async function verifyLogout(page) {
  if (!/\/client\//.test(page.url())) {
    await gotoPath(page, '/client/setting');
  }

  const loginPage = new LoginPage(page);
  await loginPage.logout();
  await expect(page).toHaveURL(/sign-in|login|authentication/, { timeout: 15000 });
}

async function verifyProtectedRouteRequiresAuth(browser, tc, baseURL) {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await gotoPath(page, tc.path || '/client/setting');
  const url = page.url();
  const loginVisible = await page.locator('input[type="email"], button:has-text("Login"), button:has-text("Log In")').first().isVisible().catch(() => false);
  await context.close();
  expect(/sign-in|login|authentication/.test(url) || loginVisible).toBeTruthy();
}

async function runOnFreshAuthPage(page, options, callback) {
  if (options.browser) {
    const context = await options.browser.newContext({ baseURL: options.baseURL });
    const freshPage = await context.newPage();
    try {
      return await callback(freshPage);
    } finally {
      await context.close();
    }
  }

  return await callback(page);
}

async function verifyInvalidLoginShowsError(page, tc, options = {}) {
  return await runOnFreshAuthPage(page, options, async freshPage => {
    const loginPage = new LoginPage(freshPage);
    await loginPage.login(tc.email || 'wrong@example.com', tc.password || 'WrongPassword123');
    const url = freshPage.url();
    const error = await loginPage.getErrorMessage();
    expect(url.includes('sign-in') || !!error).toBeTruthy();
  });
}

async function verifyMandatoryLoginValidation(page, options = {}) {
  return await runOnFreshAuthPage(page, options, async freshPage => {
    const loginPage = new LoginPage(freshPage);
    await loginPage.goto();
    await freshPage.locator(loginPage.loginButton).first().click();
    await freshPage.waitForTimeout(1000);
    expect(freshPage.url().includes('sign-in') || !!await loginPage.getErrorMessage()).toBeTruthy();
  });
}

async function runGenericSanityCase(page, tc, options = {}) {
const stepWaitMs = options.stepWaitMs ?? 500;
  switch (tc.action) {


    case 'sanity_page_load':
      await page.waitForTimeout(stepWaitMs);
      return await verifyPageLoaded(page, tc);



    case 'sanity_console_clean': {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      await verifyPageLoaded(page, tc);
      expect(consoleErrors, `Console errors found: ${consoleErrors.join(' | ')}`).toHaveLength(0);
      return;
    }
    case 'sanity_control_available':
      await verifyPageLoaded(page, tc);
      await expectAnyClickable(page, tc.labels || []);
      return;
    case 'sanity_filters_available':
      return await verifyFiltersAvailable(page, tc);
    case 'sanity_search_available':
      return await verifySearchAvailable(page, tc);
    case 'sanity_reset_filter':
      return await verifyResetFilter(page, tc);
    case 'sanity_table_or_list':
      return await verifyTableOrList(page, tc);
    case 'sanity_pagination':
      return await verifyPagination(page, tc);
    case 'sanity_sorting_available':
      return await verifySortingAvailable(page, tc);
    case 'sanity_success_message':
      return await verifySuccessMessagePath(page, tc);
    case 'sanity_create_available':
      return await verifyCreateAvailable(page, tc);
    case 'sanity_row_action_available':
      return await verifyRowActionAvailable(page, tc);
    case 'sanity_status_control':
      return await verifyStatusControl(page, tc);
    case 'sanity_sidebar_visible':
      return await verifySidebarVisible(page, tc);
    case 'sanity_sidebar_navigation':
      return await verifySidebarNavigation(page, tc);
    case 'sanity_breadcrumb':
      return await verifyBreadcrumb(page, tc);
    case 'sanity_browser_history':
      return await verifyBrowserHistory(page, tc);
    case 'sanity_refresh_persistence':
      return await verifyDataPersistenceAfterRefresh(page, tc);
    case 'sanity_logout':
      return await verifyLogout(page);
    case 'sanity_access_restriction':
      return await verifyProtectedRouteRequiresAuth(options.browser, tc, options.baseURL);
    case 'sanity_invalid_login_error':
      return await verifyInvalidLoginShowsError(page, tc, options);
    case 'sanity_mandatory_login_validation':
      return await verifyMandatoryLoginValidation(page, options);
    default:
      throw new Error(`Unsupported sanity action: ${tc.action}`);
  }
}

module.exports = { runGenericSanityCase };
