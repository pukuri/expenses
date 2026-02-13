export interface Category { 
  id: number; 
  name: string; 
  color: string;
}

export interface NullString {
  String: string;
  Valid: boolean;
}

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  running_balance: number;
  description: string;
  category_name: NullString;
  category_color: NullString;
}

export interface TransactionsResponse {
  data: Transaction[];
}

export interface User {
  name: string;
  picture: string;
}

export interface ExpensesByMonthCategory {
  id: number;
  amount: number;
  name: string; 
  color: string;
}

export interface ChartDataByDate {
  date: string;
  amount: number;
}

export interface EventExpense {
  id: number;
  eventId: number;
  amount: number;
  description: string;
}

export interface EventSummary {
  id: number;
  name: string;
  description: string;
  date: string;
  totalExpenses: number;
}

export interface Event extends EventSummary {
  expenses: EventExpense[];
}

export interface EventsResponse {
  data: EventSummary[];
}

export interface EventExpensesResponse {
  data: EventExpense[];
}
