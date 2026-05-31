# System Architecture & Implementation Guide

Comprehensive documentation of the AI-Genius Authentication & Authorization System.

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [Authorization (RBAC) Flow](#authorization-rbac-flow)
4. [Token Lifecycle](#token-lifecycle)
5. [Database Schema](#database-schema)
6. [Security Considerations](#security-considerations)
7. [File Structure](#file-structure)
8. [Implementation Details](#implementation-details)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATION                       │
│              (Browser, Mobile App, or Desktop)               │
└────────────────────────────┬────────────────────────────────┘
                             │
                  HTTP/HTTPS Requests
                             │
         ┌───────────────────▼───────────────────┐
         │    Express.js Server (Port 3000)      │
         └───────────────────┬───────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────────┐    ┌──────────────┐    ┌────────────┐
    │   AUTH     │    │   PROTECTED  │    │    RBAC    │
    │ MIDDLEWARE │    │  MIDDLEWARE  │    │ MIDDLEWARE │
    │            │    │              │    │            │
    │ (JWT       │    │ (Verifies    │    │ (Checks    │
    │ Verify)    │    │  Bearer      │    │  User      │
    │            │    │  Token)      │    │  Role)     │
    └────────────┘    └──────────────┘    └────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                   ┌─────────▼─────────┐
                   │   ROUTE HANDLERS  │
                   │                   │
                   │ • Login           │
                   │ • Refresh         │
                   │ • Logout          │
                   │ • AI Endpoints    │
                   └─────────┬─────────┘
                             │
                   ┌─────────▼─────────┐
                   │   MOCK DATABASE   │
                   │                   │
                   │ • Users           │
                   │ • Refresh Tokens  │
                   │ • Whitelist       │
                   └───────────────────┘
```

---

## 🔐 Authentication Flow

### Step-by-Step Login Process

```
1. CLIENT SENDS CREDENTIALS
   ┌─────────────────────────────┐
   │ POST /api/auth/login        │
   │ {                           │
   │   "email": "...",          │
   │   "password": "..."        │
   │ }                           │
   └──────────────┬──────────────┘
                  │
2. SERVER VALIDATES
   ├─ Check if email exists in DB
   ├─ Compare password with bcrypt
   └─ Return 401 if invalid
                  │
3. GENERATE TOKENS
   ├─ Access Token: jwt.sign(payload, JWT_SECRET, {expiresIn: 15m})
   │  payload: {id, email, role}
   │
   └─ Refresh Token: jwt.sign(payload, JWT_REFRESH_SECRET, {expiresIn: 7d})
                  │
4. STORE REFRESH TOKEN
   ├─ Add to database whitelist
   └─ Set in httpOnly cookie (secure, sameSite=strict)
                  │
5. RETURN RESPONSE
   ┌─────────────────────────────┐
   │ 200 OK                      │
   │ {                           │
   │   "accessToken": "...",    │
   │   "tokenType": "Bearer",   │
   │   "expiresIn": "15m"       │
   │ }                           │
   │                             │
   │ Cookie: refreshToken=...   │
   └─────────────────────────────┘
```

### JWT Token Payload Structure

```javascript
// Access Token Payload
{
  "id": 1,
  "email": "user@ai-genius.com",
  "role": "Premium_User",
  "iat": 1705318200,           // Issued at
  "exp": 1705319100            // Expires at (15 min later)
}

// Refresh Token Payload (same structure, longer expiration)
{
  "id": 1,
  "email": "user@ai-genius.com",
  "role": "Premium_User",
  "iat": 1705318200,
  "exp": 1705923000            // Expires at (7 days later)
}
```

---

## 🛡️ Authorization (RBAC) Flow

### Protected Endpoint Request

```
1. CLIENT MAKES AUTHENTICATED REQUEST
   ┌──────────────────────────────────────┐
   │ GET /api/ai/premium-model            │
   │ Authorization: Bearer ACCESS_TOKEN   │
   └────────────┬─────────────────────────┘
                │
2. PROTECT MIDDLEWARE
   ├─ Extract token from Authorization header
   ├─ Verify signature using JWT_SECRET
   ├─ Decode payload
   ├─ Return 401 if invalid/expired
   └─ Attach user to req.user if valid
                │
3. RBAC MIDDLEWARE (restrictTo)
   ├─ Check req.user exists
   ├─ Compare req.user.role with allowed roles
   ├─ Return 403 if not authorized
   └─ Continue to handler if authorized
                │
4. ROUTE HANDLER EXECUTES
   ├─ Access req.user for user info
   ├─ Perform business logic
   └─ Return success response
                │
5. RETURN RESPONSE
   ┌──────────────────────────────────────┐
   │ 200 OK                               │
   │ {                                    │
   │   "success": true,                   │
   │   "data": {...}                      │
   │ }                                    │
   └──────────────────────────────────────┘
```

### Role-Based Access Matrix

| Endpoint | Free_User | Premium_User | Admin |
|----------|:---------:|:------------:|:-----:|
| GET /api/ai/free-model | ✅ | ✅ | ✅ |
| POST /api/ai/premium-model | ❌ | ✅ | ✅ |
| DELETE /api/ai/purge-cache | ❌ | ❌ | ✅ |

---

## ⏰ Token Lifecycle

### Complete Token Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                      │
└─────────────────────────────────────────────────────────┘

1. LOGIN
   └─ User logs in
   └─ Access Token (15m) + Refresh Token (7d) created
   └─ Refresh Token stored in httpOnly cookie

2. NORMAL OPERATION (< 15 minutes)
   └─ Client sends requests with Access Token
   └─ Server validates and processes requests

3. ACCESS TOKEN EXPIRES (after 15 minutes)
   
   ┌─ Client receives 401 TOKEN_EXPIRED error
   └─ Client automatically calls refresh endpoint
   
4. TOKEN REFRESH
   ├─ Client sends refresh token from cookie
   ├─ Server verifies refresh token
   ├─ Server checks whitelist
   ├─ Server generates new Access Token (15m)
   └─ Returns new Access Token
   
5. RESUME OPERATION
   └─ Client retries original request with new Access Token
   └─ Server processes request successfully

6. LOGOUT
   ├─ Client calls logout endpoint
   ├─ Server removes refresh token from whitelist
   ├─ Server clears cookie
   └─ Client clears localStorage

7. AFTER LOGOUT
   └─ Client cannot use stored tokens
   └─ Must login again to get new tokens

8. REFRESH TOKEN EXPIRES (after 7 days)
   └─ Refresh token becomes invalid
   └─ User must login again
```

### Timeline Example

```
Time        Event                           Access Token    Refresh Token
────────────────────────────────────────────────────────────────────────
10:00:00    Login                           ✅ Valid        ✅ Valid
10:05:00    API Call                        ✅ Valid        ✅ Valid
10:10:00    API Call                        ✅ Valid        ✅ Valid
10:14:55    API Call - Token Expires!       ❌ Expired      ✅ Valid
10:14:56    Auto-Refresh Called             (creating new)   ✅ Valid
10:14:57    New Token Generated             ✅ Valid        ✅ Valid
10:14:58    API Call with New Token         ✅ Valid        ✅ Valid
────────────────────────────────────────────────────────────────────────
7 days...   (After 7 days)                  ❌ Expired      ❌ Expired
            User Must Login Again
```

---

## 💾 Database Schema

### Users Table

```javascript
{
  id: Number,              // Unique identifier
  email: String,           // Unique email address
  password: String,        // Bcrypt hashed password (never plaintext)
  role: String,            // 'Admin', 'Premium_User', or 'Free_User'
  createdAt: Date,         // (optional) Account creation date
  updatedAt: Date          // (optional) Last update date
}

// Example records
[
  {
    id: 1,
    email: "admin@ai-genius.com",
    password: "$2a$10$8K.fKRi4UqUn2mqO.F4pKe.XqkY4v.HfCJU5w.VH4X0RKg.SFJ0.G",
    role: "Admin"
  },
  {
    id: 2,
    email: "premium@ai-genius.com",
    password: "$2a$10$X5JK.8n9Y2Q3z0R.B1c2Dexl.8Q4nV7w.KH9M2P5s.XqkY4v.HfC",
    role: "Premium_User"
  },
  {
    id: 3,
    email: "user@ai-genius.com",
    password: "$2a$10$L2P9K8m0Q1V5X3W.Z2D.ZefM.9R5oW8x.LI0N3Q6t.YqkY4v.HfC",
    role: "Free_User"
  }
]
```

### Refresh Token Whitelist

```javascript
// In-memory Set (in production, use Redis or DB)
refreshTokenWhitelist = Set [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  // ... more tokens
]

// Operations:
.add(token)          // Add token when user logs in
.has(token)          // Check if token is valid (exists)
.delete(token)       // Remove token when user logs out
.clear()             // Clear all tokens (emergency)
```

---

## 🔒 Security Considerations

### 1. Password Security

**Problem:** Storing plain text passwords is dangerous!

**Solution:** Use bcryptjs with salting

```javascript
// ✅ CORRECT: Hash password before storing
const hashedPassword = await bcrypt.hash(plainPassword, 10);
// Stores: $2a$10$... (never reveals original password)

// ✅ CORRECT: Compare on login
const isValid = await bcrypt.compare(providedPassword, storedHash);
```

### 2. Token Security

**Problem:** Tokens can be stolen from localStorage

**Solution:** Use httpOnly cookies for refresh tokens

```javascript
// ✅ CORRECT: Secure httpOnly cookie
res.cookie('refreshToken', token, {
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // Only sent over HTTPS (production)
  sameSite: 'strict'   // CSRF protection
});

// ❌ WRONG: Storing in localStorage
localStorage.setItem('refreshToken', token); // Vulnerable to XSS
```

### 3. JWT Secret Management

**Problem:** If secret is exposed, tokens can be forged

**Solution:** Use environment variables

```javascript
// ✅ CORRECT: Environment variable
const secret = process.env.JWT_SECRET;

// ❌ WRONG: Hardcoded in code
const secret = "my-secret-key"; // Version control leak!
```

### 4. Error Messages

**Problem:** Leaking too much info in errors

**Solution:** Generic error messages, detailed logs

```javascript
// ✅ CORRECT: Generic message
return res.status(401).json({
  message: "Invalid email or password",
  errorCode: "INVALID_CREDENTIALS"
});

// ❌ WRONG: Reveals user existence
return res.status(401).json({
  message: "User not found: john@example.com"
});
```

### 5. Token Validation

**Problem:** Invalid tokens should be rejected

**Solution:** Verify signature and expiration

```javascript
// ✅ CORRECT: Verify with secret
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// ❌ WRONG: Decode without verification
const decoded = jwt.decode(token); // Anyone can modify!
```

---

## 📁 File Structure & Responsibilities

```
Assignment-3/
│
├── server.js
│   ├─ Express app initialization
│   ├─ Middleware setup (bodyParser, cors, cookieParser)
│   ├─ Route registration
│   └─ Error handling & 404 routes
│
├── database.js
│   ├─ Mock user database
│   ├─ User model (CRUD operations)
│   ├─ Refresh token whitelist
│   └─ RefreshToken model
│
├── authMiddleware.js
│   ├─ protect() - Verify access token
│   └─ protectRefresh() - Verify refresh token from cookie
│
├── rbacMiddleware.js
│   └─ restrictTo(...roles) - Check user role authorization
│
├── authRoutes.js
│   ├─ POST /api/auth/login
│   ├─ POST /api/auth/refresh
│   └─ POST /api/auth/logout
│
├── aiRoutes.js
│   ├─ GET /api/ai/free-model (all users)
│   ├─ POST /api/ai/premium-model (Premium_User, Admin)
│   └─ DELETE /api/ai/purge-cache (Admin only)
│
├── tokenUtils.js
│   ├─ generateAccessToken()
│   ├─ generateRefreshToken()
│   ├─ verifyToken()
│   └─ decodeToken()
│
├── hashPassword.js
│   ├─ hashPassword() - Hash plain passwords
│   └─ comparePassword() - Verify passwords
│
├── package.json - Dependencies
├── .env - Environment variables
├── .gitignore - Git ignore rules
├── README.md - API documentation
├── TESTING_GUIDE.md - Testing procedures
├── ARCHITECTURE.md - This file
└── CLIENT_EXAMPLES.js - Client-side usage examples
```

---

## 🔧 Implementation Details

### Middleware Execution Order

```
REQUEST
   │
   ├─► app.use(express.json())           [Parse JSON body]
   │
   ├─► app.use(cookieParser())           [Parse cookies]
   │
   ├─► app.use(cors())                   [CORS handling]
   │
   ├─► app.use(authLogging)              [Log request]
   │
   └─► Route Handler Selection
        │
        ├─► PUBLIC ROUTES (/auth/login, /health)
        │   └─► Execute without auth
        │
        └─► PROTECTED ROUTES (/api/ai/*)
            │
            ├─► protect middleware         [Verify JWT]
            │
            ├─► restrictTo middleware      [Check role]
            │
            └─► Route handler              [Execute endpoint]
                │
                └─► RESPONSE
```

### Request Flow Example: Accessing Premium Model

```javascript
// 1. CLIENT REQUEST
GET /api/ai/premium-model
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...

// 2. PROTECT MIDDLEWARE EXECUTES
const authHeader = req.headers.authorization;  // Get header
const token = authHeader.split(' ')[1];         // Extract token
const decoded = jwt.verify(token, JWT_SECRET);  // Verify & decode
req.user = decoded;                             // Attach to request

// 3. RESTRICTTO MIDDLEWARE EXECUTES
if (!['Premium_User', 'Admin'].includes(req.user.role)) {
  return res.status(403).json({...});           // Reject if not authorized
}

// 4. ROUTE HANDLER EXECUTES
router.post('/premium-model', protect, restrictTo('Premium_User', 'Admin'), (req, res) => {
  // req.user is already validated and attached
  const { prompt } = req.body;
  // ... process request ...
});

// 5. RESPONSE SENT
200 OK
{
  "success": true,
  "data": {...}
}
```

---

## 🎓 Learning Outcomes

After completing this system, you will understand:

✅ **Authentication**
- JWT token generation and verification
- Access vs Refresh token distinction
- Token expiration and lifecycle

✅ **Authorization**
- Role-Based Access Control (RBAC)
- Middleware for role checking
- Access matrix design

✅ **Security**
- Password hashing with bcryptjs
- httpOnly cookie protection against XSS
- JWT secret management
- Error message sanitization

✅ **Express.js**
- Middleware chains
- Route protection
- Error handling
- CORS and cookie handling

✅ **Database Design**
- User schema design
- Token whitelist management
- Stateless authentication

---

## 📚 References

- [JWT.io - JWT Overview](https://jwt.io/)
- [OWASP JWT Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Express.js Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [Bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js/)

---

**Last Updated:** 2024-01-15
**Author:** AI-Genius Project Team
