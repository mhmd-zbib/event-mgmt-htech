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