/**
 * Task Management API Tests
 * Endpoints: /api/tasks/*
 * 
 * IMPORTANT: Task IDs come from /api/audience/generate-async
 * Must create a task first before querying it
 */
import { client } from '../lib/client.js';
import { describe, test, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runTaskTests() {
  const { testAccountId, testData, timeout } = config;
  
  // Will be populated by workflow
  let createdTaskId = null;

  // ═══════════════════════════════════════════════════════════════════
  // Task Creation (via /api/audience/generate-async)
  // ═══════════════════════════════════════════════════════════════════
  await describe('Tasks API - Create Task (Prerequisite)', async () => {
    await test('POST /api/audience/generate-async - Create task for testing', async () => {
      // Arrange
      const body = {
        product_description: testData.productDescription || '面向年轻女性的高端护肤品',
        market_context: '中国美妆市场',
        segment_count: 2,
        user_count: 3,
        target_continent: 'Asia',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/audience/generate-async', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Should create audience generation task');
      assert.hasProperty(response.data, 'task_id', 'Response should contain task_id');
      
      // Save for subsequent tests
      if (response.ok && response.data?.task_id) {
        createdTaskId = response.data.task_id;
        console.log(`    📌 Created task_id: ${createdTaskId}`);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Task Query (using created task_id)
  // ═══════════════════════════════════════════════════════════════════
  await describe('Tasks API - Query', async () => {
    await test('GET /api/tasks/:id - Get task info with valid task_id', async () => {
      // Skip if no task was created
      if (!createdTaskId) {
        throw new Error('No task_id available - prerequisite test failed');
      }
      
      // Act
      const response = await client.get(`/api/tasks/${createdTaskId}`);
      
      // Assert
      assert.httpOk(response, 'Get task info should succeed');
      assert.hasProperty(response.data, 'task', 'Response should contain task object');
      assert.equal(response.data.task?.id, createdTaskId, 'Task ID should match');
    });

    await test('GET /api/tasks/:id/result - Get task result', async () => {
      if (!createdTaskId) {
        throw new Error('No task_id available');
      }
      
      const response = await client.get(`/api/tasks/${createdTaskId}/result`);
      
      // May return 404 if task not completed yet, or 200 with partial results
      assert.ok([200, 404].includes(response.status), 'Get task result should handle request');
    });

    await test('GET /api/tasks/:id/audiences - Get task audiences', async () => {
      if (!createdTaskId) {
        throw new Error('No task_id available');
      }
      
      const response = await client.get(`/api/tasks/${createdTaskId}/audiences`);
      
      // May return 404 if no audiences yet, or 200 with data
      assert.ok([200, 404].includes(response.status), 'Get task audiences should handle request');
    });

    await test('GET /api/tasks/999999999 - Non-existent task should indicate not found', async () => {
      const response = await client.get('/api/tasks/999999999');
      
      // API returns 200 with success:false for non-existent tasks (REST pattern)
      assert.ok([200, 404, 422].includes(response.status), 'Should return valid response');
      if (response.status === 200) {
        assert.equal(response.data?.success, false, 'success should be false for non-existent task');
        assert.ok(response.data?.task === null, 'task should be null');
      }
    });

    await test('GET /api/tasks/invalid - Invalid task ID format', async () => {
      const response = await client.get('/api/tasks/invalid-string-id');
      
      assert.ok([400, 404, 422].includes(response.status), 'Invalid task ID should return error');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Retry Operations
  // ═══════════════════════════════════════════════════════════════════
  await describe('Tasks API - Retry Operations', async () => {
    await test('POST /api/tasks/:id/retry-failed-responses - Retry failed survey responses', async () => {
      if (!createdTaskId) {
        throw new Error('No task_id available');
      }
      
      const body = {
        task_id: createdTaskId,
        response_mode: 'concise',
        model_provider: 'openrouter'
      };
      
      const response = await client.post(`/api/tasks/${createdTaskId}/retry-failed-responses`, body, {
        timeout: timeout.long
      });
      
      // May fail if no failed responses exist
      assert.ok([200, 400, 404, 422].includes(response.status), 'Retry failed responses should handle request');
    });

    await test('POST /api/tasks/:id/retry-failed-audience-generation - Retry failed audiences', async () => {
      if (!createdTaskId) {
        throw new Error('No task_id available');
      }
      
      const body = {
        task_id: createdTaskId,
        resume_from: 'failed',
        model_provider: 'openrouter'
      };
      
      const response = await client.post(`/api/tasks/${createdTaskId}/retry-failed-audience-generation`, body, {
        timeout: timeout.veryLong
      });
      
      assert.ok([200, 400, 404, 422].includes(response.status), 'Retry failed audiences should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Resume Operations
  // ═══════════════════════════════════════════════════════════════════
  await describe('Tasks API - Resume Operations', async () => {
    await test('POST /api/tasks/:id/resume-from-survey - Resume from survey stage', async () => {
      if (!createdTaskId) {
        throw new Error('No task_id available');
      }
      
      const body = {
        model_provider: 'openrouter',
        response_mode: 'concise',
        generate_responses: true,
        question_count: 5
      };
      
      const response = await client.post(`/api/tasks/${createdTaskId}/resume-from-survey`, body, {
        timeout: timeout.long
      });
      
      // May fail depending on task state
      assert.ok([200, 400, 404, 422].includes(response.status), 'Resume from survey should handle request');
    });

    await test('POST /api/tasks/:id/resume - Resume interrupted task', async () => {
      if (!createdTaskId) {
        throw new Error('No task_id available');
      }
      
      const body = {
        response_mode: 'concise'
      };
      
      const response = await client.post(`/api/tasks/${createdTaskId}/resume`, body, {
        timeout: timeout.long
      });
      
      assert.ok([200, 400, 404, 422].includes(response.status), 'Resume task should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════════════════
  await describe('Tasks API - Edge Cases', async () => {
    await test('GET /api/tasks/ - Missing task ID should fail', async () => {
      const response = await client.get('/api/tasks/');
      
      assert.ok([400, 404, 405].includes(response.status), 'Missing task ID should be rejected');
    });

    await test('POST /api/tasks/999999/retry-failed-responses - Non-existent task', async () => {
      const body = {
        response_mode: 'concise'
      };
      
      const response = await client.post('/api/tasks/999999999/retry-failed-responses', body);
      
      assert.ok([400, 404, 422].includes(response.status), 'Non-existent task should return error');
    });
  });
}

export default runTaskTests;
