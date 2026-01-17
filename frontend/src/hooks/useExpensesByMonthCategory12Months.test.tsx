import { renderHook, waitFor } from '@testing-library/react';
import { useExpensesByMonthCategory12Months } from './useExpensesByMonthCategory12Months';

const mockApiResponse = {
  data: [
    { id: 1, name: 'Food', amount: 1000000, color: '#FF6B6B' },
    { id: 2, name: 'Transportation', amount: 500000, color: '#4ECDC4' }
  ]
};

jest.mock('@/utils/TodayDate', () => ({
  __esModule: true,
  default: jest.fn(() => '2025-01-15'),
}));

describe('useExpensesByMonthCategory12Months', () => {
  const originalFetch = globalThis.fetch;
  
  beforeEach(() => {
    globalThis.fetch = jest.fn(() => 
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockApiResponse)} as Response)
    ) as jest.Mock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should fetch data from API', async () => {
    const { result } = renderHook(() => useExpensesByMonthCategory12Months());

    await waitFor(() => {
      expect(result.current.monthlyExpenses.length).toBeGreaterThan(0);
    });

    expect(globalThis.fetch).toHaveBeenCalled();
    expect((globalThis.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(1);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/expenses_by_month_category?')
    );
  });
});
