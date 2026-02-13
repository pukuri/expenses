import { useState, useEffect } from 'react';
import type { EventSummary } from '@/types';
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
        const response = await fetch('/api/v1/events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json();
        setEvents(events.data);
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