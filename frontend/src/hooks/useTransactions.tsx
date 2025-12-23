import { useState, useEffect } from 'react';
import type { TransactionsResponse } from '@/types';

export const useTransactions = () => {
  const [data, setData] = useState<TransactionsResponse>({ data: [] });

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await fetch("/api/v1/transactions");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions().catch(console.error);
  }, []);

  return { data, fetchTransactions };
};
