// utils/testHelpers.js
const fs   = require('fs');
const path = require('path');

/**
 * Load test data for a given module.
 * @param {string} module - e.g. 'auth', 'personnel'
 */
function loadTestData(module) {
  const filePath = path.join(__dirname, '..', 'data', `${module}.data.json`);
  if (!fs.existsSync(filePath)) throw new Error(`Test data not found: ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Filter test cases — only enabled ones, optionally by tag.
 */
function getEnabledTests(testData, tag = null) {
  return testData.testCases.filter(tc => {
    if (!tc.enabled) return false;
    if (tag && !tc.tags.includes(tag)) return false;
    return true;
  });
}

/**
 * Build a Playwright test title with TC ID embedded so reporter can parse it.
 */
function tcTitle(tc) {
  return `[${tc.id}] ${tc.title}`;
}

/**
 * Ensure a directory exists.
 */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Write a result entry for a test (used for inline result tracking per test).
 */
function writeTestResult(module, tcId, status, detail = '') {
  const dir      = path.join(process.cwd(), 'reports', 'json');
  const filePath = path.join(dir, `${module}_results.json`);
  ensureDir(dir);
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch {}
  existing.push({ tcId, status, detail, timestamp: new Date().toISOString() });
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
}

module.exports = { loadTestData, getEnabledTests, tcTitle, ensureDir, writeTestResult };
