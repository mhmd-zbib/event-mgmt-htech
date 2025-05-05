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
    
    // Add tag filter if provided
    let tagFilter = null;
    if (queryParams.tagId && isValidUUID(queryParams.tagId)) {
      tagFilter = queryParams.tagId;
    }
    
    return paginatedQuery(Event, {
      queryParams,
      allowedSortFields: ['title', 'createdAt', 'startDate', 'endDate', 'location'],
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
          through: { attributes: [] }, // Exclude junction table attributes
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
          through: { attributes: [] } // Exclude junction table attributes
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

    // Extract tags from event data before creating the event
    const { tags, ...eventDataWithoutTags } = eventData;
    
    // Create event
    const event = await Event.create({
      ...eventDataWithoutTags,
      createdBy: adminId
    });
    
    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Validate tagIds
      for (const tagId of tags) {
        if (!isValidUUID(tagId)) {
          throw new BadRequestError(`Invalid tag ID format: ${tagId}`);
        }
      }
      
      // Check if all tags exist
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
      
      // Associate tags with the event
      await event.addTags(existingTags);
    }
    
    // Return the event with all associations
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
    
    // Extract tags from event data before updating the event
    const { tags, ...eventDataWithoutTags } = eventData;

    await event.update(eventDataWithoutTags);
    
    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Validate tagIds
      for (const tagId of tags) {
        if (!isValidUUID(tagId)) {
          throw new BadRequestError(`Invalid tag ID format: ${tagId}`);
        }
      }
      
      // Check if all tags exist
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
      
      // Replace existing tags with the new set
      await event.setTags(existingTags);
    }
    
    // Get the updated event with all associations
    return this.getEventById(eventId);
  }

  async setEventCategory(eventId, categoryId, adminId) {
    // Validate input
    if (!isValidUUID(eventId)) {
      throw new BadRequestError('Invalid event ID format. Must be a valid UUID.');
    }
    
    if (!isValidUUID(categoryId)) {
      throw new BadRequestError('Invalid category ID format. Must be a valid UUID.');
    }
    
    // Get the event and check if it exists
    const event = await this.getEventById(eventId);
    
    // Check if user has permission to update the event
    if (event.createdBy !== adminId) {
      throw new ForbiddenError('You can only update events you created');
    }
    
    // Check if the category exists
    const categoryExists = await Category.findByPk(categoryId);
    if (!categoryExists) {
      throw new BadRequestError('The specified category does not exist.');
    }
    
    // Update the event's category
    await event.update({ categoryId });
    
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