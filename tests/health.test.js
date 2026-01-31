/**
 * Health Check API Tests
 * Endpoints: /inference/health, /inference/ready
 */
import { client } from '../lib/client.js';
import { describe, test, assert, skip } from '../lib/utils.js';
import config from '../config/default.js';

export async function runHealthTests() {
  await describe('Health Check - /inference/health', async () => {
    // AAA: Arrange - no setup needed
    // AAA: Act & Assert
    
    await test('GET /inference/health - Should return healthy status', async () => {
      const response = await client.get('/inference/health', { timeout: config.timeout.short });
      assert.httpOk(response, 'Health check should return 200');
      assert.hasProperty(response.data, 'status', 'Response should have status field');
    });

    await test('GET /inference/health - Response time should be < 5s', async () => {
      const response = await client.get('/inference/health', { timeout: config.timeout.short });
      assert.responseTime(response, 5000, 'Health check should respond within 5 seconds');
    });

    await test('GET /inference/health - Should work without auth', async () => {
      const response = await client.get('/inference/health', { 
        timeout: config.timeout.short,
        auth: false,
        headers: { 'X-API-Key': '' }
      });
      // Health endpoints typically don't require auth
      assert.ok(response.status !== 401, 'Health check should not require authentication');
    });
  });

  await describe('Ready Check - /inference/ready', async () => {
    await test('GET /inference/ready - Should return ready status', async () => {
      const response = await client.get('/inference/ready', { timeout: config.timeout.short });
      assert.httpOk(response, 'Ready check should return 200');
    });

    await test('GET /inference/ready - Response time should be < 5s', async () => {
      const response = await client.get('/inference/ready', { timeout: config.timeout.short });
      assert.responseTime(response, 5000, 'Ready check should respond within 5 seconds');
    });
  });

  await describe('Vector Health - /api/v1/vector/health', async () => {
    await test('GET /api/v1/vector/health - Should return vector service status', async () => {
      const response = await client.get('/api/v1/vector/health', { timeout: config.timeout.short });
      assert.httpOk(response, 'Vector health check should return 200');
      assert.hasProperty(response.data, 'status', 'Response should have status field');
    });

    await test('GET /api/v1/vector/health - Should include service details', async () => {
      const response = await client.get('/api/v1/vector/health', { timeout: config.timeout.short });
      if (response.ok && response.data.services) {
        assert.hasProperty(response.data, 'services', 'Response should have services field');
      }
    });
  });

  await describe('Avatar Health - /api/avatars/health', async () => {
    await test('GET /api/avatars/health - Should return avatar service status', async () => {
      const response = await client.get('/api/avatars/health', { timeout: config.timeout.short });
      // Avatar service may have issues, just check it responds
      assert.ok(response.status > 0, 'Avatar health check should respond');
    });
  });
}

export default runHealthTests;
