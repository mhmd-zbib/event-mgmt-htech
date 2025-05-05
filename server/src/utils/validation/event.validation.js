const { z } = require('zod');
const { isValidUUID } = require('../validation');

const eventFields = {
  title: z.string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  location: z.string()
    .max(200, 'Location cannot exceed 200 characters')
    .optional(),
  startDate: z.string()
    .refine(val => !isNaN(new Date(val).getTime()), {
      message: 'Start date must be a valid date format'
    }),
  endDate: z.string()
    .refine(val => !isNaN(new Date(val).getTime()), {
      message: 'End date must be a valid date format'
    }),
  categoryId: z.string()
    .refine(val => !val || isValidUUID(val), {
      message: 'Category ID must be a valid UUID'
    })
    .optional()
};

const validateDateRange = schema => schema.refine(
  data => {
    if (!data.startDate || !data.endDate) return true;
    return new Date(data.startDate) < new Date(data.endDate);
  }, 
  {
    message: 'Start date must be before end date',
    path: ['startDate']
  }
);

const eventSchema = {
  create: validateDateRange(
    z.object({
      title: eventFields.title,
      description: eventFields.description,
      location: eventFields.location,
      startDate: eventFields.startDate,
      endDate: eventFields.endDate,
      categoryId: eventFields.categoryId,
      tags: z.array(z.string()
        .refine(val => isValidUUID(val), {
          message: 'Tag IDs must be valid UUIDs'
        })
      ).optional()
    })
  ),

  update: validateDateRange(
    z.object({
      title: eventFields.title.optional(),
      description: eventFields.description,
      location: eventFields.location,
      startDate: eventFields.startDate.optional(),
      endDate: eventFields.endDate.optional(),
      categoryId: eventFields.categoryId,
      tags: z.array(z.string()
        .refine(val => isValidUUID(val), {
          message: 'Tag IDs must be valid UUIDs'
        })
      ).optional()
    })
  ),
  
  updateCategory: z.object({
    categoryId: z.string()
      .refine(val => isValidUUID(val), {
        message: 'Category ID must be a valid UUID'
      })
  }),
  
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    size: z.string().regex(/^\d+$/, 'Size must be a number').optional(),
    sortBy: z.enum(['title', 'createdAt', 'startDate', 'endDate', 'location'], {
      errorMap: () => ({ message: 'Invalid sort field' })
    }).optional(),
    sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc'], {
      errorMap: () => ({ message: 'Sort order must be ASC or DESC' })
    }).optional(),
    fromDate: z.string()
      .refine(val => !val || !isNaN(new Date(val).getTime()), {
        message: 'From date must be a valid date format'
      })
      .optional(),
    toDate: z.string()
      .refine(val => !val || !isNaN(new Date(val).getTime()), {
        message: 'To date must be a valid date format'
      })
      .optional(),
    categoryId: z.string()
      .refine(val => !val || isValidUUID(val), {
        message: 'Category ID must be a valid UUID'
      })
      .optional(),
    tagId: z.string()
      .refine(val => !val || isValidUUID(val), {
        message: 'Tag ID must be a valid UUID'
      })
      .optional()
  }).refine(
    data => {
      if (!data.fromDate || !data.toDate) return true;
      return new Date(data.fromDate) <= new Date(data.toDate);
    },
    {
      message: 'From date must be before or equal to To date',
      path: ['fromDate']
    }
  )
};

module.exports = eventSchema;