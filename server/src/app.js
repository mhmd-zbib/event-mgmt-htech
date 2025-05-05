const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const errorHandler = require('./middleware/error.middleware');
const { NotFoundError } = require('./errors/HttpErrors');
const logger = require('./utils/logger');

const app = express();

// Add request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  // Log at the start of the request
  const startTime = Date.now();
  logger.info(`${req.method} ${req.originalUrl}`, {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id
  });

  // Log when the request is complete
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

// API routes
const routes = require('./routes');
app.use('/', routes);

// 404 handler for routes that don't exist
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  });
  
  // Give the logger time to write to files before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  });
  
  // Give the logger time to write to files before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = app;