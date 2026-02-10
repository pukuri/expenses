import type { ExpensesByMonthCategory } from '@/types';

// Sample data for different months - some months have no data to show the hiding behavior
// Updated to match current date range (2026)
export const sampleMonthlyExpensesData: { [key: string]: ExpensesByMonthCategory[] } = {
  '2026-02': [
    { id: 1, name: "Food", amount: 1500000, color: "#FF6B6B" },
    { id: 2, name: "Transportation", amount: 800000, color: "#4ECDC4" },
    { id: 3, name: "Entertainment", amount: 600000, color: "#45B7D1" },
  ],
  '2026-01': [
    { id: 1, name: "Food", amount: 1200000, color: "#FF6B6B" },
    { id: 2, name: "Transportation", amount: 750000, color: "#4ECDC4" },
    { id: 3, name: "Shopping", amount: 900000, color: "#96CEB4" },
    { id: 4, name: "Bills", amount: 1100000, color: "#FECA57" },
  ],
  '2025-12': [
    { id: 1, name: "Food", amount: 1800000, color: "#FF6B6B" },
    { id: 2, name: "Transportation", amount: 600000, color: "#4ECDC4" },
    { id: 3, name: "Entertainment", amount: 1200000, color: "#45B7D1" },
    { id: 4, name: "Shopping", amount: 2000000, color: "#96CEB4" },
  ],
  '2025-11': [
    { id: 1, name: "Food", amount: 1100000, color: "#FF6B6B" },
    { id: 2, name: "Transportation", amount: 700000, color: "#4ECDC4" },
    { id: 3, name: "Bills", amount: 950000, color: "#FECA57" },
  ],
  '2025-10': [
    { id: 1, name: "Food", amount: 1300000, color: "#FF6B6B" },
    { id: 2, name: "Transportation", amount: 850000, color: "#4ECDC4" },
    { id: 3, name: "Entertainment", amount: 500000, color: "#45B7D1" },
    { id: 4, name: "Shopping", amount: 750000, color: "#96CEB4" },
    { id: 5, name: "Bills", amount: 1050000, color: "#FECA57" },
  ],
  '2025-09': [
    { id: 1, name: "Food", amount: 1400000, color: "#FF6B6B" },
    { id: 2, name: "Transportation", amount: 900000, color: "#4ECDC4" },
  ],
  // Some months intentionally left empty to demonstrate hiding behavior
  // '2025-08': [], // No data
  // '2025-07': [], // No data
  '2025-06': [
    { id: 1, name: "Food", amount: 1600000, color: "#FF6B6B" },
    { id: 2, name: "Transportation", amount: 800000, color: "#4ECDC4" },
    { id: 3, name: "Entertainment", amount: 1000000, color: "#45B7D1" },
  ],
  '2025-05': [
    { id: 1, name: "Food", amount: 1250000, color: "#FF6B6B" },
    { id: 2, name: "Bills", amount: 1200000, color: "#FECA57" },
  ],
  // '2025-04': [], // No data
  '2025-03': [
    { id: 1, name: "Food", amount: 1350000, color: "#FF6B6B" },
    { id: 2, name: "Transportation", amount: 950000, color: "#4ECDC4" },
    { id: 3, name: "Shopping", amount: 800000, color: "#96CEB4" },
  ],
};

// Helper function to get sample data for a specific month
export const getSampleExpensesForMonth = (month: string): ExpensesByMonthCategory[] => {
  // Convert YYYY-MM-DD format to YYYY-MM for lookup
  const monthKey = month.substring(0, 7);
  return sampleMonthlyExpensesData[monthKey] || [];
};