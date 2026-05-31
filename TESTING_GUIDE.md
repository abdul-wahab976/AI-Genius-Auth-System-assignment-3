# Testing Guide - AI-Genius Authentication System

Complete guide to test all endpoints and verify the authentication & authorization system.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 3. Server Should Output
```
╔════════════════════════════════════════╗
║   AI-Genius Auth System Server         ║
║   Running on port 3000                 ║
║   Environment: development             ║
╚════════════════════════════════════════╝

📚 API Documentation: http://localhost:3000/api/info
🏥 Health Check: http://localhost:3000/api/health
```

---

## 🧪 Test Scenarios

### Test Suite 1: Health & Info Endpoints

#### Test 1.1 - Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

**Expected:** 200 OK status

---

#### Test 1.2 - API Information
```bash
curl -X GET http://localhost:3000/api/info
```

**Expected:** 200 OK status with complete API documentation

---

### Test Suite 2: Authentication Flow

#### Test 2.1 - Successful Login (Admin)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ai-genius.com",
    "password": "admin123"
  }' \
  -v
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@ai-genius.com",
      "role": "Admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  }
}
```

**Check:** 
- ✅ Cookie header contains `Set-Cookie: refreshToken=...`
- ✅ Response includes accessToken
- ✅ Status code: 200

---

#### Test 2.2 - Invalid Credentials
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ai-genius.com",
    "password": "wrongpassword"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "INVALID_CREDENTIALS"
}
```

**Check:**
- ✅ Status code: 401
- ✅ No accessToken in response
- ✅ No cookie set

---

#### Test 2.3 - Missing Credentials
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Email and password are required",
  "errorCode": "MISSING_CREDENTIALS"
}
```

**Check:**
- ✅ Status code: 400
- ✅ Clear error message

---

### Test Suite 3: Access Control (Using Admin Token)

#### Test 3.1 - Login & Save Token
```bash
# Run this first to get a token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ai-genius.com","password":"admin123"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo $TOKEN
```

---

#### Test 3.2 - Access Free Model (Admin)
```bash
curl -X GET http://localhost:3000/api/ai/free-model \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Free model access granted",
  "data": {
    "model": "GPT-2 Free Tier",
    "description": "Basic text generation model available to all users",
    "capabilities": ["text-generation", "basic-summarization"],
    "maxTokens": 100,
    "rateLimit": "10 requests/hour",
    "accessedBy": {
      "userId": 1,
      "email": "admin@ai-genius.com",
      "role": "Admin"
    }
  }
}
```

**Check:**
- ✅ Status code: 200
- ✅ User information in response shows Admin role

---

#### Test 3.3 - Access Premium Model (Admin)
```bash
curl -X POST http://localhost:3000/api/ai/premium-model \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Generate code for REST API"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Premium model access granted",
  "data": {
    "model": "GPT-4 Premium",
    "capabilities": ["advanced-text-generation", "image-generation", "summarization", "code-generation"],
    "maxTokens": 2048,
    "rateLimit": "100 requests/hour",
    "userPrompt": "Generate code for REST API",
    "generatedResponse": "This is a mock response from the premium AI model...",
    "accessedBy": {
      "userId": 1,
      "email": "admin@ai-genius.com",
      "role": "Admin"
    }
  }
}
```

**Check:**
- ✅ Status code: 200
- ✅ Premium model features accessible
- ✅ User prompt echoed in response

---

#### Test 3.4 - Admin Cache Purge
```bash
curl -X DELETE http://localhost:3000/api/ai/purge-cache \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Cache purged successfully",
  "data": {
    "operation": "purge-cache",
    "timestamp": "2024-01-15T10:40:00.000Z",
    "clearedItems": {
      "userCache": 1250,
      "modelCache": 345,
      "tokenBlacklist": 89
    },
    "totalSize": "2.4 MB",
    "performedBy": {
      "userId": 1,
      "email": "admin@ai-genius.com",
      "role": "Admin"
    }
  }
}
```

**Check:**
- ✅ Status code: 200
- ✅ Admin operation successful

---

### Test Suite 4: Role-Based Access Control (RBAC)

#### Test 4.1 - Free User Accessing Free Model ✅
```bash
# Login as free user
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@ai-genius.com","password":"user123"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Try to access free model
curl -X GET http://localhost:3000/api/ai/free-model \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 200 OK ✅

---

#### Test 4.2 - Free User Accessing Premium Model ❌
```bash
# Using same token from Test 4.1
curl -X POST http://localhost:3000/api/ai/premium-model \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Forbidden: Only users with role(s) Premium_User, Admin can access this resource",
  "errorCode": "INSUFFICIENT_PERMISSIONS",
  "requiredRoles": ["Premium_User", "Admin"],
  "userRole": "Free_User"
}
```

