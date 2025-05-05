const { ValidationError: SequelizeValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');
const { ValidationError, ConflictError, BadRequestError } = require('./HttpErrors');

const handleDatabaseError = (err) => {
  if (err instanceof SequelizeValidationError) {
    const validationErrors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return new ValidationError('Validation failed', validationErrors);
  }
  
  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path || 'unknown';
    return new ConflictError(`${field} already exists`, {
      field,
      message: `A record with this ${field} already exists`
    });
  }
  
  if (err instanceof ForeignKeyConstraintError) {
    return new BadRequestError('Invalid reference to a related resource', {
      field: err.fields || ['unknown'],
      message: 'The referenced resource does not exist'
    });
  }
  
  return err;
};

module.exports = handleDatabaseError;