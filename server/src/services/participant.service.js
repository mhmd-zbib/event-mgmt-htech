const { NotFoundError, BadRequestError } = require('../errors/HttpErrors');
const Participant = require('../models/participant.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');

class ParticipantService {
  /**
   * Remove a participant from an event (admin only)
   * @param {string} eventId - The ID of the event
   * @param {string} userId - The ID of the user to remove
   * @param {string} adminId - The ID of the admin performing the action
   * @returns {Promise<Object>} - The removed participant
   */
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
}

module.exports = new ParticipantService();
