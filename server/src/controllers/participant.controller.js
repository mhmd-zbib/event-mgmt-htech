const participantService = require('../services/participant.service');
const { formatMessageResponse, formatItemResponse } = require('../utils/response-formatter');
const { createParticipantListResponseDto, createParticipantDetailResponseDto } = require('../dto/participant-response.dto');
const { createEventListResponseDto } = require('../dto/event-response.dto');

class ParticipantController {
  async registerForEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const registrationData = req.body;
      
      const participant = await participantService.registerForEvent(eventId, userId, registrationData);
      
      // Return a message with a separate link field
      const responseData = {
        message: "Successfully registered for the event",
        link: `/api/events/${eventId}`
      };
      
      res.status(201).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async exitEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      
      const result = await participantService.exitEvent(eventId, userId);
      
      const responseData = formatMessageResponse(result.message);
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async removeParticipant(req, res, next) {
    try {
      const { eventId, userId } = req.params;
      const adminId = req.user.id;
      
      await participantService.removeParticipant(eventId, userId, adminId);
      
      const responseData = formatMessageResponse('Participant removed successfully');
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async getEventParticipants(req, res, next) {
    try {
      const { eventId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      
      const result = await participantService.getEventParticipants(
        eventId, 
        {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          status
        }
      );

      const responseData = createParticipantListResponseDto(
        result.participants,
        result.pagination,
        result.sort
      );
      
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async getUserParticipatingEvents(req, res, next) {
    try {
      const userId = req.user.id; // Get the current user's ID from the auth token
      
      const result = await participantService.getUserParticipatingEvents(userId, req.query);
      
      // Extract just the events from the participations
      const events = result.participations
        .map(participation => participation.event)
        .filter(event => event !== null);
      
      // Use the event DTO directly to format the response
      const responseData = createEventListResponseDto(
        events,
        result.pagination,
        result.sort
      );
      
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ParticipantController();
