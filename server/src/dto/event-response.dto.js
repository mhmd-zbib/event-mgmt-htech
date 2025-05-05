/**
 * Event Response DTOs
 * Responsible for structuring event response data
 */

const { formatPaginatedResponse, formatItemResponse } = require('../utils/response-formatter');

/**
 * Map function to transform events for list view (simplified fields)
 * @param {Object} event - The event object
 * @returns {Object} Simplified event object for list view
 */
const mapEventForList = (event) => ({
  id: event.id,
  title: event.title,
  location: event.location || null,
  startDate: event.startDate
});

/**
 * DTO for creating list responses for events
 * @param {Array} events - Array of event objects
 * @param {Object} pagination - Pagination information
 * @param {Object} sort - Sort information
 * @returns {Object} Formatted paginated response
 */
const createEventListResponseDto = (events, pagination, sort) => {
  return formatPaginatedResponse(events, pagination, sort, mapEventForList);
};

/**
 * DTO for creating detail responses for a single event
 * @param {Object} event - The event object
 * @returns {Object} Formatted event response
 */
const createEventDetailResponseDto = (event) => {
  return formatItemResponse(event, 'event');
};

module.exports = {
  createEventListResponseDto,
  createEventDetailResponseDto,
  mapEventForList
};