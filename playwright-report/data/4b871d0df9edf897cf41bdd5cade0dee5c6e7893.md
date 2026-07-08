# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projectManagement.spec.js >> Project Management >> [PM_TC_018] Verify Project Tracker page loads successfully.
- Location: tests\projectManagement.spec.js:10:5

# Error details

```
Error: Expected page text "Project Tracker" to be visible

expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - link "Brand" [ref=e5] [cursor=pointer]:
      - /url: /
      - img "Brand" [ref=e6]
    - separator [ref=e7]
    - list [ref=e8]:
      - link "Project Management" [ref=e9] [cursor=pointer]:
        - /url: /client/project-management
        - listitem [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e13]: dashboard
            - generic:
              - generic: Project Management
      - link "Shift Details" [ref=e14] [cursor=pointer]:
        - /url: /client/shifts
        - listitem [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e18]: add card
            - generic:
              - generic: Shift Details
      - link "Toolbox Talk" [ref=e19] [cursor=pointer]:
        - /url: /client/toolbox-talk
        - listitem [ref=e20]:
          - generic [ref=e21]:
            - generic [ref=e23]: mark_unread_chat_alt_outlined
            - generic:
              - generic: Toolbox Talk
      - link "Report" [ref=e24] [cursor=pointer]:
        - /url: /client/report
        - listitem [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e28]: report
            - generic:
              - generic: Report
      - link "DPR" [ref=e29] [cursor=pointer]:
        - /url: /client/dpr
        - listitem [ref=e30]:
          - generic [ref=e31]:
            - generic [ref=e33]: add card
            - generic:
              - generic: DPR
      - link "QHSE Management" [ref=e34] [cursor=pointer]:
        - /url: /client/qhse-management
        - listitem [ref=e35]:
          - generic [ref=e36]:
            - generic [ref=e38]: ballot
            - generic:
              - generic: QHSE Management
      - link "QHSE Cards" [ref=e39] [cursor=pointer]:
        - /url: /client/qhse-cards
        - listitem [ref=e40]:
          - generic [ref=e41]:
            - generic [ref=e43]: style
            - generic:
              - generic: QHSE Cards
      - link "Safety Alert" [ref=e44] [cursor=pointer]:
        - /url: /client/safety-alert
        - listitem [ref=e45]:
          - generic [ref=e46]:
            - generic [ref=e48]: article
            - generic:
              - generic: Safety Alert
      - link "Feedback" [ref=e49] [cursor=pointer]:
        - /url: /client/feedback
        - listitem [ref=e50]:
          - generic [ref=e51]:
            - generic [ref=e53]: feedback
            - generic:
              - generic: Feedback
      - link "Equipment Management" [ref=e54] [cursor=pointer]:
        - /url: /client/equipment-management
        - listitem [ref=e55]:
          - generic [ref=e56]:
            - generic [ref=e58]: construction
            - generic:
              - generic: Equipment Management
      - link "Inventory" [ref=e59] [cursor=pointer]:
        - /url: /client/inventory
        - listitem [ref=e60]:
          - generic [ref=e61]:
            - generic [ref=e63]: store
            - generic:
              - generic: Inventory
      - link "Inventory Summary" [ref=e64] [cursor=pointer]:
        - /url: /client/inventory-summary
        - listitem [ref=e65]:
          - generic [ref=e66]:
            - generic [ref=e68]: store
            - generic:
              - generic: Inventory Summary
      - link "Orders" [ref=e69] [cursor=pointer]:
        - /url: /client/orders
        - listitem [ref=e70]:
          - generic [ref=e71]:
            - generic [ref=e73]: warehouse
            - generic:
              - generic: Orders
      - link "Project Inventory" [ref=e74] [cursor=pointer]:
        - /url: /client/project-inventory
        - listitem [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e78]: shop_outlined
            - generic:
              - generic: Project Inventory
      - link "Project Orders" [ref=e79] [cursor=pointer]:
        - /url: /client/project-orders
        - listitem [ref=e80]:
          - generic [ref=e81]:
            - generic [ref=e83]: assignment
            - generic:
              - generic: Project Orders
      - link "Return Cart" [ref=e84] [cursor=pointer]:
        - /url: /client/return-cart
        - listitem [ref=e85]:
          - generic [ref=e86]:
            - generic [ref=e88]: assignment_return
            - generic:
              - generic: Return Cart
      - link "Personnel Management" [ref=e89] [cursor=pointer]:
        - /url: /client/personnel-management
        - listitem [ref=e90]:
          - generic [ref=e91]:
            - generic [ref=e93]: manage_accounts
            - generic:
              - generic: Personnel Management
      - link "Personnel" [ref=e94] [cursor=pointer]:
        - /url: /client/personnel
        - listitem [ref=e95]:
          - generic [ref=e96]:
            - generic [ref=e98]: person outlined
            - generic:
              - generic: Personnel
      - link "Certificate Approval" [ref=e99] [cursor=pointer]:
        - /url: /client/certificate-approval
        - listitem [ref=e100]:
          - generic [ref=e101]:
            - generic [ref=e103]: workspace_premium
            - generic:
              - generic: Certificate Approval
      - link "Training Matrix" [ref=e104] [cursor=pointer]:
        - /url: /client/training-matrix
        - listitem [ref=e105]:
          - generic [ref=e106]:
            - generic [ref=e108]: person outlined
            - generic:
              - generic: Training Matrix
      - link "Settings" [ref=e109] [cursor=pointer]:
        - /url: /client/setting
        - listitem [ref=e110]:
          - generic [ref=e111]:
            - generic [ref=e113]: settings
            - generic:
              - generic: Settings
    - generic [ref=e114]:
      - button [ref=e115] [cursor=pointer]:
        - generic [ref=e116]: keyboard_double_arrow_left
      - listitem [ref=e118]:
        - generic [ref=e119] [cursor=pointer]:
          - generic [ref=e121]: power_settings_new
          - generic:
            - generic: Logout
  - generic [ref=e122]:
    - generic [ref=e123]:
      - heading "Toolbox Suite Configurator" [level=5] [ref=e125]
      - generic [ref=e126] [cursor=pointer]: close
    - separator [ref=e127]
    - generic [ref=e128]:
      - generic [ref=e129]:
        - heading "Sidenav Colors" [level=6] [ref=e130]
        - generic [ref=e131]:
          - button [ref=e132] [cursor=pointer]
          - button [ref=e133] [cursor=pointer]
          - button [ref=e134] [cursor=pointer]
          - button [ref=e135] [cursor=pointer]
          - button [ref=e136] [cursor=pointer]
          - button [ref=e137] [cursor=pointer]
      - generic [ref=e138]:
        - heading "Sidenav Type" [level=6] [ref=e139]
        - text: Choose between different sidenav types.
        - generic [ref=e140]:
          - button "Dark" [ref=e141] [cursor=pointer]: Dark
          - button "Transparent" [ref=e143] [cursor=pointer]: Transparent
          - button "White" [ref=e144] [cursor=pointer]: White
      - generic [ref=e145]:
        - heading "Navbar Fixed" [level=6] [ref=e146]
        - checkbox [checked] [ref=e149] [cursor=pointer]
      - separator [ref=e152]
      - generic [ref=e153]:
        - heading "Light / Dark" [level=6] [ref=e154]
        - checkbox [ref=e157] [cursor=pointer]
  - generic [ref=e160]:
    - banner [ref=e161]:
      - generic [ref=e162]:
        - generic [ref=e164]:
          - link [ref=e165] [cursor=pointer]:
            - /url: /client/qhse-cards
            - generic [ref=e167]: home_outlined
          - navigation [ref=e170]:
            - list [ref=e171]:
              - listitem [ref=e172]: /
              - listitem [ref=e173]: /
              - listitem [ref=e174]: setting
        - generic [ref=e176]:
          - link "T" [ref=e177] [cursor=pointer]:
            - /url: /client/profile
            - button "T" [ref=e178]:
              - paragraph [ref=e180]: T
          - generic [ref=e181]:
            - img [ref=e184] [cursor=pointer]
            - generic: "0"
    - paragraph [ref=e186]: Settings
    - separator [ref=e187]
    - generic [ref=e189]:
      - generic [ref=e192]:
        - generic [ref=e193]:
          - img "complex" [ref=e195]
          - heading "Project Management" [level=4] [ref=e197]
        - list [ref=e199]:
          - listitem [ref=e200]:
            - link "Project Setup" [ref=e201] [cursor=pointer]:
              - /url: /client/setting/project-setup
              - paragraph [ref=e204]: Project Setup
            - button "comments" [ref=e205] [cursor=pointer]
          - listitem [ref=e206]:
            - link "Report Setup" [ref=e207] [cursor=pointer]:
              - /url: /client/setting/setup-report
              - paragraph [ref=e210]: Report Setup
            - button "comments" [ref=e211] [cursor=pointer]
      - generic [ref=e214]:
        - generic [ref=e215]:
          - img "complex" [ref=e217]
          - heading "Actions" [level=4] [ref=e219]
        - list [ref=e221]:
          - listitem [ref=e222]:
            - link "System Notification" [ref=e223] [cursor=pointer]:
              - /url: /client/setting/system-notification
              - paragraph [ref=e226]: System Notification
            - button "comments" [ref=e227] [cursor=pointer]
          - listitem [ref=e228]:
            - button "Send Notification" [ref=e229] [cursor=pointer]:
              - paragraph [ref=e232]: Send Notification
            - button "comments" [ref=e233] [cursor=pointer]:
              - img [ref=e234]
      - generic [ref=e239]:
        - generic [ref=e240]:
          - img "complex" [ref=e242]
          - heading "Equipment" [level=4] [ref=e244]
        - list [ref=e246]:
          - listitem [ref=e247]:
            - link "Equipment Setup" [ref=e248] [cursor=pointer]:
              - /url: /client/setting/equipment-setup
              - paragraph [ref=e251]: Equipment Setup
            - button "comments" [ref=e252] [cursor=pointer]
          - listitem [ref=e253]:
            - link "Add Warehouse" [ref=e254] [cursor=pointer]:
              - /url: /client/setting/add-warehouse
              - paragraph [ref=e257]: Add Warehouse
            - button "comments" [ref=e258] [cursor=pointer]
          - listitem [ref=e259]:
            - link "Warehouse" [ref=e260] [cursor=pointer]:
              - /url: /client/setting/warehouse
              - paragraph [ref=e263]: Warehouse
            - button "comments" [ref=e264] [cursor=pointer]
      - generic [ref=e267]:
        - generic [ref=e268]:
          - img "complex" [ref=e270]
          - heading "Personal Setting" [level=4] [ref=e272]
        - list [ref=e274]:
          - listitem [ref=e275]:
            - button "Time format" [ref=e276] [cursor=pointer]:
              - paragraph [ref=e279]: Time format
            - button "comments" [ref=e280] [cursor=pointer]:
              - img [ref=e281]
          - listitem [ref=e284]:
            - button "Language" [ref=e285] [cursor=pointer]:
              - paragraph [ref=e288]: Language
            - button "comments" [ref=e289] [cursor=pointer]:
              - img [ref=e290]
          - listitem [ref=e293]:
            - button "Dark theme" [ref=e294] [cursor=pointer]:
              - paragraph [ref=e297]: Dark theme
            - button "comments" [ref=e298] [cursor=pointer]:
              - img [ref=e299]
          - generic [ref=e302]:
            - paragraph [ref=e303]: Project Status
            - generic [ref=e306]:
              - generic [ref=e307]:
                - button "Open Completed" [ref=e308] [cursor=pointer]:
                  - generic [ref=e309]:
                    - paragraph [ref=e313]: Open
                    - paragraph [ref=e317]: Completed
                - textbox:
                  - /placeholder: Select Project Status
                  - text: open,completed
                - img [ref=e318]
                - group
              - button [ref=e320] [cursor=pointer]:
                - img [ref=e321]
    - link:
      - /url: /client/setting
```

