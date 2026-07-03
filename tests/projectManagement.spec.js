const { test } = require('../utils/authFixture');
const { loadTestData, getEnabledTests, tcTitle } = require('../utils/testHelpers');
const { runDataDrivenCase } = require('../utils/dataDrivenRunner');

const moduleKey = 'projectManagement';
const data = loadTestData(moduleKey);

test.describe('Project Management', () => {
  for (const tc of getEnabledTests(data)) {
    test(tcTitle(tc), async ({ authenticatedPage, browser, baseURL }, testInfo) => {
      await runDataDrivenCase({ page: authenticatedPage, authenticatedPage, browser, baseURL, testInfo, moduleKey, moduleData: data, tc });
    });
  }
});
