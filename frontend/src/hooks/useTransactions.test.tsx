import { renderHook, waitFor } from '@testing-library/react'
import { useTransactions } from './useTransactions'

const mockResponse = {
  data: {
    amount: 1000000,
    date: "2025-12-22T00:00:00Z",
    description: "Ayam goreng",
    id: 67,
    running_balance: 9000000,
    category_color: { String: '', Valid: false },
    category_name: { String: '', valid: false }
  }
}

describe('useTransactions', () => {
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

  it('should return the transaction and the fetch method itself', async () => {
    const { result } = renderHook(() => useTransactions())
    
    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse)
    })
    
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/transactions')
    expect(typeof result.current.fetchTransactions).toBe('function')
  })
})
