import { renderHook, waitFor } from "@testing-library/react"
import { useCategories } from "./useCategories"

const resultData = [
    {
        "id": 18,
        "name": "Groceries",
        "color": "#FF0000",
        "created_at": "2025-12-14T15:11:31Z"
    },
    {
        "id": 20,
        "name": "Rent",
        "color": "#0000FF",
        "created_at": "2025-12-14T15:11:31Z"
    },
  ]
const mockResponse = { data: resultData }

describe('useCategories', () => {
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

  it('returns all categories data', async () => {
    const { result } = renderHook(() => useCategories())
    
    await waitFor(() => {
      expect(result.current.categories).toEqual([{id: 0, name: 'Uncategorized', color: '#999'}, ...resultData])
    })

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/categories')
    expect(typeof result.current.fetchCategories).toBe('function')
  })
})