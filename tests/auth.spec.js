const { test } = require('@playwright/test');
const { loadTestData, getEnabledTests, tcTitle } = require('../utils/testHelpers');
const { runDataDrivenCase } = require('../utils/dataDrivenRunner');

const moduleKey = 'auth';
const data = loadTestData(moduleKey);

test.describe('Authentication', () => {
  for (const tc of getEnabledTests(data)) {
    test(tcTitle(tc), async ({ page, browser, baseURL }, testInfo) => {
      await runDataDrivenCase({ page, browser, baseURL, testInfo, moduleKey, moduleData: data, tc });
    });
  }
});
