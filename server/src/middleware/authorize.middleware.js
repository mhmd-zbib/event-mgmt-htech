const { ForbiddenError, UnauthorizedError } = require('../errors/HttpErrors');
const logger = require('../utils/logger');

/**
 * Authorization middleware
 * Checks if authenticated user has the required role or passes custom checks
 * @param {Object|string|Array} options - Role(s) or options object
 * @param {string|Array} options.roles - Required role(s)
 * @param {Function} options.customCheck - Custom authorization check function
 * @returns {Function} Express middleware
 */
const authorize = (options) => {
  if (typeof options === 'string' || Array.isArray(options)) {
    options = { roles: options };
  }
  
  const roles = options.roles ? 
    (Array.isArray(options.roles) ? options.roles : [options.roles]) : 
    [];
  
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    
    const roleAuthorized = roles.length === 0 || roles.includes(req.user.role);
    const customAuthorized = !options.customCheck || options.customCheck(req);
    
    if (roleAuthorized && customAuthorized) {
      return next();
    }
    
    logger.warn('Authorization failure', {
      userId: req.user.id,
      userRole: req.user.role,
      requiredRoles: roles,
      path: req.path,
      method: req.method,
      requestId: req.id,
      customCheckFailed: roleAuthorized && !customAuthorized
    });
    
    return next(new ForbiddenError('You do not have permission to access this resource'));
  };
};

module.exports = authorize;