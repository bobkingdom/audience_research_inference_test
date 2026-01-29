/**
 * Vector Search API Tests
 */
import { client } from '../lib/client.js';
import { describe, test, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runVectorTests() {
  await describe('Vector Search API - Health & Stats', async () => {
    await test('GET /health - Vector service health check', async () => {
      const response = await client.get('/api/v1/vector/health', { timeout: config.timeout.short });
      assert.httpOk(response, 'Vector health check should succeed');
    });

    await test('GET /stats - Get search statistics', async () => {
      const response = await client.get('/api/v1/vector/stats');
      assert.httpOk(response, 'Should return vector stats');
    });

    await test('POST /stats/account - Account vector statistics', async () => {
      const body = { account_id: config.testAccountId };
      const response = await client.post('/api/v1/vector/stats/account', body);
      assert.httpOk(response, 'Should return account vector stats');
    });
  });

  await describe('Vector Search API - Semantic Search', async () => {
    await test('POST /search/semantic - Valid semantic search', async () => {
      const body = { query: '年轻女性护肤品用户', limit: 10, threshold: 0.7, account_id: config.testAccountId };
      const response = await client.post('/api/v1/vector/search/semantic', body, { timeout: config.timeout.long });
      assert.httpOk(response, 'Semantic search should succeed');
    });

    await test('POST /search/semantic - Empty query should fail', async () => {
      const body = { query: '', limit: 10, account_id: config.testAccountId };
      const response = await client.post('/api/v1/vector/search/semantic', body);
      assert.httpError(response, 'Empty query should be rejected');
    });

    await test('POST /search/semantic - Missing account_id should fail', async () => {
      const body = { query: '测试查询', limit: 10 };
      const response = await client.post('/api/v1/vector/search/semantic', body);
      assert.httpError(response, 'Missing account_id should be rejected');
    });
  });

  await describe('Vector Search API - Similarity & Multimodal', async () => {
    await test('POST /search/similar - Valid similarity search', async () => {
      const body = { reference_id: 12345, limit: 10, threshold: 0.8 };
      const response = await client.post('/api/v1/vector/search/similar', body, { timeout: config.timeout.long });
      assert.ok([200, 404].includes(response.status), 'Should handle similarity search');
    });

    await test('POST /search/multimodal - Text-only multimodal search', async () => {
      const body = { text_query: '年轻女性', limit: 10 };
      const response = await client.post('/api/v1/vector/search/multimodal', body, { timeout: config.timeout.long });
      assert.ok([200, 400].includes(response.status), 'Should handle text-only multimodal');
    });
  });
}

export default runVectorTests;
