const jwt = require('jsonwebtoken');
const config = require('../config');
const userService = require('./user.service');
const { UnauthorizedError } = require('../errors/HttpErrors');

class AuthService {
  async register(userData) {
    // User creation handles its own errors
    const user = await userService.createUser(userData);
    const token = this.generateToken(user);
    
    return { user, token };
  }

  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Validate password
    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login time
    await userService.updateLastLogin(user);
    
    // Generate token
    const token = this.generateToken(user);
    
    return { user, token };
  }

  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn || '1d'
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();