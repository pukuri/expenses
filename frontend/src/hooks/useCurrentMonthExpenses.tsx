import { useState, useEffect, type SetStateAction } from 'react';
import TodayDate from '@/utils/TodayDate';
import LastDate from '@/utils/LastDate';

export const useCurrentMonthExpenses = () => {
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [lastAmount, setLastAmount] = useState<number>(0);

  const fetchAmount = async (dateParams: string, callback: { (value: SetStateAction<number>): void; }) => {
    try {
      const response = await fetch("/api/v1/expenses_by_month?" + new URLSearchParams({
        date: dateParams
      }));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      callback(result.data.amount);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCurrentAmount = async (): Promise<void> => {
    const dateParams = TodayDate();
    fetchAmount(dateParams, setCurrentAmount);
  };

  const fetchLastAmount = async(): Promise<void> => {
    const dateParams = LastDate();
    fetchAmount(dateParams, setLastAmount);
  };

  useEffect(() => {
    fetchCurrentAmount().catch(console.error);
    fetchLastAmount().catch(console.error);
  }, []);

  return { currentAmount, lastAmount };
};
