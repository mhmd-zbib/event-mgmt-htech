const jwt = require('jsonwebtoken');
const config = require('../config');
const userService = require('./user.service');
const { UnauthorizedError, BadRequestError } = require('../errors/HttpErrors');
const logger = require('../utils/logger');

class AuthService {
  async register(userData) {
    const user = await userService.createUser(userData);
    const token = this.generateToken(user);
    
    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email
    });
    
    return { user, token };
  }

  async login(credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.isActive === false) {
      throw new UnauthorizedError('Account is deactivated. Please contact support.');
    }

    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      logger.warn('Failed login attempt', {
        email,
        reason: 'Invalid password'
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    await userService.updateLastLogin(user);
    
    const token = this.generateToken(user);
    
    logger.info('User logged in', {
      userId: user.id,
      email: user.email
    });
    
    return { user, token };
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
    try {
      const decoded = this.verifyToken(refreshToken);
      
      const user = await userService.getUserById(decoded.id);
      
      const newToken = this.generateToken(user);
      
      return { user, token: newToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}

module.exports = new AuthService();