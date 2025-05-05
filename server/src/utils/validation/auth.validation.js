const { z } = require('zod');

const authSchema = {
  register: z.object({
    email: z.string()
      .email({ message: "Please enter a valid email address" }),
    password: z.string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    firstName: z.string()
      .optional()
      .refine(val => !val || typeof val === 'string', { 
        message: "First name must be a string" 
      }),
    lastName: z.string()
      .optional()
      .refine(val => !val || typeof val === 'string', { 
        message: "Last name must be a string" 
      })
  }),

  login: z.object({
    email: z.string()
      .email({ message: "Please enter a valid email address" }),
    password: z.string()
      .min(1, { message: "Password is required" })
  })
};

module.exports = authSchema;