export default function AmountFormatter(amount: number): string {
  if (amount === undefined || amount === null) {
    return "";
  }
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
