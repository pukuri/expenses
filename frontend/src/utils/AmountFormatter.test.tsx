import AmountFormatter from './AmountFormatter';

describe('AmountFormatter', () => {
  it('should format numbers with thousands separators using dots', () => {
    expect(AmountFormatter(1000)).toEqual('1.000');
    expect(AmountFormatter(12345)).toEqual('12.345');
    expect(AmountFormatter(12345678)).toEqual('12.345.678');
    expect(AmountFormatter(-12345)).toEqual('-12.345');
    expect(AmountFormatter(-123456789)).toEqual('-123.456.789');
  });

  it('should not add separators to numbers less than 1000', () => {
    expect(AmountFormatter(0)).toEqual('0');
    expect(AmountFormatter(1)).toEqual('1');
    expect(AmountFormatter(999)).toEqual('999');
  });
});
