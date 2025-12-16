import { useEffect, useState } from "react"
import AmountFormatter from "../utils/AmountFormatter"
import DateConverter from "../utils/DateConverter"

interface NullString {
  String: string;
  Valid: boolean;
}

interface Transaction {
  id: number;
  created_at: string;
  amount: number;
  running_balance: number;
  description: string;
  category_name: NullString;
  category_color: NullString;
}

interface TransactionsResponse {
  data: Transaction[];
}

const fetchData = async (): Promise<TransactionsResponse> => {
  const response = await fetch("/api/v1/transactions")
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const result = await response.json()
  return result
}

export default function MainTable() {
  const [data, setData] = useState<TransactionsResponse>({ data: [] })
  useEffect(() => {
    fetchData().then(setData).catch(console.error);
  }, []);

  const theadClass = "border-b p-4 pt-0 pb-3 pl-8 text-left font-medium border-gray-600 text-gray-200"
  const tbodyClass = "border-b p-4 pl-8 border-gray-700 text-gray-200"

  return (
    <div className="pt-4 bg-gray-950/50">
      <table className="w-full table-auto border-collapse text-sm">
        <thead>
          <tr>
            <th className={theadClass}>Date</th>
            <th className={theadClass}>Amount</th>
            <th className={theadClass}>Balance</th>
            <th className={theadClass}>Description</th>
            <th className={theadClass}>Category</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800">
          {data.data.map((datum: Transaction) => (
            <tr key={datum.id} style={{backgroundColor: datum.category_color.String}}>
              <td className={tbodyClass}>{DateConverter(datum.created_at)}</td>
              <td className={tbodyClass}>{AmountFormatter(datum.amount)}</td>
              <td className={tbodyClass}>{AmountFormatter(datum.running_balance)}</td>
              <td className={tbodyClass}>{datum.description}</td>
              <td className={tbodyClass}>
                <span
                  style={{
                    backgroundColor: datum.category_color.String,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                >
                  {datum.category_name.String}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
