# Audience Research API Test Suite

Comprehensive API test suite for **Inference Service V2** - the Audience Research / User Research platform.

## 📋 Overview

This test suite covers all 70+ API endpoints across 7 major modules:

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Health Check | 2 | Service health and readiness |
| Audience Generation | 25+ | Intent analysis, personas, task management, segments, interviews |
| Focus Group | 20+ | Session management, participants, messages, insights, reports |
| Vector Search | 10+ | Semantic search, similarity search, multimodal search |
| Content Generation | 8+ | Article generation, Reddit comments, history |
| Avatar Management | 10+ | Generate, batch generate, fix avatars |
| Async Survey | 15+ | Survey creation, deployment, collection, analysis |

## 🚀 Quick Start

```bash
# Set the API base URL
export API_BASE_URL=http://your-api-server:8877
export API_KEY=your_api_key

# Run all tests
node runner.js

# Run smoke tests (health + vector)
node runner.js --smoke

# Run specific module
node runner.js --module health
node runner.js --module audience

# Generate JSON report
node runner.js --report

# Enable verbose logging
node runner.js --verbose
```

## 📁 Project Structure

```
audience_research_test/
├── package.json          # Project configuration
├── runner.js             # Test runner entry point
├── README.md             # This file
├── config/
│   └── default.js        # Default configuration
├── lib/
│   ├── client.js         # HTTP client for API requests
│   └── utils.js          # Test utilities and assertions
├── tests/
│   ├── health.test.js    # Health check tests
│   ├── audience.test.js  # Audience generation tests
│   ├── focus-group.test.js
│   ├── vector.test.js
│   ├── content.test.js
│   ├── avatar.test.js
│   └── survey.test.js
└── reports/              # Generated test reports
```

## 🧪 Test Methodology

All tests follow the **AAA Pattern** (Arrange-Act-Assert):

```javascript
await test('POST /api/endpoint - description', async () => {
  // Arrange - Set up test data
  const body = { field: 'value' };
  
  // Act - Execute the operation
  const response = await client.post('/api/endpoint', body);
  
  // Assert - Verify results
  assert.httpOk(response);
});
```

## ⚙️ Configuration

Edit `config/default.js` or use environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | API server base URL | `http://localhost:8877` |
| `API_KEY` | API authentication key | `outsea_fu9etech` |
| `TEST_ACCOUNT_ID` | Test account ID | `1` |
| `VERBOSE` | Enable verbose logging | `false` |

## 📄 License

MIT
