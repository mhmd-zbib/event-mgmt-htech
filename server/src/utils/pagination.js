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

/**
 * Creates pagination metadata for API responses
 * Now includes HATEOAS links for better RESTful compliance
 * 
 * @param {number} totalItems - Total number of items
 * @param {Object} options - Pagination options
 * @param {number} options.page - Current page number
 * @param {number} options.size - Items per page
 * @param {string} options.baseUrl - Base URL for HATEOAS links (optional)
 * @returns {Object} Pagination metadata with HATEOAS links
 */
const createPaginationMeta = (totalItems, options) => {
  const { page, size, baseUrl } = options;
  const totalPages = Math.ceil(totalItems / size);
  
  const meta = {
    totalItems,
    itemsPerPage: size,
    currentPage: page,
    totalPages
  };
  
  // Add HATEOAS links if a baseUrl was provided
  if (baseUrl) {
    const query = new URLSearchParams();
    query.append('size', size);
    
    const links = {};
    
    // Current page
    links.self = `${baseUrl}?page=${page}&${query.toString()}`;
    
    // First page
    links.first = `${baseUrl}?page=1&${query.toString()}`;
    
    // Last page
    links.last = `${baseUrl}?page=${totalPages}&${query.toString()}`;
    
    // Previous page (if not on first page)
    if (page > 1) {
      links.prev = `${baseUrl}?page=${page - 1}&${query.toString()}`;
    }
    
    // Next page (if not on last page)
    if (page < totalPages) {
      links.next = `${baseUrl}?page=${page + 1}&${query.toString()}`;
    }
    
    meta.links = links;
  }
  
  return meta;
};

/**
 * Executes a paginated query using Sequelize's findAndCountAll
 * 
 * @param {Object} model - Sequelize model to query
 * @param {Object} options - Query options
 * @param {Object} options.queryParams - Raw query parameters from request
 * @param {Array} options.allowedSortFields - Fields that can be used for sorting
 * @param {string} options.defaultSortField - Default field to sort by
 * @param {Object} options.where - Where clause for the query
 * @param {Array} options.include - Associations to include
 * @param {string} options.resultKey - Key to use for the results in the returned object
 * @returns {Object} Results with pagination metadata
 */
const paginatedQuery = async (model, options) => {
  const {
    queryParams = {},
    allowedSortFields = ['createdAt'],
    defaultSortField = 'createdAt',
    where = {},
    include = [],
    resultKey = 'items'
  } = options;

  // Process pagination parameters
  const paginationOptions = processPaginationParams(
    queryParams,
    allowedSortFields,
    defaultSortField
  );
  
  // Execute the query
  const { count, rows: results } = await model.findAndCountAll({
    where,
    include,
    limit: paginationOptions.limit,
    offset: paginationOptions.offset,
    order: [[paginationOptions.sortBy, paginationOptions.sortOrder]]
  });
  
  // Create pagination metadata
  const meta = createPaginationMeta(count, paginationOptions);
  
  // Return results with the specified key and pagination metadata
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