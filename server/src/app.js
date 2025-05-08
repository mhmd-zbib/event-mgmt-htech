const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/error.middleware');
const rateLimiter = require('./middleware/rate-limiter.middleware');
const { NotFoundError } = require('./errors/HttpErrors');
const logger = require('./utils/logger');
const { swaggerSpec, swaggerUiOptions, exportSwaggerDocs } = require('./config/swagger');

const app = express();

app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, '../public')));

app.use(rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.get('/api-docs.json', (req, res) => {
  const jsonDocs = exportSwaggerDocs('json');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="api-docs.json"');
  res.send(jsonDocs);
});

app.get('/api-docs.yaml', (req, res) => {
  const yamlDocs = exportSwaggerDocs('yaml');
  res.setHeader('Content-Type', 'text/yaml');
  res.setHeader('Content-Disposition', 'attachment; filename="api-docs.yaml"');
  res.send(yamlDocs);
});

app.use((req, res, next) => {
  const startTime = Date.now();
  logger.info(`${req.method} ${req.originalUrl}`, {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMethod = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logMethod](`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userId: req.user?.id
    });
  });

  next();
});

const routes = require('./routes');
app.use('/', routes);

app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

app.use(errorHandler);

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  });
  
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  });
  
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = app;