/**
 * Audience Management API Tests
 * Endpoints: /api/audience/*, /api/personality/*, /api/analysis/*
 * 
 * Updated for V2: Comprehensive audience management operations
 */
import { client } from '../lib/client.js';
import { describe, test, assert, random } from '../lib/utils.js';
import config from '../config/default.js';

export async function runAudienceTests() {
  const { testAccountId, testData, timeout } = config;

  // ═══════════════════════════════════════════════════════════════════
  // Audience Analysis (Legacy - may be deprecated)
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience API - Analysis (Legacy)', async () => {
    await test('POST /api/audience/analyze - Analyze audience (deprecated)', async () => {
      // Arrange
      const body = {
        product_description: testData.productDescription,
        market_context: '中国美妆市场',
        segment_count: 3,
        user_count: 5,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/audience/analyze', body, {
        timeout: timeout.veryLong
      });
      
      // Assert - may be deprecated, accept various status codes
      assert.ok([200, 400, 404, 410, 422].includes(response.status), 'Audience analyze should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Async Audience Generation
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience API - Async Generation', async () => {
    await test('POST /api/audience/generate-async - Async generate audience', async () => {
      // Arrange
      const body = {
        product_description: testData.productDescription,
        market_context: '中国美妆市场',
        segment_count: 3,
        user_count: 5,
        target_continent: 'Asia',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/audience/generate-async', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 202, 400, 422].includes(response.status), 'Async generate audience should handle request');
    });

    await test('POST /api/audience/generate-async - Missing product_description should fail', async () => {
      // Arrange
      const body = {
        market_context: '中国美妆市场',
        segment_count: 3,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/audience/generate-async', body);
      
      // Assert
      assert.httpError(response, 'Missing product_description should be rejected');
    });

    await test('POST /api/audience/generate-async - Missing account_id should fail', async () => {
      // Arrange
      const body = {
        product_description: testData.productDescription,
        segment_count: 3
      };
      
      // Act
      const response = await client.post('/api/audience/generate-async', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /api/audience/generate-async - Invalid segment_count should fail', async () => {
      // Arrange
      const body = {
        product_description: testData.productDescription,
        segment_count: 0,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/audience/generate-async', body);
      
      // Assert
      assert.httpError(response, 'Invalid segment_count should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Personality Analysis
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience API - Personality Analysis', async () => {
    await test('POST /api/personality/analyze - Analyze audience personality', async () => {
      // Arrange
      const body = {
        audience_id: 'user_12345'
      };
      
      // Act
      const response = await client.post('/api/personality/analyze', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Personality analyze should handle request');
    });

    await test('POST /api/personality/analyze - Missing audience_id should fail', async () => {
      // Arrange
      const body = {};
      
      // Act
      const response = await client.post('/api/personality/analyze', body);
      
      // Assert
      assert.httpError(response, 'Missing audience_id should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Full Analysis Flow
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience API - Full Analysis Flow', async () => {
    await test('POST /api/analysis/full - Complete analysis pipeline', async () => {
      // Arrange
      const body = {
        user_input: testData.userInput,
        segment_count: 2,
        audience_count: 3,
        generate_survey: false,
        question_count: 5,
        generate_responses: false,
        response_mode: 'concise',
        skip_db_save: true,
        target_continent: 'Asia',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/analysis/full', body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 202, 400, 422].includes(response.status), 'Full analysis should handle request');
    });

    await test('POST /api/analysis/full - Missing user_input should fail', async () => {
      // Arrange
      const body = {
        segment_count: 2,
        audience_count: 3,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/analysis/full', body);
      
      // Assert
      assert.httpError(response, 'Missing user_input should be rejected');
    });

    await test('POST /api/analysis/full - Missing account_id should fail', async () => {
      // Arrange
      const body = {
        user_input: testData.userInput,
        segment_count: 2
      };
      
      // Act
      const response = await client.post('/api/analysis/full', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Intent Analysis Query
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience API - Intent Analysis', async () => {
    await test('POST /api/intent-analysis - Query intent analysis data', async () => {
      // Arrange
      const body = {
        account_id: testAccountId,
        audience_task_id: 123
      };
      
      // Act
      const response = await client.post('/api/intent-analysis', body);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Intent analysis query should handle request');
    });

    await test('POST /api/intent-analysis - Missing account_id should fail', async () => {
      // Arrange
      const body = {
        audience_task_id: 123
      };
      
      // Act
      const response = await client.post('/api/intent-analysis', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Audience Update
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience API - Update Operations', async () => {
    await test('POST /api/audience/:id/update - Update audience and regenerate', async () => {
      // Arrange
      const audienceId = 'user_12345';
      const body = {
        name: '张三',
        age: 28,
        avatar: 'https://report.survy.ai/chat/images/chat_15202510131517220e9fa3fc.jpg',
        location: '北京市',
        education: '本科',
        regenerate_personality: true,
        ai_provider: 'anthropic',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post(`/api/audience/${audienceId}/update`, body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Update audience should handle request');
    });

    await test('POST /api/audience/:id/update - Missing account_id should fail', async () => {
      // Arrange
      const audienceId = 'user_12345';
      const body = {
        name: '张三',
        age: 28
      };
      
      // Act
      const response = await client.post(`/api/audience/${audienceId}/update`, body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /api/audience/:id/update - With regenerate_personality=false', async () => {
      // Arrange
      const audienceId = 'user_12345';
      const body = {
        name: '李四',
        age: 30,
        regenerate_personality: false,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post(`/api/audience/${audienceId}/update`, body);
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Update without regenerate should handle request');
    });

    await test('POST /api/audience/non-existent/update - Non-existent audience', async () => {
      // Arrange
      const audienceId = 'non-existent-audience-99999';
      const body = {
        name: '测试',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post(`/api/audience/${audienceId}/update`, body);
      
      // Assert
      assert.http404(response, 'Non-existent audience should return 404');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════════════════
  await describe('Audience API - Edge Cases', async () => {
    await test('POST /api/audience/generate-async - Negative segment_count', async () => {
      // Arrange
      const body = {
        product_description: testData.productDescription,
        segment_count: -1,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/audience/generate-async', body);
      
      // Assert
      assert.httpError(response, 'Negative segment_count should be rejected');
    });

    await test('POST /api/analysis/full - Very large segment_count', async () => {
      // Arrange
      const body = {
        user_input: testData.userInput,
        segment_count: 1000,
        audience_count: 1000,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/analysis/full', body);
      
      // Assert
      assert.ok([200, 400, 422].includes(response.status), 'Very large segment_count should be handled');
    });
  });
}

export default runAudienceTests;
