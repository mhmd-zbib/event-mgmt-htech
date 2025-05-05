const router = require('express').Router();
const participantController = require('../controllers/participant.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');

/**
 * @swagger
 * /events/{eventId}/participants/{userId}:
 *   delete:
 *     summary: Remove a participant from an event (Admin only)
 *     description: Allows admins to remove a user from an event
 *     tags: [Events, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The event ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID to remove from the event
 *     responses:
 *       200:
 *         description: Participant removed successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Event or user not found
 */
router.delete(
  '/:eventId/participants/:userId',
  authMiddleware,
  authorize('admin'),
  participantController.removeParticipant
);

module.exports = router;
