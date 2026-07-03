// utils/customReporter.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CustomReporter {
  constructor() {
    this.results = [];
    this.resultIndex = new Map();
    this.startTime = null;
    this.startTimeIso = null;
    this.runId = null;
    this.suite = null;
    this.config = null;
    this.dirs = {
      base: path.join(process.cwd(), 'reports'),
      history: path.join(process.cwd(), 'reports', 'history'),
      byTest: path.join(process.cwd(), 'reports', 'history', 'by-test'),
      json: path.join(process.cwd(), 'reports', 'json'),
      csv: path.join(process.cwd(), 'reports', 'csv'),
      html: path.join(process.cwd(), 'reports', 'html'),
      screenshots: path.join(process.cwd(), 'reports', 'screenshots'),
    };
    this._ensureDirs();
  }

  _ensureDirs() {
    Object.values(this.dirs).forEach(d => this._ensureDir(d));
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    this.startTimeIso = new Date(this.startTime).toISOString();
    this.runId = this._safeTimestamp(this.startTimeIso);
    this.suite = suite;
    this.config = config;
    console.log(`\n🚀  Reynard Automation — ${new Date().toLocaleString()}`);
    console.log(`📋  Total tests: ${suite.allTests().length}\n`);
  }

  onTestBegin(test) {
    // no-op (playwright list reporter covers this)
  }

  onTestEnd(test, result) {
    const testResult = this._buildTestResult(test, result);
    const key = this._testKey(test);

    if (this.resultIndex.has(key)) {
      this.results[this.resultIndex.get(key)] = testResult;
    } else {
      this.resultIndex.set(key, this.results.length);
      this.results.push(testResult);
    }
  }

  onEnd(result) {
    const endTime = Date.now();
    const endTimeIso = new Date(endTime).toISOString();
    const durationMs = this.startTime ? endTime - this.startTime : 0;
    const elapsed = (durationMs / 1000).toFixed(1);
    const summary = this._buildSummary(result, durationMs, endTimeIso);
    const run = this._buildRun(result, summary, endTimeIso, durationMs);

    this._writeRunHistory(run);
    this._writeLatestRun(run);
    this._appendSummary(summary);
    this._appendByTestHistory(run);

    // Preserve existing reporter outputs.
    this._writeModuleJsonResults();
    this._writeHistoryCsv(summary);
    this._writeRunSummaryJson(summary, elapsed);
    this._printConsole(summary, elapsed);
  }

  // Existing-style helpers

  _extractModule(titlePath) {
    // titlePath = ['file > describe > test'] — grab describe name
    return titlePath.length >= 2 ? titlePath[titlePath.length - 2] : 'General';
  }

  _extractId(title) {
    const match = title.match(/^\[([^\]]+)\]/) || title.match(/\b([A-Z0-9]+_TC_\d+|SC-\d+|TC-[A-Z0-9]+-\d+)\b/);
    return match ? match[1] : null;
  }

  _buildSummary(result, durationMs = 0, endTimeIso = new Date().toISOString()) {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const flaky = this.results.filter(r => r.status === 'flaky').length;
    const timedOut = this.results.filter(r => r.status === 'timedOut').length;
    const git = this._getGitInfo();

    return {
      runId: this.runId || this._safeTimestamp(endTimeIso),
      timestamp: this.startTimeIso || endTimeIso,
      totalTests: total,
      total,
      passed,
      failed,
      skipped,
      flaky,
      timedOut,
      durationMs,
      status: result.status,
      gitBranch: git.branch,
      gitCommit: git.commit,
    };
  }

  _writeModuleJsonResults() {
    const byModule = {};
    for (const r of this.results) {
      (byModule[r.module] = byModule[r.module] || []).push(r);
    }

    for (const [mod, tests] of Object.entries(byModule)) {
      const safeName = this._sanitizeFileName(mod);
      const filePath = path.join(this.dirs.json, `${safeName}_results.json`);
      const existing = this._readJson(filePath, []);
      const updated = [...(Array.isArray(existing) ? existing : []), { run: new Date().toISOString(), tests }];
      this._writeJson(filePath, updated);
    }
  }

  _writeHistoryCsv(summary) {
    const csvPath = path.join(this.dirs.history, 'run_history.csv');
    const header = 'RunDate,Total,Passed,Failed,Skipped,Flaky,TimedOut,OverallStatus\n';
    const row = `${new Date().toISOString()},${summary.total},${summary.passed},${summary.failed},${summary.skipped},${summary.flaky},${summary.timedOut},${summary.status}\n`;

    this._appendText(csvPath, row, header);

    const detailPath = path.join(this.dirs.history, `run_${Date.now()}.csv`);
    const detailHdr = 'TestID,Module,SpecFile,Title,Status,DurationMs,Error\n';
    const detailRows = this.results.map(r =>
      `"${r.caseId || r.id || ''}","${r.module}","${r.specFile}","${r.title.replace(/"/g, '""')}","${r.status}",${r.durationMs},"${(r.error?.message || '').replace(/"/g, '""')}"`
    ).join('\n');
    this._writeText(detailPath, detailHdr + detailRows);
  }

  _writeRunSummaryJson(summary, elapsed) {
    const summaryPath = path.join(this.dirs.json, 'last_run_summary.json');
    this._writeJson(summaryPath, {
      runDate: new Date().toISOString(),
      elapsed: `${elapsed}s`,
      ...summary,
      results: this.results,
    });
  }

  _printConsole(summary, elapsed) {
    const icon = summary.failed === 0 ? '✅' : '❌';
    console.log('\n' + '═'.repeat(60));
    console.log(`${icon}  Run complete in ${elapsed}s`);
    console.log(`   Passed:   ${summary.passed}`);
    console.log(`   Failed:   ${summary.failed}`);
    console.log(`   Skipped:  ${summary.skipped}`);
    console.log(`   Flaky:    ${summary.flaky}`);
    console.log(`   TimedOut: ${summary.timedOut}`);
    console.log('═'.repeat(60));
    console.log('📁  Reports saved to: reports/');
    console.log('📄  Latest run:       reports/latest.json');
    console.log('📄  Summary history:  reports/summary.json');
    console.log('📄  Run history:      reports/history/<runId>_run.json');
    console.log('📊  Module JSONs:     reports/json/<Module>_results.json\n');
  }

  // New history storage helpers

  _buildTestResult(test, result) {
    const titlePath = test.titlePath();
    const title = test.title;
    const caseId = this._extractId(title);
    const caseIndex = this._extractCaseIndex(caseId);
    const error = this._extractError(result);
    const status = this._normalizeStatus(test, result);

    return {
      module: this._extractModule(titlePath),
      specFile: this._extractSpecFile(test),
      title,
      fullTitle: titlePath.filter(Boolean).join(' > '),
      id: caseId,
      caseId,
      caseIndex,
      dataDrivenCaseId: caseId,
      dataDrivenCaseIndex: caseIndex,
      status,
      durationMs: result.duration,
      duration: result.duration,
      error,
      retries: result.retry,
      retry: result.retry,
      timestamp: new Date().toISOString(),
    };
  }

  _buildRun(result, summary, endTimeIso, durationMs) {
    return {
      runId: summary.runId,
      startTime: this.startTimeIso,
      endTime: endTimeIso,
      durationMs,
      status: result.status,
      gitBranch: summary.gitBranch,
      gitCommit: summary.gitCommit,
      summary: {
        totalTests: summary.totalTests,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        flaky: summary.flaky,
        timedOut: summary.timedOut,
      },
      tests: this.results,
    };
  }

  _writeRunHistory(run) {
    this._writeJson(path.join(this.dirs.history, `${run.runId}_run.json`), run);
  }

  _writeLatestRun(run) {
    this._writeJson(path.join(this.dirs.base, 'latest.json'), run);
  }

  _appendSummary(summary) {
    const summaryPath = path.join(this.dirs.base, 'summary.json');
    const existing = this._readJson(summaryPath, []);
    const summaries = Array.isArray(existing) ? existing : [];
    summaries.push({
      runId: summary.runId,
      timestamp: summary.timestamp,
      totalTests: summary.totalTests,
      passed: summary.passed,
      failed: summary.failed,
      skipped: summary.skipped,
      flaky: summary.flaky,
      durationMs: summary.durationMs,
      gitBranch: summary.gitBranch,
      gitCommit: summary.gitCommit,
    });
    this._writeJson(summaryPath, summaries);
  }

  _appendByTestHistory(run) {
    for (const test of run.tests) {
      const fileName = this._byTestFileName(test);
      const filePath = path.join(this.dirs.byTest, fileName);
      const existing = this._readJson(filePath, []);
      const history = Array.isArray(existing) ? existing : [];
      history.push({
        runId: run.runId,
        timestamp: run.startTime,
        status: test.status,
        durationMs: test.durationMs,
      });
      this._writeJson(filePath, history);
    }
  }

  _extractSpecFile(test) {
    const file = test.location?.file || '';
    return file ? path.basename(file) : null;
  }

  _extractCaseIndex(caseId) {
    if (!caseId) return null;
    const match = String(caseId).match(/(\d+)$/);
    return match ? Number(match[1]) : null;
  }

  _extractError(result) {
    const err = result.error || result.errors?.[0];
    if (!err) return null;

    return {
      message: this._truncate(err.message || String(err), 500),
      stack: this._truncate(err.stack || '', 500),
    };
  }

  _normalizeStatus(test, result) {
    const rawStatus = result.status;
    const outcome = typeof test.outcome === 'function' ? test.outcome() : null;

    if (outcome === 'flaky' || (rawStatus === 'passed' && result.retry > 0)) return 'flaky';
    if (rawStatus === 'timedOut') return 'failed';
    if (rawStatus === 'interrupted') return 'failed';
    return rawStatus;
  }

  _testKey(test) {
    return test.id || `${test.location?.file || ''}:${test.location?.line || ''}:${test.titlePath().join(' > ')}`;
  }

  _byTestFileName(test) {
    const base = [test.caseId || test.id, test.module, test.title].filter(Boolean).join('_');
    return `${this._sanitizeFileName(base, 180)}.json`;
  }

  _getGitInfo() {
    return {
      branch: this._git('git rev-parse --abbrev-ref HEAD'),
      commit: this._git('git rev-parse HEAD'),
    };
  }

  _git(command) {
    try {
      return execSync(command, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() || null;
    } catch {
      return null;
    }
  }

  _safeTimestamp(value) {
    return value.replace(/[:.]/g, '-');
  }

  _sanitizeFileName(value, maxLength = 120) {
    const sanitized = String(value || 'unknown')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, maxLength);
    return sanitized || 'unknown';
  }

  _truncate(value, maxLength) {
    const text = String(value || '');
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  _ensureDir(dirPath) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (err) {
      console.warn(`Could not create report directory ${dirPath}: ${err.message}`);
    }
  }

  _readJson(filePath, fallback) {
    try {
      if (!fs.existsSync(filePath)) return fallback;
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.warn(`Could not read JSON report ${filePath}; starting fresh. ${err.message}`);
      return fallback;
    }
  }

  _writeJson(filePath, data) {
    try {
      this._ensureDir(path.dirname(filePath));
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.warn(`Could not write JSON report ${filePath}: ${err.message}`);
    }
  }

  _writeText(filePath, data) {
    try {
      this._ensureDir(path.dirname(filePath));
      fs.writeFileSync(filePath, data);
    } catch (err) {
      console.warn(`Could not write report ${filePath}: ${err.message}`);
    }
  }

  _appendText(filePath, row, header = '') {
    try {
      this._ensureDir(path.dirname(filePath));
      if (!fs.existsSync(filePath) && header) fs.writeFileSync(filePath, header);
      fs.appendFileSync(filePath, row);
    } catch (err) {
      console.warn(`Could not append report ${filePath}: ${err.message}`);
    }
  }
}

module.exports = CustomReporter;
