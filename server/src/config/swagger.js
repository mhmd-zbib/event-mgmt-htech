const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const YAML = require('yamljs');
const fs = require('fs');

// Load base Swagger configuration from index.yaml
const loadBaseSwaggerConfig = () => {
  const indexPath = path.resolve(__dirname, '../docs/swagger/index.yaml');
  return YAML.load(indexPath);
};

// Load all feature-specific Swagger YAML files
const loadSwaggerDocs = () => {
  const swaggerDir = path.resolve(__dirname, '../docs/swagger');
  const yamlFiles = fs.readdirSync(swaggerDir)
    .filter(file => file.endsWith('.yaml') && file !== 'index.yaml');
  
  // Combine all API documentation
  const combinedPaths = {};
  const combinedSchemas = {};
  
  yamlFiles.forEach(file => {
    const yamlPath = path.join(swaggerDir, file);
    const swaggerDoc = YAML.load(yamlPath);
    
    // Merge paths
    if (swaggerDoc.paths) {
      Object.assign(combinedPaths, swaggerDoc.paths);
    }
    
    // Merge schemas
    if (swaggerDoc.components && swaggerDoc.components.schemas) {
      Object.assign(combinedSchemas, swaggerDoc.components.schemas);
    }
  });
  
  return { paths: combinedPaths, schemas: combinedSchemas };
};

// Load common schemas from common-schemas.yaml
const loadCommonSchemas = () => {
  const commonSchemasPath = path.resolve(__dirname, '../docs/swagger/common-schemas.yaml');
  return YAML.load(commonSchemasPath);
};

// Get the base configuration
const baseConfig = loadBaseSwaggerConfig();

// Add error schemas and responses
if (!baseConfig.components) {
  baseConfig.components = {};
}

if (!baseConfig.components.schemas) {
  baseConfig.components.schemas = {};
}

baseConfig.components.schemas.Error = {
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
};

if (!baseConfig.components.responses) {
  baseConfig.components.responses = {};
}

baseConfig.components.responses = {
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
};

// Load paths and schemas from feature-specific YAML files
const { paths, schemas } = loadSwaggerDocs();
baseConfig.paths = paths;
Object.assign(baseConfig.components.schemas, schemas);

// Load common schemas
const commonSchemas = loadCommonSchemas();
if (commonSchemas.components && commonSchemas.components.schemas) {
  Object.assign(baseConfig.components.schemas, commonSchemas.components.schemas);
}

// Configure Swagger UI options
const swaggerUiOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    syntaxHighlight: {
      activate: true,
      theme: 'agate'
    }
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HTech Assessment API Documentation',
  customfavIcon: '/public/images/favicon.ico'
};

module.exports = {
  swaggerSpec: baseConfig,
  swaggerUiOptions
};