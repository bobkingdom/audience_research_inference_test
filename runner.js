#!/usr/bin/env node
/**
 * Test Runner for Audience Research API Tests
 */
import { writeFileSync, mkdirSync } from 'fs';
import { printSummary, generateReport, resetResults, results } from './lib/utils.js';

import { runHealthTests } from './tests/health.test.js';
import { runAudienceTests } from './tests/audience.test.js';
import { runFocusGroupTests } from './tests/focus-group.test.js';
import { runVectorTests } from './tests/vector.test.js';
import { runContentTests } from './tests/content.test.js';
import { runAvatarTests } from './tests/avatar.test.js';
import { runSurveyTests } from './tests/survey.test.js';

const testModules = {
  health: { name: 'Health Check', fn: runHealthTests, smoke: true },
  audience: { name: 'Audience Generation', fn: runAudienceTests, smoke: false },
  'focus-group': { name: 'Focus Group', fn: runFocusGroupTests, smoke: false },
  vector: { name: 'Vector Search', fn: runVectorTests, smoke: true },
  content: { name: 'Content Generation', fn: runContentTests, smoke: false },
  avatar: { name: 'Avatar Management', fn: runAvatarTests, smoke: false },
  survey: { name: 'Async Survey', fn: runSurveyTests, smoke: false },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { module: null, smoke: false, report: false, verbose: false, help: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--module' || arg === '-m') options.module = args[++i];
    else if (arg === '--smoke') options.smoke = true;
    else if (arg === '--report') options.report = true;
    else if (arg === '--verbose' || arg === '-v') options.verbose = true;
  }
  return options;
}

async function main() {
  const options = parseArgs();
  if (options.help) {
    console.log(`
Audience Research API Test Runner
Usage: node runner.js [options]
Options:
  --module, -m <name>   Run specific module
  --smoke               Run smoke tests only
  --report              Generate JSON report
  --verbose, -v         Enable verbose logging
`);
    process.exit(0);
  }

  if (options.verbose) process.env.VERBOSE = 'true';

  console.log('═'.repeat(60));
  console.log('  Audience Research API Test Suite');
  console.log('  ' + new Date().toISOString());
  console.log('═'.repeat(60));

  resetResults();
  const startTime = Date.now();

  try {
    if (options.module) {
      const module = testModules[options.module];
      if (!module) {
        console.error(`Unknown module: ${options.module}`);
        process.exit(1);
      }
      await module.fn();
    } else if (options.smoke) {
      for (const [key, module] of Object.entries(testModules)) {
        if (module.smoke) await module.fn();
      }
    } else {
      for (const [key, module] of Object.entries(testModules)) {
        await module.fn();
      }
    }
  } catch (error) {
    console.error('Test execution error:', error.message);
  }

  const totalTime = Date.now() - startTime;
  printSummary();
  console.log(`\nTotal time: ${(totalTime / 1000).toFixed(2)}s`);

  if (options.report) {
    const report = generateReport();
    report.totalTimeMs = totalTime;
    mkdirSync('./reports', { recursive: true });
    const reportPath = `./reports/test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nReport saved to: ${reportPath}`);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

main();
