const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const userSchema = require('../utils/validation/user.validation');
const validationMiddleware = require('../middleware/validation.middleware');

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);

router.get('/users/:id', adminController.getUserById);

router.patch('/users/:id/role', adminController.updateUserRole);

router.delete('/users/:id', adminController.deleteUser);

module.exports = router;