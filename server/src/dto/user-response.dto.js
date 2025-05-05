const { z } = require('zod');

// Define a schema for the user profile response
const userProfileSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  lastLogin: z.date().or(z.string()).optional().nullable()
});

const userProfileResponseSchema = z.object({
  message: z.string(),
  user: userProfileSchema
});

exports.userProfileResponseSchema = userProfileResponseSchema;

// Create response DTO
exports.createUserProfileResponseDto = (message, user) => {
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
    }
  };
  
  // Optional validation of the response DTO
  // userProfileResponseSchema.parse(responseDto);
  
  return responseDto;
};