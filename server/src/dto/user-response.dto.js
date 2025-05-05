/**
 * User Response DTOs
 * Responsible for structuring user response data
 */

const { formatPaginatedResponse, formatItemResponse } = require('../utils/response-formatter');

/**
 * Map function to transform users for list view (simplified fields)
 * @param {Object} user - The user object
 * @returns {Object} Simplified user object for list view
 */
const mapUserForList = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role
});

/**
 * DTO for creating list responses for users
 * @param {Array} users - Array of user objects
 * @param {Object} pagination - Pagination information
 * @param {Object} sort - Sort information
 * @returns {Object} Formatted paginated response
 */
const createUserListResponseDto = (users, pagination, sort) => {
  return formatPaginatedResponse(users, pagination, sort, mapUserForList);
};

/**
 * DTO for creating detail responses for a single user profile
 * @param {Object} user - The user object
 * @returns {Object} Formatted user profile response
 */
const createUserProfileResponseDto = (user) => {
  return formatItemResponse({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin
  }, 'user');
};

module.exports = {
  createUserProfileResponseDto,
  createUserListResponseDto,
  mapUserForList
};