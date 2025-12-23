import { useState, useEffect } from 'react';
import type { Category } from '@/types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([{id: 0, name: 'Uncategorized', color: ''}]);

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await fetch("/api/v1/categories");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setCategories([...categories, ...result.data]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories().catch(console.error);
  }, []);

  return { categories, fetchCategories };
};
