import type { ExpensesByMonthCategory } from '@/types';

export interface MonthlyExpensesByCategory {
  date: string;
  expenses: ExpensesByMonthCategory[];
}

export const expensesByMonthCategory12MonthsSample: MonthlyExpensesByCategory[] = [
  {
    date: "2026-01",
    expenses: [
      { id: 1, name: "Food", amount: 1500000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 1000000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 800000, color: "#45B7D1" },
      { id: 4, name: "Shopping", amount: 900000, color: "#96CEB4" },
      { id: 5, name: "Health", amount: 450000, color: "#FECA57" }
    ]
  },
  {
    date: "2025-12",
    expenses: [
      { id: 1, name: "Food", amount: 1400000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 950000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 700000, color: "#45B7D1" },
      { id: 4, name: "Shopping", amount: 850000, color: "#96CEB4" },
      { id: 5, name: "Health", amount: 400000, color: "#FECA57" }
    ]
  },
  {
    date: "2025-11",
    expenses: [
      { id: 1, name: "Food", amount: 1240000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 860000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 540000, color: "#45B7D1" },
      { id: 4, name: "Shopping", amount: 780000, color: "#96CEB4" }
    ]
  },
  {
    date: "2025-10",
    expenses: [
      { id: 1, name: "Food", amount: 1350000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 920000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 600000, color: "#45B7D1" }
    ]
  },
  {
    date: "2025-09",
    expenses: [
      { id: 1, name: "Food", amount: 1220000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 790000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 520000, color: "#45B7D1" },
      { id: 4, name: "Shopping", amount: 680000, color: "#96CEB4" },
      { id: 5, name: "Health", amount: 280000, color: "#FECA57" }
    ]
  },
  {
    date: "2025-08",
    expenses: [
      { id: 1, name: "Food", amount: 1280000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 830000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 580000, color: "#45B7D1" },
      { id: 4, name: "Shopping", amount: 750000, color: "#96CEB4" }
    ]
  },
  {
    date: "2025-07",
    expenses: [
      { id: 1, name: "Food", amount: 1320000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 900000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 650000, color: "#45B7D1" }
    ]
  },
  {
    date: "2025-06",
    expenses: [
      { id: 1, name: "Food", amount: 1180000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 850000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 480000, color: "#45B7D1" },
      { id: 4, name: "Shopping", amount: 720000, color: "#96CEB4" },
      { id: 5, name: "Health", amount: 320000, color: "#FECA57" }
    ]
  },
  {
    date: "2025-05",
    expenses: [
      { id: 1, name: "Food", amount: 1250000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 780000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 550000, color: "#45B7D1" },
      { id: 4, name: "Shopping", amount: 650000, color: "#96CEB4" }
    ]
  },
  {
    date: "2025-04",
    expenses: [
      { id: 1, name: "Food", amount: 1150000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 820000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 450000, color: "#45B7D1" },
      { id: 4, name: "Shopping", amount: 700000, color: "#96CEB4" },
      { id: 5, name: "Health", amount: 250000, color: "#FECA57" }
    ]
  },
  {
    date: "2025-03",
    expenses: [
      { id: 1, name: "Food", amount: 1300000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 900000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 600000, color: "#45B7D1" }
    ]
  },
  {
    date: "2025-02", 
    expenses: [
      { id: 1, name: "Food", amount: 1100000, color: "#FF6B6B" },
      { id: 2, name: "Transportation", amount: 750000, color: "#4ECDC4" },
      { id: 3, name: "Entertainment", amount: 400000, color: "#45B7D1" },
      { id: 4, name: "Shopping", amount: 800000, color: "#96CEB4" },
      { id: 5, name: "Health", amount: 300000, color: "#FECA57" }
    ]
  }
];
