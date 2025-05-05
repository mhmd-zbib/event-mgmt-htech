const { z } = require('zod');
const userSchema = require('../utils/validation/user.validation');

// Reuse the existing schema from validation
exports.updateProfileSchema = userSchema.updateProfile;

// Create DTO from validated data (now simplified since validation is done by Zod)
exports.createUpdateProfileDto = (validatedData) => {
  return validatedData;
};