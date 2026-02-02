/**
 * Default configuration for Inference Service V2 API tests
 * Based on Postman collection: inference-service-v2.json
 */
export default {
  // API Configuration
  baseUrl: process.env.API_BASE_URL || 'https://ext.survy.ai',
  apiKey: process.env.API_KEY || 'outsea_fu9etech',
  jwtToken: process.env.JWT_TOKEN || '',
  
  // Test Account
  testAccountId: parseInt(process.env.TEST_ACCOUNT_ID || '12', 10),
  
  // Timeouts
  timeout: {
    short: 5000,      // Health checks
    default: 30000,   // Normal operations
    long: 120000,     // AI generation tasks
    veryLong: 300000, // Batch operations
  },
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000,
  },
  
  // Test data
  testData: {
    userInput: '我想为一款面向年轻女性的护肤品寻找目标受众',
    productName: '测试护肤品',
    productDescription: '面向年轻女性的高端护肤品，主打保湿和抗老功效',
    segmentCount: 3,
    audiencePerPersona: 5,
    interviewTranscript: '用户A: 我每天早晚都会使用护肤品。主要关注保湿和抗老。\n主持人: 你通常在哪里购买？\n用户A: 主要是线上，看小红书推荐。',
    // New V2 test data
    chatTopic: '护肤品使用体验',
    surveyRequirements: '了解年轻女性对护肤品的购买偏好和使用习惯',
  },
  
  // Report settings
  report: {
    outputDir: './reports',
    format: 'json',
  },
  
  // Debug
  verbose: process.env.VERBOSE === 'true',
};
