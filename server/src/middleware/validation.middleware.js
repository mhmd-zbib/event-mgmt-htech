const { ValidationError } = require('../errors/HttpErrors');

/**
 * Middleware for Zod schema validation
 * @param {object} schema - Zod schema for validation
 * @returns {function} Express middleware
 */
const validationMiddleware = (schema) => (req, res, next) => {
  try {
    const result = schema.parse(req.body);
    req.validatedData = result;
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      next(new ValidationError('Validation Failed', formattedErrors));
    } else {
      next(error);
    }
  }
};

module.exports = validationMiddleware;