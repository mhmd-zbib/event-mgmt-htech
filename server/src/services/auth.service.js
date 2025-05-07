const jwt = require('jsonwebtoken');
const config = require('../config');
const userService = require('./user.service');
const { UnauthorizedError, BadRequestError, InternalServerError } = require('../errors/HttpErrors');
const logger = require('../utils/logger');

class AuthService {
  async register(userData) {
    const user = await userService.createUser(userData);
    const token = this.generateToken(user);
    
    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email.substring(0, 3) + '***' // Log partial email for audit, not full email
    });
    
    // Don't return sensitive user data in the response
    const sanitizedUser = this.sanitizeUserForResponse(user);
    
    return { user: sanitizedUser, token };
  }

  async login(credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await userService.getUserByEmail(email);
    
    // Use consistent error message for all authentication failures
    // to prevent user enumeration attacks
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
    
    const token = this.generateToken(user);
    
    logger.info('User logged in successfully', {
      userId: user.id,
      maskedEmail: email.substring(0, 3) + '***'
    });
    
    // Don't return sensitive user data in the response
    const sanitizedUser = this.sanitizeUserForResponse(user);
    
    return { user: sanitizedUser, token };
  }

  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn || '1d'
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
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
    
    const decoded = this.verifyToken(refreshToken);
    
    const user = await userService.getUserById(decoded.id);
    
    const newToken = this.generateToken(user);
    
    // Don't return sensitive user data in the response
    const sanitizedUser = this.sanitizeUserForResponse(user);
    
    return { user: sanitizedUser, token: newToken };
  }
  
  // Helper method to sanitize user data for responses
  sanitizeUserForResponse(user) {
    const userData = user.toJSON ? user.toJSON() : { ...user };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'resetToken', 'resetTokenExpires'];
    sensitiveFields.forEach(field => {
      if (userData[field]) delete userData[field];
    });
    
    return userData;
  }
}

module.exports = new AuthService();