import TodayDate from "./TodayDate"

describe('TodayDate', () => {
  it('should return todays date with format of YYYY-MM-DD', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-12-20'))
    
    expect(TodayDate()).toEqual('2025-12-20')
  })
})