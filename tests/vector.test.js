/**
 * Vector Search API Tests
 * Endpoints: /api/v1/vector/*
 */
import { client } from '../lib/client.js';
import { describe, test, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runVectorTests() {
  const { testAccountId, timeout } = config;

  // ═══════════════════════════════════════════════════════════════════
  // Health & Stats
  // ═══════════════════════════════════════════════════════════════════
  await describe('Vector API - Health & Stats', async () => {
    await test('GET /api/v1/vector/health - Vector service health', async () => {
      const response = await client.get('/api/v1/vector/health', { timeout: timeout.short });
      assert.httpOk(response, 'Vector health should return 200');
      assert.hasProperty(response.data, 'status', 'Response should have status');
    });

    await test('GET /api/v1/vector/stats - Vector statistics', async () => {
      const response = await client.get('/api/v1/vector/stats');
      assert.httpOk(response, 'Vector stats should return 200');
    });

    await test('POST /api/v1/vector/stats/account - Account vector stats', async () => {
      // Arrange
      const body = { account_id: testAccountId };
      
      // Act
      const response = await client.post('/api/v1/vector/stats/account', body);
      
      // Assert
      assert.httpOk(response, 'Account vector stats should succeed');
    });

    await test('POST /api/v1/vector/stats/account - Missing account_id should fail', async () => {
      // Arrange
      const body = {};
      
      // Act
      const response = await client.post('/api/v1/vector/stats/account', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /api/v1/vector/stats/task - Task vector stats', async () => {
      // Arrange
      const body = { task_id: 123 };
      
      // Act
      const response = await client.post('/api/v1/vector/stats/task', body);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Task stats should handle request');
    });

    await test('POST /api/v1/vector/stats/distribution - Vector distribution', async () => {
      // Arrange
      const body = { account_id: testAccountId };
      
      // Act
      const response = await client.post('/api/v1/vector/stats/distribution', body);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Distribution stats should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Semantic Search
  // ═══════════════════════════════════════════════════════════════════
  await describe('Vector API - Semantic Search', async () => {
    await test('POST /search/semantic - Valid semantic search', async () => {
      // Arrange
      const body = {
        query: '年轻女性护肤品用户',
        account_id: testAccountId,
        top_k: 10
      };
      
      // Act
      const response = await client.post('/api/v1/vector/search/semantic', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Semantic search should succeed');
    });

    await test('POST /search/semantic - Empty query should fail', async () => {
      // Arrange
      const body = {
        query: '',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/v1/vector/search/semantic', body);
      
      // Assert
      assert.httpError(response, 'Empty query should be rejected');
    });

    await test('POST /search/semantic - Missing account_id should fail', async () => {
      // Arrange
      const body = {
        query: '测试查询'
      };
      
      // Act
      const response = await client.post('/api/v1/vector/search/semantic', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /search/semantic - With filters', async () => {
      // Arrange
      const body = {
        query: '护肤品用户',
        account_id: testAccountId,
        top_k: 5,
        score_threshold: 0.5
      };
      
      // Act
      const response = await client.post('/api/v1/vector/search/semantic', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Semantic search with filters should succeed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Similarity Search
  // ═══════════════════════════════════════════════════════════════════
  await describe('Vector API - Similarity Search', async () => {
    await test('POST /search/similar - Valid similarity search', async () => {
      // Arrange
      const body = {
        audience_id: 12345,
        account_id: testAccountId,
        top_k: 10
      };
      
      // Act
      const response = await client.post('/api/v1/vector/search/similar', body, {
        timeout: timeout.long
      });
      
      // Assert - may fail if audience doesn't exist
      assert.ok([200, 404, 422].includes(response.status), 'Similarity search should handle request');
    });

    await test('POST /search/similar - Missing audience_id should fail', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        top_k: 10
      };
      
      // Act
      const response = await client.post('/api/v1/vector/search/similar', body);
      
      // Assert
      assert.httpError(response, 'Missing audience_id should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Multimodal Search
  // ═══════════════════════════════════════════════════════════════════
  await describe('Vector API - Multimodal Search', async () => {
    await test('POST /search/multimodal - Text-only multimodal search', async () => {
      // Arrange
      const body = {
        text_query: '年轻女性护肤习惯',
        account_id: testAccountId,
        top_k: 10
      };
      
      // Act
      const response = await client.post('/api/v1/vector/search/multimodal', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Multimodal search should succeed');
    });

    await test('POST /search/multimodal - Empty text_query should fail', async () => {
      // Arrange
      const body = {
        text_query: '',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/v1/vector/search/multimodal', body);
      
      // Assert
      assert.httpError(response, 'Empty text_query should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Index Management
  // ═══════════════════════════════════════════════════════════════════
  await describe('Vector API - Index Management', async () => {
    await test('POST /reload-index - Reload vector index', async () => {
      // Arrange
      const body = {};
      
      // Act
      const response = await client.post('/api/v1/vector/reload-index', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Reload index should succeed');
    });

    // Skip rebuild-index as it's a heavy operation
    // await test('POST /rebuild-index - Rebuild vector index', async () => { ... });
  });
}

export default runVectorTests;
