const { test } = require('../utils/authFixture');
const { loadTestData, getEnabledTests, tcTitle } = require('../utils/testHelpers');
const { runGenericSanityCase } = require('../utils/sanityHelpers');

const data = loadTestData('common');

test.describe('Common', () => {
  for (const tc of getEnabledTests(data)) {
    test(tcTitle(tc), async ({ authenticatedPage, browser, baseURL }) => {
      await runGenericSanityCase(authenticatedPage, tc, { browser, baseURL });
    });
  }
});
