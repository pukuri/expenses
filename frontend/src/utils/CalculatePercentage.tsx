export const calculateBalancePercentage = (a: number, b: number): number => {
  var percent: number;
  if(b !== 0) {
    if(a !== 0) {
      percent = (b - a) / a * 100;
    } else {
      percent = b * 100;
    }
  } else {
    percent = - a * 100;            
  }       
  return Math.floor(percent);
}