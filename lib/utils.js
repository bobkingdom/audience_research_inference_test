/**
 * Test utilities and AAA testing helpers
 * AAA = Arrange, Act, Assert
 */

let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
};

let currentSuite = '';

export function resetResults() {
  testResults = { passed: 0, failed: 0, skipped: 0, tests: [] };
}

export function getResults() {
  return testResults;
}

/**
 * Define a test suite (describe block)
 */
export async function describe(name, fn) {
  currentSuite = name;
  console.log(`\n\x1b[34m▸ ${name}\x1b[0m`);
  await fn();
}

/**
 * Define a test case following AAA pattern
 * @param {string} name - Test name
 * @param {Function} fn - Test function that should throw on failure
 */
export async function test(name, fn) {
  const startTime = Date.now();
  const testInfo = {
    suite: currentSuite,
    name,
    status: 'pending',
    duration: 0,
    error: null,
  };

  try {
    await fn();
    const duration = Date.now() - startTime;
    testInfo.status = 'passed';
    testInfo.duration = duration;
    testResults.passed++;
    console.log(`\x1b[32m✓\x1b[0m ${name} \x1b[90m(${duration}ms)\x1b[0m`);
  } catch (error) {
    const duration = Date.now() - startTime;
    testInfo.status = 'failed';
    testInfo.duration = duration;
    testInfo.error = error.message;
    testResults.failed++;
    console.log(`\x1b[31m✗\x1b[0m ${name}`);
    console.log(`  \x1b[31mError: ${error.message}\x1b[0m`);
  }

  testResults.tests.push(testInfo);
}

/**
 * Skip a test
 */
export async function skip(name, reason = '') {
  testResults.skipped++;
  testResults.tests.push({
    suite: currentSuite,
    name,
    status: 'skipped',
    reason,
  });
  console.log(`\x1b[33m○\x1b[0m ${name} \x1b[90m(skipped${reason ? ': ' + reason : ''})\x1b[0m`);
}

/**
 * Assertion helpers for AAA testing
 */
export const assert = {
  // Basic assertions
  ok(value, message = 'Expected value to be truthy') {
    if (!value) throw new Error(message);
  },

  equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  },

  deepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Deep equality failed`);
    }
  },

  notEqual(actual, expected, message) {
    if (actual === expected) {
      throw new Error(message || `Expected values to be different`);
    }
  },

  // HTTP specific assertions
  httpOk(response, message = 'Expected HTTP 2xx response') {
    if (!response.ok) {
      const detail = response.data?.detail || response.data?.message || JSON.stringify(response.data);
      throw new Error(`${message} (got ${response.status}: ${detail})`);
    }
  },

  httpStatus(response, expectedStatus, message) {
    if (response.status !== expectedStatus) {
      throw new Error(message || `Expected HTTP ${expectedStatus}, got ${response.status}`);
    }
  },

  httpError(response, message = 'Expected HTTP error response') {
    if (response.ok) {
      throw new Error(message);
    }
  },

  http4xx(response, message = 'Expected HTTP 4xx error') {
    if (response.status < 400 || response.status >= 500) {
      throw new Error(`${message} (got ${response.status})`);
    }
  },

  http400(response, message = 'Expected HTTP 400 Bad Request') {
    if (response.status !== 400) {
      throw new Error(`${message} (got ${response.status})`);
    }
  },

  http401(response, message = 'Expected HTTP 401 Unauthorized') {
    if (response.status !== 401) {
      throw new Error(`${message} (got ${response.status})`);
    }
  },

  http403(response, message = 'Expected HTTP 403 Forbidden') {
    if (response.status !== 403) {
      throw new Error(`${message} (got ${response.status})`);
    }
  },

  http404(response, message = 'Expected HTTP 404 Not Found') {
    if (response.status !== 404) {
      throw new Error(`${message} (got ${response.status})`);
    }
  },

  http422(response, message = 'Expected HTTP 422 Unprocessable Entity') {
    if (response.status !== 422) {
      throw new Error(`${message} (got ${response.status})`);
    }
  },

  // Data assertions
  hasProperty(obj, prop, message) {
    if (!(prop in obj)) {
      throw new Error(message || `Expected object to have property '${prop}'`);
    }
  },

  hasProperties(obj, props, message) {
    for (const prop of props) {
      if (!(prop in obj)) {
        throw new Error(message || `Expected object to have property '${prop}'`);
      }
    }
  },

  isArray(value, message = 'Expected value to be an array') {
    if (!Array.isArray(value)) {
      throw new Error(message);
    }
  },

  isObject(value, message = 'Expected value to be an object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(message);
    }
  },

  isString(value, message = 'Expected value to be a string') {
    if (typeof value !== 'string') {
      throw new Error(message);
    }
  },

  isNumber(value, message = 'Expected value to be a number') {
    if (typeof value !== 'number') {
      throw new Error(message);
    }
  },

  // Response time assertions
  responseTime(response, maxMs, message) {
    if (response.duration > maxMs) {
      throw new Error(message || `Response time ${response.duration}ms exceeded ${maxMs}ms`);
    }
  },

  // Validation error assertions
  hasValidationError(response, field, message) {
    const detail = response.data?.detail;
    if (!Array.isArray(detail)) {
      throw new Error(message || `Expected validation error array, got: ${JSON.stringify(response.data)}`);
    }
    const hasField = detail.some(e => e.field?.includes(field) || e.loc?.includes(field));
    if (!hasField) {
      throw new Error(message || `Expected validation error for field '${field}'`);
    }
  },
};

/**
 * Random helpers for test data generation
 */
export const random = {
  string(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  number(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  item(array) {
    return array[Math.floor(Math.random() * array.length)];
  },
};

/**
 * Print test summary
 */
export function printSummary() {
  const { passed, failed, skipped } = testResults;
  const total = passed + failed + skipped;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  console.log('\n══════════════════════════════════════════════════');
  console.log('\x1b[34mTest Summary\x1b[0m');
  console.log('──────────────────────────────────────────────────');
  console.log(`Total:   ${total}`);
  console.log(`\x1b[32mPassed:  ${passed}\x1b[0m`);
  console.log(`\x1b[31mFailed:  ${failed}\x1b[0m`);
  console.log(`\x1b[33mSkipped: ${skipped}\x1b[0m`);
  console.log(`Pass Rate: ${passRate}%`);
  console.log('══════════════════════════════════════════════════');
}

export default { describe, test, skip, assert, resetResults, getResults, printSummary };
