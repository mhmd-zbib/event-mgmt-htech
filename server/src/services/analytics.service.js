const Event = require('../models/event.model');
const Participant = require('../models/participant.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Tag = require('../models/tag.model');
const handleDatabaseError = require('../errors/DatabaseError');
const { InternalServerError, NotFoundError } = require('../errors/HttpErrors');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AnalyticsService {
  async getDashboardOverview() {
    try {
      // Get base counts in parallel
      const [
        totalEvents,
        totalParticipants,
        totalUsers,
        totalCategories,
        recentEvents
      ] = await Promise.all([
        Event.count(),
        Participant.count(),
        User.count(),
        Category.count(),
        Event.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'title', 'startDate', 'location']
        })
      ]);
      
      // Get participant counts separately with better error handling
      let topEvents = [];
      try {
        const participantCounts = await Participant.findAll({
          attributes: [
            'eventId',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['eventId'],
          limit: 10,
          order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        });
        
        if (participantCounts && participantCounts.length > 0) {
          const eventIds = participantCounts.map(p => p.eventId);
          
          // Only query if we have event IDs
          if (eventIds.length > 0) {
            const popularEvents = await Event.findAll({
              where: { id: eventIds },
              attributes: ['id', 'title']
            });
            
            topEvents = participantCounts.map(pc => {
              const event = popularEvents.find(e => e.id === pc.eventId);
              return {
                eventId: pc.eventId,
                eventTitle: event ? event.title : 'Unknown Event',
                participantCount: parseInt(pc.get('count'), 10)
              };
            });
          }
        }
      } catch (error) {
        logger.error('Failed to fetch participant counts', { error });
        // Continue with empty top events rather than failing completely
      }

      return {
        counts: {
          events: totalEvents,
          participants: totalParticipants,
          users: totalUsers,
          categories: totalCategories
        },
        recentEvents,
        topEvents
      };
    } catch (error) {
      logger.error('Failed to fetch dashboard overview data', { error });
      throw handleDatabaseError(error);
    }
  }

  async getEventAnalytics(startDate, endDate) {
    try {
      const query = {};
      
      if (startDate || endDate) {
        query.where = {};
        
        if (startDate) {
          query.where.createdAt = {
            ...query.where.createdAt,
            [Op.gte]: new Date(startDate)
          };
        }
        
        if (endDate) {
          query.where.createdAt = {
            ...query.where.createdAt,
            [Op.lte]: new Date(endDate)
          };
        }
      }
      
      // Get event stats by category with better error handling
      let formattedCategoryStats = [];
      try {
        const categoryStats = await Event.findAll({
          ...query,
          attributes: [
            'categoryId',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name'],
            required: false
          }],
          group: ['categoryId', 'category.id', 'category.name'],
          order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        });
        
        formattedCategoryStats = categoryStats.map(stat => ({
          categoryId: stat.categoryId,
          categoryName: stat.category ? stat.category.name : 'Uncategorized',
          count: parseInt(stat.get('count'), 10)
        }));
      } catch (error) {
        logger.error('Failed to fetch category stats', { error });
        // Continue with empty stats instead of failing completely
      }
      
      // Get total count based on the same filter
      const totalEvents = await Event.count(query);
      
      // Get upcoming and past events
      const now = new Date();
      let upcomingEvents = 0, pastEvents = 0, ongoingEvents = 0;
      
      try {
        [upcomingEvents, pastEvents, ongoingEvents] = await Promise.all([
          Event.count({
            ...query,
            where: {
              ...query.where,
              startDate: { [Op.gt]: now }
            }
          }),
          
          Event.count({
            ...query,
            where: {
              ...query.where,
              endDate: { [Op.lt]: now }
            }
          }),
          
          Event.count({
            ...query,
            where: {
              ...query.where,
              startDate: { [Op.lte]: now },
              endDate: { [Op.gte]: now }
            }
          })
        ]);
      } catch (error) {
        logger.error('Failed to fetch event counts', { error });
        // Continue with zeroes instead of failing completely
      }
      
      return {
        categoryStats: formattedCategoryStats,
        eventCounts: {
          total: totalEvents,
          upcoming: upcomingEvents,
          past: pastEvents,
          ongoing: ongoingEvents
        }
      };
    } catch (error) {
      logger.error('Failed to fetch event analytics', { error });
      throw handleDatabaseError(error);
    }
  }

  async getUserAnalytics(startDate, endDate) {
    try {
      const query = {};
      
      if (startDate || endDate) {
        query.where = {};
        
        if (startDate) {
          query.where.createdAt = {
            ...query.where.createdAt,
            [Op.gte]: new Date(startDate)
          };
        }
        
        if (endDate) {
          query.where.createdAt = {
            ...query.where.createdAt,
            [Op.lte]: new Date(endDate)
          };
        }
      }

      // Get user registration trends
      const usersByMonth = await User.findAll({
        ...query,
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']]
      });

      // Get user role distribution
      const usersByRole = await User.findAll({
        ...query,
        attributes: [
          'role',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['role']
      });

      // Get active vs inactive users
      const activeUsers = await User.count({
        where: {
          ...query.where,
          lastLogin: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // active in last 30 days
          }
        }
      });

      const totalUsers = await User.count(query);

      const formattedMonthlyData = usersByMonth.map(item => ({
        month: item.get('month'),
        count: parseInt(item.get('count'), 10)
      }));

      const formattedRoleData = usersByRole.map(item => ({
        role: item.role,
        count: parseInt(item.get('count'), 10)
      }));

      // Get most active users (those who registered for most events)
      const mostActiveUsers = await Participant.findAll({
        attributes: [
          'userId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'eventCount']
        ],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }],
        group: ['userId', 'user.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10
      });

      const formattedActiveUsers = mostActiveUsers.map(item => ({
        userId: item.userId,
        email: item.user ? item.user.email : 'Unknown',
        name: item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown User',
        eventCount: parseInt(item.get('eventCount'), 10)
      }));

      return {
        registrationTrends: formattedMonthlyData,
        roleDistribution: formattedRoleData,
        activityMetrics: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          activeRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
        },
        mostActiveUsers: formattedActiveUsers
      };
    } catch (error) {
      logger.error('Failed to fetch user analytics', { error });
      throw handleDatabaseError(error);
    }
  }

  async getEventSpecificAnalytics(eventId) {
    try {
      // Get the event details
      const event = await Event.findByPk(eventId, {
        attributes: ['id', 'title', 'startDate', 'endDate', 'capacity', 'location']
      });

      if (!event) {
        throw new NotFoundError(`Event with ID ${eventId} not found`);
      }

      // Get participant statistics
      const participantStats = await Participant.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { eventId },
        group: ['status']
      });

      // Calculate totals
      let totalRegistered = 0;
      let totalAttended = 0;
      let totalCancelled = 0;
      let totalWaitlisted = 0;

      participantStats.forEach(stat => {
        const count = parseInt(stat.get('count'), 10);
        switch (stat.status) {
          case 'registered':
            totalRegistered = count;
            break;
          case 'attended':
            totalAttended = count;
            break;
          case 'cancelled':
            totalCancelled = count;
            break;
          case 'waitlisted':
            totalWaitlisted = count;
            break;
        }
      });

      const totalParticipants = totalRegistered + totalAttended + totalCancelled + totalWaitlisted;
      const attendanceRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;

      // Get registration timeline
      const registrationTimeline = await Participant.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { eventId },
        group: [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'ASC']]
      });

      const formattedTimeline = registrationTimeline.map(item => ({
        date: item.get('date'),
        count: parseInt(item.get('count'), 10)
      }));

      return {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        capacity: event.capacity,
        location: event.location,
        totalParticipants,
        totalRegistered,
        totalAttended,
        totalCancelled,
        totalWaitlisted,
        attendanceRate,
        registrationTimeline: formattedTimeline,
        capacityUtilization: event.capacity > 0 ? (totalParticipants / event.capacity) * 100 : 0
      };
    } catch (error) {
      logger.error(`Failed to fetch analytics for event ${eventId}`, { error });
      throw handleDatabaseError(error);
    }
  }

  async getParticipantStats() {
    try {
      const [
        participantsByEvent,
        participantsByMonth,
        participationRate
      ] = await Promise.all([
        Participant.findAll({
          attributes: [
            'eventId',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          include: [{
            model: Event,
            attributes: ['title']
          }],
          group: ['eventId', 'Event.id'],
          order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
          limit: 10
        }),

        Participant.findAll({
          attributes: [
            [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
          limit: 12
        }),

        Participant.findAll({
          attributes: [
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN "checkedIn" = true THEN 1 ELSE 0 END')), 'checkedIn'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'total']
          ]
        })
      ]);

      const byEvent = participantsByEvent.map(pe => ({
        eventId: pe.eventId,
        eventTitle: pe.Event ? pe.Event.title : 'Unknown Event',
        count: parseInt(pe.get('count'), 10)
      }));

      const byMonth = participantsByMonth.map(pm => ({
        month: pm.get('month'),
        count: parseInt(pm.get('count'), 10)
      }));

      const rateData = participationRate[0];
      const checkedIn = parseInt(rateData.get('checkedIn'), 10) || 0;
      const total = parseInt(rateData.get('total'), 10) || 0;
      const rate = total > 0 ? (checkedIn / total) * 100 : 0;

      return {
        byEvent,
        byMonth,
        participationRate: {
          checkedIn,
          total,
          rate: Math.round(rate * 100) / 100
        }
      };
    } catch (error) {
      logger.error('Failed to fetch participant statistics', { error });
      throw handleDatabaseError(error);
    }
  }

  async getEventStats() {
    try {
      const [
        eventsByCategory,
        eventsByMonth,
        upcomingEvents,
        pastEvents
      ] = await Promise.all([
        Event.findAll({
          attributes: [
            'categoryId',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          include: [{
            model: Category,
            attributes: ['name']
          }],
          group: ['categoryId', 'Category.id'],
          order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        }),

        Event.findAll({
          attributes: [
            [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
          limit: 12
        }),

        Event.count({
          where: {
            startDate: {
              [Op.gt]: new Date()
            }
          }
        }),

        Event.count({
          where: {
            startDate: {
              [Op.lt]: new Date()
            }
          }
        })
      ]);

      const byCategory = eventsByCategory.map(ec => ({
        categoryId: ec.categoryId,
        categoryName: ec.Category ? ec.Category.name : 'Uncategorized',
        count: parseInt(ec.get('count'), 10)
      }));

      const byMonth = eventsByMonth.map(em => ({
        month: em.get('month'),
        count: parseInt(em.get('count'), 10)
      }));

      return {
        byCategory,
        byMonth,
        upcomingEvents,
        pastEvents,
        totalEvents: upcomingEvents + pastEvents
      };
    } catch (error) {
      logger.error('Failed to fetch event statistics', { error });
      throw handleDatabaseError(error);
    }
  }

  async getUserActivityStats() {
    try {
      const [
        newUsersByMonth,
        usersByRole,
        activeUsers
      ] = await Promise.all([
        User.findAll({
          attributes: [
            [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
          limit: 12
        }),

        User.findAll({
          attributes: [
            'role',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['role'],
          order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        }),

        User.count({
          where: {
            lastLoginAt: {
              [Op.gt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      const byMonth = newUsersByMonth.map(um => ({
        month: um.get('month'),
        count: parseInt(um.get('count'), 10)
      }));

      const byRole = usersByRole.map(ur => ({
        role: ur.role,
        count: parseInt(ur.get('count'), 10)
      }));

      return {
        byMonth,
        byRole,
        activeUsers,
        totalUsers: byRole.reduce((sum, item) => sum + item.count, 0)
      };
    } catch (error) {
      logger.error('Failed to fetch user activity statistics', { error });
      throw handleDatabaseError(error);
    }
  }
}

module.exports = new AnalyticsService();