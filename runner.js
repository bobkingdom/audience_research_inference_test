#!/usr/bin/env node
/**
 * Test Runner for Inference Service V2 API
 * 
 * Usage:
 *   node runner.js                    # Run all tests
 *   node runner.js --smoke            # Run smoke tests only (health checks)
 *   node runner.js --module health    # Run specific module
 *   node runner.js --report           # Save report to file
 *   node runner.js --verbose          # Verbose output
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { resetResults, getResults, printSummary } from './lib/utils.js';
import { client } from './lib/client.js';
import config from './config/default.js';

// Import test modules
import runHealthTests from './tests/health.test.js';
import runVectorTests from './tests/vector.test.js';
import runAudienceGenerateTests from './tests/audience-generate.test.js';
import runFocusGroupTests from './tests/focus-group.test.js';
import runAvatarTests from './tests/avatar.test.js';
import runAsyncSurveyTests from './tests/async-survey.test.js';
import runContentGenerationTests from './tests/content-generation.test.js';
import runWorkflowTests from './tests/workflow.test.js';

// Import auth helpers
import { login, getToken } from './lib/auth.js';

const TEST_MODULES = {
  health: { name: 'Health Checks', fn: runHealthTests, smoke: true },
  vector: { name: 'Vector Search API', fn: runVectorTests, smoke: true },
  'audience-generate': { name: 'Audience Generate API', fn: runAudienceGenerateTests },
  'focus-group': { name: 'Focus Group API', fn: runFocusGroupTests },
  avatar: { name: 'Avatar API', fn: runAvatarTests },
  'async-survey': { name: 'Async Survey API', fn: runAsyncSurveyTests },
  'content-generation': { name: 'Content Generation API', fn: runContentGenerationTests },
  workflow: { name: 'Workflow Tests (Chained)', fn: runWorkflowTests },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    smoke: false,
    module: null,
    report: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--smoke':
        options.smoke = true;
        break;
      case '--module':
        options.module = args[++i];
        break;
      case '--report':
        options.report = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        console.log(`
Inference Service V2 API Test Runner

Usage:
  node runner.js [options]

Options:
  --smoke           Run smoke tests only (health checks)
  --module <name>   Run specific module (${Object.keys(TEST_MODULES).join(', ')})
  --report          Save report to ./reports/
  --verbose         Verbose output

Environment Variables:
  API_BASE_URL      API base URL (default: ${config.baseUrl})
  API_KEY           API key (default: ${config.apiKey})
  JWT_TOKEN         JWT token for authenticated endpoints
  TEST_ACCOUNT_ID   Test account ID (default: ${config.testAccountId})
  VERBOSE           Enable verbose mode (true/false)
`);
        process.exit(0);
    }
  }

  return options;
}

async function saveReport(results, duration) {
  const reportDir = config.report.outputDir;
  if (!existsSync(reportDir)) {
    await mkdir(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `test-report-${timestamp}.json`;
  const filepath = join(reportDir, filename);

  const report = {
    timestamp: new Date().toISOString(),
    duration: `${(duration / 1000).toFixed(2)}s`,
    config: {
      baseUrl: config.baseUrl,
      testAccountId: config.testAccountId,
    },
    summary: {
      total: results.passed + results.failed + results.skipped,
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped,
      passRate: ((results.passed / (results.passed + results.failed + results.skipped)) * 100).toFixed(1) + '%',
    },
    tests: results.tests,
  };

  await writeFile(filepath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${filepath}`);
  return filepath;
}

async function main() {
  const options = parseArgs();
  const startTime = Date.now();

  // Configure client
  if (options.verbose) {
    client.verbose = true;
  }

  // Auto-login if credentials provided
  if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
    try {
      await login(process.env.TEST_EMAIL, process.env.TEST_PASSWORD);
    } catch (error) {
      console.log(`⚠️ Auto-login failed: ${error.message}`);
    }
  } else if (config.jwtToken) {
    console.log('🔐 Using configured JWT Token');
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('  Inference Service V2 API Test Suite');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Account ID: ${config.testAccountId}`);
  console.log('');

  resetResults();

  try {
    // Determine which modules to run
    let modulesToRun = [];

    if (options.module) {
      // Single module
      if (!TEST_MODULES[options.module]) {
        console.error(`Unknown module: ${options.module}`);
        console.error(`Available modules: ${Object.keys(TEST_MODULES).join(', ')}`);
        process.exit(1);
      }
      modulesToRun = [{ key: options.module, ...TEST_MODULES[options.module] }];
    } else if (options.smoke) {
      // Smoke tests only
      modulesToRun = Object.entries(TEST_MODULES)
        .filter(([_, m]) => m.smoke)
        .map(([key, m]) => ({ key, ...m }));
    } else {
      // All modules
      modulesToRun = Object.entries(TEST_MODULES)
        .map(([key, m]) => ({ key, ...m }));
    }

    // Run tests
    for (const module of modulesToRun) {
      console.log(`\n${'═'.repeat(50)}`);
      console.log(`📦 ${module.name}`);
      console.log(`${'═'.repeat(50)}`);
      await module.fn();
    }

  } catch (error) {
    console.error('\n❌ Test runner error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
  }

  const duration = Date.now() - startTime;

  // Print summary
  printSummary();
  console.log(`\nTotal time: ${(duration / 1000).toFixed(2)}s`);

  // Save report if requested
  if (options.report) {
    await saveReport(getResults(), duration);
  }

  // Exit with appropriate code
  const results = getResults();
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(console.error);
