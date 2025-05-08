const jwt = require('jsonwebtoken');
const config = require('../config');
const userService = require('./user.service');
const { UnauthorizedError, BadRequestError, InternalServerError } = require('../errors/HttpErrors');
const logger = require('../utils/logger');

class AuthService {
  async register(userData) {
    const user = await userService.createUser(userData);
    const tokens = this.generateTokens(user);
    
    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email.substring(0, 3) + '***'
    });
    
    const sanitizedUser = this.sanitizeUserForResponse(user);
    
    return { user: sanitizedUser, token: tokens };
  }

  async login(credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await userService.getUserByEmail(email);
    
    const authFailureMessage = 'Invalid credentials';
    
    if (!user) {
      logger.info('Login attempt for non-existent user', {
        maskedEmail: email.substring(0, 3) + '***'
      });
      throw new UnauthorizedError(authFailureMessage);
    }

    if (user.isActive === false) {
      logger.info('Login attempt for inactive account', {
        userId: user.id,
        maskedEmail: email.substring(0, 3) + '***'
      });
      throw new UnauthorizedError(authFailureMessage);
    }

    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      logger.warn('Failed login attempt - invalid password', {
        userId: user.id,
        maskedEmail: email.substring(0, 3) + '***'
      });
      throw new UnauthorizedError(authFailureMessage);
    }

    await userService.updateLastLogin(user);
    
    const tokens = this.generateTokens(user);
    
    logger.info('User logged in successfully', {
      userId: user.id,
      maskedEmail: email.substring(0, 3) + '***'
    });
    
    const sanitizedUser = this.sanitizeUserForResponse(user);
    
    return { user: sanitizedUser, token: tokens };
  }

  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Generate access token
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn || '1h'
    });

    // Generate refresh token with longer expiration
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret || config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn || '7d'
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour in seconds
    };
  }

  verifyToken(token, isRefreshToken = false) {
    try {
      const secret = isRefreshToken ? 
        (config.jwt.refreshSecret || config.jwt.secret) : 
        config.jwt.secret;
        
      return jwt.verify(token, secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired');
      }
      throw new UnauthorizedError('Invalid token');
    }
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }
    
    // Verify refresh token specifically
    const decoded = this.verifyToken(refreshToken, true);
    
    const user = await userService.getUserById(decoded.id);
    
    if (!user || user.isActive === false) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    
    // Generate new tokens
    const tokens = this.generateTokens(user);
    
    const sanitizedUser = this.sanitizeUserForResponse(user);
    
    return { user: sanitizedUser, token: tokens };
  }
  
  sanitizeUserForResponse(user) {
    const userData = user.toJSON ? user.toJSON() : { ...user };
    
    const sensitiveFields = ['password', 'resetToken', 'resetTokenExpires'];
    sensitiveFields.forEach(field => {
      if (userData[field]) delete userData[field];
    });
    
    return userData;
  }
}

module.exports = new AuthService();