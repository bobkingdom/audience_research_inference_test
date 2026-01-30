/**
 * Default configuration for API tests
 */
export default {
  baseUrl: process.env.API_BASE_URL || 'https://ext.survy.ai',
  apiKey: process.env.API_KEY || 'outsea_fu9etech',
  testAccountId: parseInt(process.env.TEST_ACCOUNT_ID || '1', 10),
  timeout: {
    default: 30000,
    long: 120000,
    short: 5000,
  },
  retry: { attempts: 3, delay: 1000 },
  testData: {
    userInput: '我想为一款面向年轻女性的护肤品寻找目标受众',
    productName: '测试护肤品',
    segmentCount: 3,
    audiencePerPersona: 5,
  },
  report: { outputDir: './reports', format: 'json' },
  verbose: process.env.VERBOSE === 'true',
};
