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
    docExpansion: 'list',
    filter: true,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    syntaxHighlight: {
      activate: true,
      theme: 'agate'  // Changed to agate for better contrast
    },
    tryItOutEnabled: true,
    operationsSorter: function(a, b) {
      // Sort GET methods first, then by path
      const methodsOrder = {
        get: 1,
        post: 2,
        put: 3,
        patch: 4,
        delete: 5
      };
      
      const aMethod = a.get('method').toLowerCase();
      const bMethod = b.get('method').toLowerCase();
      
      // First sort by method
      if (methodsOrder[aMethod] !== methodsOrder[bMethod]) {
        return methodsOrder[aMethod] - methodsOrder[bMethod];
      }
      
      // Then by path
      return a.get('path').localeCompare(b.get('path'));
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info h2 { font-size: 2.5em; margin-bottom: 20px; color: #3b4151; }
    .swagger-ui .scheme-container { margin: 0 0 20px; padding: 20px 0; box-shadow: 0 1px 2px 0 rgba(0,0,0,.15); }
    .swagger-ui .opblock-tag { font-size: 20px; margin: 10px 0 5px 0; font-weight: 600; }
    .swagger-ui .opblock-tag:hover { background-color: rgba(0,0,0,.02); }
    .swagger-ui .opblock { margin: 0 0 15px; border-radius: 6px; box-shadow: 0 0 3px rgba(0,0,0,.19); }
    .swagger-ui .opblock .opblock-summary { padding: 8px 20px; }
    .swagger-ui table tbody tr td { padding: 10px 0; }
    .swagger-ui .btn { transition: all .3s; }
    .swagger-ui .btn.execute { background-color: #4990e2; }
    .swagger-ui .btn.execute:hover { background-color: #357abf; }
    .swagger-ui .response-col_status { min-width: 100px; }
    .api-export-links { margin: 10px 0 15px; text-align: right; }
    .api-export-links a { display: inline-block; margin-left: 10px; text-decoration: none; color: #4990e2; font-weight: 600; }
    .api-export-links a:hover { text-decoration: underline; }
  `,
  customSiteTitle: 'HTech Event Management API Documentation',
  customfavIcon: '/public/images/favicon.ico',
  customJs: '/public/js/swagger-custom.js'
};

/**
 * Exports the Swagger documentation to the specified format
 * @param {string} format - The format to export (json or yaml)
 * @returns {string} The documentation in the requested format
 */
const exportSwaggerDocs = (format = 'json') => {
  if (format.toLowerCase() === 'json') {
    return JSON.stringify(baseConfig, null, 2);
  } else if (format.toLowerCase() === 'yaml') {
    return YAML.stringify(baseConfig, 10, 2);
  } else {
    throw new Error(`Unsupported export format: ${format}. Supported formats are 'json' and 'yaml'.`);
  }
};

module.exports = {
  swaggerSpec: baseConfig,
  swaggerUiOptions,
  exportSwaggerDocs
};