const { NotFoundError, BadRequestError, ForbiddenError } = require('../errors/HttpErrors');
const Participant = require('../models/participant.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const { log } = require('winston');
const { processPaginationParams, createPaginationMeta, paginatedQuery } = require('../utils/pagination');

class ParticipantService {

  async registerForEvent(eventId, userId, data = {}) {
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Verify the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Don't allow admins to participate
    if (user.role === 'admin') {
      throw new ForbiddenError('Administrators cannot register for events');
    }
    
    // Check if the event has already passed
    if (new Date(event.endDate) < new Date()) {
      throw new BadRequestError('Cannot register for an event that has already ended');
    }

    // Check if user is already registered
    const existingParticipant = await Participant.findOne({
      where: { eventId, userId }
    });

    if (existingParticipant) {
      throw new BadRequestError('User is already registered for this event');
    }

    // Create the participant record
    const participant = await Participant.create({
      eventId,
      userId,
      notes: data.notes || null,
      status: 'registered',
      registrationDate: new Date()
    });
    
    // Return with user details
    const participantWithDetails = await Participant.findByPk(participant.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    return participantWithDetails;
  }

  async exitEvent(eventId, userId) {
    // Verify the event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Find the participant record
    const participant = await Participant.findOne({
      where: {
        eventId,
        userId
      }
    });

    if (!participant) {
      throw new NotFoundError('You are not registered for this event');
    }

    // Store participant data before deletion for logging
    const participantData = participant.toJSON();

    // Delete the participant record
    await participant.destroy();

    return {
      message: 'You have successfully unregistered from this event',
      participant: participantData
    };
  }

  async removeParticipant(eventId, userId, adminId) {
    // Verify the event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Verify the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Find the participant record
    const participant = await Participant.findOne({
      where: {
        eventId,
        userId
      }
    });

    if (!participant) {
      throw new NotFoundError('User is not registered for this event');
    }

    // Store participant data before deletion for logging/response
    const participantData = participant.toJSON();

    // Delete the participant record
    await participant.destroy();

    return {
      message: 'Participant removed successfully',
      participant: participantData
    };
  }

  async getEventParticipants(eventId, options = {}) {
    // Verify the event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Setup query conditions
    const where = { eventId };
    if (options.status && ['registered', 'attended', 'cancelled', 'waitlisted'].includes(options.status)) {
      where.status = options.status;
    }

    const result = await paginatedQuery(Participant, {
      queryParams: options,
      allowedSortFields: ['registrationDate', 'createdAt', 'status'],
      defaultSortField: 'registrationDate',
      where,
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'firstName', 'lastName', 'email'] 
        }
      ],
      resultKey: 'participants'
    });

    // Return the complete result including participants, pagination and sort information
    return result;
  }

  async getUserParticipatingEvents(userId, queryParams = {}) {
    // Verify the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Use the pagination utility to get the events the user is participating in
    const result = await paginatedQuery(Participant, {
      queryParams,
      allowedSortFields: ['registrationDate', 'createdAt'],
      defaultSortField: 'registrationDate',
      where: { userId },
      include: [
        {
          model: Event,
          as: 'event',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ],
      resultKey: 'participations'
    });

    return result;
  }
}

module.exports = new ParticipantService();
