const { NotFoundError, BadRequestError, ForbiddenError } = require('../errors/HttpErrors');
const Participant = require('../models/participant.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const { log } = require('winston');
const { processPaginationParams, createPaginationMeta, paginatedQuery } = require('../utils/pagination');
const sequelize = require('../config/database');

class ParticipantService {

  async registerForEvent(eventId, userId, data = {}) {
    // Use a transaction to ensure data consistency
    const transaction = await sequelize.transaction();
    
    try {
      const event = await Event.findByPk(eventId, { transaction });
      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Verify the user exists
      const user = await User.findByPk(userId, { transaction });
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
        where: { eventId, userId },
        transaction
      });

      if (existingParticipant) {
        throw new BadRequestError('User is already registered for this event');
      }

      // Check event capacity if it's set
      if (event.capacity !== null && event.participantsCount >= event.capacity) {
        throw new BadRequestError('This event has reached its maximum capacity');
      }

      // Create the participant record
      const participant = await Participant.create({
        eventId,
        userId,
        notes: data.notes || null,
        status: 'registered',
        registrationDate: new Date()
      }, { transaction });
      
      // Increment the participantsCount
      await event.increment('participantsCount', { transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      // Return with user details
      const participantWithDetails = await Participant.findByPk(participant.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ]
      });

      return participantWithDetails;
    } catch (error) {
      // If an error occurs, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  }

  async exitEvent(eventId, userId) {
    // Use a transaction to ensure data consistency
    const transaction = await sequelize.transaction();
    
    try {
      // Verify the event exists
      const event = await Event.findByPk(eventId, { transaction });
      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Find the participant record
      const participant = await Participant.findOne({
        where: {
          eventId,
          userId
        },
        transaction
      });

      if (!participant) {
        throw new NotFoundError('You are not registered for this event');
      }

      // Store participant data before deletion for logging
      const participantData = participant.toJSON();

      // Delete the participant record
      await participant.destroy({ transaction });
      
      // Decrement the participantsCount
      await event.decrement('participantsCount', { transaction });
      
      // Commit the transaction
      await transaction.commit();

      return {
        message: 'You have successfully unregistered from this event',
        participant: participantData
      };
    } catch (error) {
      // If an error occurs, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  }

  async removeParticipant(eventId, userId, adminId) {
    // Use a transaction to ensure data consistency
    const transaction = await sequelize.transaction();
    
    try {
      // Verify the event exists
      const event = await Event.findByPk(eventId, { transaction });
      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Verify the user exists
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Find the participant record
      const participant = await Participant.findOne({
        where: {
          eventId,
          userId
        },
        transaction
      });

      if (!participant) {
        throw new NotFoundError('User is not registered for this event');
      }

      // Store participant data before deletion for logging/response
      const participantData = participant.toJSON();

      // Delete the participant record
      await participant.destroy({ transaction });
      
      // Decrement the participantsCount
      await event.decrement('participantsCount', { transaction });
      
      // Commit the transaction
      await transaction.commit();

      return {
        message: 'Participant removed successfully',
        participant: participantData
      };
    } catch (error) {
      // If an error occurs, rollback the transaction
      await transaction.rollback();
      throw error;
    }
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
