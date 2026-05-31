/**
 * Mock Database
 * In production, replace with MongoDB, PostgreSQL, or any other database
 * This demonstrates the structure and fields needed
 */

// Mock users storage (in-memory)
// In production: Use bcryptjs.hash() to generate these
let mockUsers = [
  {
    id: 1,
    email: 'admin@ai-genius.com',
    // Password: "admin123" - pre-hashed with bcryptjs
    password: '$2a$10$8FaUkd5gr1epeyA3lHGUKe91xiIhJwFR6IDwL7DJJlRU8eXv897YK',
    role: 'Admin'
  },
  {
    id: 2,
    email: 'premium@ai-genius.com',
    // Password: "premium123" - pre-hashed with bcryptjs
    password: '$2a$10$jRhhHQK4kKdgi7Yb0rimCOTL59.IB9e82.dsFNMv.4HUGHen8hA62',
    role: 'Premium_User'
  },
  {
    id: 3,
    email: 'user@ai-genius.com',
    // Password: "user123" - pre-hashed with bcryptjs
    password: '$2a$10$hRPA1J6Es827L2FDXgeYuuclrFxgN/1ljsAGGWPmvK8XismWZ16Zq',
    role: 'Free_User'
  }
];

// Refresh token whitelist (in production: store in Redis or DB)
let refreshTokenWhitelist = new Set();

// User model operations
const User = {
  // Find user by email
  findByEmail: (email) => {
    return mockUsers.find(user => user.email === email);
  },

  // Find user by ID
  findById: (id) => {
    return mockUsers.find(user => user.id === id);
  },

  // Get user without password
  findByIdSafe: (id) => {
    const user = mockUsers.find(user => user.id === id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Create new user (for registration)
  create: (email, hashedPassword, role = 'Free_User') => {
    const newUser = {
      id: mockUsers.length + 1,
      email,
      password: hashedPassword,
      role
    };
    mockUsers.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  // All users (for admin purposes - without passwords)
  getAll: () => {
    return mockUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
};

// Refresh token operations
const RefreshToken = {
  // Add token to whitelist
  add: (token) => {
    refreshTokenWhitelist.add(token);
  },

  // Check if token exists in whitelist
  exists: (token) => {
    return refreshTokenWhitelist.has(token);
  },

  // Remove token from whitelist (logout)
  remove: (token) => {
    refreshTokenWhitelist.delete(token);
  },

  // Clear all tokens (for debugging)
  clear: () => {
    refreshTokenWhitelist.clear();
  }
};

module.exports = {
  User,
  RefreshToken
};
