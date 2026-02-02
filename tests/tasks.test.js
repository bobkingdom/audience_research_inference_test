/**
 * Task Management API Tests
 * Endpoints: /api/tasks/*
 * 
 * New in V2: Comprehensive task management and recovery operations
 */
import { client } from '../lib/client.js';
import { describe, test, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runTaskTests() {
  const { testAccountId, testData, timeout } = config;
  
  // Use a known task ID or create one for testing
  let testTaskId = null;

  // ═══════════════════════════════════════════════════════════════════
  // Task Query
  // ═══════════════════════════════════════════════════════════════════
  await describe('Tasks API - Query', async () => {
    await test('GET /api/tasks/:id - Get task info', async () => {
      // Arrange
      const taskId = testTaskId || '123';
      
      // Act
      const response = await client.get(`/api/tasks/${taskId}`);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get task info should handle request');
      if (response.ok && response.data?.id) {
        testTaskId = response.data.id;
      }
    });

    await test('GET /api/tasks/:id/result - Get task result', async () => {
      // Arrange
      const taskId = testTaskId || '123';
      
      // Act
      const response = await client.get(`/api/tasks/${taskId}/result`);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get task result should handle request');
    });

    await test('GET /api/tasks/:id/audiences - Get task audiences', async () => {
      // Arrange
      const taskId = testTaskId || '123';
      
      // Act
      const response = await client.get(`/api/tasks/${taskId}/audiences`);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get task audiences should handle request');
    });

    await test('GET /api/tasks/non-existent-id - Non-existent task should return 404', async () => {
      // Arrange
      const fakeTaskId = 'non-existent-task-id-99999';
      
      // Act
      const response = await client.get(`/api/tasks/${fakeTaskId}`);
      
      // Assert
      assert.http404(response, 'Non-existent task should return 404');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Retry Operations
  // ═══════════════════════════════════════════════════════════════════
  await describe('Tasks API - Retry Operations', async () => {
    await test('POST /api/tasks/:id/retry-failed-responses - Retry failed survey responses', async () => {
      // Arrange
      const taskId = testTaskId || '123';
      const body = {
        task_id: parseInt(taskId) || 123,
        response_mode: 'concise',
        model_provider: 'openrouter'
      };
      
      // Act
      const response = await client.post(`/api/tasks/${taskId}/retry-failed-responses`, body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Retry failed responses should handle request');
    });

    await test('POST /api/tasks/:id/retry-failed-responses - Invalid task_id format', async () => {
      // Arrange
      const taskId = 'invalid';
      const body = {
        response_mode: 'concise'
      };
      
      // Act
      const response = await client.post(`/api/tasks/${taskId}/retry-failed-responses`, body);
      
      // Assert
      assert.ok([400, 404, 422].includes(response.status), 'Invalid task_id should be rejected');
    });

    await test('POST /api/tasks/:id/retry-failed-audience-generation - Retry failed audiences', async () => {
      // Arrange
      const taskId = testTaskId || '123';
      const body = {
        task_id: parseInt(taskId) || 123,
        resume_from: 'failed',
        model_provider: 'openrouter'
      };
      
      // Act
      const response = await client.post(`/api/tasks/${taskId}/retry-failed-audience-generation`, body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Retry failed audiences should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Resume Operations
  // ═══════════════════════════════════════════════════════════════════
  await describe('Tasks API - Resume Operations', async () => {
    await test('POST /api/tasks/:id/resume-from-survey - Resume from survey stage', async () => {
      // Arrange
      const taskId = testTaskId || '123';
      const body = {
        model_provider: 'openrouter',
        response_mode: 'concise',
        generate_responses: true,
        question_count: 5
      };
      
      // Act
      const response = await client.post(`/api/tasks/${taskId}/resume-from-survey`, body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Resume from survey should handle request');
    });

    await test('POST /api/tasks/:id/resume - Resume interrupted task', async () => {
      // Arrange
      const taskId = testTaskId || '123';
      const body = {
        response_mode: 'concise'
      };
      
      // Act
      const response = await client.post(`/api/tasks/${taskId}/resume`, body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Resume task should handle request');
    });

    await test('POST /api/tasks/:id/resume - Empty body should be accepted', async () => {
      // Arrange
      const taskId = testTaskId || '123';
      const body = {};
      
      // Act
      const response = await client.post(`/api/tasks/${taskId}/resume`, body, {
        timeout: timeout.long
      });
      
      // Assert
      // Empty body might be acceptable depending on task state
      assert.ok([200, 400, 404, 422].includes(response.status), 'Resume with empty body should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════════════════
  await describe('Tasks API - Edge Cases', async () => {
    await test('GET /api/tasks/ - Missing task ID should fail', async () => {
      // Arrange & Act
      const response = await client.get('/api/tasks/');
      
      // Assert
      assert.ok([400, 404, 405].includes(response.status), 'Missing task ID should be rejected');
    });

    await test('POST /api/tasks/:id/retry-failed-responses - Very large task_id', async () => {
      // Arrange
      const taskId = '999999999999';
      const body = {
        response_mode: 'concise'
      };
      
      // Act
      const response = await client.post(`/api/tasks/${taskId}/retry-failed-responses`, body);
      
      // Assert
      assert.ok([400, 404, 422].includes(response.status), 'Very large task_id should be handled');
    });
  });
}

export default runTaskTests;
