import * as TodayDateModule from '@/utils/TodayDate'
import { renderHook, waitFor } from '@testing-library/react'
import { useExpensesByMonthCategories } from './useExpensesByMonthCategory'

describe('useExpensesByMonthCategory', () => {
  const resultData = [
    {
      "amount": 300000,
      "name": "Big Spending",
      "color": "#8a2922",
      "id": 19
    },
    {
      "amount": 2000000,
      "name": "Investments",
      "color": "#ebb134",
      "id": 2
    }
  ]

  const mockResponse = { data: resultData }
  const originalFetch = globalThis.fetch
  
  beforeEach(() => {
    globalThis.fetch = jest.fn(() => 
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse)} as Response)
    ) as jest.Mock
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('will return all expenses grouped by category based on date', async () => {
    jest.spyOn(TodayDateModule, 'default').mockReturnValue('2025-12-20')
    const { result } = renderHook(() => useExpensesByMonthCategories())
    
    await waitFor(() => {
      expect(result.current.expenses).toEqual(resultData)
    })

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/expenses_by_month_category?date=2025-12-20')
  })
})