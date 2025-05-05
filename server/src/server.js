const app = require('./app');
const config = require('./config');
const initDatabase = require('./config/db-init');
const logger = require('./utils/logger');

const PORT = config.port || 3000;

const startServer = async () => {
  try {
    const dbInitialized = await initDatabase();
    
    if (!dbInitialized) {
      logger.error('Failed to initialize database. Server will not start.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      logger.info(`Server running in ${config.environment} mode on port ${PORT}`, {
        port: PORT,
        environment: config.environment,
        nodeVersion: process.version
      });
    });
  } catch (error) {
    logger.error('Server startup failed:', {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    process.exit(1);
  }
};

startServer();
