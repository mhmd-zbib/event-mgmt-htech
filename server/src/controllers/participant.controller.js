const participantService = require('../services/participant.service');
const { formatMessageResponse } = require('../utils/response-formatter');

class ParticipantController {
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
}

module.exports = new ParticipantController();
