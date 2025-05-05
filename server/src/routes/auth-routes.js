const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authSchema = require('../utils/validation/auth.validation');
const validationMiddleware = require('../middleware/validation.middleware');

router.post('/register', validationMiddleware(authSchema.register), authController.register);
router.post('/login', validationMiddleware(authSchema.login), authController.login);

module.exports = router;