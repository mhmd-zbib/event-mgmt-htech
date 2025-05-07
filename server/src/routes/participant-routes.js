const router = require('express').Router();
const participantController = require('../controllers/participant.controller');
const authorize = require('../middleware/authorize.middleware');
const participantSchema = require('../utils/validation/participant.validation');
const validationMiddleware = require('../middleware/validation.middleware');

// GET /participants - Get all events the current user is participating in
router.get('/', participantController.getUserParticipatingEvents);

module.exports = router;
