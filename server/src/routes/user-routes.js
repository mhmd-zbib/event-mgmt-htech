const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const userSchema = require('../utils/validation/user.validation');
const validationMiddleware = require('../middleware/validation.middleware');

router.use(authMiddleware);

router.get('/profile', userController.getProfile);

router.put('/profile', validationMiddleware(userSchema.updateProfile), userController.updateProfile);

module.exports = router;