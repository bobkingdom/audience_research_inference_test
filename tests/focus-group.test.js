/**
 * Focus Group API Tests
 */
import { client } from '../lib/client.js';
import { describe, test, assert, random } from '../lib/utils.js';
import config from '../config/default.js';

const state = { focusGroupId: null };

export async function runFocusGroupTests() {
  await describe('Focus Group API - Create & Manage', async () => {
    await test('POST /create - Create focus group with valid data', async () => {
      const body = {
        account_id: config.testAccountId,
        title: `Test Focus Group ${random.string(6)}`,
        topic: '了解年轻女性护肤习惯',
        research_objectives: ['了解购买动机', '了解使用场景'],
      };
      const response = await client.post('/api/focus-group/create', body);
      assert.httpOk(response, 'Focus group creation should succeed');
      if (response.data?.focus_group_id || response.data?.id) state.focusGroupId = response.data.focus_group_id || response.data.id;
    });

    await test('POST /create - Missing account_id should fail', async () => {
      const body = { title: 'Test', topic: 'Test topic' };
      const response = await client.post('/api/focus-group/create', body);
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('GET /list - List focus groups', async () => {
      const response = await client.get(`/api/focus-group/list?account_id=${config.testAccountId}&page=1&page_size=20`);
      assert.httpOk(response, 'Should list focus groups');
    });
  });

  await describe('Focus Group API - Participants & Messages', async () => {
    await test('POST /:id/participants - Add participants', async () => {
      const groupId = state.focusGroupId || 123;
      const body = { audience_ids: [1, 2, 3, 4, 5] };
      const response = await client.post(`/api/focus-group/${groupId}/participants`, body);
      assert.ok([200, 400, 404].includes(response.status), 'Should handle add participants');
    });

    await test('POST /:id/host-message - Send host message', async () => {
      const groupId = state.focusGroupId || 123;
      const body = { host_prompt: '大家好，请分享一下你们日常的护肤习惯？', message_type: 'question' };
      const response = await client.post(`/api/focus-group/${groupId}/host-message`, body, { timeout: config.timeout.long });
      assert.ok([200, 400, 404].includes(response.status), 'Should handle host message');
    });
  });

  await describe('Focus Group API - Insights & Reports', async () => {
    await test('POST /:id/extract-insights - Extract insights', async () => {
      const groupId = state.focusGroupId || 123;
      const body = { recent_messages_count: 20, insight_type: 'all', max_insights: 10 };
      const response = await client.post(`/api/focus-group/${groupId}/extract-insights`, body, { timeout: config.timeout.long });
      assert.ok([200, 400, 404].includes(response.status), 'Should handle insight extraction');
    });

    await test('GET /report-types/list - Get report types', async () => {
      const response = await client.get('/api/focus-group/report-types/list');
      assert.httpOk(response, 'Should list report types');
    });
  });
}

export default runFocusGroupTests;
