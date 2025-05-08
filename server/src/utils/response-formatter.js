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

const formatItemResponse = (item, entityName = 'data') => {
  const response = {};
  response[entityName] = item;
  return response;
};

const formatMessageResponse = (message, additionalData = null) => {
  const response = { message };
  
  if (additionalData) {
    Object.assign(response, additionalData);
  }
  
  return response;
};

module.exports = {
  formatPaginatedResponse,
  formatItemResponse,
  formatMessageResponse
};