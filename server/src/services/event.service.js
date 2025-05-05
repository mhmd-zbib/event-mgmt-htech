const Event = require('../models/event.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const { 
  NotFoundError, 
  BadRequestError,
  ForbiddenError
} = require('../errors/HttpErrors');
const { processPaginationParams, createPaginationMeta } = require('../utils/pagination');
const { isValidUUID, isValidDate, isValidDateRange } = require('../utils/validation');
const { Op } = require('sequelize');

class EventService {
  async getAllEvents(queryParams = {}) {
    const allowedSortFields = ['title', 'createdAt', 'startDate', 'endDate', 'location'];
    const paginationOptions = processPaginationParams(
      queryParams,
      allowedSortFields,
      'createdAt'
    );
    
    const where = {};
    
    if (queryParams.fromDate && isValidDate(queryParams.fromDate)) {
      where.startDate = {
        ...where.startDate,
        [Op.gte]: new Date(queryParams.fromDate)
      };
    }
    
    if (queryParams.toDate && isValidDate(queryParams.toDate)) {
      where.endDate = {
        ...where.endDate,
        [Op.lte]: new Date(queryParams.toDate)
      };
    }
    
    // Add categoryId filter if provided
    if (queryParams.categoryId && isValidUUID(queryParams.categoryId)) {
      where.categoryId = queryParams.categoryId;
    }
    
    const { count, rows: events } = await Event.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        }
      ],
      limit: paginationOptions.limit,
      offset: paginationOptions.offset,
      order: [[paginationOptions.sortBy, paginationOptions.sortOrder]]
    });
    
    const meta = createPaginationMeta(count, paginationOptions);
    
    return {
      events,
      ...meta
    };
  }

  validateEventDates(startDate, endDate) {
    if (!isValidDate(startDate)) {
      throw new BadRequestError('Invalid start date format');
    }
    
    if (!isValidDate(endDate)) {
      throw new BadRequestError('Invalid end date format');
    }
    
    if (!isValidDateRange(startDate, endDate)) {
      throw new BadRequestError('Start date must be before end date');
    }
    
    return { 
      start: new Date(startDate), 
      end: new Date(endDate) 
    };
  }

  async getEventById(eventId) {
    if (!isValidUUID(eventId)) {
      throw new BadRequestError('Invalid event ID format. Must be a valid UUID.');
    }
    
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        }
      ]
    });
    
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    
    return event;
  }

  async createEvent(eventData, adminId) {
    this.validateEventDates(eventData.startDate, eventData.endDate);

    // Validate categoryId if provided
    if (eventData.categoryId) {
      if (!isValidUUID(eventData.categoryId)) {
        throw new BadRequestError('Invalid category ID format. Must be a valid UUID.');
      }
      
      const categoryExists = await Category.findByPk(eventData.categoryId);
      if (!categoryExists) {
        throw new BadRequestError('The specified category does not exist.');
      }
    }

    const event = await Event.create({
      ...eventData,
      createdBy: adminId
    });
    
    // If we need to return the full event with associations immediately
    if (event) {
      return this.getEventById(event.id);
    }
    
    return event;
  }

  async updateEvent(eventId, eventData, adminId) {
    const event = await this.getEventById(eventId);
    
    if (event.createdBy !== adminId) {
      throw new ForbiddenError('You can only update events you created');
    }
    
    if (eventData.startDate && eventData.endDate) {
      this.validateEventDates(eventData.startDate, eventData.endDate);
    } 
    else if (eventData.startDate) {
      if (!isValidDate(eventData.startDate)) {
        throw new BadRequestError('Invalid start date format');
      }
      if (!isValidDateRange(eventData.startDate, event.endDate)) {
        throw new BadRequestError('Start date must be before end date');
      }
    } 
    else if (eventData.endDate) {
      if (!isValidDate(eventData.endDate)) {
        throw new BadRequestError('Invalid end date format');
      }
      if (!isValidDateRange(event.startDate, eventData.endDate)) {
        throw new BadRequestError('Start date must be before end date');
      }
    }

    // Validate categoryId if provided
    if (eventData.categoryId) {
      if (!isValidUUID(eventData.categoryId)) {
        throw new BadRequestError('Invalid category ID format. Must be a valid UUID.');
      }
      
      const categoryExists = await Category.findByPk(eventData.categoryId);
      if (!categoryExists) {
        throw new BadRequestError('The specified category does not exist.');
      }
    }

    await event.update(eventData);
    
    // Get the updated event with all associations
    return this.getEventById(eventId);
  }

  async deleteEvent(eventId, adminId) {
    const event = await this.getEventById(eventId);
    
    if (event.createdBy !== adminId) {
      throw new ForbiddenError('You can only delete events you created');
    }
    
    await event.destroy();
    
    return true;
  }
}

module.exports = new EventService();