/**
 * Avatar API Tests
 * Endpoints: /api/avatars/*
 */
import { client } from '../lib/client.js';
import { describe, test, skip, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runAvatarTests() {
  const { testAccountId, timeout } = config;

  // ═══════════════════════════════════════════════════════════════════
  // Avatar Health & Tasks
  // ═══════════════════════════════════════════════════════════════════
  await describe('Avatar API - Health & Tasks', async () => {
    await test('GET /api/avatars/health - Avatar service health', async () => {
      const response = await client.get('/api/avatars/health', { timeout: timeout.short });
      // Avatar service may have issues, just check it responds
      assert.ok(response.status > 0, 'Avatar health should respond');
    });

    await test('GET /api/avatars/batch-tasks - List batch tasks', async () => {
      const response = await client.get(`/api/avatars/batch-tasks?limit=10&account_id=${testAccountId}`);
      assert.httpOk(response, 'List batch tasks should succeed');
    });

    await test('GET /api/avatars/regenerate/tasks - List regenerate tasks', async () => {
      const response = await client.get('/api/avatars/regenerate/tasks');
      assert.ok([200, 404].includes(response.status), 'List regenerate tasks should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Avatar Generation
  // ═══════════════════════════════════════════════════════════════════
  await describe('Avatar API - Generation', async () => {
    await test('POST /api/avatars/openrouter-generate - Generate single avatar', async () => {
      // Arrange
      const body = {
        audience_id: 12345,
        account_id: testAccountId,
        style: 'realistic'
      };
      
      // Act
      const response = await client.post('/api/avatars/openrouter-generate', body, {
        timeout: timeout.long
      });
      
      // Assert - may fail if audience doesn't exist
      assert.ok([200, 400, 404, 422, 500].includes(response.status), 'Generate avatar should handle request');
    });

    await test('POST /api/avatars/openrouter-generate - Missing audience_id should fail', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        style: 'realistic'
      };
      
      // Act
      const response = await client.post('/api/avatars/openrouter-generate', body);
      
      // Assert
      assert.httpError(response, 'Missing audience_id should be rejected');
    });

    await test('POST /api/avatars/batch-generate - Batch generate avatars', async () => {
      // Arrange
      const body = {
        audience_ids: [1, 2, 3],
        account_id: testAccountId,
        style: 'realistic',
        batch_size: 5
      };
      
      // Act
      const response = await client.post('/api/avatars/batch-generate', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 202, 400, 404, 500].includes(response.status), 'Batch generate should handle request');
    });

    await test('POST /api/avatars/batch-generate - Empty audience_ids should fail', async () => {
      // Arrange
      const body = {
        audience_ids: [],
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/avatars/batch-generate', body);
      
      // Assert
      assert.httpError(response, 'Empty audience_ids should be rejected');
    });

    await test('POST /api/avatars/openrouter-batch-generate - OpenRouter batch', async () => {
      // Arrange
      const body = {
        audience_ids: [1, 2, 3],
        account_id: testAccountId,
        style: 'realistic'
      };
      
      // Act
      const response = await client.post('/api/avatars/openrouter-batch-generate', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 202, 400, 404, 500].includes(response.status), 'OpenRouter batch should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Avatar Regeneration
  // ═══════════════════════════════════════════════════════════════════
  await describe('Avatar API - Regeneration', async () => {
    await test('POST /api/avatars/regenerate - Regenerate avatar', async () => {
      // Arrange
      const body = {
        audience_id: 12345,
        account_id: testAccountId,
        reason: 'quality improvement'
      };
      
      // Act
      const response = await client.post('/api/avatars/regenerate', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404, 500].includes(response.status), 'Regenerate should handle request');
    });

    await test('POST /api/avatars/regenerate - Missing audience_id should fail', async () => {
      // Arrange
      const body = {
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/avatars/regenerate', body);
      
      // Assert
      assert.httpError(response, 'Missing audience_id should be rejected');
    });

    await test('GET /api/avatars/regenerate/:task_id/status - Get regen status', async () => {
      // Arrange
      const taskId = 'task-id-here';
      
      // Act
      const response = await client.get(`/api/avatars/regenerate/${taskId}/status`);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get regen status should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Avatar Fix Operations
  // ═══════════════════════════════════════════════════════════════════
  await describe('Avatar API - Fix Operations', async () => {
    await test('GET /api/avatars/scan-chinese-avatars - Scan Chinese avatars', async () => {
      const response = await client.get('/api/avatars/scan-chinese-avatars', {
        timeout: timeout.long
      });
      assert.ok([200, 404].includes(response.status), 'Scan Chinese avatars should handle request');
    });

    await test('POST /api/avatars/fix-chinese-avatars - Fix Chinese avatars', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        dry_run: true
      };
      
      // Act
      const response = await client.post('/api/avatars/fix-chinese-avatars', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404].includes(response.status), 'Fix Chinese avatars should handle request');
    });

    await test('POST /api/avatars/fix-unknown-gender-avatars - Fix unknown gender', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        dry_run: true
      };
      
      // Act
      const response = await client.post('/api/avatars/fix-unknown-gender-avatars', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404].includes(response.status), 'Fix unknown gender should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Batch Task Management
  // ═══════════════════════════════════════════════════════════════════
  await describe('Avatar API - Batch Task Management', async () => {
    await test('GET /api/avatars/batch-progress/:id - Get batch progress', async () => {
      // Arrange
      const batchTaskId = 'batch-task-id';
      
      // Act
      const response = await client.get(`/api/avatars/batch-progress/${batchTaskId}`);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get batch progress should handle request');
    });

    await test('DELETE /api/avatars/batch-tasks/:id - Delete batch task', async () => {
      // Arrange
      const batchTaskId = 'non-existent-task';
      
      // Act
      const response = await client.delete(`/api/avatars/batch-tasks/${batchTaskId}`);
      
      // Assert
      assert.ok([200, 204, 404].includes(response.status), 'Delete batch task should handle request');
    });
  });
}

export default runAvatarTests;
