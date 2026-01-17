import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NavigationMenu from "./NavigationMenu";

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockNavigate,
}));

// Mock the UI components
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <div 
      data-testid="dropdown-item" 
      onClick={onClick}
      className={className}
    >
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button data-testid="menu-button" onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock lucide icons
jest.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  Table: () => <div data-testid="table-icon">Table</div>,
  PieChart: () => <div data-testid="pie-chart-icon">PieChart</div>,
}));

describe('NavigationMenu', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders menu button and dropdown items', () => {
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' });

    render(
      <BrowserRouter>
        <NavigationMenu />
      </BrowserRouter>
    );

    expect(screen.getByTestId('menu-button')).toBeInTheDocument();
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('dropdown-item')).toHaveLength(2);
    expect(screen.getByTestId('table-icon')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-icon')).toBeInTheDocument();
    expect(screen.getByText('Main Table')).toBeInTheDocument();
    expect(screen.getByText('Monthly Summary')).toBeInTheDocument();
  });

  it('navigates to dashboard routes when in dashboard mode', () => {
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' });

    render(
      <BrowserRouter>
        <NavigationMenu />
      </BrowserRouter>
    );

    const menuItems = screen.getAllByTestId('dropdown-item');
    
    // Click on Main Table
    fireEvent.click(menuItems[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

    // Click on Monthly Summary
    fireEvent.click(menuItems[1]);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/summary');
  });

  it('navigates to sample routes when in sample mode', () => {
    mockUseLocation.mockReturnValue({ pathname: '/sample' });

    render(
      <BrowserRouter>
        <NavigationMenu />
      </BrowserRouter>
    );

    const menuItems = screen.getAllByTestId('dropdown-item');
    
    // Click on Main Table
    fireEvent.click(menuItems[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/sample');

    // Click on Monthly Summary
    fireEvent.click(menuItems[1]);
    expect(mockNavigate).toHaveBeenCalledWith('/sample/summary');
  });

  it('highlights active table item when on table page', () => {
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' });

    render(
      <BrowserRouter>
        <NavigationMenu />
      </BrowserRouter>
    );

    const menuItems = screen.getAllByTestId('dropdown-item');
    expect(menuItems[0]).toHaveClass('bg-accent');
    expect(menuItems[1]).not.toHaveClass('bg-accent');
  });

  it('highlights active summary item when on summary page', () => {
    mockUseLocation.mockReturnValue({ pathname: '/dashboard/summary' });

    render(
      <BrowserRouter>
        <NavigationMenu />
      </BrowserRouter>
    );

    const menuItems = screen.getAllByTestId('dropdown-item');
    expect(menuItems[0]).not.toHaveClass('bg-accent');
    expect(menuItems[1]).toHaveClass('bg-accent');
  });
});
