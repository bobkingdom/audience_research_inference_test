/**
 * Async Survey API Tests
 * Endpoints: /api/async-survey/*
 */
import { client } from '../lib/client.js';
import { describe, test, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runAsyncSurveyTests() {
  const { testAccountId, timeout } = config;
  let createdTaskId = null;
  let createdBatchId = null;

  // ═══════════════════════════════════════════════════════════════════
  // Survey Generation
  // ═══════════════════════════════════════════════════════════════════
  await describe('Async Survey - Generation', async () => {
    await test('POST /api/async-survey/generate-async - Create async survey', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        survey_config: {
          title: `测试问卷_${Date.now()}`,
          questions: [
            { id: 'q1', text: '您的年龄段是？', type: 'single_choice' },
            { id: 'q2', text: '您日常使用哪些护肤品？', type: 'multiple_choice' }
          ]
        },
        audience_ids: [1, 2, 3]
      };
      
      // Act
      const response = await client.post('/api/async-survey/generate-async', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 202, 400, 422].includes(response.status), 'Create async survey should handle request');
      if (response.ok && response.data?.task_id) {
        createdTaskId = response.data.task_id;
      }
    });

    await test('POST /api/async-survey/generate-async - Missing account_id should fail', async () => {
      // Arrange
      const body = {
        survey_config: { title: 'Test', questions: [] },
        audience_ids: [1, 2, 3]
      };
      
      // Act
      const response = await client.post('/api/async-survey/generate-async', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /api/async-survey/generate-async - Empty audience_ids should fail', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        survey_config: { title: 'Test', questions: [] },
        audience_ids: []
      };
      
      // Act
      const response = await client.post('/api/async-survey/generate-async', body);
      
      // Assert
      assert.httpError(response, 'Empty audience_ids should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Task Management
  // ═══════════════════════════════════════════════════════════════════
  await describe('Async Survey - Task Management', async () => {
    await test('GET /api/async-survey/generate-async-tasks - List tasks', async () => {
      // Arrange & Act
      const response = await client.get(
        `/api/async-survey/generate-async-tasks?account_id=${testAccountId}&page=1&page_size=20`
      );
      
      // Assert
      assert.httpOk(response, 'List tasks should succeed');
    });

    await test('GET /api/async-survey/generate-async/:id - Get task details', async () => {
      // Arrange
      const taskId = createdTaskId || 'task-id';
      
      // Act
      const response = await client.get(
        `/api/async-survey/generate-async/${taskId}?account_id=${testAccountId}`
      );
      
      // Assert
      if (createdTaskId) {
        assert.httpOk(response, 'Get task details should succeed');
      } else {
        assert.ok([200, 404].includes(response.status), 'Get task should handle request');
      }
    });

    await test('DELETE /api/async-survey/generate-async/:id - Delete task', async () => {
      // Arrange
      const taskId = 'non-existent-task';
      
      // Act
      const response = await client.delete(`/api/async-survey/generate-async/${taskId}`);
      
      // Assert
      assert.ok([200, 204, 404].includes(response.status), 'Delete task should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Parallel Deployment
  // ═══════════════════════════════════════════════════════════════════
  await describe('Async Survey - Parallel Deployment', async () => {
    await test('POST /api/async-survey/deploy-parallel - Deploy parallel survey', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        survey_id: 123,
        audience_ids: [1, 2, 3, 4, 5],
        parallel_count: 3
      };
      
      // Act
      const response = await client.post('/api/async-survey/deploy-parallel', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 202, 400, 404, 422].includes(response.status), 'Deploy parallel should handle request');
      if (response.ok && response.data?.batch_id) {
        createdBatchId = response.data.batch_id;
      }
    });

    await test('POST /api/async-survey/deploy-parallel - Missing survey_id should fail', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        audience_ids: [1, 2, 3]
      };
      
      // Act
      const response = await client.post('/api/async-survey/deploy-parallel', body);
      
      // Assert
      assert.httpError(response, 'Missing survey_id should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Batch Management
  // ═══════════════════════════════════════════════════════════════════
  await describe('Async Survey - Batch Management', async () => {
    await test('GET /api/async-survey/deployment-status/:batch_id - Get deployment status', async () => {
      // Arrange
      const batchId = createdBatchId || 'batch-id';
      
      // Act
      const response = await client.get(`/api/async-survey/deployment-status/${batchId}`);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get deployment status should handle request');
    });

    await test('GET /api/async-survey/batch/:batch_id/heartbeat - Batch heartbeat', async () => {
      // Arrange
      const batchId = createdBatchId || 'batch-id';
      
      // Act
      const response = await client.get(`/api/async-survey/batch/${batchId}/heartbeat`);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Batch heartbeat should handle request');
    });

    await test('POST /api/async-survey/batch/:batch_id/resume - Resume batch', async () => {
      // Arrange
      const batchId = createdBatchId || 'batch-id';
      const body = {
        continue_from_failed: true
      };
      
      // Act
      const response = await client.post(`/api/async-survey/batch/${batchId}/resume`, body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404].includes(response.status), 'Resume batch should handle request');
    });

    await test('GET /api/async-survey/survey-by-batch/:batch_id - Get surveys by batch', async () => {
      // Arrange
      const batchId = createdBatchId || 'batch-id';
      
      // Act
      const response = await client.get(`/api/async-survey/survey-by-batch/${batchId}`);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get surveys by batch should handle request');
    });
  });
}

export default runAsyncSurveyTests;
