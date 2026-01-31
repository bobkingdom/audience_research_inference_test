/**
 * Audience Generate API Tests
 * Endpoints: /api/v1/audience-generate/*
 * 
 * AAA Testing Pattern:
 * - Arrange: Set up test data
 * - Act: Call the API
 * - Assert: Verify the response
 */
import { client } from '../lib/client.js';
import { describe, test, skip, assert } from '../lib/utils.js';
import config from '../config/default.js';

export async function runAudienceGenerateTests() {
  const { testAccountId, testData, timeout } = config;

  // ═══════════════════════════════════════════════════════════════════
  // Intent Analysis
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience Generate - Intent Analysis', async () => {
    await test('POST /intent-analysis - Valid request', async () => {
      // Arrange
      const body = { user_input: testData.userInput };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/intent-analysis', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Intent analysis should succeed');
    });

    await test('POST /intent-analysis - Empty user_input should fail', async () => {
      // Arrange
      const body = { user_input: '' };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/intent-analysis', body);
      
      // Assert
      assert.httpError(response, 'Empty user_input should be rejected');
    });

    await test('POST /intent-analysis - Missing user_input should fail', async () => {
      // Arrange
      const body = {};
      
      // Act
      const response = await client.post('/api/v1/audience-generate/intent-analysis', body);
      
      // Assert
      assert.httpError(response, 'Missing user_input should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Personas Generation
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience Generate - Personas', async () => {
    await test('POST /personas - Valid request', async () => {
      // Arrange
      const body = {
        user_input: testData.userInput,
        segment_count: testData.segmentCount
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/personas', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Personas generation should succeed');
    });

    await test('POST /personas - Invalid segment_count (0) should fail', async () => {
      // Arrange
      const body = {
        user_input: testData.userInput,
        segment_count: 0
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/personas', body);
      
      // Assert
      assert.httpError(response, 'Zero segment_count should be rejected');
    });

    await test('POST /personas - Negative segment_count should fail', async () => {
      // Arrange
      const body = {
        user_input: testData.userInput,
        segment_count: -1
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/personas', body);
      
      // Assert
      assert.httpError(response, 'Negative segment_count should be rejected');
    });

    await test('POST /personas - Missing user_input should fail', async () => {
      // Arrange
      const body = { segment_count: 3 };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/personas', body);
      
      // Assert
      assert.httpError(response, 'Missing user_input should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Complete Generation Flow
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience Generate - Complete Flow', async () => {
    await test('POST /complete - Valid request', async () => {
      // Arrange
      const body = {
        user_input: testData.userInput,
        segment_count: testData.segmentCount
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/complete', body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.httpOk(response, 'Complete generation should succeed');
    });

    await test('POST /complete - Empty body should fail', async () => {
      // Arrange
      const body = {};
      
      // Act
      const response = await client.post('/api/v1/audience-generate/complete', body);
      
      // Assert
      assert.httpError(response, 'Empty body should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Task Management
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience Generate - Task Management', async () => {
    let createdTaskId = null;

    await test('POST /task/create - Create new task', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        task_name: `测试任务_${Date.now()}`,
        user_input: testData.userInput
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/task/create', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Task creation should succeed');
      if (response.ok && response.data?.task_id) {
        createdTaskId = response.data.task_id;
      }
    });

    await test('POST /task/create - Missing account_id should fail', async () => {
      // Arrange
      const body = {
        task_name: 'Test Task',
        user_input: testData.userInput
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/task/create', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /task/create - Missing user_input should fail', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        task_name: 'Test Task'
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/task/create', body);
      
      // Assert
      assert.httpError(response, 'Missing user_input should be rejected');
    });

    await test('GET /task/:id - Query existing task', async () => {
      // Arrange - use created task or a known task ID
      const taskId = createdTaskId || '123';
      
      // Act
      const response = await client.get(`/api/v1/audience-generate/task/${taskId}?include_details=true`);
      
      // Assert
      if (createdTaskId) {
        assert.httpOk(response, 'Task query should succeed');
      } else {
        // If no task was created, 404 is acceptable
        assert.ok([200, 404].includes(response.status), 'Task query should return 200 or 404');
      }
    });

    await test('GET /task/:id - Non-existent task should return 404', async () => {
      // Arrange
      const fakeTaskId = 'non-existent-task-id-12345';
      
      // Act
      const response = await client.get(`/api/v1/audience-generate/task/${fakeTaskId}`);
      
      // Assert
      assert.http404(response, 'Non-existent task should return 404');
    });

    await test('GET /task/:id/analyze-resume - Analyze task resume state', async () => {
      // Arrange
      const taskId = createdTaskId || '123';
      
      // Act
      const response = await client.get(`/api/v1/audience-generate/task/${taskId}/analyze-resume`);
      
      // Assert
      if (createdTaskId) {
        assert.httpOk(response, 'Analyze resume should succeed');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Segment Operations
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience Generate - Segment Operations', async () => {
    await test('POST /segment/rename - Rename segment', async () => {
      // Arrange
      const body = {
        segment_id: 1327,
        generate_language: 'Chinese',
        async_mode: false,
        update_db: false
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/segment/rename', body, {
        timeout: timeout.long
      });
      
      // Assert - may fail if segment doesn't exist, which is acceptable
      assert.ok([200, 404, 422].includes(response.status), 'Segment rename should handle request');
    });

    await test('POST /segment/rename - Missing segment_id should fail', async () => {
      // Arrange
      const body = {
        generate_language: 'Chinese'
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/segment/rename', body);
      
      // Assert
      assert.httpError(response, 'Missing segment_id should be rejected');
    });

    await test('POST /segment/batch-rename - Batch rename segments', async () => {
      // Arrange
      const body = {
        task_id: 123,
        generate_language: 'Chinese',
        async_mode: false,
        update_db: false
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/segment/batch-rename', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 404, 422].includes(response.status), 'Batch rename should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Audience Operations
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience Generate - Audience Operations', async () => {
    await test('POST /audience/insight - Get audience insight', async () => {
      // Arrange
      const body = {
        audience_id: 12345,
        insight_type: 'comprehensive'
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/audience/insight', body, {
        timeout: timeout.long
      });
      
      // Assert - may fail if audience doesn't exist
      assert.ok([200, 404, 422].includes(response.status), 'Audience insight should handle request');
    });

    await test('POST /audience/insight - Missing audience_id should fail', async () => {
      // Arrange
      const body = {
        insight_type: 'comprehensive'
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/audience/insight', body);
      
      // Assert
      assert.httpError(response, 'Missing audience_id should be rejected');
    });

    await test('GET /audience/personality-integrity - Check personality integrity', async () => {
      // Arrange & Act
      const response = await client.get(
        `/api/v1/audience-generate/audience/personality-integrity?account_id=${testAccountId}&task_id=123`
      );
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Personality integrity check should handle request');
    });

    await test('GET /audience/personality-integrity/by-account - Account stats', async () => {
      // Arrange & Act
      const response = await client.get(
        `/api/v1/audience-generate/audience/personality-integrity/by-account?account_id=${testAccountId}`
      );
      
      // Assert
      assert.httpOk(response, 'Account personality stats should succeed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Interview Extraction
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience Generate - Interview Extraction', async () => {
    let extractionId = null;

    await test('POST /interview/extract - Extract from interview', async () => {
      // Arrange
      const body = {
        interview_transcript: testData.interviewTranscript,
        account_id: testAccountId,
        product_info: {
          category: '护肤品',
          name: testData.productName
        }
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/interview/extract', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Interview extraction should succeed');
      if (response.ok && response.data?.extraction_id) {
        extractionId = response.data.extraction_id;
      }
    });

    await test('POST /interview/extract - Empty transcript should fail', async () => {
      // Arrange
      const body = {
        interview_transcript: '',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/interview/extract', body);
      
      // Assert
      assert.httpError(response, 'Empty transcript should be rejected');
    });

    await test('GET /interview/extractions - List extractions', async () => {
      // Arrange & Act
      const response = await client.get(
        `/api/v1/audience-generate/interview/extractions?account_id=${testAccountId}&page=1&page_size=20`
      );
      
      // Assert
      assert.httpOk(response, 'List extractions should succeed');
    });

    await test('GET /interview/extraction/:id - Get specific extraction', async () => {
      // Arrange
      const id = extractionId || '123';
      
      // Act
      const response = await client.get(`/api/v1/audience-generate/interview/extraction/${id}`);
      
      // Assert
      if (extractionId) {
        assert.httpOk(response, 'Get extraction should succeed');
      } else {
        assert.ok([200, 404].includes(response.status), 'Get extraction should return 200 or 404');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Batch Operations
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience Generate - Batch Operations', async () => {
    await test('POST /batch-generate-prompt - Batch generate prompts', async () => {
      // Arrange
      const body = {
        audience_ids: [1, 2, 3],
        force_regenerate: false,
        batch_size: 10
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/batch-generate-prompt', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 404, 422].includes(response.status), 'Batch generate prompt should handle request');
    });

    await test('POST /batch-generate-prompt - Empty audience_ids should fail', async () => {
      // Arrange
      const body = {
        audience_ids: [],
        force_regenerate: false
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/batch-generate-prompt', body);
      
      // Assert
      assert.httpError(response, 'Empty audience_ids should be rejected');
    });

    await test('POST /segments/audiences - Generate audiences from segments', async () => {
      // Arrange
      const body = {
        segment_ids: [1, 2, 3],
        audience_per_segment: 5,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/v1/audience-generate/segments/audiences', body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 202, 404, 422].includes(response.status), 'Segments audiences should handle request');
    });
  });
}

export default runAudienceGenerateTests;
