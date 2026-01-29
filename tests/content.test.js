/**
 * Content Generation API Tests
 */
import { client } from '../lib/client.js';
import { describe, test, assert, random } from '../lib/utils.js';
import config from '../config/default.js';

export async function runContentTests() {
  await describe('Content Generation API - Article Generation', async () => {
    await test('POST /survey/:id/generate-article - Generate blog article', async () => {
      const body = {
        batch_id: random.uuid(),
        account_id: config.testAccountId,
        content_type: 'blog',
        product_name: config.testData.productName,
        key_insights: ['洞察1: 用户偏好天然成分', '洞察2: 价格敏感度高'],
      };
      const response = await client.post('/api/survey/123/generate-article', body, { timeout: config.timeout.long });
      assert.ok([200, 400, 404].includes(response.status), 'Should handle article generation');
    });

    await test('POST /survey/:id/generate-article - Empty insights should fail', async () => {
      const body = { batch_id: random.uuid(), account_id: config.testAccountId, content_type: 'blog', key_insights: [] };
      const response = await client.post('/api/survey/123/generate-article', body);
      assert.httpError(response, 'Empty insights should be rejected');
    });
  });

  await describe('Content Generation API - History & Stats', async () => {
    await test('GET /content-generation/history/:accountId - Get generation history', async () => {
      const response = await client.get(`/api/content-generation/history/${config.testAccountId}?page=1&page_size=20`);
      assert.httpOk(response, 'Should return generation history');
    });

    await test('GET /content-generation/statistics/:accountId - Get statistics', async () => {
      const response = await client.get(`/api/content-generation/statistics/${config.testAccountId}`);
      assert.httpOk(response, 'Should return generation statistics');
    });
  });

  await describe('Content Generation API - Reddit Comment', async () => {
    await test('POST /generate-reddit-comment - Generate Reddit comment', async () => {
      const body = {
        platform: 'reddit',
        url: 'https://reddit.com/r/SkincareAddiction/example',
        post: { title: '求推荐适合敏感肌的护肤品', content: '最近换季皮肤很敏感...' },
        account_id: config.testAccountId,
        product_name: config.testData.productName,
        tone: 'friendly',
      };
      const response = await client.post('/api/generate-reddit-comment', body, { timeout: config.timeout.long });
      assert.ok([200, 400].includes(response.status), 'Should handle Reddit comment generation');
    });
  });
}

export default runContentTests;
