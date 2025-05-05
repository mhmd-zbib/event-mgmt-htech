/**
 * Base application error class that extends the native Error class
 * All custom errors should inherit from this
 */
class AppError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.isOperational = true; // Used to distinguish operational errors from programmer errors
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;