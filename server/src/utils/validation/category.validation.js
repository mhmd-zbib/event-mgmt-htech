const { z } = require('zod');

const categoryFields = {
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
};

const categorySchema = {
  create: z.object({
    name: categoryFields.name,
    description: categoryFields.description
  }),

  update: z.object({
    name: categoryFields.name.optional(),
    description: categoryFields.description
  }),
  
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    size: z.string().regex(/^\d+$/, 'Size must be a number').optional(),
    sortBy: z.enum(['name', 'createdAt'], {
      errorMap: () => ({ message: 'Invalid sort field' })
    }).optional(),
    sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc'], {
      errorMap: () => ({ message: 'Sort order must be ASC or DESC' })
    }).optional()
  })
};

module.exports = categorySchema;