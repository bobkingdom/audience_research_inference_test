/**
 * Test utilities following AAA (Arrange-Act-Assert) pattern
 */
export const results = { passed: 0, failed: 0, skipped: 0, errors: [], details: [] };

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', blue: '\x1b[34m', gray: '\x1b[90m',
};

export async function test(name, testFn) {
  const startTime = Date.now();
  const testResult = { name, status: 'pending', duration: 0, error: null };
  
  try {
    await testFn();
    testResult.status = 'passed';
    testResult.duration = Date.now() - startTime;
    results.passed++;
    console.log(`${colors.green}✓${colors.reset} ${name} ${colors.gray}(${testResult.duration}ms)${colors.reset}`);
  } catch (error) {
    testResult.status = 'failed';
    testResult.duration = Date.now() - startTime;
    testResult.error = error.message;
    results.failed++;
    results.errors.push({ name, error: error.message });
    console.log(`${colors.red}✗${colors.reset} ${name}\n  ${colors.red}Error: ${error.message}${colors.reset}`);
  }
  
  results.details.push(testResult);
  return testResult;
}

export function skip(name, reason = '') {
  results.skipped++;
  results.details.push({ name, status: 'skipped', reason });
  console.log(`${colors.yellow}○${colors.reset} ${name} ${colors.gray}(skipped${reason ? ': ' + reason : ''})${colors.reset}`);
}

export async function describe(suiteName, suiteFn) {
  console.log(`\n${colors.blue}▸ ${suiteName}${colors.reset}`);
  await suiteFn();
}

export const assert = {
  ok(value, message = 'Expected truthy value') { if (!value) throw new Error(message); },
  equal(actual, expected, message) { if (actual !== expected) throw new Error(message || `Expected ${expected}, got ${actual}`); },
  isObject(value, message) { if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(message || 'Expected object'); },
  isArray(value, message) { if (!Array.isArray(value)) throw new Error(message || 'Expected array'); },
  httpOk(response, message) { if (!response.ok) throw new Error(message || `Expected HTTP success, got ${response.status}: ${JSON.stringify(response.data)}`); },
  httpStatus(response, expected, message) { if (response.status !== expected) throw new Error(message || `Expected HTTP ${expected}, got ${response.status}`); },
  httpError(response, message) { if (response.ok) throw new Error(message || `Expected HTTP error, got ${response.status}`); },
  greaterThan(actual, expected, message) { if (actual <= expected) throw new Error(message || `Expected ${actual} > ${expected}`); },
  lessThan(actual, expected, message) { if (actual >= expected) throw new Error(message || `Expected ${actual} < ${expected}`); },
  hasProperty(obj, prop, message) { if (!(prop in obj)) throw new Error(message || `Expected object to have property ${prop}`); },
};

export function generateReport() {
  return {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.passed + results.failed + results.skipped,
      passed: results.passed, failed: results.failed, skipped: results.skipped,
      passRate: ((results.passed / (results.passed + results.failed || 1)) * 100).toFixed(2) + '%',
    },
    errors: results.errors,
    details: results.details,
  };
}

export function printSummary() {
  const total = results.passed + results.failed + results.skipped;
  console.log('\n' + '═'.repeat(50));
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log('─'.repeat(50));
  console.log(`Total:   ${total}`);
  console.log(`${colors.green}Passed:  ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed:  ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}Skipped: ${results.skipped}${colors.reset}`);
  if (total > 0) {
    console.log(`Pass Rate: ${((results.passed / (results.passed + results.failed || 1)) * 100).toFixed(1)}%`);
  }
  console.log('═'.repeat(50));
}

export function resetResults() {
  results.passed = 0; results.failed = 0; results.skipped = 0;
  results.errors = []; results.details = [];
}

export const random = {
  string: (length = 10) => Math.random().toString(36).substring(2, 2 + length),
  number: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  }),
};
