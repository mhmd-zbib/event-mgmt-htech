const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const { UnauthorizedError, NotFoundError } = require('../errors/HttpErrors');
const logger = require('../utils/logger');

module.exports = (options = {}) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (options.optional && (!authHeader || !authHeader.startsWith('Bearer '))) {
      return next();
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);
    
    const user = await userService.getUserById(decoded.id);
    
    if (!user) {
      return next(new NotFoundError('User no longer exists'));
    }
    
    if (options.roles && options.roles.length > 0 && !options.roles.includes(user.role)) {
      logger.warn('Unauthorized role access attempt', {
        userId: user.id,
        userRole: user.role,
        requiredRoles: options.roles,
        path: req.path,
        method: req.method,
        requestId: req.id
      });
      return next(new UnauthorizedError('You do not have permission to access this resource'));
    }
    
    req.user = user;
    
    next();
  } catch (error) {
    if (options.optional && error.name && 
        (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
      return next();
    }
    
    logger.warn('Authentication failure', {
      errorName: error.name,
      message: error.message,
      path: req.path,
      method: req.method,
      requestId: req.id
    });
    
    next(new UnauthorizedError('Invalid or expired token'));
  }
};