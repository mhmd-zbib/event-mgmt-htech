const router = require('express').Router();
const tagController = require('../controllers/tag.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const tagSchema = require('../utils/validation/tag.validation');

// Public routes - accessible to everyone
router.get('/', 
  validationMiddleware(tagSchema.query, 'query'),
  tagController.getAllTags
);

router.get('/:id', tagController.getTagById);

router.get('/:tagId/events',
  validationMiddleware(tagSchema.query, 'query'),
  tagController.getTagEvents
);

// Protected routes - require authentication
router.post('/',
  authMiddleware(),
  validationMiddleware(tagSchema.create),
  tagController.createTag
);

router.put('/:id',
  authMiddleware(),
  validationMiddleware(tagSchema.update),
  tagController.updateTag
);

router.delete('/:id',
  authMiddleware(),
  tagController.deleteTag
);

module.exports = router;