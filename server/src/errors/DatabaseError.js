const { ValidationError: SequelizeValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require('sequelize');
const { ValidationError, ConflictError, BadRequestError, InternalServerError } = require('./HttpErrors');
const logger = require('../utils/logger');

const handleDatabaseError = (err) => {
  // Log the original database error for debugging (only in logs)
  logger.error('Database error:', {
    type: err.name,
    message: err.message,
    stack: err.stack,
    original: err.original ? {
      code: err.original.code,
      errno: err.original.errno,
      sqlState: err.original.sqlState,
      sqlMessage: err.original.sqlMessage
    } : null
  });

  if (err instanceof SequelizeValidationError) {
    const validationErrors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return new ValidationError('Validation failed', validationErrors);
  }
  
  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path || 'field';
    // Use more generic message without exposing exact field names that might reveal DB structure
    return new ConflictError(`Record already exists`, {
      field,
      message: `A record with this value already exists`
    });
  }
  
  if (err instanceof ForeignKeyConstraintError) {
    return new BadRequestError('Invalid reference to a related resource', {
      field: err.fields || ['reference'],
      message: 'The referenced resource does not exist'
    });
  }
  
  // Handle general database errors
  if (err instanceof DatabaseError) {
    // Log detailed error but return sanitized message to user
    logger.error('Unexpected database error', { original: err.original });
    return new BadRequestError('Invalid data or operation');
  }
  
  // For any other database-related errors, convert to internal server error
  // without leaking implementation details
  if (err.name && err.name.includes('Sequelize')) {
    logger.error('Unhandled Sequelize error', { error: err });
    return new InternalServerError('Database operation failed');
  }
  
  return err;
};

module.exports = handleDatabaseError;