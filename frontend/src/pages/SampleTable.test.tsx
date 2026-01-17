import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SampleTable from "./SampleTable";

// Mock sample data
jest.mock('@/data/transactionSample', () => ({
  transactionSample: [
    {
      id: 1,
      date: "2025-12-20",
      amount: 90000,
      running_balance: 13385000,
      description: "Dim Sum Lunch",
      category_name: { String: "Foods", Valid: true },
      category_color: { String: "#2fe3b5", Valid: true }
    }
  ]
}));

jest.mock('@/data/categoriesSample', () => ({
  categorySample: [
    { id: 1, name: 'Foods', color: '#2fe3b5' }
  ]
}));

jest.mock('@/data/expensesByMonthCategorySample', () => ({
  expensesByMonthCategorySample: [
    { id: 1, name: 'Foods', color: '#2fe3b5', amount: 2000000 }
  ]
}));

jest.mock('@/data/last30DaysChartDataSample', () => ({
  last30DaysChartDataSample: [
    { date: '2025-12-01', amount: 2000000 }
  ]
}));

// Mock components
jest.mock('@/features/Header', () => ({
  __esModule: true,
  default: jest.fn(({ isSample }) => (
    <div data-testid="mock-header">
      Mock Header - isSample: {isSample.toString()}
    </div>
  )),
}));

jest.mock('@/features/MainLayout', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div data-testid="mock-main-layout">
      Mock MainLayout - isSample: {props.isSample.toString()}, currentAmount: {props.currentAmount}, lastAmount: {props.lastAmount}
    </div>
  )),
}));

describe('SampleTable', () => {
  it('renders sample table page with correct props', () => {
    render(
      <BrowserRouter>
        <SampleTable />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText(/Mock Header - isSample: true/)).toBeInTheDocument();

    expect(screen.getByTestId('mock-main-layout')).toBeInTheDocument();
    expect(screen.getByText(/Mock MainLayout - isSample: true/)).toBeInTheDocument();
    expect(screen.getByText(/currentAmount: 14000000/)).toBeInTheDocument();
    expect(screen.getByText(/lastAmount: 8000000/)).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(
      <BrowserRouter>
        <SampleTable />
      </BrowserRouter>
    );

    const mainContainer = container.querySelector('.h-full');
    expect(mainContainer).toBeInTheDocument();

    const maxWidthContainer = container.querySelector('.max-w-420');
    expect(maxWidthContainer).toBeInTheDocument();

    const flexContainer = container.querySelector('.flex-col');
    expect(flexContainer).toBeInTheDocument();
  });

  it('passes correct sample data to MainLayout', () => {
    render(
      <BrowserRouter>
        <SampleTable />
      </BrowserRouter>
    );

    // Verify that the MainLayout receives the sample props
    expect(screen.getByTestId('mock-main-layout')).toBeInTheDocument();
    
    // Check that it's in sample mode
    expect(screen.getAllByText(/isSample: true/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/isSample: true/)[1]).toBeInTheDocument();
  });

  it('renders header in sample mode', () => {
    render(
      <BrowserRouter>
        <SampleTable />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Mock Header - isSample: true')).toBeInTheDocument();
  });
});
