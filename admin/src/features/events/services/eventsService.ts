import { apiClient } from "@/lib/axios";
import type {
  EventsResponse,
  EventDetail,
  EventsFilterParams,
  CreateEventRequest,
  UpdateEventRequest,
  Tag,
  ParticipantsFilterParams,
  ParticipantsResponse,
  EventSummary
} from "../types/events";

/**
 * Events Service
 * Handles all API calls related to events
 */
class EventsService {
  /**
   * Get a list of events with optional filtering
   */
  async getEvents(params?: EventsFilterParams): Promise<EventsResponse> {
    try {
      const response = await apiClient.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Get a specific event by ID
   */
  async getEventById(id: string): Promise<EventDetail> {
    try {
      const response = await apiClient.get(`/events/${id}`);
      return response.data.event;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventRequest): Promise<EventDetail> {
    try {
      const response = await apiClient.post('/events', eventData);
      return response.data.event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: string, eventData: UpdateEventRequest): Promise<EventDetail> {
    try {
      const response = await apiClient.put(`/events/${id}`, eventData);
      return response.data.event;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    try {
      await apiClient.delete(`/events/${id}`);
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get featured events
   */
  async getFeaturedEvents(): Promise<EventSummary[]> {
    try {
      const response = await apiClient.get('/events/featured');
      return response.data.events;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      throw error;
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit?: number, categoryId?: string): Promise<EventSummary[]> {
    try {
      const params: Record<string, any> = {};
      if (limit) params.limit = limit;
      if (categoryId) params.categoryId = categoryId;
      
      const response = await apiClient.get('/events/upcoming', { params });
      return response.data.events;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  /**
   * Get event tags
   */
  async getEventTags(eventId: string): Promise<Tag[]> {
    try {
      const response = await apiClient.get(`/events/${eventId}/tags`);
      return response.data.tags;
    } catch (error) {
      console.error(`Error fetching tags for event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Add tags to an event
   */
  async addEventTags(eventId: string, tagIds: string[]): Promise<Tag[]> {
    try {
      const response = await apiClient.post(`/events/${eventId}/tags`, { tagIds });
      return response.data.tags;
    } catch (error) {
      console.error(`Error adding tags to event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Remove tags from an event
   */
  async removeEventTags(eventId: string, tagIds: string[]): Promise<void> {
    try {
      const tagIdsParam = tagIds.join(',');
      await apiClient.delete(`/events/${eventId}/tags`, {
        params: { tagIds: tagIdsParam }
      });
    } catch (error) {
      console.error(`Error removing tags from event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Get event participants
   */
  async getEventParticipants(eventId: string, params?: ParticipantsFilterParams): Promise<ParticipantsResponse> {
    try {
      const response = await apiClient.get(`/events/${eventId}/participants`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching participants for event ${eventId}:`, error);
      throw error;
    }
  }
}

export const eventsService = new EventsService();