const processPaginationParams = (
  params = {},
  allowedSortFields = ['createdAt'],
  defaultSortField = 'createdAt',
  maxPageSize = 100
) => {
  let { page = 1, size = 10, sortBy = defaultSortField, sortOrder = 'DESC' } = params;
  
  page = parseInt(page, 10);
  size = parseInt(size, 10);
  
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  
  if (isNaN(size) || size < 1) {
    size = 10;
  } else if (size > maxPageSize) {
    size = maxPageSize;
  }
  
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = defaultSortField;
  }
  
  sortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  const offset = (page - 1) * size;
  
  return {
    page,
    size,
    offset,
    sortBy,
    sortOrder,
    limit: size
  };
};

const createPaginationMeta = (count, { page, size, sortBy, sortOrder }) => {
  const totalPages = Math.ceil(count / size);
  
  return {
    pagination: {
      total: count,
      page,
      size,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    },
    sort: {
      sortBy,
      sortOrder
    }
  };
};

module.exports = {
  processPaginationParams,
  createPaginationMeta
};