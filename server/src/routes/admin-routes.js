const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authorize = require('../middleware/authorize.middleware');
const userSchema = require('../utils/validation/user.validation');
const validationMiddleware = require('../middleware/validation.middleware');

// All routes require admin authorization
router.use(authorize('admin'));

// GET /admin/users - Get all users (admin only)
router.get('/users', adminController.getAllUsers);

// GET /admin/users/:id - Get a specific user by ID (admin only)
router.get('/users/:id', adminController.getUserById);

// PUT /admin/users/:id/role - Update a user's role (admin only)
router.put('/users/:id/role', 
  validationMiddleware(userSchema.updateRole), 
  adminController.updateUserRole
);

// DELETE /admin/users/:id - Delete a user (admin only)
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;