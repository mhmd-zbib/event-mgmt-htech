const router = require('express').Router();
const tagController = require('../controllers/tag.controller');
const authorize = require('../middleware/authorize.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const tagSchema = require('../utils/validation/tag.validation');

// GET /tags - Get all tags
router.get('/', 
  validationMiddleware(tagSchema.query, 'query'),
  tagController.getAllTags
);

// GET /tags/:id - Get a specific tag by ID
router.get('/:id', tagController.getTagById);

// GET /tags/:id/events - Get all events for a specific tag
router.get('/:id/events',
  validationMiddleware(tagSchema.query, 'query'),
  tagController.getTagEvents
);

// Admin only routes
// POST /tags - Create a new tag (admin only)
router.post('/',
  authorize('admin'),
  validationMiddleware(tagSchema.create),
  tagController.createTag
);

// PUT /tags/:id - Update a tag (admin only)
router.put('/:id',
  authorize('admin'),
  validationMiddleware(tagSchema.update),
  tagController.updateTag
);

// DELETE /tags/:id - Delete a tag (admin only)
router.delete('/:id',
  authorize('admin'),
  tagController.deleteTag
);

module.exports = router;