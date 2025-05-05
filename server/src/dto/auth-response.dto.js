/**
 * Authentication Response DTOs
 * Responsible for structuring authentication response data
 */

const { formatItemResponse } = require('../utils/response-formatter');

/**
 * Create a standardized authentication response
 * @param {Object} user - The user object
 * @param {Object} token - The token object
 * @returns {Object} Formatted authentication response
 */
exports.createAuthResponseDto = (user, token) => {
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin
    },
    token
  };
};