import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import type { DashboardOverview, EventAnalytics, UserAnalytics, EventSpecificAnalytics } from '../types/analytics';

/**
 * Hook for fetching dashboard overview analytics
 */
export function useDashboardOverview() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const overview = await analyticsService.getDashboardOverview();
        setData(overview);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard overview'));
        // Data will be null, which is handled in the component
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook for fetching event analytics
 */
export function useEventAnalytics() {
  const [data, setData] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const eventAnalytics = await analyticsService.getEventAnalytics();
        setData(eventAnalytics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch event analytics'));
        // Data will be null, which is handled in the component
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook for fetching user analytics
 */
export function useUserAnalytics() {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userAnalytics = await analyticsService.getUserAnalytics();
        setData(userAnalytics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user analytics'));
        // Data will be null, which is handled in the component
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook for fetching specific event analytics
 */
export function useEventSpecificAnalytics(eventId: string) {
  const [data, setData] = useState<EventSpecificAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const eventSpecificAnalytics = await analyticsService.getEventSpecificAnalytics(eventId);
        setData(eventSpecificAnalytics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch analytics for event ${eventId}`));
        // Data will be null, which is handled in the component
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  return { data, loading, error };
}