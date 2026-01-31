# Inference Service V2 API Test Suite

基于 AAA (Arrange-Act-Assert) 测试方法的完整 API 测试套件。

## 📋 测试覆盖

| 模块 | 接口数 | 描述 |
|------|--------|------|
| Health | 4 | 健康检查、就绪状态 |
| Vector | 12 | 向量搜索、语义搜索、相似度搜索 |
| Audience Generate | 25+ | 受众生成、任务管理、访谈提取 |
| Focus Group | 20+ | 焦点小组创建、参与者管理、洞察分析 |
| Avatar | 15+ | 头像生成、批量处理、修复操作 |
| Async Survey | 10+ | 异步问卷、并行部署、批次管理 |
| Content Generation | 8+ | 内容生成、Reddit评论、文章生成 |

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
export API_BASE_URL="https://ext.survy.ai"
export API_KEY="outsea_fu9etech"
export JWT_TOKEN="your-jwt-token"  # 可选，用于认证接口
export TEST_ACCOUNT_ID="12"
```

### 运行测试

```bash
# 运行所有测试
npm test

# 仅运行冒烟测试（健康检查）
npm run test:smoke

# 运行特定模块
npm run test:module health
npm run test:module vector
npm run test:module audience-generate
npm run test:module focus-group
npm run test:module avatar
npm run test:module async-survey
npm run test:module content-generation

# 详细输出
npm run test:verbose

# 生成报告
npm run test:report
```

## 🌐 Web 服务模式

部署为 Web 服务后，可通过 HTTP 触发测试：

```bash
# 启动服务
npm start

# 触发测试
curl -X POST http://localhost:10000/run
curl -X POST http://localhost:10000/run?smoke=true
curl -X POST http://localhost:10000/run?module=health
```

### 登录页面

访问 `/login` 获取 JWT Token：
```
http://localhost:10000/login
```

## 📁 项目结构

```
.
├── config/
│   └── default.js        # 默认配置
├── lib/
│   ├── client.js         # API 客户端
│   └── utils.js          # 测试工具和断言
├── tests/
│   ├── health.test.js           # 健康检查测试
│   ├── vector.test.js           # 向量搜索测试
│   ├── audience-generate.test.js # 受众生成测试
│   ├── focus-group.test.js      # 焦点小组测试
│   ├── avatar.test.js           # 头像测试
│   ├── async-survey.test.js     # 异步问卷测试
│   └── content-generation.test.js # 内容生成测试
├── postman/
│   ├── inference-service-v2.json  # Postman 集合
│   └── backhour-ai.json           # 完整 API 集合
├── public/
│   └── login.html        # 登录页面
├── reports/              # 测试报告输出目录
├── runner.js             # 测试运行器
├── server.js             # Web 服务器
└── package.json
```

## 🧪 AAA 测试模式

每个测试用例遵循 AAA 模式：

```javascript
await test('POST /api/endpoint - Description', async () => {
  // Arrange - 准备测试数据
  const body = { ... };
  
  // Act - 执行 API 调用
  const response = await client.post('/api/endpoint', body);
  
  // Assert - 验证结果
  assert.httpOk(response, 'Should succeed');
});
```

## 📊 断言方法

| 方法 | 描述 |
|------|------|
| `assert.httpOk(response)` | 验证 HTTP 2xx |
| `assert.httpStatus(response, code)` | 验证特定状态码 |
| `assert.httpError(response)` | 验证 HTTP 错误 |
| `assert.http400(response)` | 验证 400 Bad Request |
| `assert.http401(response)` | 验证 401 Unauthorized |
| `assert.http404(response)` | 验证 404 Not Found |
| `assert.hasProperty(obj, prop)` | 验证对象属性 |
| `assert.isArray(value)` | 验证数组类型 |
| `assert.responseTime(response, maxMs)` | 验证响应时间 |

## 🔧 配置选项

| 环境变量 | 默认值 | 描述 |
|----------|--------|------|
| `API_BASE_URL` | `https://ext.survy.ai` | API 基础地址 |
| `API_KEY` | `outsea_fu9etech` | API 密钥 |
| `JWT_TOKEN` | - | JWT 认证令牌 |
| `TEST_ACCOUNT_ID` | `12` | 测试账户 ID |
| `VERBOSE` | `false` | 详细输出模式 |

## 📝 测试报告

测试报告保存在 `./reports/` 目录，格式：

```json
{
  "timestamp": "2026-01-31T10:00:00.000Z",
  "duration": "62.81s",
  "summary": {
    "total": 84,
    "passed": 70,
    "failed": 14,
    "passRate": "83.3%"
  },
  "tests": [...]
}
```

## 🚀 Render 部署

使用 `render.yaml` 一键部署：

```yaml
services:
  - type: web
    name: audience-research-test-api
    runtime: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: API_BASE_URL
        value: "https://ext.survy.ai"
      - key: API_KEY
        sync: false
```

## 📚 相关文档

- [认证接口文档](./docs/AUTH_API.md)
- [Postman 集合](./postman/)

## License

MIT
