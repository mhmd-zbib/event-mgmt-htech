const sequelize = require('./database');
const User = require('../models/user.model');
const config = require('./index');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

const initAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      logger.info('No admin user found. Creating default admin user...');
      
      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        logger.warn('Admin credentials not properly configured in environment variables. Using default values for development only.');
      }
      
      const adminUser = await User.create({
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });
      
      logger.info(`Admin user created successfully with email: ${adminUser.email}`);
    } else {
      logger.info('Admin user already exists. Skipping admin creation.');
    }
  } catch (error) {
    logger.error('Failed to initialize admin user:', {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};

const checkDatabaseRequirements = async () => {
  try {
    if (sequelize.options.dialect === 'postgres') {
      const [results] = await sequelize.query("SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'");
      
      if (results.length === 0) {
        logger.warn('PostgreSQL uuid-ossp extension not found. UUID generation may not work correctly.');
      } else {
        logger.info('PostgreSQL uuid-ossp extension is available.');
      }
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to check database requirements:', {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    return true;
  }
};

const waitForDatabase = async (maxRetries = 5, retryInterval = 5000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.authenticate();
      logger.info(`Database connection established successfully on attempt ${attempt}.`);
      return true;
    } catch (error) {
      logger.warn(`Database connection attempt ${attempt}/${maxRetries} failed:`, {
        error: {
          message: error.message
        }
      });
      
      if (attempt === maxRetries) {
        logger.error('Max database connection attempts reached. Giving up.');
        return false;
      }
      
      logger.info(`Waiting ${retryInterval}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
  
  return false;
};

const initDatabase = async () => {
  try {
    if (process.env.CONTAINERIZED === 'true') {
      const connected = await waitForDatabase();
      if (!connected) {
        logger.error('Failed to connect to the database after multiple attempts.');
        return false;
      }
    } else {
      await sequelize.authenticate();
      logger.info('Database connection has been established successfully.');
    }

    await checkDatabaseRequirements();

    const syncOptions = {
      force: false,
      alter: config.environment === 'development'
    };

    await sequelize.sync(syncOptions);
    logger.info(`Database models synchronized successfully (alter: ${syncOptions.alter}).`);
    
    await initAdminUser();
    
    return true;
  } catch (error) {
    logger.error('Database initialization failed:', {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    return false;
  }
};

module.exports = initDatabase;