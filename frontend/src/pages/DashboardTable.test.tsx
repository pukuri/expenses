import { render, screen, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import DashboardTable from "./DashboardTable";

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
jest.mock('@/hooks/useTransactions', () => ({
  useTransactions: jest.fn(() => ({
    data: { data: [{ id: 1, running_balance: 1000000 }] },
    fetchTransactions: jest.fn()
  }))
}));

jest.mock('@/hooks/useCategories', () => ({
  useCategories: jest.fn(() => ({ categories: [] }))
}));

jest.mock('@/hooks/useCurrentMonthExpenses', () => ({
  useCurrentMonthExpenses: jest.fn(() => ({ currentAmount: 1000000, lastAmount: 800000 }))
}));

jest.mock('@/hooks/useLastBalance', () => ({
  useLastBalance: jest.fn(() => ({ lastBalance: 1200000 }))
}));

jest.mock('@/hooks/useExpensesByMonthCategory', () => ({
  useExpensesByMonthCategories: jest.fn(() => ({ expenses: [] })),
  useExpensesByMonthCategory: jest.fn(() => ({
    expenses: [],
    loading: false,
    error: null
  }))
}));

jest.mock('@/hooks/useExpensesLast30Days', () => ({
  useExpensesLast30Days: jest.fn(() => ({ expenses: [] }))
}));

// Mock components
jest.mock('@/features/Header', () => ({
  __esModule: true,
  default: jest.fn(({ user, isSample }) => (
    <div data-testid="mock-header">
      Mock Header - User: {user?.name || 'None'}, isSample: {isSample.toString()}
    </div>
  )),
}));

jest.mock('@/features/MainLayout', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div data-testid="mock-main-layout">
      Mock MainLayout - isSample: {props.isSample.toString()}
    </div>
  )),
}));

describe('DashboardTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      fetchUser: mockFetchUser
    });

    act(() => {
      render(
        <BrowserRouter>
          <DashboardTable />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to home when user is not authenticated', async () => {
    mockFetchUser.mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue({
      user: null,
      fetchUser: mockFetchUser
    });

    act(() => {
      render(
        <BrowserRouter>
          <DashboardTable />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/');
    });
  });

  it('renders dashboard content when user is authenticated', async () => {
    const mockUser = {
      name: 'John Doe',
      picture: 'https://example.com/picture.jpg'
    };

    mockFetchUser.mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue({
      user: mockUser,
      fetchUser: mockFetchUser
    });

    act(() => {
      render(
        <BrowserRouter>
          <DashboardTable />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    });

    expect(screen.getByText(/Mock Header - User: John Doe, isSample: false/)).toBeInTheDocument();
    expect(screen.getByTestId('mock-main-layout')).toBeInTheDocument();
    expect(screen.getByText(/Mock MainLayout - isSample: false/)).toBeInTheDocument();
  });

  it('calls fetchUser on mount', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      fetchUser: mockFetchUser
    });

    act(() => {
      render(
        <BrowserRouter>
          <DashboardTable />
        </BrowserRouter>
      );
    });

    expect(mockFetchUser).toHaveBeenCalledTimes(1);
  });

  it('has correct layout structure when authenticated', async () => {
    const mockUser = {
      name: 'John Doe',
      picture: 'https://example.com/picture.jpg'
    };

    mockFetchUser.mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue({
      user: mockUser,
      fetchUser: mockFetchUser
    });

    let container: HTMLElement;
    act(() => {
      const rendered = render(
        <BrowserRouter>
          <DashboardTable />
        </BrowserRouter>
      );
      container = rendered.container;
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    });

    const mainContainer = container!.querySelector('.h-full');
    expect(mainContainer).toBeInTheDocument();

    const maxWidthContainer = container!.querySelector('.max-w-420');
    expect(maxWidthContainer).toBeInTheDocument();

    const flexContainer = container!.querySelector('.flex-col');
    expect(flexContainer).toBeInTheDocument();
  });
});
