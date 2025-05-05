const formatPaginatedResponse = (items, pagination, sort, mapFunction = null) => {
  const mappedItems = mapFunction ? items.map(mapFunction) : items;

  return {
    data: mappedItems,
    pagination,
    sort
  };
};

const formatItemResponse = (item, entityName = 'item') => {
  // Return the item directly instead of nesting it
  return item;
};

const formatMessageResponse = (message) => {
  return { message };
};

module.exports = {
  formatPaginatedResponse,
  formatItemResponse,
  formatMessageResponse
};