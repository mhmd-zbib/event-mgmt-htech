const { ValidationError } = require('../errors/HttpErrors');

const validationMiddleware = (schema, source = 'body') => (req, res, next) => {
  try {
    switch (source) {
      case 'body':
        req.validatedData = schema.parse(req.body);
        break;
      case 'query':
        req.validatedQuery = schema.parse(req.query);
        break;
      case 'params':
        req.validatedParams = schema.parse(req.params);
        break;
      case 'all':
        if (schema.body) req.validatedData = schema.body.parse(req.body);
        if (schema.query) req.validatedQuery = schema.query.parse(req.query);
        if (schema.params) req.validatedParams = schema.params.parse(req.params);
        break;
      default:
        throw new Error(`Invalid validation source: ${source}`);
    }
    
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