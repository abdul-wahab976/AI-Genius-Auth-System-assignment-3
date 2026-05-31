/**
 * Token Utilities
 * Helper functions for JWT token operations
 */

const jwt = require('jsonwebtoken');

/**
 * Generate Access Token
 */
const generateAccessToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m' }
  );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
  );
};

/**
 * Verify Token
 */
const verifyToken = (token, isRefresh = false) => {
  try {
    const secret = isRefresh 
      ? process.env.JWT_REFRESH_SECRET 
      : process.env.JWT_SECRET;
    
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

/**
 * Decode Token (without verification)
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};
