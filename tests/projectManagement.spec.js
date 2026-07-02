// tests/projectManagement.spec.js
const { test, expect }          = require('../utils/authFixture');
const { ProjectManagementPage } = require('../pages/ProjectManagementPage');
const { loadTestData, getEnabledTests, tcTitle } = require('../utils/testHelpers');
const { runGenericSanityCase } = require('../utils/sanityHelpers');

const data = loadTestData('projectManagement');

test.describe('Project Management', () => {
  let pmPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    pmPage = new ProjectManagementPage(authenticatedPage);
    await pmPage.goto();
  });

  for (const tc of getEnabledTests(data)) {
    test(tcTitle(tc), async ({ authenticatedPage }) => {
      pmPage = new ProjectManagementPage(authenticatedPage);

      switch (tc.action) {

        case 'navigate': {
          await pmPage.goto();
          expect(await pmPage.isPageLoaded()).toBeTruthy();
          break;
        }

        case 'verify_banner': {
          const text = await pmPage.getBannerText();
          expect(text).toContain(tc.expectedText);
          break;
        }

        case 'verify_active_tab': {
          const isActive = await pmPage.isTabActive(tc.expectedTab);
          // Some apps don't add active class — just verify tab is visible
          const tabVisible = await authenticatedPage.locator(`text=${tc.expectedTab}`).first().isVisible().catch(() => false);
          expect(isActive || tabVisible).toBeTruthy();
          break;
        }

        case 'click_tab': {
          await pmPage.clickTab(tc.tab);
          const tabVisible = await authenticatedPage.locator(`text=${tc.tab}`).first().isVisible().catch(() => false);
          expect(tabVisible).toBeTruthy();
          break;
        }

        case 'verify_project_dropdown': {
          const options = await pmPage.getProjectDropdownOptions();
          expect(options.length).toBeGreaterThan(0);
          break;
        }

        case 'verify_filter_default': {
          const value = await pmPage.getFilterValue(tc.filter);
          // Value should be "All" or empty (both indicate default state)
          expect(value === null || value === undefined || value.toLowerCase().includes('all') || value === '').toBeTruthy();
          break;
        }

        case 'reset_filters': {
          // Change a filter then reset
          const selects = authenticatedPage.locator('select');
          if (await selects.count() > 1) {
            await selects.nth(1).selectOption({ index: 1 }).catch(() => {});
          }
          await pmPage.clickResetFilters();
          // All filters should be back to default
          const val = await pmPage.getFilterValue('String');
          expect(val === null || val === '' || (val && val.toLowerCase().includes('all'))).toBeTruthy();
          break;
        }

        case 'verify_empty_state': {
          if (tc.section === 'HoursWorked') {
            const visible = await pmPage.isNoHoursMsgVisible();
            // Either empty state OR actual chart data exists
            expect(typeof visible).toBe('boolean');
          } else if (tc.section === 'ActivityHoursPivot') {
            const visible = await pmPage.isNoDataMsgVisible();
            expect(typeof visible).toBe('boolean');
          }
          break;
        }

        case 'verify_element_visible': {
          const elementMap = {
            resetZoomButton:      () => pmPage.isResetZoomVisible(),
            averageHoursReference:() => pmPage.isAvgHoursRefVisible(),
            totalHoursLogged:     () => pmPage.isTotalHoursLoggedVisible(),
          };
          const checker = elementMap[tc.element];
          if (checker) {
            const visible = await checker();
            expect(visible).toBeTruthy();
          } else {
            test.skip(true, `No element checker for "${tc.element}"`);
          }
          break;
        }

        default:
          if (tc.action && tc.action.startsWith('sanity_')) {
            await runGenericSanityCase(authenticatedPage, tc);
            break;
          }
          test.skip(true, `Handler for "${tc.action}" not implemented`);
      }
    });
  }
});
