const { formatPaginatedResponse, formatItemResponse } = require('../utils/response-formatter');

const mapEventForList = (event) => ({
  id: event.id,
  title: event.title,
  location: event.location || null,
  startDate: event.startDate
});

const createEventListResponseDto = (events, pagination, sort) => {
  return formatPaginatedResponse(events, pagination, sort, mapEventForList);
};

const createEventDetailResponseDto = (event) => {
  return formatItemResponse(event);
};

module.exports = {
  createEventListResponseDto,
  createEventDetailResponseDto,
  mapEventForList
};