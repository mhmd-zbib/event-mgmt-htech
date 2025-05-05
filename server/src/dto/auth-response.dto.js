const { z } = require('zod');

// Define a schema for the auth response
const userResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  lastLogin: z.date().or(z.string()).optional().nullable()
});

const authResponseSchema = z.object({
  message: z.string(),
  user: userResponseSchema,
  token: z.string()
});

exports.authResponseSchema = authResponseSchema;

// Create response DTO
exports.createAuthResponseDto = (message, user, token) => {
  const responseDto = {
    message,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin
    },
    token
  };
  
  // Optional validation of the response DTO
  // authResponseSchema.parse(responseDto);
  
  return responseDto;
};