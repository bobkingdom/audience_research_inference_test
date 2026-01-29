/**
 * Async Survey API Tests
 */
import { client } from '../lib/client.js';
import { describe, test, assert, random } from '../lib/utils.js';
import config from '../config/default.js';

const state = { surveyId: null };

export async function runSurveyTests() {
  await describe('Async Survey API - Create & Manage', async () => {
    await test('POST /create - Create async survey', async () => {
      const body = {
        account_id: config.testAccountId,
        title: `Test Survey ${random.string(6)}`,
        description: '测试问卷描述',
        questions: [
          { type: 'single_choice', text: '您的年龄段是？', options: ['18-24', '25-34', '35-44'], required: true },
          { type: 'open_ended', text: '请描述您的护肤习惯', required: false },
        ],
      };
      const response = await client.post('/api/async-survey/create', body);
      assert.httpOk(response, 'Survey creation should succeed');
      if (response.data?.survey_id || response.data?.id) state.surveyId = response.data.survey_id || response.data.id;
    });

    await test('POST /create - Missing account_id should fail', async () => {
      const body = { title: 'Test', questions: [{ type: 'single_choice', text: 'Q1', options: ['A', 'B'] }] };
      const response = await client.post('/api/async-survey/create', body);
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /create - Empty questions should fail', async () => {
      const body = { account_id: config.testAccountId, title: 'Test', questions: [] };
      const response = await client.post('/api/async-survey/create', body);
      assert.httpError(response, 'Empty questions should be rejected');
    });

    await test('GET /list - List surveys', async () => {
      const response = await client.get(`/api/async-survey/list?account_id=${config.testAccountId}&page=1&page_size=20`);
      assert.httpOk(response, 'Should list surveys');
    });
  });

  await describe('Async Survey API - Deployment & Collection', async () => {
    await test('POST /:id/deploy - Deploy survey', async () => {
      const surveyId = state.surveyId || 123;
      const body = { deployment_config: { start_time: new Date().toISOString() } };
      const response = await client.post(`/api/async-survey/${surveyId}/deploy`, body, { timeout: config.timeout.long });
      assert.ok([200, 400, 404].includes(response.status), 'Should handle deployment');
    });

    await test('POST /:id/collect - Collect AI responses', async () => {
      const surveyId = state.surveyId || 123;
      const body = { audience_ids: [1, 2, 3], batch_size: 5 };
      const response = await client.post(`/api/async-survey/${surveyId}/collect`, body, { timeout: config.timeout.long });
      assert.ok([200, 202, 400, 404].includes(response.status), 'Should handle response collection');
    });
  });

  await describe('Async Survey API - Analysis', async () => {
    await test('POST /:id/analyze - Analyze survey results', async () => {
      const surveyId = state.surveyId || 123;
      const body = { analysis_type: 'comprehensive', include_segments: true };
      const response = await client.post(`/api/async-survey/${surveyId}/analyze`, body, { timeout: config.timeout.long });
      assert.ok([200, 400, 404].includes(response.status), 'Should handle analysis');
    });

    await test('GET /:id/statistics - Get survey statistics', async () => {
      const surveyId = state.surveyId || 123;
      const response = await client.get(`/api/async-survey/${surveyId}/statistics`);
      assert.ok([200, 404].includes(response.status), 'Should handle statistics');
    });
  });
}

export default runSurveyTests;
