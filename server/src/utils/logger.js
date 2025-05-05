const winston = require('winston');
const { createLogger, format, transports } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create file transport with rotation
const fileRotateTransport = new DailyRotateFile({
  dirname: logDir,
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // Keep logs for 14 days
  maxSize: '20m',  // Rotate when file reaches 20MB
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Create error specific transport
const errorFileRotateTransport = new DailyRotateFile({
  dirname: logDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  level: 'error'
});

// Create console transport
const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? 
        '\n' + JSON.stringify(meta, null, 2) : '';
      return `${timestamp} ${level}: ${message}${metaString}`;
    })
  ),
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Create the logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'htech-assessment-api' },
  transports: [
    fileRotateTransport,
    errorFileRotateTransport,
    consoleTransport
  ],
  exitOnError: false
});

// Create stream for Morgan integration (if needed later)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;