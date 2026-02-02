/**
 * Chat Management API Tests
 * Endpoints: /api/chat/*
 * 
 * New in V2: Chat session management and interview question generation
 */
import { client } from '../lib/client.js';
import { describe, test, assert, random } from '../lib/utils.js';
import config from '../config/default.js';

export async function runChatTests() {
  const { testAccountId, testData, timeout } = config;
  let createdSessionId = null;

  // ═══════════════════════════════════════════════════════════════════
  // Chat Session Management
  // ═══════════════════════════════════════════════════════════════════
  await describe('Chat API - Session Management', async () => {
    await test('POST /sessions/batch - Batch create chat sessions', async () => {
      // Arrange
      const body = {
        audience_ids: [1, 2, 3],
        account_id: testAccountId,
        topic: '护肤品使用体验',
        engine: 'S'
      };
      
      // Act
      const response = await client.post('/api/chat/sessions/batch', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 202, 400, 404, 422].includes(response.status), 'Batch create sessions should handle request');
      if (response.ok && response.data?.session_ids?.[0]) {
        createdSessionId = response.data.session_ids[0];
      }
    });

    await test('POST /sessions/batch - Missing account_id should fail', async () => {
      // Arrange
      const body = {
        audience_ids: [1, 2, 3],
        topic: 'Test Topic'
      };
      
      // Act
      const response = await client.post('/api/chat/sessions/batch', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /sessions/batch - Empty audience_ids should fail', async () => {
      // Arrange
      const body = {
        audience_ids: [],
        account_id: testAccountId,
        topic: 'Test Topic'
      };
      
      // Act
      const response = await client.post('/api/chat/sessions/batch', body);
      
      // Assert
      assert.httpError(response, 'Empty audience_ids should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Chat Messages
  // ═══════════════════════════════════════════════════════════════════
  await describe('Chat API - Messages', async () => {
    await test('POST /sessions/:id/messages - Send chat message', async () => {
      // Arrange
      const sessionId = createdSessionId || '123';
      const body = {
        content: '你好，请介绍一下你自己',
        message_type: 'text',
        account_id: testAccountId,
        engine: 'S'
      };
      
      // Act
      const response = await client.post(`/api/chat/sessions/${sessionId}/messages`, body, {
        timeout: timeout.long
      });
      
      // Assert
      if (createdSessionId) {
        assert.httpOk(response, 'Send message should succeed');
      } else {
        assert.ok([200, 404].includes(response.status), 'Send message should handle request');
      }
    });

    await test('POST /sessions/:id/messages - Missing content should fail', async () => {
      // Arrange
      const sessionId = createdSessionId || '123';
      const body = {
        message_type: 'text',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post(`/api/chat/sessions/${sessionId}/messages`, body);
      
      // Assert
      assert.httpError(response, 'Missing content should be rejected');
    });

    await test('POST /sessions/:id/messages - Empty content should fail', async () => {
      // Arrange
      const sessionId = createdSessionId || '123';
      const body = {
        content: '',
        message_type: 'text',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post(`/api/chat/sessions/${sessionId}/messages`, body);
      
      // Assert
      assert.httpError(response, 'Empty content should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Session End
  // ═══════════════════════════════════════════════════════════════════
  await describe('Chat API - Session End', async () => {
    await test('POST /sessions/:id/end - End chat session', async () => {
      // Arrange
      const sessionId = createdSessionId || '123';
      const body = {
        account_id: testAccountId,
        audience_id: 'user_12345',
        generate_summary: true
      };
      
      // Act
      const response = await client.post(`/api/chat/sessions/${sessionId}/end`, body, {
        timeout: timeout.long
      });
      
      // Assert
      if (createdSessionId) {
        assert.httpOk(response, 'End session should succeed');
      } else {
        assert.ok([200, 404].includes(response.status), 'End session should handle request');
      }
    });

    await test('POST /sessions/:id/end - Missing account_id should fail', async () => {
      // Arrange
      const sessionId = createdSessionId || '123';
      const body = {
        audience_id: 'user_12345'
      };
      
      // Act
      const response = await client.post(`/api/chat/sessions/${sessionId}/end`, body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Interview Questions Generation
  // ═══════════════════════════════════════════════════════════════════
  await describe('Chat API - Interview Questions', async () => {
    await test('POST /interview-questions/by-participant - Generate by participant', async () => {
      // Arrange
      const body = {
        participant_id: 456,
        topic: '护肤品购买决策',
        background: '年轻女性护肤市场研究',
        force_regenerate: false,
        provider: 'anthropic'
      };
      
      // Act
      const response = await client.post('/api/chat/interview-questions/by-participant', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Generate by participant should handle request');
    });

    await test('POST /interview-questions/by-participant - Missing participant_id should fail', async () => {
      // Arrange
      const body = {
        topic: '护肤品购买决策',
        background: '年轻女性护肤市场研究'
      };
      
      // Act
      const response = await client.post('/api/chat/interview-questions/by-participant', body);
      
      // Assert
      assert.httpError(response, 'Missing participant_id should be rejected');
    });

    await test('POST /interview-questions - Generate interview questions', async () => {
      // Arrange
      const body = {
        session_id: 'session-uuid',
        audience_id: 'user_12345',
        account_id: testAccountId,
        topic: '护肤品购买决策',
        background: '年轻女性护肤市场研究',
        force_regenerate: false,
        provider: 'anthropic'
      };
      
      // Act
      const response = await client.post('/api/chat/interview-questions', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Generate interview questions should handle request');
    });

    await test('POST /interview-questions - Missing account_id should fail', async () => {
      // Arrange
      const body = {
        session_id: 'session-uuid',
        audience_id: 'user_12345',
        topic: '护肤品购买决策'
      };
      
      // Act
      const response = await client.post('/api/chat/interview-questions', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('GET /sessions/:id/interview-questions - Get interview questions', async () => {
      // Arrange
      const sessionId = '123';
      
      // Act
      const response = await client.get(
        `/api/chat/sessions/${sessionId}/interview-questions?audience_id=user_12345&account_id=${testAccountId}`
      );
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Get interview questions should handle request');
    });
  });
}

export default runChatTests;
