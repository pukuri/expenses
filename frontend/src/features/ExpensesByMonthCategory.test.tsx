import { render, screen } from "@testing-library/react";
import ExpensesByMonthCategory from "./ExpensesByMonthCategory";
import type { ExpensesByMonthCategory as ExpenseType } from "@/types";

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Doughnut: jest.fn(({ data }) => (
    <div data-testid="mock-doughnut-chart">
      Labels: {data.labels.join(', ')}
    </div>
  ))
}));

jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn()
  },
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  ArcElement: jest.fn(),
}));

describe('ExpensesByMonthCategory', () => {
  const mockExpenses: ExpenseType[] = [
    { id: 1, name: "Food", amount: 1200000, color: "#FF6B6B" },
    { id: 2, name: "Transportation", amount: 800000, color: "#4ECDC4" },
    { id: 3, name: "Entertainment", amount: 500000, color: "#45B7D1" }
  ];

  it('renders with correct date title', () => {
    render(
      <ExpensesByMonthCategory 
        expenses={mockExpenses} 
        date="2024-01" 
      />
    );

    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  it('renders doughnut chart with correct data', () => {
    render(
      <ExpensesByMonthCategory 
        expenses={mockExpenses} 
        date="2024-01" 
      />
    );

    const chart = screen.getByTestId('mock-doughnut-chart');
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveTextContent('Food, Transportation, Entertainment');
  });

  it('formats date correctly for different months', () => {
    const { rerender } = render(
      <ExpensesByMonthCategory 
        expenses={mockExpenses} 
        date="2024-12" 
      />
    );

    expect(screen.getByText('December 2024')).toBeInTheDocument();

    rerender(
      <ExpensesByMonthCategory 
        expenses={mockExpenses} 
        date="2025-06" 
      />
    );

    expect(screen.getByText('June 2025')).toBeInTheDocument();
  });

  it('renders with empty expenses array', () => {
    render(
      <ExpensesByMonthCategory 
        expenses={[]} 
        date="2024-01" 
      />
    );

    expect(screen.getByText('January 2024')).toBeInTheDocument();
    const chart = screen.getByTestId('mock-doughnut-chart');
    expect(chart).toHaveTextContent('Labels:');
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <ExpensesByMonthCategory 
        expenses={mockExpenses} 
        date="2024-01" 
      />
    );

    const mainContainer = container.querySelector('.p-4');
    expect(mainContainer).toBeInTheDocument();

    const title = screen.getByText('January 2024');
    expect(title).toHaveClass('text-2xl');

    const chartContainer = container.querySelector('.pt-4.text-white.max-h-136\\.5.m-auto');
    expect(chartContainer).toBeInTheDocument();
  });

  it('handles single expense item', () => {
    const singleExpense: ExpenseType[] = [
      { id: 1, name: "Food", amount: 1200000, color: "#FF6B6B" }
    ];

    render(
      <ExpensesByMonthCategory 
        expenses={singleExpense} 
        date="2024-01" 
      />
    );

    const chart = screen.getByTestId('mock-doughnut-chart');
    expect(chart).toHaveTextContent('Labels: Food');
  });
});
