const Event = require('../models/event.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Tag = require('../models/tag.model');
const { 
  NotFoundError, 
  BadRequestError,
  ForbiddenError
} = require('../errors/HttpErrors');
const { processPaginationParams, createPaginationMeta, paginatedQuery } = require('../utils/pagination');
const { isValidUUID, isValidDate, isValidDateRange } = require('../utils/validation');
const { Op } = require('sequelize');

class EventService {
  async getAllEvents(queryParams = {}) {
    const where = {};
    
    // Date filters
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
    
    // Category filter
    if (queryParams.categoryId && isValidUUID(queryParams.categoryId)) {
      where.categoryId = queryParams.categoryId;
    }
    
    // Event status filter (upcoming, past, ongoing)
    if (queryParams.status) {
      const now = new Date();
      
      switch(queryParams.status.toLowerCase()) {
        case 'upcoming':
          where.startDate = { [Op.gt]: now };
          break;
        case 'past':
          where.endDate = { [Op.lt]: now };
          break;
        case 'ongoing':
          where.startDate = { [Op.lte]: now };
          where.endDate = { [Op.gte]: now };
          break;
      }
    }
    
    // Location filter
    if (queryParams.location) {
      where.location = { 
        [Op.iLike]: `%${queryParams.location}%`
      };
    }
    
    // Title search
    if (queryParams.title) {
      where.title = { 
        [Op.iLike]: `%${queryParams.title}%`
      };
    }
    
    // Description search
    if (queryParams.description) {
      where.description = { 
        [Op.iLike]: `%${queryParams.description}%`
      };
    }
    
    // Combined search for title or description
    if (queryParams.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${queryParams.search}%` } },
        { description: { [Op.iLike]: `%${queryParams.search}%` } }
      ];
    }
    
    // Capacity filters
    if (queryParams.minCapacity && !isNaN(queryParams.minCapacity)) {
      where.capacity = {
        ...where.capacity,
        [Op.gte]: parseInt(queryParams.minCapacity)
      };
    }
    
    if (queryParams.maxCapacity && !isNaN(queryParams.maxCapacity)) {
      where.capacity = {
        ...where.capacity,
        [Op.lte]: parseInt(queryParams.maxCapacity)
      };
    }
    
    // Price filters
    if (queryParams.isFree === 'true') {
      where.price = 0;
    } else if (queryParams.isFree === 'false') {
      where.price = { [Op.gt]: 0 };
    }
    
    if (queryParams.minPrice && !isNaN(queryParams.minPrice)) {
      where.price = {
        ...where.price,
        [Op.gte]: parseFloat(queryParams.minPrice)
      };
    }
    
    if (queryParams.maxPrice && !isNaN(queryParams.maxPrice)) {
      where.price = {
        ...where.price,
        [Op.lte]: parseFloat(queryParams.maxPrice)
      };
    }
    
    // Tag filter
    let tagFilter = null;
    if (queryParams.tagId && isValidUUID(queryParams.tagId)) {
      tagFilter = queryParams.tagId;
    }
    
    return paginatedQuery(Event, {
      queryParams,
      allowedSortFields: ['title', 'createdAt', 'startDate', 'endDate', 'location', 'price', 'capacity'],
      defaultSortField: 'createdAt',
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
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] },
          where: tagFilter ? { id: tagFilter } : undefined,
          required: tagFilter ? true : false
        }
      ],
      resultKey: 'events'
    });
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
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
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

    if (eventData.categoryId) {
      if (!isValidUUID(eventData.categoryId)) {
        throw new BadRequestError('Invalid category ID format. Must be a valid UUID.');
      }
      
      const categoryExists = await Category.findByPk(eventData.categoryId);
      if (!categoryExists) {
        throw new BadRequestError('The specified category does not exist.');
      }
    }

    const { tags, ...eventDataWithoutTags } = eventData;
    
    const event = await Event.create({
      ...eventDataWithoutTags,
      createdBy: adminId
    });
    
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        if (!isValidUUID(tagId)) {
          throw new BadRequestError(`Invalid tag ID format: ${tagId}`);
        }
      }
      
      const existingTags = await Tag.findAll({
        where: {
          id: {
            [Op.in]: tags
          }
        }
      });
      
      if (existingTags.length !== tags.length) {
        const foundIds = existingTags.map(tag => tag.id);
        const missingIds = tags.filter(id => !foundIds.includes(id));
        throw new NotFoundError(`The following tags do not exist: ${missingIds.join(', ')}`);
      }
      
      await event.addTags(existingTags);
    }
    
    return this.getEventById(event.id);
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

    if (eventData.categoryId) {
      if (!isValidUUID(eventData.categoryId)) {
        throw new BadRequestError('Invalid category ID format. Must be a valid UUID.');
      }
      
      const categoryExists = await Category.findByPk(eventData.categoryId);
      if (!categoryExists) {
        throw new BadRequestError('The specified category does not exist.');
      }
    }
    
    const { tags, ...eventDataWithoutTags } = eventData;

    await event.update(eventDataWithoutTags);
    
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        if (!isValidUUID(tagId)) {
          throw new BadRequestError(`Invalid tag ID format: ${tagId}`);
        }
      }
      
      const existingTags = await Tag.findAll({
        where: {
          id: {
            [Op.in]: tags
          }
        }
      });
      
      if (existingTags.length !== tags.length) {
        const foundIds = existingTags.map(tag => tag.id);
        const missingIds = tags.filter(id => !foundIds.includes(id));
        throw new NotFoundError(`The following tags do not exist: ${missingIds.join(', ')}`);
      }
      
      await event.setTags(existingTags);
    }
    
    return this.getEventById(eventId);
  }

  async setEventCategory(eventId, categoryId, adminId) {
    if (!isValidUUID(eventId)) {
      throw new BadRequestError('Invalid event ID format. Must be a valid UUID.');
    }
    
    if (!isValidUUID(categoryId)) {
      throw new BadRequestError('Invalid category ID format. Must be a valid UUID.');
    }
    
    const event = await this.getEventById(eventId);
    
    if (event.createdBy !== adminId) {
      throw new ForbiddenError('You can only update events you created');
    }
    
    const categoryExists = await Category.findByPk(categoryId);
    if (!categoryExists) {
      throw new BadRequestError('The specified category does not exist.');
    }
    
    await event.update({ categoryId });
    
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