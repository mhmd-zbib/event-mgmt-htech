const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const userSchema = require('../utils/validation/user.validation');
const validationMiddleware = require('../middleware/validation.middleware');

router.use(authMiddleware);

// GET /users/me - Get current user's profile
router.get('/me', userController.getProfile);

// PUT /users/me - Update current user's profile
router.put('/me', validationMiddleware(userSchema.updateProfile), userController.updateProfile);

module.exports = router;