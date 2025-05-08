require('dotenv').config();

module.exports = {
    // Server configuration
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    
    // Database configuration
    db: {
        url: process.env.DATABASE_URL,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        options: {
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
                max: parseInt(process.env.DB_POOL_MAX || '5'),
                min: parseInt(process.env.DB_POOL_MIN || '0'),
                acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
                idle: parseInt(process.env.DB_POOL_IDLE || '10000')
            },
            ssl: process.env.DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
            } : false
        }
    },
    
    // Authentication configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'default-dev-secret-do-not-use-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-do-not-use-in-production',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    
    // Logging configuration
    logLevel: process.env.LOG_LEVEL || 'info'
}