const { z } = require('zod');
const authSchema = require('../utils/validation/auth.validation');

// Reuse the existing schemas from validation
exports.registerSchema = authSchema.register;
exports.loginSchema = authSchema.login;

// Create DTOs from validated data (now redundant but kept for backward compatibility)
exports.createRegisterDto = (validatedData) => {
  return validatedData;
};

exports.createLoginDto = (validatedData) => {
  return validatedData;
};