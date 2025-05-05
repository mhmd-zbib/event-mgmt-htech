const sequelize = require('./database');
const User = require('../models/user.model');
const config = require('./index');

/**
 * Initialize database connection and sync models
 * @returns {Promise<boolean>} - True if initialization is successful
 */
const initDatabase = async () => {
  try {
    // Test database connection
    const connected = await sequelize.testConnection();
    if (!connected) {
      console.error('Failed to connect to the database.');
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
    console.log(`Database models synchronized successfully (alter: ${syncOptions.alter}).`);
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

module.exports = initDatabase;