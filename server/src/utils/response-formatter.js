const formatPaginatedResponse = (items, pagination, sort, mapFunction = null) => {
  const mappedItems = mapFunction ? items.map(mapFunction) : items;

  return {
    data: mappedItems,
    pagination,
    sort
  };
};

const formatItemResponse = (item, entityName = 'item') => {
  const response = {};
  response[entityName] = item;
  return response;
};

const formatMessageResponse = (message) => {
  return { message };
};

module.exports = {
  formatPaginatedResponse,
  formatItemResponse,
  formatMessageResponse
};