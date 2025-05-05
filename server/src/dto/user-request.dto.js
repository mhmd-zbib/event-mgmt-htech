/**
 * User Request DTOs
 * Responsible for structuring user request data
 */

/**
 * Creates an Update Profile DTO from validated data
 * @param {Object} validatedData - Validated profile data
 * @returns {Object} Update Profile DTO
 */
exports.createUpdateProfileDto = (validatedData) => {
  return {
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
    email: validatedData.email
  };
};