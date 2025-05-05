const eventService = require('../services/event.service');
const eventResponseDto = require('../dto/event-response.dto');
const { formatPaginatedResponse, formatItemResponse, formatMessageResponse } = require('../utils/response-formatter');

class EventController {
  async getAllEvents(req, res, next) {
    const result = await eventService.getAllEvents(req.query);
    
    const responseData = formatPaginatedResponse(
      result.events,
      result.pagination,
      result.sort,
      eventResponseDto.mapEventForList
    );
    
    res.status(200).json(responseData);
  }

  async getEventById(req, res, next) {
    const { id } = req.params;
    
    const event = await eventService.getEventById(id);
    
    const responseData = formatItemResponse(event, 'event');
    
    res.status(200).json(responseData);
  }

  async createEvent(req, res, next) {
    const eventData = req.validatedData || req.body;
    const adminId = req.user.id;
    
    const event = await eventService.createEvent(eventData, adminId);
    
    const responseData = formatItemResponse(event, 'event');
    
    res.status(201).json(responseData);
  }

  async updateEvent(req, res, next) {
    const { id } = req.params;
    const eventData = req.validatedData || req.body;
    const adminId = req.user.id;
    
    const event = await eventService.updateEvent(id, eventData, adminId);
    
    const responseData = formatItemResponse(event, 'event');
    
    res.status(200).json(responseData);
  }

  async deleteEvent(req, res, next) {
    const { id } = req.params;
    const adminId = req.user.id;
    
    await eventService.deleteEvent(id, adminId);
    
    const responseData = formatMessageResponse('Event deleted successfully');
    
    res.status(200).json(responseData);
  }
}

module.exports = new EventController();