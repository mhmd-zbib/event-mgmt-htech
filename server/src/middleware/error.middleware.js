const AppError = require('../errors/AppError');
const handleDatabaseError = require('../errors/DatabaseError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error with all relevant details
  logger.error('Request error', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    requestId: req.id, // Assuming request ID middleware is used
    userId: req.user?.id
  });
  
  // Handle database-related errors
  if (err.name && ['SequelizeValidationError', 'SequelizeUniqueConstraintError', 'SequelizeForeignKeyConstraintError'].includes(err.name)) {
    err = handleDatabaseError(err);
  }
  
  // Handle authentication and token errors
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    err = new AppError('Token expired', 401);
  }
  
  // Handle validation errors
  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message
    }));
    
    err = new AppError('Validation error', 422, formattedErrors);
  }
  
  // Handle any uncaught errors without a statusCode as 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    message: err.message || 'Internal Server Error',
    statusCode,
    timestamp: new Date().toISOString()
  };
  
  // Add additional error details if available
  if (err.data) {
    errorResponse.details = err.data;
  }
  
  // Include stack trace in development environment for 500 errors
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;