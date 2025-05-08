const { formatPaginatedResponse, formatItemResponse } = require('../utils/response-formatter');

const mapCategoryForList = (category) => ({
  id: category.id,
  name: category.name,
  description: category.description
});

const createCategoryListResponseDto = (categories, pagination, sort) => {
  return formatPaginatedResponse(categories, pagination, sort, mapCategoryForList);
};

const createCategoryDetailResponseDto = (category) => {
  return formatItemResponse({
    id: category.id,
    name: category.name,
    description: category.description,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    createdBy: category.createdBy,
    creator: category.creator ? {
      id: category.creator.id,
      firstName: category.creator.firstName,
      lastName: category.creator.lastName
    } : null
  });
};

module.exports = {
  createCategoryListResponseDto,
  createCategoryDetailResponseDto,
  mapCategoryForList
};