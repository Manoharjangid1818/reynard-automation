# Reynard Automation Framework

Playwright + JavaScript | Page Object Model | Data-Driven | History Reporting

---

## Project Structure

```
reynard-automation/
├── config/                  # (reserved for env-specific configs)
├── data/                    # ← TEST DATA — only file you edit to add test cases
│   ├── auth.data.json
│   ├── personnel.data.json
│   ├── certificates.data.json
│   ├── trainingMatrix.data.json
│   ├── settings.data.json
│   └── projectManagement.data.json
├── pages/                   # Page Object Models (POM)
│   ├── BasePage.js
│   ├── LoginPage.js
│   ├── PersonnelPage.js
│   ├── TrainingMatrixPage.js
│   ├── SettingsPage.js
│   ├── ProjectManagementPage.js
│   └── CertificateApprovalPage.js
├── tests/                   # Test specs (data-driven — reads from data/)
│   ├── auth.spec.js
│   ├── personnel.spec.js
│   ├── certificates.spec.js
│   ├── trainingMatrix.spec.js
│   ├── settings.spec.js
│   └── projectManagement.spec.js
├── utils/
│   ├── authFixture.js       # Shared login fixture (login once per worker)
│   ├── customReporter.js    # Writes per-module JSON + CSV run history
│   └── testHelpers.js       # loadTestData, tcTitle, etc.
├── reports/                 # Auto-generated — never commit this
│   ├── html/                # Playwright HTML report
│   ├── json/                # Per-module result JSON files
│   ├── history/             # run_history.csv (cumulative) + per-run CSVs
│   ├── screenshots/         # Failure screenshots
│   └── test-results/        # Traces, videos
├── playwright-report/      # Auto-generated (Playwright HTML report) — never commit
│   ├── index.html
│   └── data/
│       └── (attachments/artifacts)
└── playwright-help.txt     # Helper output — should not be committed
├── .env                     # Credentials & base URL (do NOT commit)
├── playwright.config.js
└── package.json
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install chromium firefox

# 3. Set credentials in .env
#    ADMIN_EMAIL=your@email.com
#    ADMIN_PASSWORD=yourpassword
#    BASE_URL=https://reynard-qa-m7xqu.ondigitalocean.app
```

---

## Running Tests

```bash
# Run all tests
npm run test:all

# Run by module
npm run test:auth
npm run test:personnel
npm run test:certificates
npm run test:training
npm run test:settings
npm run test:projects

# Run with browser visible
npm run test:headed

# Open HTML report
npm run report

# Run only smoke tests (via grep)
npx playwright test --grep "@smoke"

# Run on specific browser
npx playwright test --project=firefox
```

---

## ✅ How to Add a New Test Case (Zero Code Change)

Open the relevant data file in `data/` and add a new entry to the `testCases` array:

```json
{
  "id": "PERS_TC_018",
  "title": "Filter personnel by nationality",
  "enabled": true,
  "action": "filter_by_nationality",
  "nationality": "Dutch",
  "expectedResult": "filtered_results",
  "tags": ["regression"]
}
```

- Set `"enabled": false` to skip a test without deleting it.
- The `id` appears in all reports and history CSVs for traceability.
- Add the corresponding `case 'filter_by_nationality':` handler in the spec only when you need a new **action type**; reusing existing action types requires zero code changes.

---

## Test Data Schema

Each data file follows this schema:

| Field         | Type    | Description                                      |
|---------------|---------|--------------------------------------------------|
| `id`          | string  | Unique ID (e.g. `AUTH_TC_001`) — used in reports |
| `title`       | string  | Human-readable test name                         |
| `enabled`     | boolean | `false` = skipped without deletion               |
| `action`      | string  | Maps to a `switch/case` in the spec              |
| `tags`        | array   | `smoke`, `regression`, `negative`, `ui`, `security` |
| `expectedResult` | string | What the test expects                         |

---

## Reporting

After every run:

| Report                              | Location                               |
|-------------------------------------|----------------------------------------|
| Interactive HTML report             | `reports/html/index.html`              |
| Per-module result JSON (with history) | `reports/json/<Module>_results.json` |
| Cumulative run history CSV          | `reports/history/run_history.csv`      |
| Per-run detail CSV                  | `reports/history/run_<timestamp>.csv`  |
| Last run summary JSON               | `reports/json/last_run_summary.json`   |
| Failure screenshots                 | `reports/screenshots/`                 |
| Traces (on failure)                 | `reports/test-results/`                |

---

## Tags Reference

| Tag          | Purpose                              |
|--------------|--------------------------------------|
| `smoke`      | Core flow — run before every release |
| `regression` | Full suite — run on every PR         |
| `negative`   | Error / edge-case scenarios          |
| `ui`         | Visual / layout checks               |
| `security`   | Input sanitisation, injection, etc.  |

---

## CI Integration (GitHub Actions example)

```yaml
- name: Run Reynard Tests
  run: |
    npm ci
    npx playwright install --with-deps chromium
    npm run test:all
  env:
    ADMIN_EMAIL: ${{ secrets.REYNARD_EMAIL }}
    ADMIN_PASSWORD: ${{ secrets.REYNARD_PASSWORD }}
    BASE_URL: ${{ secrets.REYNARD_URL }}

- name: Upload report
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: reports/html/
```
