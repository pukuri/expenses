import { renderHook, waitFor } from "@testing-library/react"
import { useExpensesLast30Days } from "./useExpensesLast30Days"

const resultData = [
  {
    "date": "2024-01-15",
    "amount": 250.50
  },
  {
    "date": "2024-01-16",
    "amount": 130.25
  },
  {
    "date": "2024-01-17",
    "amount": 450.00
  },
]
const mockResponse = { data: resultData }

describe('useExpensesLast30Days', () => {
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

  it('fetches and returns expenses last 30 days data', async () => {
    const { result } = renderHook(() => useExpensesLast30Days())
    
    await waitFor(() => {
      expect(result.current.expenses).toEqual(resultData)
    })

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/expenses_last_30_days')
  })
})
