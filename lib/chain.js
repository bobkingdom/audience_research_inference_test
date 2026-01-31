/**
 * Test Chain Manager
 * Handles dependent tests where output from one becomes input to another
 * 
 * Usage:
 *   const chain = new TestChain();
 *   chain.set('taskId', '123');
 *   const taskId = chain.get('taskId');
 */

class TestChain {
  constructor() {
    this.data = {};
    this.history = [];
  }

  /**
   * Store a value from a test result
   * @param {string} key - Key to store under
   * @param {any} value - Value to store
   * @param {string} [source] - Optional source description
   */
  set(key, value, source = '') {
    this.data[key] = value;
    this.history.push({
      action: 'set',
      key,
      value,
      source,
      timestamp: new Date().toISOString(),
    });
    return this;
  }

  /**
   * Get a stored value
   * @param {string} key - Key to retrieve
   * @param {any} [defaultValue] - Default if not found
   */
  get(key, defaultValue = null) {
    return this.data[key] ?? defaultValue;
  }

  /**
   * Check if a key exists
   */
  has(key) {
    return key in this.data;
  }

  /**
   * Get all stored data
   */
  getAll() {
    return { ...this.data };
  }

  /**
   * Clear all stored data
   */
  clear() {
    this.data = {};
    this.history = [];
  }

  /**
   * Get execution history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Print current state (for debugging)
   */
  printState() {
    console.log('\n📦 Test Chain State:');
    for (const [key, value] of Object.entries(this.data)) {
      const display = typeof value === 'object' ? JSON.stringify(value).slice(0, 50) : value;
      console.log(`  ${key}: ${display}`);
    }
    console.log('');
  }
}

// Singleton instance for global use
export const chain = new TestChain();

export default TestChain;
