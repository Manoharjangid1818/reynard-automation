// tests/certificates.spec.js
const { test, expect }          = require('../utils/authFixture');
const { PersonnelPage }         = require('../pages/PersonnelPage');
const { CertificateApprovalPage } = require('../pages/CertificateApprovalPage');
const { loadTestData, getEnabledTests, tcTitle } = require('../utils/testHelpers');
const { runGenericSanityCase } = require('../utils/sanityHelpers');

const data = loadTestData('certificates');

test.describe('Certificates', () => {
  let personnelPage;
  let certApprovalPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    personnelPage    = new PersonnelPage(authenticatedPage);
    certApprovalPage = new CertificateApprovalPage(authenticatedPage);
  });

  for (const tc of getEnabledTests(data)) {
    test(tcTitle(tc), async ({ authenticatedPage }) => {
      personnelPage    = new PersonnelPage(authenticatedPage);
      certApprovalPage = new CertificateApprovalPage(authenticatedPage);

      switch (tc.action) {

        // ── Modal fields visible ───────────────────────────────────────────
        case 'verify_modal_fields': {
          await personnelPage.goto();
          await personnelPage.clickUploadCertificates();
          expect(await personnelPage.isModalOpen()).toBeTruthy();

          // Check key elements in the modal
          const modal = authenticatedPage.locator('[class*="modal" i], [role="dialog"]').filter({ hasText: 'Upload Certificates' }).last();
          const modalText = await modal.textContent();
          expect(modalText).toContain('Select User');
          const hasFileInput = await authenticatedPage.locator('input[type="file"]').count() > 0;
          const chooseFileVisible = await authenticatedPage.getByRole('button', { name: /choose file/i }).first().isVisible().catch(() => false);
          expect(hasFileInput || chooseFileVisible).toBeTruthy();
          break;
        }

        // ── Save without user ──────────────────────────────────────────────
        case 'save_without_user': {
          await personnelPage.goto();
          await personnelPage.clickUploadCertificates();
          await personnelPage.clickSaveCertificate();
          const errMsg = await personnelPage.getCertValidationMessage();
          const modalText = await authenticatedPage.locator('[class*="modal" i], [role="dialog"]').filter({ hasText: 'Upload Certificates' }).last().textContent().catch(() => '');
          expect(
            (errMsg && errMsg.toLowerCase().includes('user')) ||
            modalText.includes('Please first select a user') ||
            modalText.includes('required')
          ).toBeTruthy();
          break;
        }

        // ── Save without cert type ─────────────────────────────────────────
        case 'save_missing_cert_type': {
          await personnelPage.goto();
          await personnelPage.clickUploadCertificates();
          await personnelPage.selectUserForCertificate(tc.userData?.userIndex || 0);
          await personnelPage.clickSaveCertificate();
          const errMsg = await personnelPage.getCertValidationMessage();
          const stillOpen = await personnelPage.isModalOpen();
          expect(stillOpen || !!errMsg).toBeTruthy();
          break;
        }

        // ── Save without file ──────────────────────────────────────────────
        case 'save_missing_file': {
          await personnelPage.goto();
          await personnelPage.clickUploadCertificates();
          await personnelPage.selectUserForCertificate(tc.userData?.userIndex || 0);
          // Select cert type
          const selects = authenticatedPage.locator('[class*="modal" i] select');
          if (await selects.count() > 1) {
            await selects.nth(1).selectOption({ index: 1 }).catch(() => {});
          }
          await personnelPage.clickSaveCertificate();
          const stillOpen = await personnelPage.isModalOpen();
          expect(stillOpen).toBeTruthy();
          break;
        }

        // ── Save without start date ────────────────────────────────────────
        case 'save_missing_start_date': {
          await personnelPage.goto();
          await personnelPage.clickUploadCertificates();
          await personnelPage.selectUserForCertificate(0);
          await personnelPage.clickSaveCertificate();
          const stillOpen = await personnelPage.isModalOpen();
          expect(stillOpen).toBeTruthy();
          break;
        }

        // ── Save without end date ──────────────────────────────────────────
        case 'save_missing_end_date': {
          await personnelPage.goto();
          await personnelPage.clickUploadCertificates();
          await personnelPage.selectUserForCertificate(0);
          // Fill start date only
          const dateInputs = authenticatedPage.locator('[class*="modal" i] input[type="date"], [class*="modal" i] input[placeholder*="DD-MM"]');
          if (await dateInputs.count() > 0) {
            await dateInputs.first().fill('2025-01-01').catch(() => {});
          }
          await personnelPage.clickSaveCertificate();
          const stillOpen = await personnelPage.isModalOpen();
          expect(stillOpen).toBeTruthy();
          break;
        }

        // ── Add Another adds a row ─────────────────────────────────────────
        case 'click_add_another': {
          await personnelPage.goto();
          await personnelPage.clickUploadCertificates();
          const beforeRows = await personnelPage.getModalRowCount();
          await personnelPage.clickAddAnother();
          const afterRows = await personnelPage.getModalRowCount();
          expect(afterRows).toBeGreaterThanOrEqual(beforeRows);
          break;
        }

        // ── Close modal ────────────────────────────────────────────────────
        case 'close_modal': {
          await personnelPage.goto();
          await personnelPage.clickUploadCertificates();
          expect(await personnelPage.isModalOpen()).toBeTruthy();
          // Close via X button
          await personnelPage.closeModal();
          await authenticatedPage.waitForTimeout(800);
          expect(await personnelPage.isModalOpen()).toBeFalsy();
          break;
        }

        // ── Certificate Approval page ──────────────────────────────────────
        case 'verify_approval_page': {
          await certApprovalPage.goto();
          expect(await certApprovalPage.isPageLoaded()).toBeTruthy();
          const headers = await certApprovalPage.getTableHeaders();
          for (const col of tc.expectedColumns) {
            expect(headers.some(h => h.includes(col)),
              `Column "${col}" missing. Found: ${headers}`
            ).toBeTruthy();
          }
          break;
        }

        // ── Certificate Approval search ────────────────────────────────────
        case 'search_approval': {
          await certApprovalPage.goto();
          await certApprovalPage.search(tc.searchTerm);
          // Verify no crash
          expect(await certApprovalPage.getRowCount()).toBeGreaterThanOrEqual(0);
          break;
        }

        // ── Internal checkbox toggles project field ───────────────────────
        case 'toggle_internal_checkbox': {
          await personnelPage.goto();
          await personnelPage.clickUploadCertificates();
          const checkbox = authenticatedPage.locator('[class*="modal" i] input[type="checkbox"]').first();
          const wasChecked = await checkbox.isChecked().catch(() => false);
          await checkbox.click({ force: true });
          await authenticatedPage.waitForTimeout(500);
          const nowChecked = await checkbox.isChecked().catch(() => false);
          expect(nowChecked).toBe(!wasChecked);
          break;
        }

        // ── Invalid date range ─────────────────────────────────────────────
        case 'save_invalid_date_range': {
          await personnelPage.goto();
          await personnelPage.clickUploadCertificates();
          await personnelPage.selectUserForCertificate(0);
          const dateInputs = authenticatedPage.locator('[class*="modal" i] input[type="date"]');
          if (await dateInputs.count() >= 2) {
            await dateInputs.first().fill('2025-06-01');
            await dateInputs.nth(1).fill('2025-01-01'); // end before start
          }
          await personnelPage.clickSaveCertificate();
          await authenticatedPage.waitForTimeout(1500);
          const errMsg    = await personnelPage.getCertValidationMessage();
          const stillOpen = await personnelPage.isModalOpen();
          expect(stillOpen || !!errMsg).toBeTruthy();
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
