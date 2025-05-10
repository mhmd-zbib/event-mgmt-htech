import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { eventsService } from '../services/eventsService';
import type { EventDetail } from '../types/events';

interface UseEventProps {
  eventId?: string;
}

export function useEvent({ eventId }: UseEventProps = {}) {
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch event if eventId is provided
  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId]);

  const fetchEvent = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await eventsService.getEventById(id);
      setEvent(data);
    } catch (err) {
      setError('Failed to fetch event');
      console.error('Error fetching event:', err);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async (data: any) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Format the data for API submission
      const formattedData = {
        ...data,
        startDate: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
        endDate: data.endDate instanceof Date ? data.endDate.toISOString() : data.endDate,
        tagIds: data.tagIds || [],
        description: data.description || '',
        location: data.location || '',
        isFeatured: data.isFeatured ?? false,
        // Convert null to undefined for categoryId to match API expectations
        categoryId: data.categoryId === null ? undefined : data.categoryId,
        // Convert null to undefined for capacity to match API expectations
        capacity: data.capacity === null ? undefined : data.capacity
      };

      if (eventId) {
        await eventsService.updateEvent(eventId, formattedData);
        toast.success("Event updated successfully");
      } else {
        await eventsService.createEvent(formattedData);
        toast.success("Event created successfully");
      }
      
      // Navigate back to events list
      navigate('/events');
    } catch (err) {
      setError('Failed to save event');
      console.error('Error saving event:', err);
      toast.error("Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    event,
    loading,
    submitting,
    error,
    fetchEvent,
    saveEvent
  };
}
