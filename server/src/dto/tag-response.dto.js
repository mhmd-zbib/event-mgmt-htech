/**
 * Tag Response DTOs
 * Responsible for structuring tag response data
 */

const { formatPaginatedResponse, formatItemResponse } = require('../utils/response-formatter');

const mapTagForList = (tag) => ({
  id: tag.id,
  name: tag.name,
  description: tag.description,
  createdAt: tag.createdAt,
  creator: tag.creator ? {
    id: tag.creator.id,
    firstName: tag.creator.firstName,
    lastName: tag.creator.lastName
  } : null
});

const createTagListResponseDto = (tags, pagination, sort) => {
  return formatPaginatedResponse(tags, pagination, sort, mapTagForList);
};

const createTagDetailResponseDto = (tag) => {
  // Using formatItemResponse which now returns the item directly
  return formatItemResponse(tag);
};

module.exports = {
  createTagListResponseDto,
  createTagDetailResponseDto,
  mapTagForList
};