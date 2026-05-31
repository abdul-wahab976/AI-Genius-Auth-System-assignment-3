/**
 * Role-Based Access Control (RBAC) Middleware
 * Factory function to create authorization middleware for specific roles
 */

/**
 * restrictTo(...roles) - Authorization middleware factory
 * 
 * Usage:
 *   router.delete('/api/ai/purge-cache', protect, restrictTo('Admin'), deleteHandler);
 *   router.post('/api/ai/premium-model', protect, restrictTo('Premium_User', 'Admin'), postHandler);
 *
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user object exists (should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated',
        errorCode: 'NOT_AUTHENTICATED'
      });
    }

    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Only users with role(s) ${roles.join(', ')} can access this resource`,
        errorCode: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = {
  restrictTo
};
