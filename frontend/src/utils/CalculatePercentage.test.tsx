import { calculateBalancePercentage } from "./CalculatePercentage"

describe('CaluclatePercentage', () => {
  it('should return whole number percentage difference from two number', () => {
    expect(calculateBalancePercentage(1000, 500)).toEqual(-50)
    expect(calculateBalancePercentage(500, 1000)).toEqual(100)
    expect(calculateBalancePercentage(7654, 2345)).toEqual(-70)
  })
})