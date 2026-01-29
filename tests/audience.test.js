/**
 * Audience Generation API Tests
 */
import { client } from '../lib/client.js';
import { describe, test, assert, random } from '../lib/utils.js';
import config from '../config/default.js';

const state = { taskId: null, segmentId: null, audienceId: null };

export async function runAudienceTests() {
  await describe('Audience Generation - Intent Analysis', async () => {
    await test('POST /intent-analysis - Valid input should return intent', async () => {
      const body = { user_input: config.testData.userInput };
      const response = await client.post('/api/v1/audience-generate/intent-analysis', body);
      assert.httpOk(response, 'Intent analysis should succeed');
    });

    await test('POST /intent-analysis - Empty input should fail', async () => {
      const body = { user_input: '' };
      const response = await client.post('/api/v1/audience-generate/intent-analysis', body);
      assert.httpError(response, 'Empty input should be rejected');
    });

    await test('POST /intent-analysis - Missing user_input should fail', async () => {
      const response = await client.post('/api/v1/audience-generate/intent-analysis', {});
      assert.httpError(response, 'Missing user_input should be rejected');
    });
  });

  await describe('Audience Generation - Personas', async () => {
    await test('POST /personas - Valid input should generate personas', async () => {
      const body = { user_input: config.testData.userInput, segment_count: config.testData.segmentCount };
      const response = await client.post('/api/v1/audience-generate/personas', body, { timeout: config.timeout.long });
      assert.httpOk(response, 'Persona generation should succeed');
    });

    await test('POST /personas - segment_count=0 should fail', async () => {
      const body = { user_input: config.testData.userInput, segment_count: 0 };
      const response = await client.post('/api/v1/audience-generate/personas', body);
      assert.httpError(response, 'Zero segment_count should be rejected');
    });
  });

  await describe('Audience Generation - Task Management', async () => {
    await test('POST /task/create - Create new task', async () => {
      const body = { account_id: config.testAccountId, task_name: `Test Task ${random.string(8)}`, user_input: config.testData.userInput };
      const response = await client.post('/api/v1/audience-generate/task/create', body);
      assert.httpOk(response, 'Task creation should succeed');
      if (response.data?.task_id || response.data?.id) state.taskId = response.data.task_id || response.data.id;
    });

    await test('POST /task/create - Missing account_id should fail', async () => {
      const body = { task_name: 'Test Task', user_input: config.testData.userInput };
      const response = await client.post('/api/v1/audience-generate/task/create', body);
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('GET /task/:id - Non-existent task should return 404', async () => {
      const response = await client.get('/api/v1/audience-generate/task/999999999');
      assert.httpStatus(response, 404, 'Non-existent task should return 404');
    });
  });

  await describe('Audience Generation - Segments & Audiences', async () => {
    await test('POST /segment/rename - Rename segment', async () => {
      const body = { segment_id: 1327, generate_language: 'Chinese', async_mode: false, update_db: false };
      const response = await client.post('/api/v1/audience-generate/segment/rename', body, { timeout: config.timeout.long });
      assert.ok([200, 404].includes(response.status), 'Should handle segment rename');
    });

    await test('POST /audience/insight - Get audience insight', async () => {
      const body = { audience_id: 12345, insight_type: 'comprehensive' };
      const response = await client.post('/api/v1/audience-generate/audience/insight', body, { timeout: config.timeout.long });
      assert.ok([200, 404].includes(response.status), 'Should handle insight request');
    });
  });

  await describe('Audience Generation - Interview Extraction', async () => {
    await test('POST /interview/extract - Extract from interview', async () => {
      const body = {
        interview_transcript: '这是一段测试访谈内容...',
        account_id: config.testAccountId,
        product_info: { category: '护肤品', name: config.testData.productName },
      };
      const response = await client.post('/api/v1/audience-generate/interview/extract', body, { timeout: config.timeout.long });
      assert.ok([200, 400].includes(response.status), 'Should handle interview extraction');
    });

    await test('GET /interview/extractions - List extractions', async () => {
      const response = await client.get(`/api/v1/audience-generate/interview/extractions?account_id=${config.testAccountId}&page=1&page_size=20`);
      assert.httpOk(response, 'Should list extractions');
    });
  });
}

export default runAudienceTests;
