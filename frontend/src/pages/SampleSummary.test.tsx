import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SampleSummary from "./SampleSummary";

// Mock SummaryLayout component
jest.mock('@/features/SummaryLayout', () => ({
  __esModule: true,
  default: jest.fn(({ isSample }) => (
    <div data-testid="mock-summary-layout">
      Mock SummaryLayout - isSample: {isSample.toString()}
    </div>
  )),
}));

describe('SampleSummary', () => {
  it('renders sample summary page', () => {
    render(
      <BrowserRouter>
        <SampleSummary />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mock-summary-layout')).toBeInTheDocument();
    expect(screen.getByText('Mock SummaryLayout - isSample: true')).toBeInTheDocument();
  });

  it('passes correct props to SummaryLayout', () => {
    render(
      <BrowserRouter>
        <SampleSummary />
      </BrowserRouter>
    );

    // Verify that SummaryLayout receives isSample as true
    expect(screen.getByText(/isSample: true/)).toBeInTheDocument();
  });

  it('renders without requiring authentication', () => {
    // Should render immediately without any loading state or authentication checks
    render(
      <BrowserRouter>
        <SampleSummary />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mock-summary-layout')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
