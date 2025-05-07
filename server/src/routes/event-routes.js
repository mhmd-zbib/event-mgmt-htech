const router = require('express').Router();
const eventController = require('../controllers/event.controller');
const tagController = require('../controllers/tag.controller');
const participantController = require('../controllers/participant.controller');
const authorize = require('../middleware/authorize.middleware');
const eventSchema = require('../utils/validation/event.validation');
const tagSchema = require('../utils/validation/tag.validation');
const participantSchema = require('../utils/validation/participant.validation');
const validationMiddleware = require('../middleware/validation.middleware');

// GET /events - Get all events
router.get('/', 
  validationMiddleware(eventSchema.query, 'query'),
  eventController.getAllEvents
);

// GET /events/my - Get events the current user is participating in
router.get('/my', 
  validationMiddleware(eventSchema.query, 'query'),
  participantController.getUserParticipatingEvents
);

// GET /events/:id - Get a specific event by ID
router.get('/:id', eventController.getEventById);

// POST /events - Create a new event (admin only)
router.post('/', 
  authorize('admin'), 
  validationMiddleware(eventSchema.create), 
  eventController.createEvent
);

// PUT /events/:id - Update an event (admin only)
router.put('/:id', 
  authorize('admin'), 
  validationMiddleware(eventSchema.update), 
  eventController.updateEvent
);

// DELETE /events/:id - Delete an event (admin only)
router.delete('/:id',
  authorize('admin'),
  eventController.deleteEvent
);

// Event category relationship
// PUT /events/:id/category - Set event category (admin only)
router.put('/:id/category', 
  authorize('admin'), 
  validationMiddleware(eventSchema.category), 
  eventController.setEventCategory
);

// Event tags routes
// GET /events/:id/tags - Get all tags for an event
router.get('/:id/tags', tagController.getEventTags);

// POST /events/:id/tags - Add tags to an event (admin only)
router.post('/:id/tags', 
  authorize('admin'), 
  validationMiddleware(tagSchema.eventTags), 
  tagController.addTagsToEvent
);

// DELETE /events/:id/tags - Remove tags from an event (admin only)
router.delete('/:id/tags', 
  authorize('admin'), 
  validationMiddleware(tagSchema.eventTags), 
  tagController.removeTagsFromEvent
);

// Event participants routes
// GET /events/:id/participants - Get all participants for an event (admin only)
router.get('/:id/participants', 
  authorize('admin'),
  validationMiddleware(participantSchema.query, 'query'),
  participantController.getEventParticipants
);

// POST /events/:id/participants - Register current user for an event
router.post('/:id/participants',
  validationMiddleware(participantSchema.registration),
  participantController.registerForEvent
);

// DELETE /events/:id/participants - Current user exits an event
router.delete('/:id/participants',
  participantController.exitEvent
);

// DELETE /events/:id/participants/:userId - Remove a specific user from an event (admin only)
router.delete('/:id/participants/:userId',
  authorize('admin'),
  participantController.removeParticipant
);

module.exports = router;