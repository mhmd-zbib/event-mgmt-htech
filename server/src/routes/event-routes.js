const router = require('express').Router();
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const eventSchema = require('../utils/validation/event.validation');
const validationMiddleware = require('../middleware/validation.middleware');

router.use(authMiddleware());

router.get('/', 
  validationMiddleware(eventSchema.query, 'query'),
  eventController.getAllEvents
);

router.get('/:id', eventController.getEventById);

router.use(authorize('admin'));

router.post('/', validationMiddleware(eventSchema.create), eventController.createEvent);

router.put('/:id', validationMiddleware(eventSchema.update), eventController.updateEvent);

router.delete('/:id', eventController.deleteEvent);

module.exports = router;