**Check:**
- ✅ Status code: 403 Forbidden
- ✅ Clear message about required roles

---

#### Test 4.3 - Free User Accessing Admin Endpoint ❌
```bash
curl -X DELETE http://localhost:3000/api/ai/purge-cache \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Forbidden: Only users with role(s) Admin can access this resource",
  "errorCode": "INSUFFICIENT_PERMISSIONS",
  "requiredRoles": ["Admin"],
  "userRole": "Free_User"
}
```

**Check:**
- ✅ Status code: 403 Forbidden

---

#### Test 4.4 - Premium User Accessing Premium Model ✅
```bash
# Login as premium user
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"premium@ai-genius.com","password":"premium123"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Access premium model
curl -X POST http://localhost:3000/api/ai/premium-model \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

**Expected:** 200 OK ✅

---

#### Test 4.5 - Premium User Cannot Access Admin Endpoint ❌
```bash
curl -X DELETE http://localhost:3000/api/ai/purge-cache \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 403 Forbidden ❌

---

### Test Suite 5: Token Validation

#### Test 5.1 - Missing Authorization Header
```bash
curl -X GET http://localhost:3000/api/ai/free-model
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized: No token provided",
  "errorCode": "NO_TOKEN"
}
```

**Check:**
- ✅ Status code: 401

---

#### Test 5.2 - Invalid Token
```bash
curl -X GET http://localhost:3000/api/ai/free-model \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized: Invalid token",
  "errorCode": "INVALID_TOKEN"
}
```

**Check:**
- ✅ Status code: 401

---

#### Test 5.3 - Missing Bearer Prefix
```bash
curl -X GET http://localhost:3000/api/ai/free-model \
  -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized: No token provided",
  "errorCode": "NO_TOKEN"
}
```

---

### Test Suite 6: Token Refresh

#### Test 6.1 - Refresh Token
```bash
# Login first (saves cookie automatically)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ai-genius.com","password":"admin123"}' \
  -c cookies.txt

# Refresh token using cookie
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  }
}
```

**Check:**
- ✅ Status code: 200
- ✅ New accessToken provided

---

#### Test 6.2 - Refresh Without Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized: No refresh token found",
  "errorCode": "NO_REFRESH_TOKEN"
}
```

---

### Test Suite 7: Logout

#### Test 7.1 - Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Check:**
- ✅ Status code: 200
- ✅ Cookie cleared (`Set-Cookie: refreshToken=; Max-Age=0`)

---

#### Test 7.2 - Try Refresh After Logout
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt
```

**Expected:** 401 Unauthorized (token removed from whitelist)

---

## 📊 Test Coverage Summary

| Feature | Tests | Status |
|---------|-------|--------|
| **Health & Info** | 2 | ✅ |
| **Authentication** | 3 | ✅ |
| **Access Control** | 4 | ✅ |
| **RBAC** | 5 | ✅ |
| **Token Validation** | 3 | ✅ |
| **Token Refresh** | 2 | ✅ |
| **Logout** | 2 | ✅ |
| **TOTAL** | **21 Tests** | ✅ |

---

## 🔍 Debugging Tips

### 1. Check Token Content
```bash
# Decode token (no verification, just see payload)
node -e "console.log(JSON.stringify(require('jsonwebtoken').decode('YOUR_TOKEN'), null, 2))"
```

### 2. Monitor Server Logs
```bash
# Run with detailed logging
NODE_ENV=development npm run dev
```

### 3. Use Postman/Insomnia
- Import API collection from `/api/info` endpoint
- Set environment variable for `access_token`
- Use pre-request scripts for auto-refresh

### 4. Check Cookies
```bash
# View saved cookies
cat cookies.txt
```

---

## ✅ Test Checklist

- [ ] All 21 tests pass
- [ ] Free user can access free model
- [ ] Free user cannot access premium model
- [ ] Free user cannot access admin endpoints
- [ ] Premium user can access free and premium models
- [ ] Premium user cannot access admin endpoints
- [ ] Admin can access all endpoints
- [ ] Token refresh works correctly
- [ ] Logout invalidates refresh token
- [ ] Expired tokens return 401
- [ ] Invalid tokens return 401
- [ ] Missing token returns 401
- [ ] RBAC restrictions enforced correctly
- [ ] Error messages are clear and helpful

---

## 📝 Notes

- Passwords are pre-hashed using bcryptjs
- Refresh tokens are stored in httpOnly cookies (CSRF protected)
- Access tokens are short-lived (15 minutes)
- Refresh tokens are long-lived (7 days)
- All sensitive operations return clear error messages
- Database is in-memory mock (can be replaced with MongoDB/PostgreSQL)

---

**Test Environment:** Node.js with Express
**Last Updated:** 2024-01-15
