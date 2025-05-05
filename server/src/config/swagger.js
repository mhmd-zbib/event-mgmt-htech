const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'HTech Assessment API',
    version: '1.0.0',
    description: 'RESTful API documentation for HTech Assessment',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'API Support',
      email: 'support@htechassessment.com',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.htechassessment.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
          },
          statusCode: {
            type: 'integer',
            description: 'HTTP status code',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error timestamp',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
            },
            description: 'Additional error details (optional)',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication failed or token expired',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Invalid or expired token',
              statusCode: 401,
              timestamp: '2025-05-05T12:00:00.000Z',
            },
          },
        },
      },
      NotFoundError: {
        description: 'The requested resource was not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Resource not found',
              statusCode: 404,
              timestamp: '2025-05-05T12:00:00.000Z',
            },
          },
        },
      },
      ValidationError: {
        description: 'Input validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Validation error',
              statusCode: 422,
              timestamp: '2025-05-05T12:00:00.000Z',
              details: [
                {
                  path: 'email',
                  message: 'Invalid email format',
                },
              ],
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Internal server error',
              statusCode: 500,
              timestamp: '2025-05-05T12:00:00.000Z',
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Auth',
      description: 'Authentication operations',
    },
    {
      name: 'Users',
      description: 'User management operations',
    },
  ],
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI annotations
  apis: [
    path.resolve(__dirname, '../routes/*.js'),
    path.resolve(__dirname, '../controllers/*.js'),
    path.resolve(__dirname, '../models/*.js'),
    path.resolve(__dirname, '../dto/*.js'),
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;