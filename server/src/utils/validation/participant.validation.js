const { z } = require('zod');
const { isValidUUID } = require('../validation');

const participantFields = {
  status: z.enum(['registered', 'attended', 'cancelled', 'waitlisted'], {
    errorMap: () => ({ message: 'Status must be one of: registered, attended, cancelled, waitlisted' })
  }).optional(),
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
};

const participantSchema = {
  // Schema for event registration
  registration: z.object({
    notes: participantFields.notes
  }),

  // Schema for updating participant status (admin use)
  updateStatus: z.object({
    status: z.enum(['registered', 'attended', 'cancelled', 'waitlisted'], {
      errorMap: () => ({ message: 'Status must be one of: registered, attended, cancelled, waitlisted' })
    }),
    notes: participantFields.notes
  }),

  // Schema for filtering participants
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    size: z.string().regex(/^\d+$/, 'Size must be a number').optional(),
    status: z.enum(['registered', 'attended', 'cancelled', 'waitlisted'], {
      errorMap: () => ({ message: 'Invalid status filter' })
    }).optional(),
    sortBy: z.enum(['registrationDate', 'status', 'createdAt'], {
      errorMap: () => ({ message: 'Invalid sort field' })
    }).optional(),
    sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc'], {
      errorMap: () => ({ message: 'Sort order must be ASC or DESC' })
    }).optional()
  })
};

module.exports = participantSchema;