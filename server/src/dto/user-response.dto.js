const { formatPaginatedResponse, formatItemResponse } = require('../utils/response-formatter');

const mapUserForList = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role
});

const createUserListResponseDto = (users, pagination, sort) => {
  return formatPaginatedResponse(users, pagination, sort, mapUserForList);
};

const createUserProfileResponseDto = (user) => {
  return formatItemResponse({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin
  });
};

module.exports = {
  createUserProfileResponseDto,
  createUserListResponseDto,
  mapUserForList
};