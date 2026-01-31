/**
 * Workflow Tests - Chained API calls
 * Tests that depend on previous API responses
 * 
 * Flow: Login → Create Task → Intent Analysis → Personas → Query Task
 */
import { client } from '../lib/client.js';
import { chain } from '../lib/chain.js';
import { login, getAccountId, getToken } from '../lib/auth.js';
import { describe, test, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runWorkflowTests() {
  const { testData, timeout } = config;

  // ═══════════════════════════════════════════════════════════════════
  // Login Flow
  // ═══════════════════════════════════════════════════════════════════
  await describe('Workflow - Authentication', async () => {
    await test('Login and get account_id', async () => {
      // Skip if no credentials configured
      if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
        // Use existing JWT token if available
        if (getToken()) {
          chain.set('accountId', getAccountId(), 'config');
          assert.ok(true, 'Using configured JWT token');
          return;
        }
        throw new Error('No credentials or JWT token configured');
      }

      // Arrange
      const email = process.env.TEST_EMAIL;
      const password = process.env.TEST_PASSWORD;

      // Act
      const auth = await login(email, password);

      // Assert
      assert.ok(auth.token, 'Should receive JWT token');
      assert.ok(auth.accountId, 'Should receive account_id');

      // Store for subsequent tests
      chain.set('accountId', auth.accountId, 'login');
      chain.set('token', auth.token, 'login');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Complete Audience Generation Workflow
  // ═══════════════════════════════════════════════════════════════════
  await describe('Workflow - Audience Generation Pipeline', async () => {
    await test('Step 1: Create task', async () => {
      // Arrange
      const accountId = chain.get('accountId') || getAccountId();
      const body = {
        account_id: accountId,
        task_name: `工作流测试_${Date.now()}`,
        user_input: testData.userInput
      };

      // Act
      const response = await client.post('/api/v1/audience-generate/task/create', body, {
        timeout: timeout.long
      });

      // Assert
      assert.httpOk(response, 'Task creation should succeed');
      assert.hasProperty(response.data, 'task_id', 'Response should have task_id');

      // Store for next steps
      chain.set('taskId', response.data.task_id, 'task/create');
      chain.set('taskData', response.data, 'task/create');
    });

    await test('Step 2: Execute intent analysis', async () => {
      // Arrange
      const taskId = chain.get('taskId');
      if (!taskId) {
        throw new Error('No taskId from previous step');
      }

      const body = {
        user_input: testData.userInput
      };

      // Act
      const response = await client.post(`/api/v1/audience-generate/task/${taskId}/intent`, body, {
        timeout: timeout.long
      });

      // Assert
      assert.httpOk(response, 'Intent analysis should succeed');

      // Store intent data
      if (response.data?.intent) {
        chain.set('intentData', response.data.intent, 'task/intent');
      }
    });

    await test('Step 3: Generate personas', async () => {
      // Arrange
      const taskId = chain.get('taskId');
      if (!taskId) {
        throw new Error('No taskId from previous step');
      }

      const body = {
        segment_count: testData.segmentCount
      };

      // Act
      const response = await client.post(`/api/v1/audience-generate/task/${taskId}/personas`, body, {
        timeout: timeout.veryLong
      });

      // Assert
      assert.httpOk(response, 'Personas generation should succeed');

      // Store personas data
      if (response.data?.personas) {
        chain.set('personas', response.data.personas, 'task/personas');
      }
    });

    await test('Step 4: Query task progress', async () => {
      // Arrange
      const taskId = chain.get('taskId');
      if (!taskId) {
        throw new Error('No taskId from previous step');
      }

      // Act
      const response = await client.get(`/api/v1/audience-generate/task/${taskId}?include_details=true`);

      // Assert
      assert.httpOk(response, 'Task query should succeed');
      assert.hasProperty(response.data, 'status', 'Response should have status');

      // Store task status
      chain.set('taskStatus', response.data.status, 'task/query');
    });

    await test('Step 5: Analyze resume state', async () => {
      // Arrange
      const taskId = chain.get('taskId');
      if (!taskId) {
        throw new Error('No taskId from previous step');
      }

      // Act
      const response = await client.get(`/api/v1/audience-generate/task/${taskId}/analyze-resume`);

      // Assert
      assert.httpOk(response, 'Analyze resume should succeed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Focus Group Workflow
  // ═══════════════════════════════════════════════════════════════════
  await describe('Workflow - Focus Group Pipeline', async () => {
    await test('Step 1: Create focus group', async () => {
      // Arrange
      const accountId = chain.get('accountId') || getAccountId();
      const body = {
        account_id: accountId,
        title: `工作流焦点小组_${Date.now()}`,
        topic: '了解用户护肤习惯',
        background: '市场调研背景',
        research_objectives: ['了解购买动机', '了解使用场景']
      };

      // Act
      const response = await client.post('/api/focus-group/create', body, {
        timeout: timeout.long
      });

      // Assert
      assert.httpOk(response, 'Focus group creation should succeed');
      assert.hasProperty(response.data, 'id', 'Response should have id');

      // Store for next steps
      chain.set('focusGroupId', response.data.id, 'focus-group/create');
    });

    await test('Step 2: List focus groups', async () => {
      // Arrange
      const accountId = chain.get('accountId') || getAccountId();

      // Act
      const response = await client.get(`/api/focus-group/list?account_id=${accountId}&page=1&page_size=10`);

      // Assert
      assert.httpOk(response, 'List focus groups should succeed');
      assert.hasProperty(response.data, 'focus_groups', 'Response should have focus_groups');
    });

    await test('Step 3: Get focus group details', async () => {
      // Arrange
      const focusGroupId = chain.get('focusGroupId');
      if (!focusGroupId) {
        throw new Error('No focusGroupId from previous step');
      }

      // Act - using the participants/list endpoint as a way to get details
      const response = await client.post(`/api/focus-group/${focusGroupId}/participants/list`, {
        page: 1,
        page_size: 10
      });

      // Assert
      assert.httpOk(response, 'Get focus group details should succeed');
    });

    await test('Step 4: Check questions ready', async () => {
      // Arrange
      const focusGroupId = chain.get('focusGroupId');
      if (!focusGroupId) {
        throw new Error('No focusGroupId from previous step');
      }

      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/check-questions-ready`, null);

      // Assert
      assert.httpOk(response, 'Check questions ready should succeed');
    });

    await test('Step 5: Update focus group', async () => {
      // Arrange
      const focusGroupId = chain.get('focusGroupId');
      if (!focusGroupId) {
        throw new Error('No focusGroupId from previous step');
      }

      const body = {
        title: `工作流焦点小组_已更新_${Date.now()}`
      };

      // Act
      const response = await client.patch(`/api/focus-group/${focusGroupId}`, body);

      // Assert
      assert.httpOk(response, 'Update focus group should succeed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Vector Search Workflow
  // ═══════════════════════════════════════════════════════════════════
  await describe('Workflow - Vector Search Pipeline', async () => {
    await test('Step 1: Check vector health', async () => {
      // Act
      const response = await client.get('/api/v1/vector/health', { timeout: timeout.short });

      // Assert
      assert.httpOk(response, 'Vector health should be OK');
      chain.set('vectorHealthy', response.data?.status === 'healthy', 'vector/health');
    });

    await test('Step 2: Get vector stats', async () => {
      // Act
      const response = await client.get('/api/v1/vector/stats');

      // Assert
      assert.httpOk(response, 'Vector stats should succeed');
    });

    await test('Step 3: Semantic search', async () => {
      // Arrange
      const accountId = chain.get('accountId') || getAccountId();
      const body = {
        query: '年轻女性护肤品用户画像',
        account_id: accountId,
        top_k: 5
      };

      // Act
      const response = await client.post('/api/v1/vector/search/semantic', body, {
        timeout: timeout.long
      });

      // Assert
      assert.httpOk(response, 'Semantic search should succeed');

      // Store first result for similarity search
      if (response.data?.results?.[0]?.audience_id) {
        chain.set('searchResultAudienceId', response.data.results[0].audience_id, 'vector/semantic');
      }
    });

    await test('Step 4: Similarity search (using previous result)', async () => {
      // Arrange
      const audienceId = chain.get('searchResultAudienceId');
      const accountId = chain.get('accountId') || getAccountId();

      if (!audienceId) {
        // Skip if no audience from previous search
        assert.ok(true, 'Skipped - no audience from previous search');
        return;
      }

      const body = {
        audience_id: audienceId,
        account_id: accountId,
        top_k: 5
      };

      // Act
      const response = await client.post('/api/v1/vector/search/similar', body, {
        timeout: timeout.long
      });

      // Assert
      assert.httpOk(response, 'Similarity search should succeed');
    });
  });

  // Print chain state for debugging
  if (config.verbose) {
    chain.printState();
  }
}

export default runWorkflowTests;
