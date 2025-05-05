const { Sequelize } = require('sequelize');
const config = require('./index');

const createSequelizeInstance = () => {
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

const sequelize = createSequelizeInstance();

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

if (require.main === module) {
  testConnection()
    .then(success => process.exit(success ? 0 : 1));
}

module.exports = sequelize;
module.exports.testConnection = testConnection;