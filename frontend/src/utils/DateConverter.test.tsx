import DateConverter from "./DateConverter"

describe('DateConverter', () => {
  it('should return YYYY-MM-DD format from date string', () => {
    expect(DateConverter('2025-12-22T00:00:00Z')).toEqual('2025 December 22')
  })
})