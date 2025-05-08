const { formatItemResponse } = require('../utils/response-formatter');

const createEventAttendanceStatsResponseDto = (data) => {
  return formatItemResponse({
    eventId: data.eventId,
    eventTitle: data.eventTitle,
    totalRegistered: data.totalRegistered,
    totalAttended: data.totalAttended,
    totalCancelled: data.totalCancelled,
    totalWaitlisted: data.totalWaitlisted,
    attendanceRate: data.attendanceRate
  });
};

const createUserParticipationStatsResponseDto = (data) => {
  return formatItemResponse({
    userId: data.userId,
    userName: data.userName,
    totalEventsRegistered: data.totalEventsRegistered,
    totalEventsAttended: data.totalEventsAttended,
    totalEventsCancelled: data.totalEventsCancelled,
    attendanceRate: data.attendanceRate
  });
};

const createCategoryPopularityStatsResponseDto = (data) => {
  return formatItemResponse({
    categories: data.categories.map(category => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      eventCount: category.eventCount,
      participantCount: category.participantCount,
      popularityScore: category.popularityScore
    }))
  });
};

const createPlatformStatsResponseDto = (data) => {
  return formatItemResponse({
    totalUsers: data.totalUsers,
    totalEvents: data.totalEvents,
    totalParticipations: data.totalParticipations,
    activeUsers: data.activeUsers,
    upcomingEvents: data.upcomingEvents,
    topCategories: data.topCategories,
    topTags: data.topTags
  });
};

module.exports = {
  createEventAttendanceStatsResponseDto,
  createUserParticipationStatsResponseDto,
  createCategoryPopularityStatsResponseDto,
  createPlatformStatsResponseDto
};