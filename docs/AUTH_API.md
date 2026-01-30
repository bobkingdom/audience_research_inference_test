# 认证接口文档

## 概述

本文档描述 Audience Research API 的认证相关接口。所有认证接口基于 JWT (JSON Web Token) 实现。

---

## 接口列表

### 1. 常规登录

**路径:** `POST /api/auth/login`

**描述:** 使用邮箱和密码登录

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ✅ | 用户邮箱 |
| password | string | ✅ | 用户密码 |

**响应示例:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com",
    "picture": "https://...",
    "credits": 100,
    "vip": false
  }
}
```

**密码验证:** 使用 bcrypt 加密

---

### 2. 用户注册

**路径:** `POST /api/auth/register`

**描述:** 注册新用户账号

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | ✅ | 用户邮箱 |
| password | string | ✅ | 密码（至少6位） |
| name | string | ❌ | 用户名（可选） |
| invitation_code | string | ❌ | 邀请码（根据配置可选） |

**功能特性:**
- 支持邀请码验证（可配置开关）
- 开放注册时自动分配系统邀请码

**响应:** 返回 JWT token + 用户信息（格式同登录接口）

---

### 3. Google 登录/注册

**路径:** `POST /api/auth/google`

**描述:** 使用 Google 账号登录或注册

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| credential | string | ✅ | Google ID Token（从Google登录获取） |
| invitation_code | string | ❌ | 邀请码（新用户根据配置可选） |

**功能特性:**
- 已存在用户直接登录
- 新用户自动创建账号

**响应:** 返回 JWT token + 用户信息（格式同登录接口）

---

### 4. 获取当前用户信息

**路径:** `POST /api/auth/me`

**描述:** 获取当前登录用户的信息

**认证:** 需要 Bearer Token

**请求头:**
```
Authorization: Bearer <jwt_token>
```

**响应:** 返回当前登录用户的完整信息

---

## 认证特性

| 特性 | 状态 |
|------|------|
| JWT 认证流程 | ✅ |
| Google OAuth 集成 | ✅ |
| 邀请码系统（可配置） | ✅ |
| 开放注册自动分配邀请码 | ✅ |
| bcrypt 密码加密 | ✅ |
| 统一用户信息格式 | ✅ |

---

## 使用 JWT Token

登录成功后获取的 token 需要在后续 API 请求的 Header 中携带：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
