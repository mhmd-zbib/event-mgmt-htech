const User = require('../models/user.model');
const { 
  NotFoundError, 
  ConflictError
} = require('../errors/HttpErrors');
const handleDatabaseError = require('../errors/DatabaseError');

class UserService {
  async createUser(userData) {
    // Check for existing email
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    try {
      // Create the user - this might throw database errors
      const user = await User.create(userData);
      return user;
    } catch (error) {
      // Handle database-specific errors only
      if (error.name && ['SequelizeValidationError', 'SequelizeUniqueConstraintError'].includes(error.name)) {
        throw handleDatabaseError(error);
      }
      
      // Let all other errors bubble up to the global handler
      throw error;
    }
  }

  async getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getUserByEmail(email) {
    // Simple database query, let any errors bubble up
    return await User.findOne({ where: { email } });
  }

  async updateLastLogin(user) {
    user.lastLogin = new Date();
    return await user.save();
  }

  async updateUser(userId, updateData) {
    // Get user (this already throws NotFoundError if needed)
    const user = await this.getUserById(userId);
    
    // Check for email conflicts
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.getUserByEmail(updateData.email);
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }
    
    try {
      // Update the user - this might throw database errors
      await user.update(updateData);
      return user;
    } catch (error) {
      // Handle database-specific errors only
      if (error.name && ['SequelizeValidationError', 'SequelizeUniqueConstraintError'].includes(error.name)) {
        throw handleDatabaseError(error);
      }
      
      // Let all other errors bubble up to the global handler
      throw error;
    }
  }
}

module.exports = new UserService();