const router = require('express').Router();
const eventController = require('../controllers/event.controller');
const tagController = require('../controllers/tag.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const eventSchema = require('../utils/validation/event.validation');
const tagSchema = require('../utils/validation/tag.validation');
const validationMiddleware = require('../middleware/validation.middleware');

router.use(authMiddleware());

router.get('/', 
  validationMiddleware(eventSchema.query, 'query'),
  eventController.getAllEvents
);

router.get('/:id', eventController.getEventById);

// Event tags routes
router.get('/:eventId/tags', tagController.getEventTags);

// Apply admin authorization only to specific routes that need it
router.post('/', authorize('admin'), validationMiddleware(eventSchema.create), eventController.createEvent);

// Event category routes using the relationship approach
router.patch('/:eventId/categories/:categoryId', authorize('admin'), eventController.setEventCategory);

router.put('/:id', authorize('admin'), validationMiddleware(eventSchema.update), eventController.updateEvent);

// Admin-only routes for managing event tags
router.post('/:eventId/tags', 
  authorize('admin'), 
  validationMiddleware(tagSchema.eventTags), 
  tagController.addTagsToEvent
);

router.delete('/:eventId/tags', 
  authorize('admin'), 
  validationMiddleware(tagSchema.eventTags), 
  tagController.removeTagsFromEvent
);

module.exports = router;