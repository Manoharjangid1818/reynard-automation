// utils/customReporter.js
const fs   = require('fs');
const path = require('path');

class CustomReporter {
  constructor() {
    this.results   = [];
    this.startTime = null;
    this.dirs = {
      base:    path.join(process.cwd(), 'reports'),
      history: path.join(process.cwd(), 'reports', 'history'),
      json:    path.join(process.cwd(), 'reports', 'json'),
      csv:     path.join(process.cwd(), 'reports', 'csv'),
      html:    path.join(process.cwd(), 'reports', 'html'),
    };
    this._ensureDirs();
  }

  _ensureDirs() {
    Object.values(this.dirs).forEach(d => fs.mkdirSync(d, { recursive: true }));
    fs.mkdirSync(path.join(process.cwd(), 'reports', 'screenshots'), { recursive: true });
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    this.suite     = suite;
    console.log(`\n🚀  Reynard Automation — ${new Date().toLocaleString()}`);
    console.log(`📋  Total tests: ${suite.allTests().length}\n`);
  }

  onTestBegin(test) {
    // no-op (playwright list reporter covers this)
  }

  onTestEnd(test, result) {
    const module = this._extractModule(test.titlePath());
    this.results.push({
      id:         this._extractId(test.title),
      module,
      title:      test.title,
      status:     result.status,           // passed | failed | skipped | timedOut
      duration:   result.duration,
      error:      result.error?.message?.split('\n')[0] || null,
      retries:    result.retry,
      timestamp:  new Date().toISOString(),
    });
  }

  onEnd(result) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const summary = this._buildSummary(result);
    this._writeModuleJsonResults();
    this._writeHistoryCsv(summary);
    this._writeRunSummaryJson(summary, elapsed);
    this._printConsole(summary, elapsed);
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  _extractModule(titlePath) {
    // titlePath = ['file > describe > test'] — grab describe name
    return titlePath.length >= 2 ? titlePath[titlePath.length - 2] : 'General';
  }

  _extractId(title) {
    const match = title.match(/\[([A-Z]+_TC_\d+|SC-\d+)\]/) || title.match(/\b(TC-[A-Z]+-\d+)\b/);
    return match ? match[1] : null;
  }

  _buildSummary(result) {
    const passed   = this.results.filter(r => r.status === 'passed').length;
    const failed   = this.results.filter(r => r.status === 'failed').length;
    const skipped  = this.results.filter(r => r.status === 'skipped').length;
    const timedOut = this.results.filter(r => r.status === 'timedOut').length;
    const total    = this.results.length;
    return { total, passed, failed, skipped, timedOut, status: result.status };
  }

  _writeModuleJsonResults() {
    // Group by module and write one file per module
    const byModule = {};
    for (const r of this.results) {
      (byModule[r.module] = byModule[r.module] || []).push(r);
    }
    for (const [mod, tests] of Object.entries(byModule)) {
      const safeName = mod.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      const filePath = path.join(this.dirs.json, `${safeName}_results.json`);
      const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
      const updated  = [...existing, { run: new Date().toISOString(), tests }];
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    }
  }

  _writeHistoryCsv(summary) {
    const csvPath = path.join(this.dirs.history, 'run_history.csv');
    const header  = 'RunDate,Total,Passed,Failed,Skipped,TimedOut,OverallStatus\n';
    const row     = `${new Date().toISOString()},${summary.total},${summary.passed},${summary.failed},${summary.skipped},${summary.timedOut},${summary.status}\n`;

    if (!fs.existsSync(csvPath)) fs.writeFileSync(csvPath, header);
    fs.appendFileSync(csvPath, row);

    // Also write per-test CSV
    const detailPath = path.join(this.dirs.history, `run_${Date.now()}.csv`);
    const detailHdr  = 'TestID,Module,Title,Status,DurationMs,Error\n';
    const detailRows = this.results.map(r =>
      `"${r.id || ''}","${r.module}","${r.title.replace(/"/g, '""')}","${r.status}",${r.duration},"${(r.error || '').replace(/"/g, '""')}"`
    ).join('\n');
    fs.writeFileSync(detailPath, detailHdr + detailRows);
  }

  _writeRunSummaryJson(summary, elapsed) {
    const summaryPath = path.join(this.dirs.json, 'last_run_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      runDate:  new Date().toISOString(),
      elapsed:  `${elapsed}s`,
      ...summary,
      results:  this.results,
    }, null, 2));
  }

  _printConsole(summary, elapsed) {
    const icon = summary.failed === 0 ? '✅' : '❌';
    console.log('\n' + '═'.repeat(60));
    console.log(`${icon}  Run complete in ${elapsed}s`);
    console.log(`   Passed:   ${summary.passed}`);
    console.log(`   Failed:   ${summary.failed}`);
    console.log(`   Skipped:  ${summary.skipped}`);
    console.log(`   TimedOut: ${summary.timedOut}`);
    console.log('═'.repeat(60));
    console.log('📁  Reports saved to: reports/');
    console.log('📄  History CSV:      reports/history/run_history.csv');
    console.log('📊  Module JSONs:     reports/json/<Module>_results.json\n');
  }
}

module.exports = CustomReporter;
