const AppError = require('./AppError');

class BadRequestError extends AppError {
  constructor(message = 'Bad Request', data = null) {
    super(message, 400, data);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', data = null) {
    super(message, 401, data);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', data = null) {
    super(message, 403, data);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', data = null) {
    super(message, 404, data);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict', data = null) {
    super(message, 409, data);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', data = null) {
    super(message, 422, data);
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', data = null) {
    super(message, 500, data);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service Unavailable', data = null) {
    super(message, 503, data);
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError
};