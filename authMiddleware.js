/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user data to request
 */

const jwt = require('jsonwebtoken');

/**
 * Protect middleware - Verifies JWT token
 * Reads Authorization: Bearer <token> header
 * Verifies signature and attaches user to req.user
 */
const protect = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
        errorCode: 'NO_TOKEN'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token expired',
        errorCode: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
        errorCode: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication failed',
      errorCode: 'AUTH_FAILED'
    });
  }
};

/**
 * Refresh token verification middleware
 * Used specifically for the refresh endpoint
 */
const protectRefresh = (req, res, next) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No refresh token found',
        errorCode: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Refresh token expired',
        errorCode: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid refresh token',
      errorCode: 'INVALID_REFRESH_TOKEN'
    });
  }
};

module.exports = {
  protect,
  protectRefresh
};
