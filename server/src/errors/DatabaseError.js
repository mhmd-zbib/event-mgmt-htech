const { ValidationError: SequelizeValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');
const { ValidationError, ConflictError, BadRequestError } = require('./HttpErrors');

/**
 * Handles specific Sequelize errors by converting them to appropriate AppErrors
 * @param {Error} err - The original Sequelize error 
 * @returns {AppError} - The converted application error
 */
const handleDatabaseError = (err) => {
  // Handle Sequelize validation errors
  if (err instanceof SequelizeValidationError) {
    const validationErrors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return new ValidationError('Validation failed', validationErrors);
  }
  
  // Handle unique constraint violations (e.g., duplicate email)
  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path || 'unknown';
    return new ConflictError(`${field} already exists`, {
      field,
      message: `A record with this ${field} already exists`
    });
  }
  
  // Handle foreign key constraint violations
  if (err instanceof ForeignKeyConstraintError) {
    return new BadRequestError('Invalid reference to a related resource', {
      field: err.fields || ['unknown'],
      message: 'The referenced resource does not exist'
    });
  }
  
  // For other database errors, return a more generic error
  return err;
};

module.exports = handleDatabaseError;