import apiClient from '@/lib/axios';
import type {
  ApiResponse,
  DashboardOverview,
  EventAnalytics,
  UserAnalytics,
  EventSpecificAnalytics
} from '../types/analytics';

// Fallback empty data structures
const emptyDashboardOverview: DashboardOverview = {
  counts: {
    totalEvents: 0,
    totalUsers: 0,
    totalParticipants: 0,
    totalCategories: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    ongoingEvents: 0
  },
  registrationStatusCounts: {
    registered: 0,
    attended: 0,
    cancelled: 0,
    waitlisted: 0
  }
};

const emptyEventAnalytics: EventAnalytics = {
  eventsByCategory: [],
  topEventsByParticipants: [],
  eventCreationTrends: []
};

const emptyUserAnalytics: UserAnalytics = {
  mostActiveUsers: [],
  userRegistrationTrends: []
};

const emptyEventSpecificAnalytics: EventSpecificAnalytics = {
  eventId: "",
  eventTitle: "",
  totalParticipants: 0,
  participantStatusBreakdown: {
    registered: 0,
    attended: 0,
    cancelled: 0,
    waitlisted: 0
  },
  registrationTimeline: []
};

export const analyticsService = {
  /**
   * Get dashboard overview data
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardOverview>>('/analytics/dashboard/overview');
      return response.data.data || emptyDashboardOverview;
    } catch (error) {
      console.error('Failed to fetch dashboard overview:', error);
      // Return empty data structure instead of throwing an error
      return emptyDashboardOverview;
    }
  },

  /**
   * Get event analytics data
   */
  async getEventAnalytics(): Promise<EventAnalytics> {
    try {
      const response = await apiClient.get<ApiResponse<EventAnalytics>>('/analytics/events');
      return response.data.data || emptyEventAnalytics;
    } catch (error) {
      console.error('Failed to fetch event analytics:', error);
      // Return empty data structure instead of throwing an error
      return emptyEventAnalytics;
    }
  },

  /**
   * Get user analytics data
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      const response = await apiClient.get<ApiResponse<UserAnalytics>>('/analytics/users');
      return response.data.data || emptyUserAnalytics;
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      // Return empty data structure instead of throwing an error
      return emptyUserAnalytics;
    }
  },

  /**
   * Get analytics for a specific event
   */
  async getEventSpecificAnalytics(eventId: string): Promise<EventSpecificAnalytics> {
    try {
      const response = await apiClient.get<ApiResponse<EventSpecificAnalytics>>(`/analytics/events/${eventId}`);
      return response.data.data || emptyEventSpecificAnalytics;
    } catch (error) {
      console.error(`Failed to fetch analytics for event ${eventId}:`, error);
      // Return empty data structure instead of throwing an error
      return {
        ...emptyEventSpecificAnalytics,
        eventId,
        eventTitle: `Event ${eventId}`
      };
    }
  }
};