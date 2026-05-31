/**
 * Authentication Routes
 * POST /api/auth/login - Login endpoint
 * POST /api/auth/refresh - Refresh token endpoint
 * POST /api/auth/logout - Logout endpoint
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, RefreshToken } = require('./database');
const { protectRefresh } = require('./authMiddleware');

const router = express.Router();

/**
 * POST /api/auth/login
 * Login endpoint - Verify credentials and return tokens
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        errorCode: 'MISSING_CREDENTIALS'
      });
    }

    // Find user
    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    // Create access token (short-lived)
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m'
      }
    );

    // Create refresh token (long-lived)
    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d'
      }
    );

    // Store refresh token in whitelist
    RefreshToken.add(refreshToken);

    // Set refresh token in httpOnly, secure, sameSite=strict cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    // Return user data and access token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        accessToken,
        tokenType: 'Bearer',
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh token endpoint - Issue new access token using refresh token
 */
router.post('/refresh', protectRefresh, async (req, res) => {
  try {
    const { refreshToken } = req;
    const userId = req.user.id;

    // Check if refresh token is in whitelist
    if (!RefreshToken.exists(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Refresh token not valid',
        errorCode: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Get updated user data
    const user = User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Create new access token
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m'
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        tokenType: 'Bearer',
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m'
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint - Invalidate refresh token
 */
router.post('/logout', (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove from whitelist
      RefreshToken.remove(refreshToken);
    }

    // Clear cookie
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
