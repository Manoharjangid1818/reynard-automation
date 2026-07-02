const { test } = require('@playwright/test');
const { loadTestData, getEnabledTests, tcTitle } = require('../utils/testHelpers');
const { runGenericSanityCase } = require('../utils/sanityHelpers');

const data = loadTestData('application');

test.describe('Application', () => {
  for (const tc of getEnabledTests(data)) {
    test(tcTitle(tc), async ({ page }) => {
      await runGenericSanityCase(page, tc);
    });
  }
});
