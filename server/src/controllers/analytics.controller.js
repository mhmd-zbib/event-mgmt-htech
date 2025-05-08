const analyticsService = require('../services/analytics.service');
const { 
  createEventAttendanceStatsResponseDto,
  createUserParticipationStatsResponseDto,
  createCategoryPopularityStatsResponseDto,
  createPlatformStatsResponseDto
} = require('../dto/analytics-response.dto');

const analyticsController = {
  getDashboardOverview: async (req, res, next) => {
    try {
      const overview = await analyticsService.getDashboardOverview();
      const responseData = createPlatformStatsResponseDto(overview);
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  },

  getEventAnalytics: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const eventAnalytics = await analyticsService.getEventAnalytics(startDate, endDate);
      const responseData = createCategoryPopularityStatsResponseDto({
        categories: eventAnalytics.categoryStats
      });
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  },

  getUserAnalytics: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const userAnalytics = await analyticsService.getUserAnalytics(startDate, endDate);
      const responseData = createUserParticipationStatsResponseDto(userAnalytics);
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  },

  getEventSpecificAnalytics: async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const eventAnalytics = await analyticsService.getEventSpecificAnalytics(eventId);
      const responseData = createEventAttendanceStatsResponseDto({
        eventId,
        eventTitle: eventAnalytics.title,
        totalRegistered: eventAnalytics.totalRegistered,
        totalAttended: eventAnalytics.totalAttended,
        totalCancelled: eventAnalytics.totalCancelled,
        totalWaitlisted: eventAnalytics.totalWaitlisted,
        attendanceRate: eventAnalytics.attendanceRate
      });
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = analyticsController;