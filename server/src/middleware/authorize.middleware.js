const { ForbiddenError } = require('../errors/HttpErrors');

/**
 * Authorization middleware
 * Checks if the user has the required role to access the resource
 * Must be used after authentication middleware
 * 
 * @param {string|string[]} requiredRoles - The role(s) required to access the resource
 * @returns {Function} Express middleware
 */
const authorize = (requiredRoles) => {
  // Convert to array if single role is provided
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return (req, res, next) => {
    // Check if authenticated user exists
    if (!req.user) {
      return next(new ForbiddenError('User must be authenticated'));
    }
    
    // Check if user's role is in the required roles
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }
    
    // User is authorized
    next();
  };
};

module.exports = authorize;