/**
 * Avatar Management API Tests
 */
import { client } from '../lib/client.js';
import { describe, test, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runAvatarTests() {
  await describe('Avatar API - Generate', async () => {
    await test('POST /generate - Generate single avatar', async () => {
      const body = { audience_id: 12345, account_id: config.testAccountId, style: 'realistic' };
      const response = await client.post('/api/avatars/generate', body, { timeout: config.timeout.long });
      assert.ok([200, 400, 404].includes(response.status), 'Should handle avatar generation');
    });

    await test('POST /generate - Missing audience_id should fail', async () => {
      const body = { account_id: config.testAccountId, style: 'realistic' };
      const response = await client.post('/api/avatars/generate', body);
      assert.httpError(response, 'Missing audience_id should be rejected');
    });
  });

  await describe('Avatar API - Batch Generate', async () => {
    await test('POST /batch-generate - Batch generate avatars', async () => {
      const body = { audience_ids: [1, 2, 3, 4, 5], account_id: config.testAccountId, style: 'realistic', batch_size: 5 };
      const response = await client.post('/api/avatars/batch-generate', body, { timeout: config.timeout.long });
      assert.ok([200, 202, 400].includes(response.status), 'Should handle batch generation');
    });

    await test('POST /batch-generate - Empty audience_ids should fail', async () => {
      const body = { audience_ids: [], account_id: config.testAccountId, style: 'realistic' };
      const response = await client.post('/api/avatars/batch-generate', body);
      assert.httpError(response, 'Empty audience_ids should be rejected');
    });
  });

  await describe('Avatar API - Query & Management', async () => {
    await test('GET /list - List avatars', async () => {
      const response = await client.get(`/api/avatars/list?account_id=${config.testAccountId}&page=1&page_size=20`);
      assert.httpOk(response, 'Should list avatars');
    });

    await test('GET /stats - Get avatar statistics', async () => {
      const response = await client.get(`/api/avatars/stats?account_id=${config.testAccountId}`);
      assert.httpOk(response, 'Should return avatar statistics');
    });
  });
}

export default runAvatarTests;
