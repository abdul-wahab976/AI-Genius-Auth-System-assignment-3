# AI-Genius Authentication & Authorization System

A secure, stateless authentication and authorization subsystem built with Node.js, Express, and JWT (JSON Web Tokens). This system implements Role-Based Access Control (RBAC) for a SaaS platform offering premium AI text and image generation services.

## 📋 Features

✅ **JWT-Based Authentication**
- Access tokens (short-lived: 15 minutes)
- Refresh tokens (long-lived: 7 days)
- Secure httpOnly cookies for token storage

✅ **Role-Based Access Control (RBAC)**
- Admin: Full access to all resources
- Premium_User: Access to premium AI models
- Free_User: Access to basic free tier only

✅ **Secure Password Handling**
- Bcryptjs for password hashing and salting
- No plaintext passwords stored

✅ **Token Lifecycle Management**
- Token expiration handling
- Silent token refresh mechanism
- Token whitelist/blacklist support

✅ **Error Handling**
- Centralized error response format
- HTTP status codes (401, 403, 404, 500)
- Meaningful error messages and codes

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv
- **Cookie Handling**: cookie-parser
- **CORS**: cors

## 📦 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

# Database (can be replaced with MongoDB/PostgreSQL)
DATABASE_URL=http://localhost:27017/ai-genius

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Available Endpoints

#### 1. **Health Check**
```
GET /health
```
Check if server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

#### 2. **API Info/Documentation**
```
GET /info
```
Get complete API documentation and test credentials.

---

### 🔐 Authentication Endpoints

#### **Login**
```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@ai-genius.com",
  "password": "admin123"
}
```

**Success Response (200):**
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
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "INVALID_CREDENTIALS"
}
```

**Note:** Refresh token is automatically set in `httpOnly` cookie.

---

#### **Refresh Token**
```
POST /auth/refresh
Cookie: refreshToken=<refresh_token_from_login>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  }
}
```

---

#### **Logout**
```
POST /auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 🤖 Protected AI Endpoints

#### **Free Model Access** (All authenticated users)
```
GET /ai/free-model
Authorization: Bearer <access_token>
```

**Success Response (200):**
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
      "userId": 3,
      "email": "user@ai-genius.com",
      "role": "Free_User"
    }
  }
}
```

---

#### **Premium Model Access** (Premium_User and Admin)
```
POST /ai/premium-model
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "prompt": "Generate a creative story about AI"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Premium model access granted",
  "data": {
    "model": "GPT-4 Premium",
    "capabilities": ["advanced-text-generation", "image-generation", "summarization", "code-generation"],
    "maxTokens": 2048,
    "rateLimit": "100 requests/hour",
    "userPrompt": "Generate a creative story about AI",
    "generatedResponse": "This is a mock response from the premium AI model...",
    "accessedBy": {
      "userId": 2,
      "email": "premium@ai-genius.com",
      "role": "Premium_User"
    }
  }
}
```

**Forbidden Response (403) - Free User Accessing Premium:**
```json
{
  "success": false,
  "message": "Forbidden: Only users with role(s) Premium_User, Admin can access this resource",
  "errorCode": "INSUFFICIENT_PERMISSIONS",
  "requiredRoles": ["Premium_User", "Admin"],
  "userRole": "Free_User"
}
```

---

#### **Purge Cache** (Admin only)
```
DELETE /ai/purge-cache
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cache purged successfully",
  "data": {
    "operation": "purge-cache",
    "timestamp": "2024-01-15T10:35:00.000Z",
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

---

## 👤 Test Credentials

Use these credentials to test the API:

### Admin Account
```
Email: admin@ai-genius.com
Password: admin123
Role: Admin (access to all endpoints)
```

### Premium User Account
```
Email: premium@ai-genius.com
Password: premium123
Role: Premium_User (access to premium endpoints)
```

### Free User Account
```
Email: user@ai-genius.com
Password: user123
Role: Free_User (access only to free tier)
```

---

## 🔑 JWT Token Structure

### Access Token Payload
```json
{
  "id": 1,
  "email": "admin@ai-genius.com",
  "role": "Admin",
  "iat": 1705318200,
  "exp": 1705319100
}
```

### Refresh Token Payload
```json
{
  "id": 1,
  "email": "admin@ai-genius.com",
  "role": "Admin",
  "iat": 1705318200,
  "exp": 1705923000
}
```

---

## 🔒 Security Features

1. **Password Security**
   - Bcryptjs hashing with salt rounds
   - No plaintext passwords in database

2. **Token Security**
   - Signed JWTs with secret keys
   - Different secrets for access and refresh tokens
   - Refresh token stored in httpOnly cookie (not accessible via JavaScript)
   - SameSite=strict CSRF protection

3. **Authentication & Authorization**
   - Bearer token validation
   - Role-based access control (RBAC)
   - Request user validation

4. **Error Handling**
   - No sensitive information in error messages
   - Standardized error response format
   - Proper HTTP status codes

---

## 📁 Project Structure

```
Assignment-3/
├── server.js                 # Main Express app
├── package.json              # Dependencies
├── .env                       # Environment variables
├── .env.example              # Example environment file
├── database.js               # Mock database and models
├── authMiddleware.js         # Authentication middleware
├── rbacMiddleware.js         # Role-based access control
├── authRoutes.js             # Auth endpoints (login, refresh, logout)
├── aiRoutes.js               # Protected AI endpoints
├── tokenUtils.js             # JWT utility functions
└── README.md                 # This file
```

---

## 🧪 Testing with cURL

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ai-genius.com","password":"admin123"}' \
  -v
```

### 2. Access Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/ai/free-model \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Premium Endpoint (Admin)
```bash
curl -X POST http://localhost:3000/api/ai/premium-model \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello AI"}'
```

### 4. Admin-Only Endpoint
```bash
curl -X DELETE http://localhost:3000/api/ai/purge-cache \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN" \
  -v
```

---

## 📝 Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NO_TOKEN` | 401 | Authorization header missing or invalid |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `INVALID_TOKEN` | 401 | Token signature is invalid |
| `INVALID_CREDENTIALS` | 401 | Email or password is incorrect |
| `INSUFFICIENT_PERMISSIONS` | 403 | User role doesn't have access |
| `NOT_AUTHENTICATED` | 401 | User not authenticated |
| `MISSING_CREDENTIALS` | 400 | Email or password missing in request |
| `MISSING_PROMPT` | 400 | Prompt required for endpoint |
| `NOT_FOUND` | 404 | Endpoint not found |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 🚀 Production Deployment Checklist

- [ ] Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random strings
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (enable `secure: true` for cookies)
- [ ] Replace mock database with MongoDB/PostgreSQL
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up API monitoring and logging
- [ ] Use helmet.js for additional security headers
- [ ] Enable request validation
- [ ] Set up email verification for registration
- [ ] Implement 2FA for premium accounts

---

## 📚 Learning Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

---

## 📧 Support

For questions or issues, please refer to the assignment requirements or consult the API documentation at `/api/info`.

---

**Created for MA 216: Web Engineering and AI**
Faculty of Computing and AI, Air University, Islamabad
