const Tag = require('../models/tag.model');
const Event = require('../models/event.model');
const EventTag = require('../models/event-tag.model');
const User = require('../models/user.model');
const { 
  NotFoundError, 
  BadRequestError,
  ForbiddenError,
  ConflictError
} = require('../errors/HttpErrors');
const { isValidUUID } = require('../utils/validation');
const { paginatedQuery } = require('../utils/pagination');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class TagService {
  async getAllTags(queryParams = {}) {
    return paginatedQuery(Tag, {
      queryParams,
      allowedSortFields: ['name', 'createdAt'],
      defaultSortField: 'name',
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      resultKey: 'tags'
    });
  }

  async getTagById(tagId) {
    if (!isValidUUID(tagId)) {
      throw new BadRequestError('Invalid tag ID format. Must be a valid UUID.');
    }
    
    const tag = await Tag.findByPk(tagId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    
    return tag;
  }

  async createTag(tagData, adminId) {
    // Check if tag with the same name already exists
    const existingTag = await Tag.findOne({
      where: { name: tagData.name }
    });

    if (existingTag) {
      throw new ConflictError('Tag with this name already exists');
    }

    const tag = await Tag.create({
      ...tagData,
      createdBy: adminId
    });
    
    return tag;
  }

  async updateTag(tagId, tagData, adminId) {
    const tag = await this.getTagById(tagId);
    
    // If name is being updated, check for duplicates
    if (tagData.name && tagData.name !== tag.name) {
      const existingTag = await Tag.findOne({
        where: { name: tagData.name }
      });

      if (existingTag) {
        throw new ConflictError('Tag with this name already exists');
      }
    }

    await tag.update(tagData);
    return tag;
  }

  async deleteTag(tagId, adminId) {
    const tag = await this.getTagById(tagId);
    
    // Check if any events are using this tag
    const eventsWithTag = await EventTag.count({
      where: { tagId }
    });
    
    if (eventsWithTag > 0) {
      throw new BadRequestError('Cannot delete tag that is in use by events');
    }
    
    await tag.destroy();
    
    return true;
  }

  // Methods for event-tag associations
  async addTagsToEvent(eventId, tagIds, adminId) {
    if (!isValidUUID(eventId)) {
      throw new BadRequestError('Invalid event ID format');
    }
    
    // Check if event exists
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id']
        }
      ]
    });
    
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    
    // Check if admin has permission to modify this event
    if (event.createdBy !== adminId) {
      throw new ForbiddenError('You can only add tags to events you created');
    }
    
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      throw new BadRequestError('Tag IDs must be provided as a non-empty array');
    }
    
    // Validate tag IDs
    for (const tagId of tagIds) {
      if (!isValidUUID(tagId)) {
        throw new BadRequestError(`Invalid tag ID format: ${tagId}`);
      }
    }
    
    // Check if all tags exist
    const existingTags = await Tag.findAll({
      where: {
        id: {
          [Op.in]: tagIds
        }
      }
    });
    
    if (existingTags.length !== tagIds.length) {
      const foundIds = existingTags.map(tag => tag.id);
      const missingIds = tagIds.filter(id => !foundIds.includes(id));
      throw new NotFoundError(`The following tags do not exist: ${missingIds.join(', ')}`);
    }
    
    // Filter out tags that the event already has to prevent duplicates
    const existingEventTagIds = event.tags.map(tag => tag.id);
    const newTagIds = tagIds.filter(id => !existingEventTagIds.includes(id));
    
    if (newTagIds.length === 0) {
      throw new BadRequestError('All of these tags are already associated with this event');
    }
    
    // Create event-tag associations only for the new tags
    const eventTagPromises = newTagIds.map(tagId => 
      EventTag.create({
        eventId,
        tagId
      })
    );
    
    await Promise.all(eventTagPromises);
    
    // Get updated event with tags
    const updatedEvent = await Event.findByPk(eventId, {
      include: [
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] } // Exclude junction table attributes
        }
      ]
    });
    
    return updatedEvent;
  }
  
  async removeTagsFromEvent(eventId, tagIds, adminId) {
    if (!isValidUUID(eventId)) {
      throw new BadRequestError('Invalid event ID format');
    }
    
    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    
    // Check if admin has permission to modify this event
    if (event.createdBy !== adminId) {
      throw new ForbiddenError('You can only remove tags from events you created');
    }
    
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      throw new BadRequestError('Tag IDs must be provided as a non-empty array');
    }
    
    // Validate tag IDs
    for (const tagId of tagIds) {
      if (!isValidUUID(tagId)) {
        throw new BadRequestError(`Invalid tag ID format: ${tagId}`);
      }
    }
    
    // Delete the event-tag associations
    await EventTag.destroy({
      where: {
        eventId,
        tagId: {
          [Op.in]: tagIds
        }
      }
    });
    
    // Get updated event with remaining tags
    const updatedEvent = await Event.findByPk(eventId, {
      include: [
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] } // Exclude junction table attributes
        }
      ]
    });
    
    return updatedEvent;
  }
  
  async getEventTags(eventId) {
    if (!isValidUUID(eventId)) {
      throw new BadRequestError('Invalid event ID format');
    }
    
    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    
    // Get event with tags
    const eventWithTags = await Event.findByPk(eventId, {
      include: [
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] } // Exclude junction table attributes
        }
      ]
    });
    
    return eventWithTags.tags;
  }
  
  async getTagEvents(tagId, queryParams = {}) {
    if (!isValidUUID(tagId)) {
      throw new BadRequestError('Invalid tag ID format');
    }
    
    // Check if tag exists
    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    
    // Get events by tag ID with pagination
    const eventIds = await EventTag.findAll({
      where: { tagId },
      attributes: ['eventId']
    });
    
    if (eventIds.length === 0) {
      return {
        events: [],
        pagination: {
          total: 0,
          page: 1,
          size: parseInt(queryParams.size || 10, 10),
          totalPages: 0,
          hasNext: false,
          hasPrevious: false
        },
        sort: {
          sortBy: queryParams.sortBy || 'startDate',
          sortOrder: queryParams.sortOrder || 'DESC'
        }
      };
    }
    
    return paginatedQuery(Event, {
      queryParams,
      allowedSortFields: ['title', 'createdAt', 'startDate', 'endDate'],
      defaultSortField: 'startDate',
      where: {
        id: {
          [Op.in]: eventIds.map(item => item.eventId)
        }
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      resultKey: 'events'
    });
  }
}

module.exports = new TagService();