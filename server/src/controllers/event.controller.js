const eventService = require('../services/event.service');
const eventResponseDto = require('../dto/event-response.dto');
const eventRequestDto = require('../dto/event-request.dto');
const { formatMessageResponse } = require('../utils/response-formatter');

class EventController {
  async getAllEvents(req, res, next) {
    const result = await eventService.getAllEvents(req.query);
    
    const responseData = eventResponseDto.createEventListResponseDto(
      result.events,
      result.pagination,
      result.sort
    );
    
    res.status(200).json(responseData);
  }

  async getEventById(req, res, next) {
    const { id } = req.params;
    
    const event = await eventService.getEventById(id);
    
    const responseData = eventResponseDto.createEventDetailResponseDto(event);
    
    res.status(200).json(responseData);
  }

  async createEvent(req, res, next) {
    const eventData = req.validatedData || req.body;
    const adminId = req.user.id;
    
    const formattedData = eventRequestDto.createEventRequestDto(eventData);
    const event = await eventService.createEvent(formattedData, adminId);
    
    // Return a message with a separate link field
    const responseData = {
      message: "Event created successfully",
      link: `/api/events/${event.id}`
    };
    
    res.status(201).json(responseData);
  }

  async updateEvent(req, res, next) {
    const { id } = req.params;
    const eventData = req.validatedData || req.body;
    const adminId = req.user.id;
    
    const formattedData = eventRequestDto.updateEventRequestDto(eventData);
    const event = await eventService.updateEvent(id, formattedData, adminId);
    
    const responseData = eventResponseDto.createEventDetailResponseDto(event);
    
    res.status(200).json(responseData);
  }

  async setEventCategory(req, res, next) {
    const { eventId, categoryId } = req.params;
    const adminId = req.user.id;
    
    await eventService.setEventCategory(eventId, categoryId, adminId);
    
    // Return a message with a separate link field
    const responseData = {
      message: "Category set successfully",
      link: `/api/events/${eventId}`
    };
    
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