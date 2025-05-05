const { z } = require('zod');

const userSchema = {
  updateProfile: z.object({
    email: z.string()
      .email({ message: "Please enter a valid email address" })
      .optional(),
    firstName: z.string()
      .optional()
      .refine(val => !val || typeof val === 'string', { 
        message: "First name must be a string" 
      }),
    lastName: z.string()
      .optional()
      .refine(val => !val || typeof val === 'string', { 
        message: "Last name must be a string" 
      }),
    password: z.string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .optional()
  })
};

module.exports = userSchema;