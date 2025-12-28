import * as TodayDateModule from '@/utils/TodayDate'
import * as LastDateModule from '@/utils/LastDate'
import { renderHook, waitFor } from '@testing-library/react'
import { useCurrentMonthExpenses } from './useCurrentMonthExpenses'

describe('useExpensesByMonthCategory', () => {

  const lastAmount = 1000000
  const todayAmount = 2000000
  const mockLastResponse = { data: { amount: lastAmount } }
  const mockTodayResponse = { data: { amount: todayAmount } }
  const originalFetch = globalThis.fetch
  
  beforeEach(() => {
    globalThis.fetch = jest.fn((url) => {
      if(url === '/api/v1/expenses_by_month?date=2025-11-20') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockLastResponse)} as Response)
      }
      if(url === '/api/v1/expenses_by_month?date=2025-12-20') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTodayResponse)} as Response)
      }
    }) as jest.Mock
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('will return total expenses based on date', async () => {
    jest.spyOn(LastDateModule, 'default').mockReturnValue('2025-11-20')
    jest.spyOn(TodayDateModule, 'default').mockReturnValue('2025-12-20')

    const { result } = renderHook(() => useCurrentMonthExpenses())
    
    await waitFor(() => {
      expect(result.current.currentAmount).toEqual(todayAmount)
      expect(result.current.lastAmount).toEqual(lastAmount)
    })

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/expenses_by_month?date=2025-12-20')
  })
})