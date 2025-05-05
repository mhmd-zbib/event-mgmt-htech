const sequelize = require('./database');
const User = require('../models/user.model');
const config = require('./index');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

/**
 * Initialize an admin user if none exists
 * @returns {Promise<void>}
 */
const initAdminUser = async () => {
  try {
    // Check if an admin user already exists
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      logger.info('No admin user found. Creating default admin user...');
      
      // Create default admin user with environment variables or fallback values
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
    // Don't throw, just log - we don't want to prevent server startup
  }
};

/**
 * Initialize database connection and sync models
 * @returns {Promise<boolean>} - True if initialization is successful
 */
const initDatabase = async () => {
  try {
    // Test database connection
    const connected = await sequelize.testConnection();
    if (!connected) {
      logger.error('Failed to connect to the database.');
      return false;
    }

    // Sync models based on environment
    const syncOptions = {
      // In production, we should never use force:true as it will drop tables
      force: false,
      // Use alter in development for automatic migrations, but not in production
      alter: config.environment === 'development'
    };

    await sequelize.sync(syncOptions);
    logger.info(`Database models synchronized successfully (alter: ${syncOptions.alter}).`);
    
    // Initialize admin user after database is synced
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