const AppError = require('../errors/AppError');
const handleDatabaseError = require('../errors/DatabaseError');
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Processes errors and returns standardized error responses
 */
const errorHandler = (err, req, res, next) => {
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
  
  // Prepare response
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    message: err.message || 'Internal Server Error',
    statusCode,
    timestamp: new Date().toISOString(),
    requestId: req.id
  };
  
  if (err.data) {
    errorResponse.details = err.data;
  }
  
  // Include stack trace in development mode for 500 errors
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;