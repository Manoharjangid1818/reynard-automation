const { test } = require('../utils/authFixture');
const { loadTestData, getEnabledTests, tcTitle } = require('../utils/testHelpers');
const { runGenericSanityCase } = require('../utils/sanityHelpers');

const data = loadTestData('licenseApproval');

test.describe('License Approval', () => {
  for (const tc of getEnabledTests(data)) {
    test(tcTitle(tc), async ({ authenticatedPage }) => {
      await runGenericSanityCase(authenticatedPage, tc);
    });
  }
});
