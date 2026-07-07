# TODO - Fix failing Playwright suite

## Step 1: Auth/session stability
- [x] Update `utils/authFixture.js` to fix authenticated session restoration (remove/adjust sessionStorage injection if it causes origin mismatch; rely on storageState).


## Step 2: CertificateApproval page heuristics
- [ ] Update `pages/CertificateApprovalPage.js` to make `goto()`/`isPageLoaded()` less dependent on exact header text; instead verify URL + table presence.

## Step 3: Navigation sanity robustness
- [ ] Update `utils/sanityHelpers.js` sidebar navigation/visibility to use robust `a[href]` matching and ensure waits after click.

## Step 4: Re-run tests
- [ ] Run `npm test` (or `npx playwright test`) and review failures.

## Step 5: Remove/disable unrecoverable failing TCs
- [ ] If failures persist due to missing UI selectors/feature differences, disable/delete only those enabled failing test cases (not entire suite).

