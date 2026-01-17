import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import DashboardSummary from "./DashboardSummary";

// Mock AuthContext
const mockFetchUser = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock react-router-dom Navigate component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate-to">{to}</div>
}));

// Mock hooks
jest.mock('@/hooks/useExpensesByMonths', () => ({
  useExpensesByMonths: jest.fn(() => ({
    expenses: [
      { date: "2025-01", amount: 300 },
      { date: "2024-12", amount: 350 }
    ]
  }))
}));

jest.mock('@/hooks/useExpensesByMonthCategory12Months', () => ({
  useExpensesByMonthCategory12Months: jest.fn(() => ({
    monthlyExpenses: [
      {
        date: "2025-01",
        expenses: [
          { id: 1, name: "Food", amount: 1200000, color: "#FF6B6B" }
        ]
      }
    ]
  }))
}));

// Mock SummaryLayout component
jest.mock('@/features/SummaryLayout', () => ({
  __esModule: true,
  default: jest.fn(({ user, isSample }) => (
    <div data-testid="mock-summary-layout">
      Mock SummaryLayout - User: {user?.name || 'None'}, isSample: {isSample.toString()}
    </div>
  )),
}));

describe('DashboardSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      fetchUser: mockFetchUser
    });

    render(
      <BrowserRouter>
        <DashboardSummary />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to home when user is not authenticated', async () => {
    mockFetchUser.mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue({
      user: null,
      fetchUser: mockFetchUser
    });

    render(
      <BrowserRouter>
        <DashboardSummary />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/');
    });
  });

  it('renders summary content when user is authenticated', async () => {
    const mockUser = {
      name: 'John Doe',
      picture: 'https://example.com/picture.jpg'
    };

    mockFetchUser.mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue({
      user: mockUser,
      fetchUser: mockFetchUser
    });

    render(
      <BrowserRouter>
        <DashboardSummary />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-summary-layout')).toBeInTheDocument();
    });

    expect(screen.getByText(/Mock SummaryLayout - User: John Doe, isSample: false/)).toBeInTheDocument();
  });

  it('calls fetchUser on mount', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      fetchUser: mockFetchUser
    });

    render(
      <BrowserRouter>
        <DashboardSummary />
      </BrowserRouter>
    );

    expect(mockFetchUser).toHaveBeenCalledTimes(1);
  });

  it('passes correct props to SummaryLayout', async () => {
    const mockUser = {
      name: 'Jane Smith',
      picture: 'https://example.com/jane.jpg'
    };

    mockFetchUser.mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue({
      user: mockUser,
      fetchUser: mockFetchUser
    });

    render(
      <BrowserRouter>
        <DashboardSummary />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-summary-layout')).toBeInTheDocument();
    });

    expect(screen.getByText(/Mock SummaryLayout - User: Jane Smith, isSample: false/)).toBeInTheDocument();
  });
});
