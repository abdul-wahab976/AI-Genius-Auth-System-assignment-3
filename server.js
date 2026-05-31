/**
 * AI-Genius Authentication & Authorization Server
 * Secure JWT-based auth system with RBAC
 * 
 * Start server: npm start (production) or npm run dev (development)
 */

require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Import routes
const authRoutes = require('./authRoutes');
const aiRoutes = require('./aiRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Authentication Routes
 * POST /api/auth/login
 * POST /api/auth/refresh
 * POST /api/auth/logout
 */
app.use('/api/auth', authRoutes);

/**
 * AI API Routes (Protected)
 * GET /api/ai/free-model - All authenticated users
 * POST /api/ai/premium-model - Premium_User and Admin
 * DELETE /api/ai/purge-cache - Admin only
 */
app.use('/api/ai', aiRoutes);

/**
 * Documentation/Info Endpoint
 */
app.get('/api/info', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'AI-Genius Authentication System',
    version: '1.0.0',
    endpoints: {
      health: {
        method: 'GET',
        path: '/api/health'
      },
      auth: {
        login: {
          method: 'POST',
          path: '/api/auth/login',
          body: { email: 'string', password: 'string' },
          description: 'Login and get access token + refresh token'
        },
        refresh: {
          method: 'POST',
          path: '/api/auth/refresh',
          description: 'Refresh access token using refresh token from cookie'
        },
        logout: {
          method: 'POST',
          path: '/api/auth/logout',
          description: 'Logout and invalidate refresh token'
        }
      },
      ai: {
        freeModel: {
          method: 'GET',
          path: '/api/ai/free-model',
          auth: 'Required (Bearer token)',
          roles: 'All authenticated users',
          description: 'Access free tier AI model'
        },
        premiumModel: {
          method: 'POST',
          path: '/api/ai/premium-model',
          auth: 'Required (Bearer token)',
          roles: 'Premium_User, Admin',
          body: { prompt: 'string' },
          description: 'Access premium AI model'
        },
        purgeCache: {
          method: 'DELETE',
          path: '/api/ai/purge-cache',
          auth: 'Required (Bearer token)',
          roles: 'Admin only',
          description: 'Admin operation to purge system cache'
        }
      }
    },
    testCredentials: {
      admin: {
        email: 'admin@ai-genius.com',
        password: 'admin123',
        role: 'Admin'
      },
      premium: {
        email: 'premium@ai-genius.com',
        password: 'premium123',
        role: 'Premium_User'
      },
      freeUser: {
        email: 'user@ai-genius.com',
        password: 'user123',
        role: 'Free_User'
      }
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 - Not Found
 */
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    errorCode: 'NOT_FOUND',
    path: req.path,
    method: req.method
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({
    success: false,
    message,
    errorCode: 'SERVER_ERROR'
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   AI-Genius Auth System Server         ║');
  console.log('║   Running on port ' + PORT + '              ║');
  console.log('║   Environment: ' + (process.env.NODE_ENV || 'development').padEnd(20) + '║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n📚 API Documentation: http://localhost:' + PORT + '/api/info');
  console.log('🏥 Health Check: http://localhost:' + PORT + '/api/health\n');
});

module.exports = app;
