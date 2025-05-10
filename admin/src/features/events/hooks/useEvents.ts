import { useState, useEffect } from 'react';
import { eventsService } from '../services/eventsService';
import type { EventSummary, EventsFilterParams } from '../types/events';

interface UseEventsProps extends Partial<EventsFilterParams> {}

export function useEvents(props: UseEventsProps = {}) {
  const {
    page = 1,
    size = 10,
    sortBy = 'startDate',
    sortOrder = 'ASC',
    search,
    categoryId,
    tags,
    startDate,
    endDate,
    location,
    status
  } = props;
  
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await eventsService.getEvents({ 
          page, 
          size,
          sortBy,
          sortOrder,
          search,
          categoryId,
          tags,
          startDate,
          endDate,
          location,
          status
        });
        
        // Handle different API response formats
        let fetchedEvents: EventSummary[] = [];
        let total = 0;
        let pages = 0;
        
        if (response.data) {
          fetchedEvents = response.data;
          
          if (response.pagination) {
            total = response.pagination.total;
            pages = response.pagination.totalPages;
          } else {
            total = response.total || fetchedEvents.length;
            pages = Math.ceil(total / size);
          }
        } else if (response.items) {
          fetchedEvents = response.items;
          total = response.total || fetchedEvents.length;
          pages = Math.ceil(total / size);
        } else if (response.events) {
          fetchedEvents = response.events;
          total = response.total || fetchedEvents.length;
          pages = Math.ceil(total / size);
        } else if (Array.isArray(response)) {
          fetchedEvents = response;
          total = fetchedEvents.length;
          pages = Math.ceil(total / size);
        }
        
        setEvents(fetchedEvents);
        setTotalItems(total);
        setTotalPages(pages);
      } catch (err) {
        setError('Failed to fetch events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page, size, sortBy, sortOrder, search, categoryId, tags, startDate, endDate, location, status]);

  return {
    events,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage: page,
    refresh: () => {
      // Force a re-fetch by triggering the useEffect
      setLoading(true);
    }
  };
}
