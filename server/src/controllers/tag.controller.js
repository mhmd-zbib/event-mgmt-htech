const tagService = require('../services/tag.service');
const { formatMessageResponse } = require('../utils/response-formatter');
const { createTagListResponseDto, createTagDetailResponseDto } = require('../dto/tag-response.dto');
const { formatItemResponse } = require('../utils/response-formatter');

class TagController {
  async getAllTags(req, res, next) {
    try {
      const result = await tagService.getAllTags(req.query);
      const responseData = createTagListResponseDto(
        result.tags,
        result.pagination,
        result.sort
      );
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async getTagById(req, res, next) {
    try {
      const { id } = req.params;
      const tag = await tagService.getTagById(id);
      const responseData = createTagDetailResponseDto(tag);
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async createTag(req, res, next) {
    try {
      const adminId = req.user.id;
      const tag = await tagService.createTag(req.body, adminId);
      const responseData = createTagDetailResponseDto(tag);
      res.status(201).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async updateTag(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const tag = await tagService.updateTag(id, req.body, adminId);
      const responseData = createTagDetailResponseDto(tag);
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async deleteTag(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      await tagService.deleteTag(id, adminId);
      const responseData = formatMessageResponse('Tag deleted successfully');
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  // Event-Tag association controllers
  async addTagsToEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const { tagIds } = req.body;
      const adminId = req.user.id;
      
      await tagService.addTagsToEvent(eventId, tagIds, adminId);
      
      // Create a response with separate message and link fields
      const responseData = {
        message: "Tags added successfully",
        link: `/api/events/${eventId}`
      };
      
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async removeTagsFromEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const { tagIds } = req.body;
      const adminId = req.user.id;
      
      await tagService.removeTagsFromEvent(eventId, tagIds, adminId);
      
      // Create a response with separate message and link fields
      const responseData = {
        message: "Tags removed successfully",
        link: `/api/events/${eventId}`
      };
      
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async getEventTags(req, res, next) {
    try {
      const { eventId } = req.params;
      const tags = await tagService.getEventTags(eventId);
      const responseData = createTagListResponseDto(
        tags, 
        { total: tags.length, page: 1, size: tags.length, totalPages: 1, hasNext: false, hasPrevious: false },
        { sortBy: 'name', sortOrder: 'ASC' }
      );
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async getTagEvents(req, res, next) {
    try {
      const { tagId } = req.params;
      const result = await tagService.getTagEvents(tagId, req.query);
      // We're using the event response DTO indirectly via the service
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TagController();