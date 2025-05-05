const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const { UnauthorizedError, NotFoundError } = require('../errors/HttpErrors');
const logger = require('../utils/logger');
const { log } = require('winston');


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