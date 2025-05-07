/**
 * Utility functions for formatting API responses
 * Ensures consistent response format across all endpoints
 */

/**
 * Formats a paginated list response
 * @param {Array} items - The items to include in the response
 * @param {Object} pagination - Pagination metadata
 * @param {Object} sort - Sorting information
 * @param {Function} mapFunction - Optional function to map each item
 * @returns {Object} Formatted response with consistent structure
 */
const formatPaginatedResponse = (items, pagination, sort, mapFunction = null) => {
  const mappedItems = mapFunction ? items.map(mapFunction) : items;

  return {
    data: mappedItems,
    meta: {
      pagination,
      sort
    }
  };
};

/**
 * Formats a single item response
 * @param {Object} item - The item to include in the response
 * @param {String} entityName - Optional name for the entity (defaults to 'data')
 * @returns {Object} Formatted response with consistent structure
 */
const formatItemResponse = (item, entityName = 'data') => {
  // Always wrap the item in an object with the entityName key
  const response = {};
  response[entityName] = item;
  return response;
};

/**
 * Formats a message response
 * @param {String} message - The message to include
 * @param {Object} additionalData - Optional additional data to include
 * @returns {Object} Formatted response with consistent structure
 */
const formatMessageResponse = (message, additionalData = null) => {
  const response = { message };
  
  // If additional data is provided, include it
  if (additionalData) {
    // Merge additionalData into response
    Object.assign(response, additionalData);
  }
  
  return response;
};

module.exports = {
  formatPaginatedResponse,
  formatItemResponse,
  formatMessageResponse
};