# Test source

```ts
  1   | const { expect } = require('@playwright/test');
  2   | const { LoginPage } = require('../pages/LoginPage');
  3   | 
  4   | function escapeRegExp(value) {
  5   |   return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  6   | }
  7   | 
  8   | function textPattern(value) {
  9   |   return new RegExp(escapeRegExp(value), 'i');
  10  | }
  11  | 
  12  | async function waitForSettled(page) {
  13  |   await page.waitForLoadState('domcontentloaded').catch(() => {});
  14  |   await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  15  |   await page.locator('body').waitFor({ state: 'visible', timeout: 15000 });
  16  |   await page.locator('[role="progressbar"]').last().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  17  | }
  18  | 
  19  | async function gotoPath(page, path) {
  20  |   if (path) {
  21  |     await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 45000 });
  22  |   }
  23  |   await waitForSettled(page);
  24  | }
  25  | 
  26  | async function bodyText(page) {
  27  |   return await page.locator('body').innerText().catch(() => '');
  28  | }
  29  | 
  30  | async function hasBodyText(page, text) {
  31  |   const value = (await bodyText(page)).toLowerCase();
  32  |   return value.includes(String(text).toLowerCase());
  33  | }
  34  | 
  35  | async function expectTexts(page, texts = []) {
  36  |   for (const text of texts) {
> 37  |     expect(await hasBodyText(page, text), `Expected page text "${text}" to be visible`).toBeTruthy();
      |                                                                                         ^ Error: Expected page text "Project Tracker" to be visible
  38  |   }
  39  | }
  40  | 
  41  | function clickableLocator(page, label) {
  42  |   const pattern = textPattern(label);
  43  |   return page.locator([
  44  |     `a:has-text("${label}")`,
  45  |     `button:has-text("${label}")`,
  46  |     `[role="button"]:has-text("${label}")`,
  47  |     `[title*="${label}" i]`,
  48  |     `[aria-label*="${label}" i]`,
  49  |   ].join(', ')).or(page.getByRole('link', { name: pattern })).or(page.getByRole('button', { name: pattern })).first();
  50  | }
  51  | 
  52  | async function expectAnyClickable(page, labels = []) {
  53  |   for (const label of labels) {
  54  |     const locator = clickableLocator(page, label);
  55  |     if (await locator.isVisible().catch(() => false)) {
  56  |       await expect(locator).toBeVisible();
  57  |       return locator;
  58  |     }
  59  |   }
  60  |   throw new Error(`No clickable control found for: ${labels.join(', ')}`);
  61  | }
  62  | 
  63  | async function closeModalIfOpen(page) {
  64  |   const modal = page.locator('[class*="modal" i], [role="dialog"]').last();
  65  |   if (!await modal.isVisible().catch(() => false)) return;
  66  | 
  67  |   const close = modal.locator('button:has-text("Cancel"), button:has-text("Close"), button[class*="close" i], [aria-label*="close" i]').first();
  68  |   if (await close.isVisible().catch(() => false)) {
  69  |     await close.click().catch(() => {});
  70  |   } else {
  71  |     await page.keyboard.press('Escape').catch(() => {});
  72  |   }
  73  |   await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  74  | }
  75  | 
  76  | async function verifyPageLoaded(page, tc) {
  77  |   await gotoPath(page, tc.path);
  78  |   await expect(page.locator('body')).toBeVisible();
  79  |   if (tc.urlContains) {
  80  |     await expect(page).toHaveURL(new RegExp(escapeRegExp(tc.urlContains)));
  81  |   }
  82  |   if (tc.expectedTexts?.length) {
  83  |     await expectTexts(page, tc.expectedTexts);
  84  |   }
  85  | }
  86  | 
  87  | async function verifyFiltersAvailable(page, tc) {
  88  |   await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  89  |   const filterControls = page.locator([
  90  |     'select',
  91  |     'input[placeholder*="All" i]',
  92  |     'input[placeholder*="Select" i]',
  93  |     'input[placeholder*="Search" i]',
  94  |     '[role="combobox"]',
  95  |     'button:has-text("Reset Filter")',
  96  |     'button:has-text("Reset Filters")',
  97  |   ].join(', '));
  98  |   expect(await filterControls.count()).toBeGreaterThan(0);
  99  | }
  100 | 
  101 | async function verifySearchAvailable(page, tc) {
  102 |   await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  103 |   const search = page.locator('input[placeholder*="search" i], input[type="search"], [role="searchbox"]').first();
  104 |   await search.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  105 |   expect(await search.isVisible().catch(() => false)).toBeTruthy();
  106 | }
  107 | 
  108 | async function verifyResetFilter(page, tc) {
  109 |   await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  110 |   const reset = page.locator('button:has-text("Reset Filter"), button:has-text("Reset Filters")').first();
  111 |   if (await reset.isVisible().catch(() => false)) {
  112 |     await reset.click().catch(() => {});
  113 |     await waitForSettled(page);
  114 |   } else {
  115 |     await verifyFiltersAvailable(page, tc);
  116 |   }
  117 | }
  118 | 
  119 | async function verifyTableOrList(page, tc) {
  120 |   await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  121 |   const contentCount = await page.locator('table, [role="table"], [class*="table"], [class*="list"], [class*="card"]').count();
  122 |   const noData = await page.getByText(/no data|no records|no result/i).first().isVisible().catch(() => false);
  123 |   expect(contentCount > 0 || noData).toBeTruthy();
  124 | }
  125 | 
  126 | async function verifyPagination(page, tc) {
  127 |   await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  128 |   const pagination = page.locator('[class*="pagination" i], button:has-text("Next"), button:has-text("Previous"), [aria-label*="page" i]').first();
  129 |   const rows = await page.locator('table tbody tr').count();
  130 |   expect(await pagination.isVisible().catch(() => false) || rows >= 0).toBeTruthy();
  131 | }
  132 | 
  133 | async function verifySortingAvailable(page, tc) {
  134 |   await verifyPageLoaded(page, { ...tc, expectedTexts: [] });
  135 |   const headers = page.locator('table thead th, [role="columnheader"]');
  136 |   const headerCount = await headers.count();
  137 |   if (headerCount > 0) {
```