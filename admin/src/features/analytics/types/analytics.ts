// Create a types file that will work properly at runtime
import { type } from "os";

// Define the analytics types as regular TypeScript types instead of interfaces
export type DashboardOverview = {
  counts: {
    totalEvents: number;
    totalUsers: number;
    totalParticipants: number;
    totalCategories: number;
    upcomingEvents: number;
    pastEvents: number;
    ongoingEvents: number;
  };
  registrationStatusCounts: {
    registered: number;
    attended: number;
    cancelled: number;
    waitlisted: number;
  };
}

export type EventAnalytics = {
  eventsByCategory: Array<{
    categoryId: string;
    eventCount: number;
    category: {
      name: string;
    };
  }>;
  topEventsByParticipants: Array<{
    id: string;
    title: string;
    participantCount: number;
  }>;
  eventCreationTrends: Array<{
    month: string;
    count: number;
  }>;
}

export type UserAnalytics = {
  mostActiveUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    eventCount: number;
  }>;
  userRegistrationTrends: Array<{
    month: string;
    count: number;
  }>;
}

export type EventSpecificAnalytics = {
  eventId: string;
  eventTitle: string;
  totalParticipants: number;
  participantStatusBreakdown: {
    registered: number;
    attended: number;
    cancelled: number;
    waitlisted: number;
  };
  registrationTimeline: Array<{
    date?: string;
    weekStart?: string;
    weekEnd?: string;
    count: number;
  }>;
}

export type ApiResponse<T> = {
  message: string;
  data: T;
}

// This ensures the file is treated as a module with exports
export const analyticsTypes = {
  DashboardOverview: {} as DashboardOverview,
  EventAnalytics: {} as EventAnalytics,
  UserAnalytics: {} as UserAnalytics,
  EventSpecificAnalytics: {} as EventSpecificAnalytics
};