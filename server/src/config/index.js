module.exports= {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    db: {
        url:process.env.DATABASE_URL
    },
    jwt:{
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN
    }
}