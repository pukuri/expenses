import AmountFormatter from "../utils/AmountFormatter";

interface NullString {
  String: string;
  Valid: boolean;
}

interface Transaction {
  id: number;
  date: string;
  amount: number;
  running_balance: number;
  description: string;
  category_name: NullString;
  category_color: NullString;
}

interface TransactionsResponse {
  data: Transaction[];
}

export default function CurrentBalance(data: { data: TransactionsResponse }) {
  return (
    <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
      <p>Current Balance</p>
      <h1 className="text-5xl font-bold mt-5">{AmountFormatter(data.data.data[0]?.running_balance)}</h1>
    </div>
  )
}