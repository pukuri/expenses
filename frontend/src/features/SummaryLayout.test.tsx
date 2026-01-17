import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SummaryLayout from "./SummaryLayout";
import type { User, ChartDataByDate } from "@/types";
import type { MonthlyExpensesByCategory } from "@/data/expensesByMonthCategory12MonthsSample";

// Mock Header component
jest.mock('./Header', () => ({
  __esModule: true,
  default: jest.fn(({ user, isSample }: { user?: User; isSample: boolean }) => (
    <div data-testid="mock-header">
      Mock Header - User: {user?.name || 'None'}, isSample: {isSample.toString()}
    </div>
  )),
}));

// Mock ExpensesByMonths component
jest.mock('./ExpensesByMonths', () => ({
  __esModule: true,
  default: jest.fn(({ data }: { data: ChartDataByDate[] }) => (
    <div data-testid="mock-expenses-by-months">
      Mock ExpensesByMonths - {data.length} months
    </div>
  )),
}));

// Mock ExpensesByMonthCategory component
jest.mock('./ExpensesByMonthCategory', () => ({
  __esModule: true,
  default: jest.fn(({ expenses, date }: { expenses: any[], date: string }) => (
    <div data-testid="mock-expenses-by-month-category">
      Mock ExpensesByMonthCategory - {date} - {expenses.length} expenses
    </div>
  )),
}));

describe('SummaryLayout', () => {
  const mockUser: User = {
    name: 'John Doe',
    picture: 'https://example.com/picture.jpg'
  };

  const mockMonthlyData: ChartDataByDate[] = [
    { date: "2025-01", amount: 300 },
    { date: "2024-12", amount: 350 },
    { date: "2024-11", amount: 400 }
  ];

  const mockMonthlyExpenses: MonthlyExpensesByCategory[] = [
    {
      date: "2025-01",
      expenses: [
        { id: 1, name: "Food", amount: 1200000, color: "#FF6B6B" },
        { id: 2, name: "Transportation", amount: 800000, color: "#4ECDC4" }
      ]
    },
    {
      date: "2024-12",
      expenses: [
        { id: 1, name: "Food", amount: 1100000, color: "#FF6B6B" },
        { id: 2, name: "Shopping", amount: 500000, color: "#96CEB4" }
      ]
    }
  ];

  it('renders layout with header for authenticated user', () => {
    render(
      <BrowserRouter>
        <SummaryLayout 
          user={mockUser} 
          isSample={false} 
          monthlyData={mockMonthlyData}
          monthlyExpenses={mockMonthlyExpenses}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText(/Mock Header - User: John Doe, isSample: false/)).toBeInTheDocument();
  });

  it('renders layout with header for sample mode', () => {
    render(
      <BrowserRouter>
        <SummaryLayout 
          isSample={true} 
          monthlyData={mockMonthlyData}
          monthlyExpenses={mockMonthlyExpenses}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText(/Mock Header - User: None, isSample: true/)).toBeInTheDocument();
  });

  it('renders ExpensesByMonths component with data', () => {
    render(
      <BrowserRouter>
        <SummaryLayout 
          user={mockUser} 
          isSample={false} 
          monthlyData={mockMonthlyData}
          monthlyExpenses={mockMonthlyExpenses}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mock-expenses-by-months')).toBeInTheDocument();
    expect(screen.getByText('Mock ExpensesByMonths - 3 months')).toBeInTheDocument();
  });

  it('renders monthly expenses section with title', () => {
    render(
      <BrowserRouter>
        <SummaryLayout 
          user={mockUser} 
          isSample={false} 
          monthlyData={mockMonthlyData}
          monthlyExpenses={mockMonthlyExpenses}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Expenses by Category - Past 12 Months')).toBeInTheDocument();
  });

  it('renders ExpensesByMonthCategory components for each month', () => {
    render(
      <BrowserRouter>
        <SummaryLayout 
          user={mockUser} 
          isSample={false} 
          monthlyData={mockMonthlyData}
          monthlyExpenses={mockMonthlyExpenses}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Mock ExpensesByMonthCategory - 2025-01 - 2 expenses')).toBeInTheDocument();
    expect(screen.getByText('Mock ExpensesByMonthCategory - 2024-12 - 2 expenses')).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(
      <BrowserRouter>
        <SummaryLayout 
          user={mockUser} 
          isSample={false} 
          monthlyData={mockMonthlyData}
          monthlyExpenses={mockMonthlyExpenses}
        />
      </BrowserRouter>
    );

    const mainContainer = container.querySelector('.h-full');
    expect(mainContainer).toBeInTheDocument();

    const maxWidthContainer = container.querySelector('.max-w-420');
    expect(maxWidthContainer).toBeInTheDocument();

    const flexContainer = container.querySelector('.flex-col');
    expect(flexContainer).toBeInTheDocument();
  });

  it('handles empty monthly expenses array', () => {
    render(
      <BrowserRouter>
        <SummaryLayout 
          user={mockUser} 
          isSample={false} 
          monthlyData={mockMonthlyData}
          monthlyExpenses={[]}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-expenses-by-months')).toBeInTheDocument();
    expect(screen.getByText('Expenses by Category - Past 12 Months')).toBeInTheDocument();
    // Should not render any ExpensesByMonthCategory components
    expect(screen.queryByTestId('mock-expenses-by-month-category')).not.toBeInTheDocument();
  });
});
