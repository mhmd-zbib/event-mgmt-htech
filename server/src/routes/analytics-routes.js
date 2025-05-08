const express = require('express');
const authorize = require('../middleware/authorize.middleware');
const authenticate = require('../middleware/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

router.get(
  '/dashboard/overview',
  authenticate(),
  authorize('admin'),
  analyticsController.getDashboardOverview
);

router.get(
  '/events',
  authenticate(),
  authorize('admin'),
  analyticsController.getEventAnalytics
);

router.get(
  '/users',
  authenticate(),
  authorize('admin'),
  analyticsController.getUserAnalytics
);

router.get(
  '/events/:eventId',
  authenticate(),
  authorize('admin'),
  analyticsController.getEventSpecificAnalytics
);

module.exports = router;