import { useState, useCallback } from 'react';
import type { EventExpense, EventExpensesResponse } from '@/types';
import { getEventExpensesByEventId } from '@/data/eventExpensesSample';

export const useEventExpenses = (isSample: boolean = false) => {
  const [expenses, setExpenses] = useState<EventExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventExpenses = useCallback(async (eventId: number) => {
    setLoading(true);
    setError(null);

    try {
      if (isSample) {
        const eventExpenses = getEventExpensesByEventId(eventId);
        setExpenses(eventExpenses);
      } else {
        // Real API call would go here
        const response = await fetch(`/api/events/${eventId}/expenses`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: EventExpensesResponse = await response.json();
        setExpenses(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [isSample]);

  const clearExpenses = useCallback(() => {
    setExpenses([]);
    setError(null);
  }, []);

  return { 
    expenses, 
    loading, 
    error, 
    fetchEventExpenses, 
    clearExpenses 
  };
};