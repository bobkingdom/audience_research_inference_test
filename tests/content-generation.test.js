/**
 * Content Generation API Tests
 * Endpoints: /api/content-generation/*, /api/generate-reddit-comment, /api/survey/:id/generate-article
 */
import { client } from '../lib/client.js';
import { describe, test, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runContentGenerationTests() {
  const { testAccountId, timeout } = config;

  // ═══════════════════════════════════════════════════════════════════
  // Content Generation History & Stats
  // ═══════════════════════════════════════════════════════════════════
  await describe('Content Generation - History & Stats', async () => {
    await test('GET /api/content-generation/history/:account_id - Get history', async () => {
      // Arrange & Act
      const response = await client.get(
        `/api/content-generation/history/${testAccountId}?page=1&page_size=20`
      );
      
      // Assert
      assert.httpOk(response, 'Get content history should succeed');
    });

    await test('GET /api/content-generation/history/:account_id - Invalid account should handle', async () => {
      // Arrange & Act
      const response = await client.get('/api/content-generation/history/999999?page=1&page_size=20');
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Invalid account should be handled');
    });

    await test('GET /api/content-generation/statistics/:account_id - Get statistics', async () => {
      // Arrange & Act
      const response = await client.get(`/api/content-generation/statistics/${testAccountId}`);
      
      // Assert
      assert.httpOk(response, 'Get content statistics should succeed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Content Update
  // ═══════════════════════════════════════════════════════════════════
  await describe('Content Generation - Update', async () => {
    await test('PUT /api/content-generation/update - Update content', async () => {
      // Arrange
      const body = {
        content_id: 123,
        account_id: testAccountId,
        updates: {
          title: '更新后的标题',
          status: 'published'
        }
      };
      
      // Act
      const response = await client.put('/api/content-generation/update', body);
      
      // Assert
      assert.ok([200, 404, 422].includes(response.status), 'Update content should handle request');
    });

    await test('PUT /api/content-generation/update - Missing content_id should fail', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        updates: { title: 'Test' }
      };
      
      // Act
      const response = await client.put('/api/content-generation/update', body);
      
      // Assert
      assert.httpError(response, 'Missing content_id should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Reddit Comment Generation
  // ═══════════════════════════════════════════════════════════════════
  await describe('Content Generation - Reddit Comment', async () => {
    await test('POST /api/generate-reddit-comment - Generate Reddit comment', async () => {
      // Arrange
      const body = {
        audience_id: 12345,
        account_id: testAccountId,
        post_context: {
          title: '推荐一款好用的护肤品',
          subreddit: 'skincare',
          content: '最近皮肤状态不太好，求推荐适合敏感肌的护肤品'
        },
        comment_style: 'helpful'
      };
      
      // Act
      const response = await client.post('/api/generate-reddit-comment', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Generate Reddit comment should handle request');
    });

    await test('POST /api/generate-reddit-comment - Missing audience_id should fail', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        post_context: {
          title: 'Test',
          content: 'Test content'
        }
      };
      
      // Act
      const response = await client.post('/api/generate-reddit-comment', body);
      
      // Assert
      assert.httpError(response, 'Missing audience_id should be rejected');
    });

    await test('POST /api/generate-reddit-comment - Missing post_context should fail', async () => {
      // Arrange
      const body = {
        audience_id: 12345,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/generate-reddit-comment', body);
      
      // Assert
      assert.httpError(response, 'Missing post_context should be rejected');
    });

    await test('POST /api/generate-reddit-comment - Empty post content should fail', async () => {
      // Arrange
      const body = {
        audience_id: 12345,
        account_id: testAccountId,
        post_context: {
          title: '',
          content: ''
        }
      };
      
      // Act
      const response = await client.post('/api/generate-reddit-comment', body);
      
      // Assert
      assert.httpError(response, 'Empty post content should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Survey Article Generation
  // ═══════════════════════════════════════════════════════════════════
  await describe('Content Generation - Survey Article', async () => {
    await test('POST /api/survey/:id/generate-article - Generate article from survey', async () => {
      // Arrange
      const surveyId = 123;
      const body = {
        account_id: testAccountId,
        article_type: 'summary',
        language: 'Chinese'
      };
      
      // Act
      const response = await client.post(`/api/survey/${surveyId}/generate-article`, body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 404, 422].includes(response.status), 'Generate article should handle request');
    });

    await test('POST /api/survey/:id/generate-article - Missing account_id should fail', async () => {
      // Arrange
      const surveyId = 123;
      const body = {
        article_type: 'summary'
      };
      
      // Act
      const response = await client.post(`/api/survey/${surveyId}/generate-article`, body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /api/survey/:id/generate-article - Invalid survey should return 404', async () => {
      // Arrange
      const surveyId = 999999;
      const body = {
        account_id: testAccountId,
        article_type: 'summary'
      };
      
      // Act
      const response = await client.post(`/api/survey/${surveyId}/generate-article`, body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([404, 422].includes(response.status), 'Invalid survey should return 404 or 422');
    });
  });
}

export default runContentGenerationTests;
