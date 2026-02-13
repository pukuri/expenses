import { useState, useEffect } from 'react';
import type { EventSummary, EventsResponse } from '@/types';
import { eventsSummarySample } from '@/data/eventsSummarySample';

export const useEvents = (isSample: boolean) => {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSample) {
        setEvents(eventsSummarySample);
      } else {
        // Real API call would go here
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: EventsResponse = await response.json();
        setEvents(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
};