/**
 * Health Check API Tests
 */
import { client } from '../lib/client.js';
import { describe, test, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runHealthTests() {
  await describe('Health Check API', async () => {
    await test('GET /inference/health - Should return healthy status', async () => {
      const response = await client.get('/inference/health', { timeout: config.timeout.short });
      assert.httpOk(response, 'Health check should return 200');
    });

    await test('GET /inference/health - Response time should be acceptable', async () => {
      const response = await client.get('/inference/health', { timeout: config.timeout.short });
      assert.lessThan(response.duration, 2000, `Health check should respond within 2000ms`);
    });

    await test('GET /inference/ready - Should return ready status', async () => {
      const response = await client.get('/inference/ready', { timeout: config.timeout.short });
      assert.httpOk(response, 'Ready check should return 200');
    });

    await test('GET /inference/health - Should handle concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() => 
        client.get('/inference/health', { timeout: config.timeout.short })
      );
      const responses = await Promise.all(promises);
      responses.forEach((response, i) => {
        assert.httpOk(response, `Concurrent request ${i + 1} should succeed`);
      });
    });
  });
}

export default runHealthTests;
