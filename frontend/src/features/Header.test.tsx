import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";
import type { User } from "@/types";

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

// Mock NavigationMenu component
jest.mock('./NavigationMenu', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="navigation-menu">Mock Navigation Menu</div>),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button data-testid="logout-button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock('lucide-react', () => ({
  LogOut: () => <div data-testid="logout-icon">LogOut</div>,
}));

describe('Header', () => {
  const originalFetch = globalThis.fetch;
  
  beforeEach(() => {
    globalThis.fetch = jest.fn(() => 
      Promise.resolve({ ok: true, json: () => Promise.resolve({})} as Response)
    ) as jest.Mock;
    window.location.href = '';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  const mockUser: User = {
    name: 'John Doe',
    picture: 'https://example.com/picture.jpg'
  };

  it('renders header with user information for authenticated user', () => {
    render(
      <BrowserRouter>
        <Header user={mockUser} isSample={false} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('profile picture')).toHaveAttribute('src', 'https://example.com/picture.jpg');
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });

  it('renders header with guest information for sample mode', () => {
    render(
      <BrowserRouter>
        <Header isSample={true} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Guest')).toBeInTheDocument();
    expect(screen.getByAltText('profile picture')).toHaveAttribute('src', '/images/profileImage.png');
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('handles logout for sample mode', async () => {
    render(
      <BrowserRouter>
        <Header isSample={true} />
      </BrowserRouter>
    );

    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);

    expect(window.location.href).toBe('/');
  });

  it('handles logout for authenticated user successfully', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    render(
      <BrowserRouter>
        <Header user={mockUser} isSample={false} />
      </BrowserRouter>
    );

    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    });

    await waitFor(() => {
      expect(window.location.href).toBe('/');
    });
  });
});
