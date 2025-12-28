import { renderHook, waitFor } from "@testing-library/react"
import { useLastBalance } from "./useLastBalance"
import * as LastDateModule from '@/utils/LastDate'

const amount = 1000000
const mockResponse = {
  data: {
    amount: amount
  }
}

describe('useLastBalance', () => {
  const originalFetch = globalThis.fetch
  
  beforeEach(() => {
    globalThis.fetch = jest.fn(() => 
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse)} as Response)
    ) as jest.Mock
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    jest.clearAllMocks()
  })
  
  it('should return amount from fetch response', async () => {
    jest.spyOn(LastDateModule, 'default').mockReturnValue('2025-12-20')
    const { result } = renderHook(() => useLastBalance())
    
    await waitFor(() => {
      expect(result.current.lastBalance).toEqual(amount)
    })

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/balance_by_date?date=2025-12-20')
  })
})
