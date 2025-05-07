const router = require('express').Router();
const categoryController = require('../controllers/category.controller');
const authorize = require('../middleware/authorize.middleware');
const categorySchema = require('../utils/validation/category.validation');
const validationMiddleware = require('../middleware/validation.middleware');

// Public routes - available to all authenticated users
// GET /categories - Get all categories
router.get('/', 
  validationMiddleware(categorySchema.query, 'query'),
  categoryController.getAllCategories
);

// GET /categories/:id - Get a specific category by ID
router.get('/:id', categoryController.getCategoryById);

// GET /categories/:id/events - Get all events for a specific category
router.get('/:id/events',
  validationMiddleware(categorySchema.query, 'query'),
  categoryController.getEventsByCategory
);

// Admin only routes
// POST /categories - Create a new category (admin only)
router.post('/', 
  authorize('admin'),
  validationMiddleware(categorySchema.create), 
  categoryController.createCategory
);

// PUT /categories/:id - Update a category (admin only)
router.put('/:id', 
  authorize('admin'),
  validationMiddleware(categorySchema.update), 
  categoryController.updateCategory
);

// DELETE /categories/:id - Delete a category (admin only)
router.delete('/:id', 
  authorize('admin'),
  categoryController.deleteCategory
);

module.exports = router;