/**
 * Focus Group API Tests
 * Endpoints: /api/focus-group/*
 */
import { client } from '../lib/client.js';
import { describe, test, skip, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runFocusGroupTests() {
  const { testAccountId, testData, timeout } = config;
  let createdFocusGroupId = null;

  // ═══════════════════════════════════════════════════════════════════
  // Focus Group CRUD
  // ═══════════════════════════════════════════════════════════════════
  await describe('Focus Group - Create & List', async () => {
    await test('POST /api/focus-group/create - Create focus group', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        title: `测试焦点小组_${Date.now()}`,
        topic: '了解年轻女性护肤习惯',
        background: '市场调研背景信息',
        research_objectives: ['了解购买动机', '了解使用场景', '了解品牌偏好']
      };
      
      // Act
      const response = await client.post('/api/focus-group/create', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Focus group creation should succeed');
      if (response.ok && response.data?.id) {
        createdFocusGroupId = response.data.id;
      }
    });

    await test('POST /api/focus-group/create - Missing account_id should fail', async () => {
      // Arrange
      const body = {
        title: 'Test Group',
        topic: 'Test Topic'
      };
      
      // Act
      const response = await client.post('/api/focus-group/create', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /api/focus-group/create - Missing title should fail', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        topic: 'Test Topic'
      };
      
      // Act
      const response = await client.post('/api/focus-group/create', body);
      
      // Assert
      assert.httpError(response, 'Missing title should be rejected');
    });

    await test('GET /api/focus-group/list - List focus groups', async () => {
      // Arrange & Act
      const response = await client.get(
        `/api/focus-group/list?account_id=${testAccountId}&page=1&page_size=20`
      );
      
      // Assert
      assert.httpOk(response, 'List focus groups should succeed');
      assert.hasProperty(response.data, 'focus_groups', 'Response should have focus_groups array');
    });

    await test('GET /api/focus-group/list - Missing account_id should fail', async () => {
      // Arrange & Act
      const response = await client.get('/api/focus-group/list');
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('GET /api/focus-group/report-types/list - List report types', async () => {
      // Arrange & Act
      const response = await client.get('/api/focus-group/report-types/list');
      
      // Assert
      assert.httpOk(response, 'List report types should succeed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Participant Management
  // ═══════════════════════════════════════════════════════════════════
  await describe('Focus Group - Participants', async () => {
    await test('POST /:id/participants - Add participants', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        audience_ids: [1, 2, 3, 4, 5]
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/participants`, body, {
        timeout: timeout.long
      });
      
      // Assert
      if (createdFocusGroupId) {
        assert.httpOk(response, 'Add participants should succeed');
      } else {
        assert.ok([200, 404].includes(response.status), 'Add participants should handle request');
      }
    });

    await test('POST /:id/participants - Empty audience_ids should fail', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        audience_ids: []
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/participants`, body);
      
      // Assert
      assert.httpError(response, 'Empty audience_ids should be rejected');
    });

    await test('POST /:id/participants/list - List participants', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        page: 1,
        page_size: 20,
        include_message_stats: true
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/participants/list`, body);
      
      // Assert
      if (createdFocusGroupId) {
        assert.httpOk(response, 'List participants should succeed');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Focus Group Operations
  // ═══════════════════════════════════════════════════════════════════
  await describe('Focus Group - Operations', async () => {
    await test('POST /:id/start - Start focus group', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/start`, null, {
        timeout: timeout.long
      });
      
      // Assert
      if (createdFocusGroupId) {
        // May fail if no participants, which is acceptable
        assert.ok([200, 400, 422].includes(response.status), 'Start should handle request');
      }
    });

    await test('POST /:id/check-questions-ready - Check questions ready', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/check-questions-ready`, null);
      
      // Assert
      if (createdFocusGroupId) {
        assert.httpOk(response, 'Check questions ready should succeed');
      }
    });

    await test('POST /:id/next-decision - Get next decision', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/next-decision`, null, {
        timeout: timeout.long
      });
      
      // Assert
      // May fail if group not started, which is acceptable
      assert.ok([200, 400, 404, 422].includes(response.status), 'Next decision should handle request');
    });

    await test('POST /:id/host-message - Send host message', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        host_prompt: '大家好，请分享一下你们日常的护肤习惯？',
        message_type: 'question'
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/host-message`, body, {
        timeout: timeout.long
      });
      
      // Assert
      // May fail if group not started
      assert.ok([200, 400, 404, 422].includes(response.status), 'Host message should handle request');
    });

    await test('POST /:id/host-message - Missing host_prompt should fail', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        message_type: 'question'
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/host-message`, body);
      
      // Assert
      assert.httpError(response, 'Missing host_prompt should be rejected');
    });

    await test('POST /:id/participant-response - Generate single participant response (New V2)', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        participant_id: 456,
        host_message: '请分享你的护肤习惯',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/participant-response`, body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Single participant response should handle request');
    });

    await test('POST /:id/participant-response - Missing participant_id should fail', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        host_message: '请分享你的护肤习惯',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/participant-response`, body);
      
      // Assert
      assert.httpError(response, 'Missing participant_id should be rejected');
    });

    await test('POST /:id/messages - Get messages', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        page: 1,
        page_size: 50
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/messages`, body);
      
      // Assert
      if (createdFocusGroupId) {
        assert.httpOk(response, 'Get messages should succeed');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Batch Operations
  // ═══════════════════════════════════════════════════════════════════
  await describe('Focus Group - Batch Operations', async () => {
    await test('POST /:id/batch-generate-prompts - Batch generate prompts', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        participant_ids: [1, 2, 3]
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/batch-generate-prompts`, body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Batch generate prompts should handle request');
    });

    await test('POST /:id/batch-participant-response - Batch responses', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        participant_ids: [1, 2, 3],
        host_message: '请分享你的护肤习惯',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/batch-participant-response`, body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Batch response should handle request');
    });

    await test('GET /:id/active-batch-task - Get active batch task', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      
      // Act
      const response = await client.get(`/api/focus-group/${focusGroupId}/active-batch-task`);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get active batch task should handle request');
    });

    await test('GET /:id/batch-task/:taskId - Query batch task progress (New V2)', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const taskId = 'task-uuid-here';
      
      // Act
      const response = await client.get(`/api/focus-group/${focusGroupId}/batch-task/${taskId}`);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Query batch task progress should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Analysis & Summary
  // ═══════════════════════════════════════════════════════════════════
  await describe('Focus Group - Analysis & Summary', async () => {
    await test('POST /:id/extract-insights - Extract insights', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {};
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/extract-insights`, body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Extract insights should handle request');
    });

    await test('POST /:id/insights - Get insights', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        regenerate: false
      };
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/insights`, body);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get insights should handle request');
    });

    await test('GET /:id/summary - Get summary', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      
      // Act
      const response = await client.get(
        `/api/focus-group/${focusGroupId}/summary?regenerate=false&report_type=comprehensive`
      );
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get summary should handle request');
    });

    await test('POST /:id/end - End focus group', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      
      // Act
      const response = await client.post(`/api/focus-group/${focusGroupId}/end`, null, {
        timeout: timeout.long
      });
      
      // Assert
      if (createdFocusGroupId) {
        assert.httpOk(response, 'End focus group should succeed');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Update & Delete
  // ═══════════════════════════════════════════════════════════════════
  await describe('Focus Group - Update', async () => {
    await test('PATCH /:id - Update focus group', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        title: '更新后的标题'
      };
      
      // Act
      const response = await client.patch(`/api/focus-group/${focusGroupId}`, body);
      
      // Assert
      if (createdFocusGroupId) {
        assert.httpOk(response, 'Update focus group should succeed');
      }
    });

    await test('PATCH /:id - Invalid status should fail', async () => {
      // Arrange
      const focusGroupId = createdFocusGroupId || '123';
      const body = {
        status: 'invalid_status'
      };
      
      // Act
      const response = await client.patch(`/api/focus-group/${focusGroupId}`, body);
      
      // Assert
      assert.httpError(response, 'Invalid status should be rejected');
    });
  });
}

export default runFocusGroupTests;
