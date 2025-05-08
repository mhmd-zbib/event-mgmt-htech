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

const createPaginationMeta = (totalItems, options) => {
  const { page, size, baseUrl } = options;
  const totalPages = Math.ceil(totalItems / size);
  
  const meta = {
    totalItems,
    itemsPerPage: size,
    currentPage: page,
    totalPages
  };
  
  if (baseUrl) {
    const query = new URLSearchParams();
    query.append('size', size);
    
    const links = {};
    
    links.self = `${baseUrl}?page=${page}&${query.toString()}`;
    
    links.first = `${baseUrl}?page=1&${query.toString()}`;
    
    links.last = `${baseUrl}?page=${totalPages}&${query.toString()}`;
    
    if (page > 1) {
      links.prev = `${baseUrl}?page=${page - 1}&${query.toString()}`;
    }
    
    if (page < totalPages) {
      links.next = `${baseUrl}?page=${page + 1}&${query.toString()}`;
    }
    
    meta.links = links;
  }
  
  return meta;
};

const paginatedQuery = async (model, options) => {
  const {
    queryParams = {},
    allowedSortFields = ['createdAt'],
    defaultSortField = 'createdAt',
    where = {},
    include = [],
    resultKey = 'items'
  } = options;

  const paginationOptions = processPaginationParams(
    queryParams,
    allowedSortFields,
    defaultSortField
  );
  
  const { count, rows: results } = await model.findAndCountAll({
    where,
    include,
    limit: paginationOptions.limit,
    offset: paginationOptions.offset,
    order: [[paginationOptions.sortBy, paginationOptions.sortOrder]]
  });
  
  const meta = createPaginationMeta(count, paginationOptions);
  
  return {
    [resultKey]: results,
    ...meta
  };
};

module.exports = {
  processPaginationParams,
  createPaginationMeta,
  paginatedQuery
};