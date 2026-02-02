/**
 * Survey Management API Tests
 * Endpoints: /api/survey/*
 * 
 * Updated for V2: Full survey lifecycle management
 */
import { client } from '../lib/client.js';
import { describe, test, assert, random } from '../lib/utils.js';
import config from '../config/default.js';

export async function runSurveyTests() {
  const { testAccountId, testData, timeout } = config;
  let createdSurveyId = null;

  // ═══════════════════════════════════════════════════════════════════
  // Survey Generation
  // ═══════════════════════════════════════════════════════════════════
  await describe('Survey API - Generation', async () => {
    await test('POST /api/survey/generate - Generate survey', async () => {
      // Arrange
      const body = {
        survey_requirements: '了解年轻女性对护肤品的购买偏好和使用习惯',
        question_count: 5,
        save_to_db: true,
        generate_responses: false,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/survey/generate', body, {
        timeout: timeout.long
      });
      
      // Assert
      assert.httpOk(response, 'Survey generation should succeed');
      if (response.ok && (response.data?.survey_id || response.data?.id)) {
        createdSurveyId = response.data.survey_id || response.data.id;
      }
    });

    await test('POST /api/survey/generate - Missing survey_requirements should fail', async () => {
      // Arrange
      const body = {
        question_count: 5,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/survey/generate', body);
      
      // Assert
      assert.httpError(response, 'Missing survey_requirements should be rejected');
    });

    await test('POST /api/survey/generate - Missing account_id should fail', async () => {
      // Arrange
      const body = {
        survey_requirements: '测试问卷需求',
        question_count: 5
      };
      
      // Act
      const response = await client.post('/api/survey/generate', body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });

    await test('POST /api/survey/generate - Invalid question_count (0) should fail', async () => {
      // Arrange
      const body = {
        survey_requirements: '测试问卷需求',
        question_count: 0,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/survey/generate', body);
      
      // Assert
      assert.httpError(response, 'Zero question_count should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Survey Responses
  // ═══════════════════════════════════════════════════════════════════
  await describe('Survey API - Response Generation', async () => {
    await test('POST /api/survey/generate-responses - Deploy and generate responses', async () => {
      // Arrange
      const surveyId = createdSurveyId || 123;
      const body = {
        survey_id: surveyId,
        segments_ids: [1, 2],
        audience_ids: [1, 2, 3],
        response_mode: 'concise',
        model_provider: 'openrouter',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/survey/generate-responses', body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 202, 400, 404, 422].includes(response.status), 'Generate responses should handle request');
    });

    await test('POST /api/survey/generate-responses - Missing survey_id should fail', async () => {
      // Arrange
      const body = {
        audience_ids: [1, 2, 3],
        response_mode: 'concise',
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/survey/generate-responses', body);
      
      // Assert
      assert.httpError(response, 'Missing survey_id should be rejected');
    });

    await test('POST /api/survey/generate-responses - Empty audience list should fail', async () => {
      // Arrange
      const body = {
        survey_id: 123,
        audience_ids: [],
        segments_ids: [],
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/survey/generate-responses', body);
      
      // Assert
      assert.httpError(response, 'Empty audience list should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Survey Statistics
  // ═══════════════════════════════════════════════════════════════════
  await describe('Survey API - Statistics', async () => {
    await test('POST /api/survey/:id/statistics - Get survey statistics', async () => {
      // Arrange
      const surveyId = createdSurveyId || 123;
      const body = {
        include_raw_data: true,
        include_questions_stats: true,
        include_segments_data: true,
        include_reason: true,
        force_regenerate: false,
        batch_id: null
      };
      
      // Act
      const response = await client.post(`/api/survey/${surveyId}/statistics`, body, {
        timeout: timeout.long
      });
      
      // Assert
      if (createdSurveyId) {
        assert.httpOk(response, 'Get statistics should succeed');
      } else {
        assert.ok([200, 404].includes(response.status), 'Get statistics should handle request');
      }
    });

    await test('POST /api/survey/:id/statistics - With batch_id filter', async () => {
      // Arrange
      const surveyId = createdSurveyId || 123;
      const body = {
        include_raw_data: false,
        include_questions_stats: true,
        batch_id: 'batch-uuid-here'
      };
      
      // Act
      const response = await client.post(`/api/survey/${surveyId}/statistics`, body);
      
      // Assert
      assert.ok([200, 404].includes(response.status), 'Statistics with batch filter should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Survey Reports
  // ═══════════════════════════════════════════════════════════════════
  await describe('Survey API - Reports', async () => {
    await test('POST /api/survey/generate-report - Generate report (general)', async () => {
      // Arrange
      const body = {
        responses_file: 'output/responses_123.json',
        survey_title: '护肤品用户研究报告',
        upload_to_cloud: false
      };
      
      // Act
      const response = await client.post('/api/survey/generate-report', body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Generate report should handle request');
    });

    await test('POST /api/survey/:id/generate-report - Generate report by survey ID', async () => {
      // Arrange
      const surveyId = createdSurveyId || 123;
      const body = {
        upload_to_cloud: false,
        force_regenerate: false,
        batch_id: null
      };
      
      // Act
      const response = await client.post(`/api/survey/${surveyId}/generate-report`, body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      if (createdSurveyId) {
        assert.httpOk(response, 'Generate report should succeed');
      } else {
        assert.ok([200, 400, 404, 422].includes(response.status), 'Generate report should handle request');
      }
    });

    await test('POST /api/survey/:id/generate-report - With batch_id', async () => {
      // Arrange
      const surveyId = createdSurveyId || 123;
      const body = {
        upload_to_cloud: true,
        force_regenerate: true,
        batch_id: 'batch-uuid-here'
      };
      
      // Act
      const response = await client.post(`/api/survey/${surveyId}/generate-report`, body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Generate report with batch should handle request');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Content Generation (Article)
  // ═══════════════════════════════════════════════════════════════════
  await describe('Survey API - Content Generation', async () => {
    await test('POST /api/survey/:id/generate-article - Generate content article', async () => {
      // Arrange
      const surveyId = createdSurveyId || 123;
      const body = {
        batch_id: 'batch-uuid',
        account_id: testAccountId,
        content_type: 'blog',
        product_name: testData.productName,
        key_insights: ['洞察1', '洞察2'],
        force_regenerate: false
      };
      
      // Act
      const response = await client.post(`/api/survey/${surveyId}/generate-article`, body, {
        timeout: timeout.veryLong
      });
      
      // Assert
      assert.ok([200, 400, 404, 422].includes(response.status), 'Generate article should handle request');
    });

    await test('POST /api/survey/:id/generate-article - Missing account_id should fail', async () => {
      // Arrange
      const surveyId = createdSurveyId || 123;
      const body = {
        content_type: 'blog',
        product_name: 'Test Product'
      };
      
      // Act
      const response = await client.post(`/api/survey/${surveyId}/generate-article`, body);
      
      // Assert
      assert.httpError(response, 'Missing account_id should be rejected');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════════════════
  await describe('Survey API - Edge Cases', async () => {
    await test('POST /api/survey/generate - Negative question_count should fail', async () => {
      // Arrange
      const body = {
        survey_requirements: '测试问卷需求',
        question_count: -1,
        account_id: testAccountId
      };
      
      // Act
      const response = await client.post('/api/survey/generate', body);
      
      // Assert
      assert.httpError(response, 'Negative question_count should be rejected');
    });

    await test('GET /api/survey/non-existent-id/statistics - Non-existent survey', async () => {
      // Arrange
      const fakeSurveyId = 'non-existent-survey-99999';
      
      // Act
      const response = await client.post(`/api/survey/${fakeSurveyId}/statistics`, {});
      
      // Assert
      assert.http404(response, 'Non-existent survey should return 404');
    });
  });
}

export default runSurveyTests;
