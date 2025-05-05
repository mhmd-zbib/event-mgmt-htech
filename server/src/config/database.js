const { Sequelize } = require('sequelize');
const config = require('./index');

/**
 * Create Sequelize instance based on configuration
 * @returns {Sequelize} - Configured Sequelize instance
 */
const createSequelizeInstance = () => {
  // If DATABASE_URL is provided, use it with parsed components
  if (config.db.url) {
    try {
      const dbUrl = new URL(config.db.url);
      const username = dbUrl.username;
      const password = dbUrl.password;
      const host = dbUrl.hostname;
      const port = dbUrl.port || '5432';
      const database = dbUrl.pathname.replace('/', '');

      return new Sequelize({
        dialect: 'postgres',
        host,
        port,
        username,
        password,
        database,
        ...config.db.options
      });
    } catch (error) {
      console.error('Invalid DATABASE_URL format:', error);
    }
  }

  // Fallback to individual config parameters or defaults
  return new Sequelize({
    dialect: 'postgres',
    host: config.db.host || 'localhost',
    port: config.db.port || 5432,
    username: config.db.username || 'postgres',
    password: config.db.password || 'postgres',
    database: config.db.database || 'postgres',
    ...config.db.options
  });
};

// Create the Sequelize instance
const sequelize = createSequelizeInstance();

/**
 * Test the database connection
 * @returns {Promise<boolean>} - True if connection is successful
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

// Test the connection if this file is run directly
if (require.main === module) {
  testConnection()
    .then(success => process.exit(success ? 0 : 1));
}

module.exports = sequelize;
module.exports.testConnection = testConnection;