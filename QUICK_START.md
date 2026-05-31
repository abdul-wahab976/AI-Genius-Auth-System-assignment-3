# 🚀 Quick Start Guide

Complete AI-Genius Authentication System - Get Started in 5 Minutes!

## ⚡ 5-Minute Startup

### 1. Install Dependencies (1 min)
```bash
npm install
```

**What it does:** Installs all required packages:
- express (web framework)
- jsonwebtoken (JWT handling)
- bcryptjs (password hashing)
- dotenv (environment variables)
- cors (cross-origin requests)
- cookie-parser (cookie handling)

### 2. Verify .env File (30 sec)
Check that `.env` file exists in root directory with these values:
```env
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_12345
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
```

✅ All set by default - no changes needed for development!

### 3. Start Server (1 min)
```bash
npm start
```

**Expected Output:**
```
╔════════════════════════════════════════╗
║   AI-Genius Auth System Server         ║
║   Running on port 3000                 ║
║   Environment: development             ║
╚════════════════════════════════════════╝

📚 API Documentation: http://localhost:3000/api/info
🏥 Health Check: http://localhost:3000/api/health
```

### 4. Test It Works (2 min)
Open your browser and visit:
```
http://localhost:3000/api/info
```

You should see complete API documentation with test credentials!

---

## 🧪 Quick Test

### Test Login (Copy & Paste)

**In your terminal:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ai-genius.com","password":"admin123"}' \
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
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  }
}
```

✅ **Success!** Your server is working!

---

## 👥 Test Users

Use these credentials to test the system:

### Admin Account
```
Email:    admin@ai-genius.com
Password: admin123
Role:     Admin (full access)
```

### Premium User
```
Email:    premium@ai-genius.com
Password: premium123
Role:     Premium_User (premium features)
```

### Free User
```
Email:    user@ai-genius.com
Password: user123
Role:     Free_User (basic features)
```

---

## 📚 Next Steps

### For Learning:
1. Read [README.md](README.md) - Complete API documentation
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) - How everything works
3. Read [TESTING_GUIDE.md](TESTING_GUIDE.md) - All test scenarios

### For Testing:
1. Open [TESTING_GUIDE.md](TESTING_GUIDE.md)
2. Copy test commands and run them
3. Verify all 21 tests pass

### For Integration:
1. Read [CLIENT_EXAMPLES.js](CLIENT_EXAMPLES.js)
2. Use provided functions in your frontend
3. Implement auto-token refresh

---

## 🔑 Three Most Important Files

### 1. **server.js** - Main Server
Starts the Express app and registers all routes.

**Start command:**
```bash
node server.js
```

### 2. **database.js** - User Data
Contains user accounts and token whitelist. Replace with MongoDB/PostgreSQL in production.

**Test users pre-created:**
- admin@ai-genius.com (password: admin123)
- premium@ai-genius.com (password: premium123)
- user@ai-genius.com (password: user123)

### 3. **.env** - Configuration
Stores secrets and settings. **NEVER commit this to git!**

**Required variables:**
```env
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-secret-key
PORT=3000
```

---

## 🎯 Project Checklist

Complete these to verify everything works:

- [ ] `npm install` runs without errors
- [ ] `npm start` starts the server
- [ ] Server outputs welcome message
- [ ] http://localhost:3000/api/health returns 200 OK
- [ ] http://localhost:3000/api/info returns API documentation
- [ ] Admin login works with curl
- [ ] Access token is returned
- [ ] Refresh token is set in cookie
- [ ] All 21 tests in TESTING_GUIDE pass

---

## ❓ Common Issues & Solutions

### Issue: `npm install` fails
**Solution:** 
```bash
# Clear npm cache
npm cache clean --force
# Try again
npm install
```

### Issue: "Cannot find module 'dotenv'"
**Solution:**
```bash
npm install
```

### Issue: Port 3000 already in use
**Solution:** Change PORT in .env
```env
PORT=3001
```

### Issue: "jwt malformed"
**Solution:** Make sure to send token with "Bearer " prefix:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Issue: CORS errors
**Solution:** Check that credentials flag is set in fetch:
```javascript
fetch(url, {
  credentials: 'include'
})
```

---

## 📊 File Purpose Summary

| File | Purpose |
|------|---------|
| **server.js** | Main Express application |
| **database.js** | Mock user database & token storage |
| **authRoutes.js** | Login, refresh, logout endpoints |
| **aiRoutes.js** | Protected AI endpoints |
| **authMiddleware.js** | JWT token verification |
| **rbacMiddleware.js** | Role-based access control |
| **tokenUtils.js** | JWT utility functions |
| **hashPassword.js** | Password hashing tool |
| **package.json** | Node.js dependencies |
| **.env** | Configuration (secrets) |
| **README.md** | Full API documentation |
| **ARCHITECTURE.md** | System design & implementation |
| **TESTING_GUIDE.md** | Test procedures |
| **CLIENT_EXAMPLES.js** | Client-side code examples |

---

## 🚀 What You've Built

✅ **Secure Authentication System**
- JWT tokens (access + refresh)
- Bcrypt password hashing
- httpOnly cookie protection

✅ **Authorization System**
- Role-Based Access Control (RBAC)
- Three user tiers (Admin, Premium, Free)
- Protected endpoints

✅ **API Endpoints**
- 3 Authentication endpoints
- 3 Protected AI endpoints
- Complete error handling

✅ **Security Features**
- Token expiration
- Token refresh mechanism
- Silent logout
- CORS protection
- XSS protection

✅ **Documentation**
- API documentation
- Architecture guide
- Testing procedures
- Client examples

---

## 💡 Pro Tips

1. **Use Postman/Insomnia** - Easier than cURL for testing
2. **Check logs** - Server outputs helpful debug info
3. **Decode tokens** - Visit jwt.io to see token contents
4. **Monitor cookies** - Browser DevTools > Application > Cookies
5. **Use environment variables** - Never hardcode secrets

---

## 🎓 Learning Path

### Beginner
- [ ] Start server
- [ ] Test login endpoint
- [ ] Understand access token

### Intermediate
- [ ] Understand JWT structure
- [ ] Test all RBAC scenarios
- [ ] Implement token refresh

### Advanced
- [ ] Replace mock database with MongoDB
- [ ] Add rate limiting
- [ ] Implement 2FA
- [ ] Add email verification

---

## 📞 Need Help?

1. **Server won't start?** → Check PORT not in use
2. **Login fails?** → Check email/password from QUICK TEST section
3. **403 errors?** → Check user role has access
4. **401 errors?** → Check token is valid and not expired
5. **CORS issues?** → Check credentials: 'include' in fetch

---

## ✨ Congratulations!

You now have a production-ready authentication system! 🎉

**Next:** Read the full documentation in README.md and ARCHITECTURE.md

**Questions?** Check TESTING_GUIDE.md for detailed examples

---

**Last Updated:** 2024-01-15
**Setup Time:** ~5 minutes ⏱️
**Status:** ✅ Ready to Use
