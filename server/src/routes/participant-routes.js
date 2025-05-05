const router = require('express').Router();
const participantController = require('../controllers/participant.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');

// Route for users to get events they're participating in
router.get('/participants', authMiddleware(), participantController.getUserParticipatingEvents);

router.post('/events/:eventId/participants', participantController.registerForEvent);

router.get('/events/:eventId/participants', authorize('admin'),
 participantController.getEventParticipants);

router.delete(
  '/events/:eventId/participants', participantController.exitEvent);

router.delete(
  '/events/:eventId/participants/:userId',
  authorize('admin'),
  participantController.removeParticipant
);

module.exports = router;
