import { useState, useEffect } from 'react';
import LastDate from '@/utils/LastDate';

export const useLastBalance = () => {
  const [lastBalance, setLastBalance] = useState<number>(0);

  const fetchLastDateBalance = async (): Promise<void> => {
    try {
      const dateParams = LastDate();
      const response = await fetch("/api/v1/balance_by_date?" + new URLSearchParams({
        date: dateParams
      }));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setLastBalance(result.data.amount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLastDateBalance().catch(console.error);
  }, []);

  return { lastBalance };
};
