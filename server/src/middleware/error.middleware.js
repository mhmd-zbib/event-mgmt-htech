const AppError = require('../errors/AppError');
const handleDatabaseError = require('../errors/DatabaseError');
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Processes errors and returns standardized error responses
 */
const errorHandler = (err, req, res, next) => {
  // Log detailed error information for debugging (only visible in logs)
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    requestId: req.id,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    name: err.name,
    code: err.code
  };
  
  logger.error('Request error', errorDetails);
  
  // Handle specific error types
  if (err.name && ['SequelizeValidationError', 'SequelizeUniqueConstraintError', 'SequelizeForeignKeyConstraintError'].includes(err.name)) {
    err = handleDatabaseError(err);
  } else if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token', 401);
  } else if (err.name === 'TokenExpiredError') {
    err = new AppError('Token expired', 401);
  } else if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message
    }));
    
    err = new AppError('Validation error', 422, formattedErrors);
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    err = new AppError('Service connection failed. Please try again later.', 503);
  }
  
  // Prepare sanitized response
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    statusCode,
    timestamp: new Date().toISOString(),
    requestId: req.id
  };
  
  // Include sanitized details for validation errors
  if (err.data && (statusCode === 400 || statusCode === 422)) {
    // For validation errors, include field-level error details but sanitize
    // to make sure no sensitive data is included
    errorResponse.details = Array.isArray(err.data) 
      ? err.data.map(item => ({
          path: item.path,
          message: item.message
        }))
      : err.data;
  }
  
  // Include stack trace only in development mode and only for 500 errors
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    errorResponse.stack = err.stack;
  }
  
  // For 500 errors, don't expose implementation details to the client in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    logger.error('Unhandled error in production', { originalError: err });
  }
  
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;