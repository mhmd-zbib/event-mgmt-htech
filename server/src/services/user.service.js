const User = require('../models/user.model');
const { 
  NotFoundError, 
  ConflictError,
  BadRequestError
} = require('../errors/HttpErrors');
const { processPaginationParams, createPaginationMeta } = require('../utils/pagination');
const { isValidUUID } = require('../utils/validation');

class UserService {
  async createUser(userData) {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    const user = await User.create(userData);
    return user;
  }

  async getUserById(userId) {
    if (!isValidUUID(userId)) {
      throw new BadRequestError('Invalid user ID format. Must be a valid UUID.');
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getUserByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async updateLastLogin(user) {
    user.lastLogin = new Date();
    return await user.save();
  }

  async updateUser(userId, updateData) {
    const user = await this.getUserById(userId);
    
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.getUserByEmail(updateData.email);
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }
    
    await user.update(updateData);
    return user;
  }

  async getAllUsers(queryParams = {}) {
    const allowedSortFields = ['email', 'firstName', 'lastName', 'createdAt', 'role'];
    const paginationOptions = processPaginationParams(
      queryParams,
      allowedSortFields,
      'createdAt'
    );
    
    const { count, rows: users } = await User.findAndCountAll({
      limit: paginationOptions.limit,
      offset: paginationOptions.offset,
      order: [[paginationOptions.sortBy, paginationOptions.sortOrder]]
    });
    
    const meta = createPaginationMeta(count, paginationOptions);
    
    return {
      users,
      ...meta
    };
  }

  async updateUserRole(userId, role) {
    if (!['user', 'admin'].includes(role)) {
      throw new BadRequestError('Invalid role. Role must be either "user" or "admin"');
    }

    const user = await this.getUserById(userId);
    
    user.role = role;
    await user.save();
    
    return user;
  }

  async deleteUser(userId) {
    const user = await this.getUserById(userId);
    
    await user.destroy();
    
    return true;
  }
}

module.exports = new UserService();