const Category = require('../models/category.model');
const User = require('../models/user.model');
const Event = require('../models/event.model');
const { 
  NotFoundError, 
  BadRequestError,
  ForbiddenError,
  ConflictError
} = require('../errors/HttpErrors');
const { processPaginationParams, createPaginationMeta, paginatedQuery } = require('../utils/pagination');
const { isValidUUID } = require('../utils/validation');

class CategoryService {
  async getAllCategories(queryParams = {}) {
    return paginatedQuery(Category, {
      queryParams,
      allowedSortFields: ['name', 'createdAt'],
      defaultSortField: 'name',
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ],
      resultKey: 'categories'
    });
  }

  async getCategoryById(categoryId) {
    if (!isValidUUID(categoryId)) {
      throw new BadRequestError('Invalid category ID format. Must be a valid UUID.');
    }
    
    const category = await Category.findByPk(categoryId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    
    return category;
  }

  async createCategory(categoryData, adminId) {
    // Check if category with the same name already exists
    const existingCategory = await Category.findOne({
      where: { name: categoryData.name }
    });

    if (existingCategory) {
      throw new ConflictError('Category with this name already exists');
    }

    const category = await Category.create({
      ...categoryData,
      createdBy: adminId
    });
    
    return category;
  }

  async updateCategory(categoryId, categoryData, adminId) {
    const category = await this.getCategoryById(categoryId);
    
    if (category.createdBy !== adminId) {
      throw new ForbiddenError('You can only update categories you created');
    }
    
    // If name is being updated, check for duplicates
    if (categoryData.name && categoryData.name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { name: categoryData.name }
      });

      if (existingCategory) {
        throw new ConflictError('Category with this name already exists');
      }
    }

    await category.update(categoryData);
    return category;
  }

  async deleteCategory(categoryId, adminId) {
    const category = await this.getCategoryById(categoryId);
    
    if (category.createdBy !== adminId) {
      throw new ForbiddenError('You can only delete categories you created');
    }
    
    // Check if any events are using this category
    const eventsWithCategory = await Event.count({
      where: { categoryId }
    });
    
    if (eventsWithCategory > 0) {
      throw new BadRequestError('Cannot delete category that is in use by events');
    }
    
    await category.destroy();
    
    return true;
  }

  // Method to get events by category
  async getEventsByCategoryId(categoryId, queryParams = {}) {
    await this.getCategoryById(categoryId); // Verify category exists
    
    return paginatedQuery(Event, {
      queryParams,
      allowedSortFields: ['title', 'createdAt', 'startDate', 'endDate', 'location'],
      defaultSortField: 'startDate',
      where: { categoryId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Category,
          as: 'category'
        }
      ],
      resultKey: 'events'
    });
  }
}

module.exports = new CategoryService();