import { renderHook, waitFor } from "@testing-library/react"
import { useExpensesByMonths } from "./useExpensesByMonths"
import TodayDate from "@/utils/TodayDate"

// Mock TodayDate
jest.mock("@/utils/TodayDate")
const mockTodayDate = TodayDate as jest.MockedFunction<typeof TodayDate>

const resultData = [
  {
    "date": "2024-01",
    "amount": 1500.50
  },
  {
    "date": "2024-02",
    "amount": 2300.75
  },
]
const mockResponse = { data: resultData }

describe('useExpensesByMonths', () => {
  const originalFetch = globalThis.fetch
  
  beforeEach(() => {
    mockTodayDate.mockReturnValue("2024-02-15")
    globalThis.fetch = jest.fn(() => 
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse)} as Response)
    ) as jest.Mock
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    jest.clearAllMocks()
  })

  it('fetches and returns expenses by months data', async () => {
    const { result } = renderHook(() => useExpensesByMonths())
    
    await waitFor(() => {
      expect(result.current.expenses).toEqual(resultData)
    })

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/expenses_by_months?' + new URLSearchParams({
      date: '2024-02-15'
    }))
  })
})
