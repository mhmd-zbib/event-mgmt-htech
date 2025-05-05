const router = require('express').Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const categorySchema = require('../utils/validation/category.validation');
const validationMiddleware = require('../middleware/validation.middleware');

router.use(authMiddleware());

// Public routes - available to all authenticated users
router.get('/', 
  validationMiddleware(categorySchema.query, 'query'),
  categoryController.getAllCategories
);

router.get('/:id', categoryController.getCategoryById);

router.get('/:id/events',
  validationMiddleware(categorySchema.query, 'query'),
  categoryController.getEventsByCategory
);

// Admin only routes
router.use(authorize('admin'));

router.post('/', 
  validationMiddleware(categorySchema.create), 
  categoryController.createCategory
);

router.put('/:id', 
  validationMiddleware(categorySchema.update), 
  categoryController.updateCategory
);

router.delete('/:id', categoryController.deleteCategory);

module.exports = router;