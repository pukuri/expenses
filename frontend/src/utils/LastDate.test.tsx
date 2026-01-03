import LastDate from "./LastDate"

describe('LastDate', () => {
  it('should return todays date minus one month with format of YYYY-MM-DD', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-20'))
    
    expect(LastDate()).toEqual('2025-12-20')
  })
})