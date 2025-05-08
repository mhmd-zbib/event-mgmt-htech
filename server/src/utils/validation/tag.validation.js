const { z } = require('zod');
const { isValidUUID } = require('../validation');

const tagSchema = {
  create: z.object({
    name: z.string()
      .min(2, 'Tag name must be between 2 and 50 characters')
      .max(50, 'Tag name must be between 2 and 50 characters'),
    description: z.string()
      .max(500, 'Tag description cannot exceed 500 characters')
      .nullish()
  }),
  
  update: z.object({
    name: z.string()
      .min(2, 'Tag name must be between 2 and 50 characters')
      .max(50, 'Tag name must be between 2 and 50 characters')
      .optional(),
    description: z.string()
      .max(500, 'Tag description cannot exceed 500 characters')
      .nullish()
  }),
  
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    size: z.string().regex(/^\d+$/, 'Size must be a number').optional(),
    sortBy: z.enum(['name', 'createdAt'], {
      errorMap: () => ({ message: 'Sort field must be either name or createdAt' })
    }).optional(),
    sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc'], {
      errorMap: () => ({ message: 'Sort order must be ASC or DESC' })
    }).optional()
  }),
  
  eventTags: z.object({
    tagIds: z.array(
      z.string().refine(val => isValidUUID(val), {
        message: 'Tag IDs must be valid UUIDs'
      })
    ).min(1, 'At least one tag ID must be provided')
  })
};

module.exports = tagSchema;